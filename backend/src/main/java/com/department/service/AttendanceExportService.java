package com.department.service;

import com.department.model.Attendance;
import com.department.model.Student;
import com.department.model.Subject;
import com.department.repository.AttendanceRepository;
import com.department.repository.StudentRepository;
import com.department.repository.SubjectRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceExportService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SubjectRepository subjectRepository;

   
    /**
     * Export attendance report as PDF
     */
    public byte[] exportAttendanceAsPDF(String program, Integer semester, Float nqCriteria, Float attendanceMarks,
                                       LocalDate startDate, LocalDate endDate) throws IOException {
        List<Student> students = studentRepository.findByProgramAndSemester(program, semester);
        
        // Get all subjects for this program/semester
        List<Subject> subjects = subjectRepository.findByProgramAndSemester(program, semester);
        
        PDDocument document = new PDDocument();
        // Create landscape orientation (A4 landscape: 842 x 595 points)
        PDPage page = new PDPage(new PDRectangle(842, 595));
        document.addPage(page);
        
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            float pageWidth = 842;
            float pageHeight = 595;
            float leftMargin = 25;
            float rightMargin = 25;
            float topMargin = 30;
            float bottomMargin = 30;
            
            float currentY = pageHeight - topMargin;
            
            // Title
            currentY = drawCenteredText(contentStream, PDType1Font.HELVETICA_BOLD, 14, 
                    "ATTENDANCE PROGRESS REPORT", pageWidth / 2, currentY);
            currentY -= 15;
            
            // Program and Semester info
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 10, 
                    "Program: " + program + "    Semester: " + semester, leftMargin, currentY);
            currentY -= 8;
            
            // Report date
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 10, 
                    "Report Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), 
                    leftMargin, currentY);
            
            if (startDate != null && endDate != null) {
                currentY -= 8;
                currentY = drawText(contentStream, PDType1Font.HELVETICA, 9,
                        "Date Range: " + startDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + 
                        " to " + endDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        leftMargin, currentY);
            }
            
            currentY -= 12;
            
            // Table header with improved formatting
            float snColWidth = 25;  // Reduced column width for S. No.
            float remainingWidth = pageWidth - leftMargin - rightMargin - snColWidth;
            float colWidth = remainingWidth / (2 + subjects.size());  // Adjusted for S. No. reduction
            float rowHeight = 22;  // Further increased to show subject names and teacher info fully
            
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 9);
            contentStream.setNonStrokingColor(new PDColor(new float[]{1, 1, 1}, PDDeviceRGB.INSTANCE)); // White text
            
            // Draw header background
            float headerX = leftMargin;
            contentStream.setNonStrokingColor(new PDColor(new float[]{52f/255, 73f/255, 94f/255}, PDDeviceRGB.INSTANCE)); // Dark blue background
            contentStream.addRect(headerX, currentY - rowHeight, pageWidth - leftMargin - rightMargin, rowHeight);
            contentStream.fill();
            contentStream.setNonStrokingColor(new PDColor(new float[]{1, 1, 1}, PDDeviceRGB.INSTANCE)); // White text for header
            
            // First header row - S. No., Roll No, Name
            float cellX = leftMargin;
            drawTableCell(contentStream, "S. No.", cellX, currentY, snColWidth, rowHeight);
            cellX += snColWidth;
            drawTableCell(contentStream, "Roll No", cellX, currentY, colWidth, rowHeight);
            cellX += colWidth;
            drawTableCell(contentStream, "Name of Student", cellX, currentY, colWidth, rowHeight);
            cellX += colWidth;
            
            // Subject codes with teacher names
            for (Subject subject : subjects) {
                String subjectWithTeacher = subject.getCourseCode() + "\n(" + subject.getTeacher().getUser().getFullName() + ")";
                drawTableCellMultiLine(contentStream, subjectWithTeacher, cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
            }
            
            currentY -= rowHeight;
            
            // Table header row 2 - Column info (TCA, %, STATUS, Mark) with background
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 8);
            contentStream.setNonStrokingColor(new PDColor(new float[]{52f/255, 73f/255, 94f/255}, PDDeviceRGB.INSTANCE)); // Dark blue background
            contentStream.addRect(leftMargin, currentY - rowHeight, pageWidth - leftMargin - rightMargin, rowHeight);
            contentStream.fill();
            contentStream.setNonStrokingColor(new PDColor(new float[]{1, 1, 1}, PDDeviceRGB.INSTANCE)); // White text
            
            cellX = leftMargin + snColWidth + (colWidth * 2);
            
            for (int i = 0; i < subjects.size(); i++) {
                float subColWidth = colWidth / 4;
                drawTableCell(contentStream, "TCA", cellX, currentY, subColWidth, rowHeight);
                cellX += subColWidth;
                drawTableCell(contentStream, "%", cellX, currentY, subColWidth, rowHeight);
                cellX += subColWidth;
                drawTableCell(contentStream, "STATUS", cellX, currentY, subColWidth, rowHeight);
                cellX += subColWidth;
                drawTableCell(contentStream, "Mark", cellX, currentY, subColWidth, rowHeight);
                cellX += subColWidth;
            }
            
            currentY -= rowHeight;
            
            // Reset text color for data rows
            contentStream.setNonStrokingColor(new PDColor(new float[]{0, 0, 0}, PDDeviceRGB.INSTANCE));
            
            // Data rows
            int serialNumber = 1;
            for (Student student : students) {
                cellX = leftMargin;
                contentStream.setFont(PDType1Font.HELVETICA, 8);
                
                // Serial number (S. No.) with reduced width
                drawTableCell(contentStream, String.valueOf(serialNumber++), cellX, currentY, snColWidth, rowHeight);
                cellX += snColWidth;
                
                // Roll No
                drawTableCell(contentStream, student.getStudentId(), cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
                
                // Student Name
                drawTableCell(contentStream, student.getUser().getFullName(), cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
                
                // Subject-wise attendance
                for (Subject subject : subjects) {
                    float subColWidth = colWidth / 4;
                    
                    // Get attendance for this student-subject combination
                    List<Attendance> attendances = startDate != null && endDate != null
                            ? attendanceRepository.findByStudentIdAndCourseIdAndAttendanceDateBetween(
                                    student.getId(), subject.getId(), startDate, endDate)
                            : attendanceRepository.findByStudentIdAndCourseId(student.getId(), subject.getId());
                    
                    int totalClasses = attendances.size();
                    int classesAttended = (int) attendances.stream()
                            .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                            .count();
                    
                    float percentage = totalClasses > 0 ? (classesAttended * 100.0f) / totalClasses : 0.0f;
                    String status = percentage >= nqCriteria ? "Q" : "NQ";
                    
                    // TCA
                    drawTableCell(contentStream, String.valueOf(classesAttended), cellX, currentY, subColWidth, rowHeight);
                    cellX += subColWidth;
                    
                    // Percentage
                    drawTableCell(contentStream, String.format("%.1f", percentage), cellX, currentY, subColWidth, rowHeight);
                    cellX += subColWidth;
                    
                    // Status
                    drawTableCell(contentStream, status, cellX, currentY, subColWidth, rowHeight);
                    cellX += subColWidth;
                    
                    // Attendance Mark (mapped to attendance marks value)
                    float mark = (percentage / 100.0f) * attendanceMarks;
                    drawTableCell(contentStream, String.format("%.1f", mark), cellX, currentY, subColWidth, rowHeight);
                    cellX += subColWidth;
                }
                
                currentY -= rowHeight;
                
                // Check if we need a new page
                if (currentY < bottomMargin + 50) {
                    // Create landscape page (842 x 595)
                    page = new PDPage(new PDRectangle(842, 595));
                    document.addPage(page);
                    currentY = pageHeight - topMargin;
                    contentStream.endText();
                }
            }
            
            // Add Total Classes Taken info per teacher/subject
            currentY -= 15;
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 10);
            drawText(contentStream, PDType1Font.HELVETICA_BOLD, 10, "Total Classes Taken by Teacher", leftMargin, currentY);
            currentY -= 12;
            
            contentStream.setFont(PDType1Font.HELVETICA, 9);
            
            // Calculate total classes taken per subject
            for (Subject subject : subjects) {
                List<Attendance> allAttendances = attendanceRepository.findBySubjectId(subject.getId());
                // Count all attendance records (each marking represents a class session)
                // Divide by number of students to get unique class sessions
                long totalAttendanceRecords = allAttendances.size();
                long totalStudents = allAttendances.stream()
                        .map(a -> a.getStudent().getId())
                        .distinct()
                        .count();
                int totalClassesTaken = totalStudents > 0 ? (int) Math.ceil((double) totalAttendanceRecords / totalStudents) : (int) totalAttendanceRecords;
                
                String teacherInfo = subject.getCourseCode() + " (" + subject.getTeacher().getUser().getFullName() + "): ";
                drawText(contentStream, PDType1Font.HELVETICA, 8, teacherInfo + totalClassesTaken + " classes marked", leftMargin, currentY);
                currentY -= 9;
            }
            
            // Faculty names at bottom
            currentY -= 10;
            contentStream.setFont(PDType1Font.HELVETICA, 9);
            
            // Create a set of unique teacher names
            Set<String> facultyNames = subjects.stream()
                    .map(s -> s.getTeacher().getUser().getFullName())
                    .collect(Collectors.toSet());
            
            drawText(contentStream, PDType1Font.HELVETICA_BOLD, 9, "Name of Faculty", leftMargin, currentY);
            currentY -= 10;
            
            for (String facultyName : facultyNames) {
                drawText(contentStream, PDType1Font.HELVETICA, 8, "• " + facultyName, leftMargin + 10, currentY);
                currentY -= 8;
            }
            
            // NQ Criteria info
            currentY -= 5;
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 8);
            drawText(contentStream, PDType1Font.HELVETICA, 8, 
                    "Note: NQ = Not Qualified (< " + nqCriteria + "%),  Q = Qualified (>= " + nqCriteria + "%)", 
                    leftMargin, currentY);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.save(outputStream);
        document.close();
        
        return outputStream.toByteArray();
    }

    /**
     * Export attendance report as Excel
     */
    public byte[] exportAttendanceAsExcel(String program, Integer semester, Float nqCriteria, Float attendanceMarks,
                                         LocalDate startDate, LocalDate endDate) throws IOException {
        List<Student> students = studentRepository.findByProgramAndSemester(program, semester);
        List<Subject> subjects = subjectRepository.findByProgramAndSemester(program, semester);
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Attendance Report");
        
        // Title row
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("ATTENDANCE PROGRESS REPORT");
        CellStyle titleStyle = workbook.createCellStyle();
        titleStyle.setFont(createBoldFont(workbook));
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 2 + subjects.size() * 4));
        
        // Info row
        Row infoRow = sheet.createRow(1);
        infoRow.createCell(0).setCellValue("Program: " + program + "  |  Semester: " + semester);
        
        Row dateRow = sheet.createRow(2);
        if (startDate != null && endDate != null) {
            dateRow.createCell(0).setCellValue("Report Date: " + LocalDate.now() + 
                    " | Filter: " + startDate + " to " + endDate);
        } else {
            dateRow.createCell(0).setCellValue("Report Date: " + LocalDate.now());
        }
        
        // Header row with improved formatting
        Row headerRow = sheet.createRow(4);
        int colIndex = 0;
        
        // Create header style with better formatting
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFont(createBoldFont(workbook));
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
        headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        
        Cell snCell = headerRow.createCell(colIndex++);
        snCell.setCellValue("S. No.");
        snCell.setCellStyle(headerStyle);
        sheet.setColumnWidth(0, 800); // Narrow width for S. No.
        
        Cell rollNoCell = headerRow.createCell(colIndex++);
        rollNoCell.setCellValue("Roll No");
        rollNoCell.setCellStyle(headerStyle);
        sheet.setColumnWidth(1, 3500);
        
        Cell nameCell = headerRow.createCell(colIndex++);
        nameCell.setCellValue("Name of Student");
        nameCell.setCellStyle(headerStyle);
        sheet.setColumnWidth(2, 4500);
        
        for (Subject subject : subjects) {
            // Subject code header (spanned across 4 columns)
            int subjectStartCol = colIndex;
            
            Cell tcaCell = headerRow.createCell(colIndex++);
            tcaCell.setCellValue(subject.getCourseCode());
            tcaCell.setCellStyle(headerStyle);
            
            Cell percentCell = headerRow.createCell(colIndex++);
            percentCell.setCellStyle(headerStyle);
            
            Cell statusCell = headerRow.createCell(colIndex++);
            statusCell.setCellStyle(headerStyle);
            
            Cell markCell = headerRow.createCell(colIndex++);
            markCell.setCellStyle(headerStyle);
            
            // Merge cells for subject code header
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(4, 4, subjectStartCol, colIndex - 1));
        }
        
        // Add teacher names row (row 5)
        Row teacherRow = sheet.createRow(5);
        int teacherColIndex = 0;
        
        // Add empty styled cells for S.No, Roll No, Name in teacher row
        for (int i = 0; i < 3; i++) {
            Cell emptyCell = teacherRow.createCell(teacherColIndex);
            CellStyle emptyCellStyle = workbook.createCellStyle();
            emptyCellStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
            emptyCellStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            emptyCellStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCell.setCellStyle(emptyCellStyle);
            teacherColIndex++;
        }
        
        for (Subject subject : subjects) {
            int teacherStartCol = teacherColIndex;
            CellStyle teacherStyle = workbook.createCellStyle();
            teacherStyle.setFont(createBoldFont(workbook));
            teacherStyle.setAlignment(HorizontalAlignment.CENTER);
            teacherStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            teacherStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
            teacherStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            teacherStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            teacherStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            teacherStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            teacherStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            Cell teacherCell = teacherRow.createCell(teacherStartCol);
            teacherCell.setCellValue(subject.getTeacher().getUser().getFullName());
            teacherCell.setCellStyle(teacherStyle);
            
            // Merge cells for teacher name (spanning 4 columns)
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(5, 5, teacherStartCol, teacherStartCol + 3));
            teacherColIndex += 4;
        }
        
        teacherRow.setHeightInPoints(16);
        
        // Add total classes taken row (row 6)
        Row totalClassesRow = sheet.createRow(6);
        int totalColIndex = 0;
        
        // Add empty styled cells for S.No, Roll No, Name in total row
        for (int i = 0; i < 3; i++) {
            Cell emptyCell = totalClassesRow.createCell(totalColIndex);
            CellStyle emptyCellStyle = workbook.createCellStyle();
            emptyCellStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.PALE_BLUE.getIndex());
            emptyCellStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            emptyCellStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCell.setCellStyle(emptyCellStyle);
            totalColIndex++;
        }
        
        for (Subject subject : subjects) {
            List<Attendance> allAttendances = attendanceRepository.findBySubjectId(subject.getId());
            // Count all attendance records (each marking represents a class session)
            // Divide by number of students to get unique class sessions
            long totalAttendanceRecords = allAttendances.size();
            long totalStudents = allAttendances.stream()
                    .map(a -> a.getStudent().getId())
                    .distinct()
                    .count();
            int totalClassesTaken = totalStudents > 0 ? (int) Math.ceil((double) totalAttendanceRecords / totalStudents) : (int) totalAttendanceRecords;
            
            CellStyle totalStyle = workbook.createCellStyle();
            totalStyle.setFont(createBoldFont(workbook));
            totalStyle.setAlignment(HorizontalAlignment.CENTER);
            totalStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            totalStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.PALE_BLUE.getIndex());
            totalStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            totalStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            totalStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            totalStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            totalStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            Cell totalCell = totalClassesRow.createCell(totalColIndex);
            totalCell.setCellValue("Classes: " + totalClassesTaken);
            totalCell.setCellStyle(totalStyle);
            
            // Merge cells for total classes (spanning 4 columns)
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(6, 6, totalColIndex, totalColIndex + 3));
            totalColIndex += 4;
        }
        
        totalClassesRow.setHeightInPoints(14);
        
        // Add sub-headers in row 7
        Row subHeaderRow = sheet.createRow(7);
        int subHeaderColIndex = 0;
        
        // Add empty styled cells for S.No, Roll No, Name in sub-header row
        for (int i = 0; i < 3; i++) {
            Cell emptyCell = subHeaderRow.createCell(subHeaderColIndex);
            CellStyle emptyCellStyle = workbook.createCellStyle();
            emptyCellStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
            emptyCellStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            emptyCellStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCellStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            emptyCell.setCellStyle(emptyCellStyle);
            subHeaderColIndex++;
        }
        
        for (int i = 0; i < subjects.size(); i++) {
            CellStyle subHeaderStyle = workbook.createCellStyle();
            subHeaderStyle.setFont(createBoldFont(workbook));
            subHeaderStyle.setAlignment(HorizontalAlignment.CENTER);
            subHeaderStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            subHeaderStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.LIGHT_BLUE.getIndex());
            subHeaderStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            subHeaderStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            subHeaderStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            subHeaderStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            subHeaderStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            Cell tcaSubHeader = subHeaderRow.createCell(subHeaderColIndex++);
            tcaSubHeader.setCellValue("TCA");
            tcaSubHeader.setCellStyle(subHeaderStyle);
            sheet.setColumnWidth(subHeaderColIndex - 1, 2200);
            
            Cell percentSubHeader = subHeaderRow.createCell(subHeaderColIndex++);
            percentSubHeader.setCellValue("%");
            percentSubHeader.setCellStyle(subHeaderStyle);
            sheet.setColumnWidth(subHeaderColIndex - 1, 1800);
            
            Cell statusSubHeader = subHeaderRow.createCell(subHeaderColIndex++);
            statusSubHeader.setCellValue("Status");
            statusSubHeader.setCellStyle(subHeaderStyle);
            sheet.setColumnWidth(subHeaderColIndex - 1, 2000);
            
            Cell markSubHeader = subHeaderRow.createCell(subHeaderColIndex++);
            markSubHeader.setCellValue("Mark");
            markSubHeader.setCellStyle(subHeaderStyle);
            sheet.setColumnWidth(subHeaderColIndex - 1, 1800);
        }
        
        subHeaderRow.setHeightInPoints(18);
        
        // Set header row height for better visibility
        headerRow.setHeightInPoints(20);
        
        // Data rows (starting from row 8 since we added teacher and total classes rows)
        int rowIndex = 8;
        int serialNumber = 1;
        
        for (Student student : students) {
            Row row = sheet.createRow(rowIndex++);
            colIndex = 0;
            
            row.createCell(colIndex++).setCellValue(serialNumber++);
            row.createCell(colIndex++).setCellValue(student.getStudentId());
            row.createCell(colIndex++).setCellValue(student.getUser().getFullName());
            
            for (Subject subject : subjects) {
                List<Attendance> attendances = startDate != null && endDate != null
                        ? attendanceRepository.findByStudentIdAndCourseIdAndAttendanceDateBetween(
                                student.getId(), subject.getId(), startDate, endDate)
                        : attendanceRepository.findByStudentIdAndCourseId(student.getId(), subject.getId());
                
                int totalClasses = attendances.size();
                int classesAttended = (int) attendances.stream()
                        .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                        .count();
                
                float percentage = totalClasses > 0 ? (classesAttended * 100.0f) / totalClasses : 0.0f;
                String status = percentage >= nqCriteria ? "Q" : "NQ";
                
                row.createCell(colIndex++).setCellValue(classesAttended);
                row.createCell(colIndex++).setCellValue(percentage);
                row.createCell(colIndex++).setCellValue(status);
                
                // Mark mapped to attendance marks value
                float mark = (percentage / 100.0f) * attendanceMarks;
                row.createCell(colIndex++).setCellValue(mark);
            }
        }
        
        // Footer with notes
        int footerRow = rowIndex + 2;
        Row noteRow1 = sheet.createRow(footerRow);
        noteRow1.createCell(0).setCellValue("Note: NQ = Not Qualified (< " + nqCriteria + "%),  Q = Qualified (>= " + nqCriteria + "%)");
        
        // Auto-size columns
        for (int i = 0; i < colIndex; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        
        return outputStream.toByteArray();
    }

    // Helper methods
    private float drawText(PDPageContentStream contentStream, PDFont font, int fontSize,
                          String text, float x, float y) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
        return y - fontSize;
    }

    private float drawCenteredText(PDPageContentStream contentStream, PDFont font, int fontSize,
                                  String text, float x, float y) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        float textWidth = font.getStringWidth(text) / 1000 * fontSize;
        contentStream.newLineAtOffset(x - textWidth / 2, y);
        contentStream.showText(text);
        contentStream.endText();
        return y - fontSize - 5;
    }

    private void drawTableCell(PDPageContentStream contentStream, String text, float x, float y,
                              float width, float height) throws IOException {
        // Draw border
        contentStream.setStrokingColor(new PDColor(new float[]{0, 0, 0}, PDDeviceRGB.INSTANCE));
        contentStream.setLineWidth(0.5f);
        contentStream.addRect(x, y - height, width, height);
        contentStream.stroke();
        
        // Draw text with top margin
        contentStream.beginText();
        contentStream.newLineAtOffset(x + 2, y - height + height - 8); // Add margin from top
        contentStream.showText(text != null ? text : "");
        contentStream.endText();
    }

    private void drawTableCellMultiLine(PDPageContentStream contentStream, String text, float x, float y,
                                       float width, float height) throws IOException {
        // Draw border
        contentStream.setStrokingColor(new PDColor(new float[]{0, 0, 0}, PDDeviceRGB.INSTANCE));
        contentStream.setLineWidth(0.5f);
        contentStream.addRect(x, y - height, width, height);
        contentStream.stroke();
        
        // Draw multi-line text with top margin
        if (text != null && !text.isEmpty()) {
            String[] lines = text.split("\n");
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA, 7);
            float lineY = y - height + 10;  // Proper margin from top of cell
            for (String line : lines) {
                contentStream.newLineAtOffset(x + 2, lineY);
                contentStream.showText(line);
                lineY -= 8;
                contentStream.endText();
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 7);
            }
            contentStream.endText();
        }
    }

    /**
     * Export teacher's subject attendance as PDF
     */
    public byte[] exportTeacherSubjectAttendanceAsPDF(String teacherIdentifier, Long subjectId) throws IOException {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        // Get program name for display and query
        String programName = subject.getProgramName() != null ? subject.getProgramName() : 
                            (subject.getProgram() != null ? subject.getProgram().getName() : "Unknown");
        
        // Get all students in the program/semester (like admin report)
        List<Student> students = studentRepository.findByProgramAndSemester(programName, subject.getSemester());
        
        // Calculate total classes taken for this subject
        // Get only attendance records for students enrolled in this subject
        List<Attendance> allAttendances = attendanceRepository.findBySubjectId(subject.getId());
        Set<Long> studentIdsWithAttendance = allAttendances.stream().map(a -> a.getStudent().getId()).collect(Collectors.toSet());
        int totalClassesTaken = studentIdsWithAttendance.size() > 0 ? allAttendances.size() / studentIdsWithAttendance.size() : 0;
        
        PDDocument document = new PDDocument();
        PDPage page = new PDPage(new PDRectangle(842, 595));
        document.addPage(page);
        
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
            float pageWidth = 842;
            float pageHeight = 595;
            float leftMargin = 25;
            float topMargin = 30;
            float currentY = pageHeight - topMargin;
            
            // Title
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            currentY = drawCenteredText(contentStream, PDType1Font.HELVETICA_BOLD, 14, 
                    "ATTENDANCE REPORT", pageWidth / 2, currentY);
            currentY -= 15;
            
            // Subject info
            contentStream.setFont(PDType1Font.HELVETICA, 11);
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 11, 
                    "Subject: " + subject.getSubjectName() + " (" + subject.getCourseCode() + ")", 
                    leftMargin, currentY);
            currentY -= 8;
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 11, 
                    "Program: " + programName + "    Semester: " + subject.getSemester(), 
                    leftMargin, currentY);
            currentY -= 8;
            String teacherName = subject.getTeacher() != null && subject.getTeacher().getUser() != null 
                    ? subject.getTeacher().getUser().getFullName() : "N/A";
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 11, 
                    "Teacher: " + teacherName, 
                    leftMargin, currentY);
            currentY -= 8;
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 11, 
                    "Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), 
                    leftMargin, currentY);
            currentY -= 8;
            currentY = drawText(contentStream, PDType1Font.HELVETICA, 11, 
                    "Total Classes Taken: " + totalClassesTaken, 
                    leftMargin, currentY);
            
            currentY -= 15;
            
            // Table header
            float colWidth = (pageWidth - 50) / 4;
            float rowHeight = 18;
            
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 9);
            contentStream.setNonStrokingColor(new PDColor(new float[]{1, 1, 1}, PDDeviceRGB.INSTANCE));
            contentStream.setNonStrokingColor(new PDColor(new float[]{52f/255, 73f/255, 94f/255}, PDDeviceRGB.INSTANCE));
            contentStream.addRect(leftMargin, currentY - rowHeight, pageWidth - 50, rowHeight);
            contentStream.fill();
            contentStream.setNonStrokingColor(new PDColor(new float[]{1, 1, 1}, PDDeviceRGB.INSTANCE));
            
            float cellX = leftMargin;
            drawTableCell(contentStream, "Roll No", cellX, currentY, colWidth, rowHeight);
            cellX += colWidth;
            drawTableCell(contentStream, "Student Name", cellX, currentY, colWidth, rowHeight);
            cellX += colWidth;
            drawTableCell(contentStream, "Class", cellX, currentY, colWidth, rowHeight);
            cellX += colWidth;
            drawTableCell(contentStream, "Attendance %", cellX, currentY, colWidth, rowHeight);
            
            currentY -= rowHeight;
            contentStream.setNonStrokingColor(new PDColor(new float[]{0, 0, 0}, PDDeviceRGB.INSTANCE));
            
            // Data rows
            for (Student student : students) {
                cellX = leftMargin;
                List<Attendance> attendances = attendanceRepository.findByStudentIdAndCourseId(student.getId(), subjectId);
                int totalClasses = attendances.size();
                int classesAttended = (int) attendances.stream()
                        .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                        .count();
                double percentage = totalClasses > 0 ? (classesAttended * 100.0) / totalClasses : 0;
                
                drawTableCell(contentStream, student.getStudentId(), cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
                drawTableCell(contentStream, student.getUser().getFullName(), cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
                drawTableCell(contentStream, String.valueOf(classesAttended), cellX, currentY, colWidth, rowHeight);
                cellX += colWidth;
                drawTableCell(contentStream, String.format("%.1f%%", percentage), cellX, currentY, colWidth, rowHeight);
                
                currentY -= rowHeight;
            }
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.save(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    /**
     * Export teacher's subject attendance as Excel
     */
    public byte[] exportTeacherSubjectAttendanceAsExcel(String teacherIdentifier, Long subjectId) throws IOException {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Attendance");
        
        // Get program name for display and query
        String programName = subject.getProgramName() != null ? subject.getProgramName() : 
                            (subject.getProgram() != null ? subject.getProgram().getName() : "Unknown");
        
        // Get all students in the program/semester (like admin report)
        List<Student> students = studentRepository.findByProgramAndSemester(programName, subject.getSemester());
        
        // Info rows
        Row infoRow1 = sheet.createRow(0);
        infoRow1.createCell(0).setCellValue("Subject: " + subject.getSubjectName() + " (" + subject.getCourseCode() + ")");
        
        Row infoRow2 = sheet.createRow(1);
        infoRow2.createCell(0).setCellValue("Program: " + programName + "  |  Semester: " + subject.getSemester());
        
        Row infoRow3 = sheet.createRow(2);
        String teacherName = subject.getTeacher() != null && subject.getTeacher().getUser() != null 
                ? subject.getTeacher().getUser().getFullName() : "N/A";
        infoRow3.createCell(0).setCellValue("Teacher: " + teacherName);
        
        // Calculate total classes taken for this subject
        // Get only attendance records for students enrolled in this subject
        List<Attendance> allAttendances = attendanceRepository.findBySubjectId(subject.getId());
        Set<Long> studentIdsWithAttendance = allAttendances.stream().map(a -> a.getStudent().getId()).collect(Collectors.toSet());
        int totalClassesTaken = studentIdsWithAttendance.size() > 0 ? allAttendances.size() / studentIdsWithAttendance.size() : 0;
        
        // Add Total Classes Taken line
        Row totalClassesRow = sheet.createRow(3);
        totalClassesRow.createCell(0).setCellValue("Total Classes Taken: " + totalClassesTaken);
        
        // Header row
        Row headerRow = sheet.createRow(4);
        headerRow.createCell(0).setCellValue("Roll No");
        headerRow.createCell(1).setCellValue("Student Name");
        headerRow.createCell(2).setCellValue("Class");
        headerRow.createCell(3).setCellValue("Attendance %");
        
        // Data rows
        int rowNum = 5;
        for (Student student : students) {
            List<Attendance> attendances = attendanceRepository.findByStudentIdAndCourseId(student.getId(), subjectId);
            int totalClasses = attendances.size();
            int classesAttended = (int) attendances.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();
            double percentage = totalClasses > 0 ? (classesAttended * 100.0) / totalClasses : 0;
            
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(student.getStudentId());
            row.createCell(1).setCellValue(student.getUser().getFullName());
            row.createCell(2).setCellValue(classesAttended);
            row.createCell(3).setCellValue(String.format("%.1f%%", percentage));
        }
        
        // Auto-resize columns
        for (int i = 0; i < 4; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private Font createBoldFont(Workbook workbook) {
        Font font = workbook.createFont();
        font.setBold(true);
        return font;
    }
}

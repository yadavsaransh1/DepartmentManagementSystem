package com.department.service;

import com.department.model.Attendance;
import com.department.model.Subject;
import com.department.repository.AttendanceRepository;
import com.department.repository.StudentRepository;
import com.department.repository.SubjectRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExportService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SubjectRepository subjectRepository;


    public byte[] exportStudentStatisticsAsExcel(Long studentId) throws IOException {
        Workbook workbook = new XSSFWorkbook();

        // Create Summary Sheet
        Sheet summarySheet = workbook.createSheet("Student Statistics");
        addStudentSummary(summarySheet, studentId);

        // Create Attendance Sheet
        Sheet attendanceSheet = workbook.createSheet("Attendance Details");
        addAttendanceDetails(attendanceSheet, studentId);

        // Create Subject Enrollment Sheet
        Sheet enrollmentSheet = workbook.createSheet("Enrolled Subjects");
        addEnrollmentDetails(enrollmentSheet, studentId);

        // Write to ByteArray
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    public byte[] exportStudentStatisticsAsPDF(Long studentId) throws IOException {
        PDDocument document = new PDDocument();
        
        // Page 1: Summary
        PDPage summaryPage = new PDPage();
        document.addPage(summaryPage);
        
        try (PDPageContentStream summaryStream = new PDPageContentStream(document, summaryPage)) {
            float leftMargin = 50;
            float currentY = 750;
            
            // Title
            currentY = writePDFText(summaryStream, leftMargin, currentY, "Student Statistics Report", PDType1Font.HELVETICA_BOLD, 16);
            currentY -= 15;
            
            var student = studentRepository.findById(studentId);
            if (student.isPresent()) {
                var s = student.get();
                
                // Student Info
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Student Name: " + s.getUser().getFullName(), PDType1Font.HELVETICA, 11);
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Email: " + s.getUser().getEmail(), PDType1Font.HELVETICA, 11);
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Program: " + s.getProgram(), PDType1Font.HELVETICA, 11);
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Semester: " + s.getSemester(), PDType1Font.HELVETICA, 11);
                
                // Get subjects for this student's program/semester
                String program = s.getProgram();
                Integer semester = s.getSemester();
                List<Subject> subjects = subjectRepository.findByProgramAndSemester(program, semester);
                long enrolledCount = subjects.size();
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Enrolled Subjects: " + enrolledCount, PDType1Font.HELVETICA, 11);
                
                currentY -= 10;
                List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
                
                currentY = writePDFText(summaryStream, leftMargin, currentY, "Attendance Statistics:", PDType1Font.HELVETICA_BOLD, 11);
                
                if (!attendances.isEmpty()) {
                    long presentCount = attendances.stream().filter(a -> Attendance.AttendanceStatus.PRESENT.equals(a.getStatus())).count();
                    long absentCount = attendances.stream().filter(a -> Attendance.AttendanceStatus.ABSENT.equals(a.getStatus())).count();
                    
                    double attendancePercentage = ((double) presentCount / attendances.size()) * 100;
                    
                    currentY = writePDFText(summaryStream, leftMargin, currentY, "  Total Records: " + attendances.size(), PDType1Font.HELVETICA, 10);
                    currentY = writePDFText(summaryStream, leftMargin, currentY, "  Present: " + presentCount, PDType1Font.HELVETICA, 10);
                    currentY = writePDFText(summaryStream, leftMargin, currentY, "  Absent: " + absentCount, PDType1Font.HELVETICA, 10);
                    currentY = writePDFText(summaryStream, leftMargin, currentY, String.format("  Attendance Percentage: %.2f%%", attendancePercentage), PDType1Font.HELVETICA, 10);
                }
            }
        }
        
        // Page 2: Enrolled Subjects/Teacher Information
        var student = studentRepository.findById(studentId);
        if (student.isPresent()) {
            var s = student.get();
            String program = s.getProgram();
            Integer semester = s.getSemester();
            List<Subject> subjects = subjectRepository.findByProgramAndSemester(program, semester);
            if (!subjects.isEmpty()) {
                addEnrollmentDetailsPage(document, studentId, subjects);
            }
        }
        
        // Page 3+: Attendance Details with proper page breaks
        List<Attendance> allAttendances = attendanceRepository.findByStudentId(studentId);
        if (!allAttendances.isEmpty()) {
            addAttendanceDetailsPages(document, allAttendances);
        }
        
        // Write to ByteArray
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.save(outputStream);
        document.close();
        
        return outputStream.toByteArray();
    }
    
    private void addAttendanceDetailsPages(PDDocument document, List<Attendance> attendances) throws IOException {
        float leftMargin = 50;
        float bottomMargin = 50;
        float topMargin = 750;
        
        PDPage currentPage = new PDPage();
        document.addPage(currentPage);
        PDPageContentStream currentStream = new PDPageContentStream(document, currentPage);
        
        float currentY = topMargin;
        currentY = writePDFText(currentStream, leftMargin, currentY, "Attendance Details", PDType1Font.HELVETICA_BOLD, 14);
        currentY -= 10;
        
        // Table header
        currentY = writePDFText(currentStream, leftMargin, currentY, "Date                Subject                                     Status", PDType1Font.HELVETICA_BOLD, 9);
        currentY -= 5;
        currentStream.setLineWidth(0.5f);
        currentStream.moveTo(leftMargin, currentY);
        currentStream.lineTo(550, currentY);
        currentStream.stroke();
        currentY -= 10;
        
        for (Attendance attendance : attendances) {
            if (currentY < bottomMargin) {
                // Close current stream and create new page
                currentStream.close();
                currentPage = new PDPage();
                document.addPage(currentPage);
                currentStream = new PDPageContentStream(document, currentPage);
                currentY = topMargin;
                currentY = writePDFText(currentStream, leftMargin, currentY, "Attendance Details (Continued)", PDType1Font.HELVETICA_BOLD, 12);
                currentY -= 10;
            }
            
            String date = attendance.getAttendanceDate() != null ? attendance.getAttendanceDate().toString() : "N/A";
            String subject = attendance.getSubject() != null ? attendance.getSubject().getSubjectName() : "N/A";
            String status = attendance.getStatus() != null ? attendance.getStatus().toString() : "N/A";
            
            if (subject.length() > 40) {
                subject = subject.substring(0, 40);
            }
            
            String row = String.format("%-19s %-44s %s", date, subject, status);
            currentY = writePDFText(currentStream, leftMargin, currentY, row, PDType1Font.HELVETICA, 9);
        }
        
        currentStream.close();
    }

    private float writePDFText(PDPageContentStream contentStream, float x, float y, String text, PDType1Font font, int fontSize) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
        return y - (fontSize + 2);
    }

    private void addEnrollmentDetailsPage(PDDocument document, Long studentId, List<Subject> subjects) throws IOException {
        float leftMargin = 50;
        float bottomMargin = 50;
        float topMargin = 750;
        
        PDPage page = new PDPage();
        document.addPage(page);
        PDPageContentStream stream = new PDPageContentStream(document, page);
        
        float currentY = topMargin;
        
        // Title
        currentY = writePDFText(stream, leftMargin, currentY, "Enrolled Subjects & Teachers", PDType1Font.HELVETICA_BOLD, 14);
        currentY -= 10;
        
        // Table header
        currentY = writePDFText(stream, leftMargin, currentY, "Subject                          Teacher                        Total Classes", PDType1Font.HELVETICA_BOLD, 9);
        currentY -= 5;
        stream.setLineWidth(0.5f);
        stream.moveTo(leftMargin, currentY);
        stream.lineTo(550, currentY);
        stream.stroke();
        currentY -= 10;
        
        for (var subject : subjects) {
            if (currentY < bottomMargin + 20) {
                // Create new page
                stream.close();
                page = new PDPage();
                document.addPage(page);
                stream = new PDPageContentStream(document, page);
                currentY = topMargin;
                currentY = writePDFText(stream, leftMargin, currentY, "Enrolled Subjects & Teachers (Continued)", PDType1Font.HELVETICA_BOLD, 12);
                currentY -= 10;
                // Re-create the table header
                currentY = writePDFText(stream, leftMargin, currentY, "Subject                          Teacher                        Total Classes", PDType1Font.HELVETICA_BOLD, 9);
                currentY -= 5;
                stream.setLineWidth(0.5f);
                stream.moveTo(leftMargin, currentY);
                stream.lineTo(550, currentY);
                stream.stroke();
                currentY -= 10;
            }
            
            String subjectName = subject.getSubjectName();
            if (subjectName.length() > 30) {
                subjectName = subjectName.substring(0, 27) + "...";
            }
            
            String teacherName = subject.getTeacher() != null ? 
                subject.getTeacher().getUser().getFullName() : "N/A";
            if (teacherName.length() > 25) {
                teacherName = teacherName.substring(0, 22) + "...";
            }
            
            long totalClasses = attendanceRepository.countTotalDays(studentId, subject.getId());
            
            String row = String.format("%-32s %-28s %d", subjectName, teacherName, totalClasses);
            currentY = writePDFText(stream, leftMargin, currentY, row, PDType1Font.HELVETICA, 9);
        }
        
        stream.close();
    }

    private void addStudentSummary(Sheet sheet, Long studentId) {
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        Cell headerCell = headerRow.createCell(0);
        headerCell.setCellValue("Student Statistics Report");
        headerCell.setCellStyle(headerStyle);

        var student = studentRepository.findById(studentId);
        if (student.isPresent()) {
            var s = student.get();
            int rowNum = 2;

            addLabelValueRow(sheet, rowNum++, "Student Name", s.getUser().getFullName());
            addLabelValueRow(sheet, rowNum++, "Email", s.getUser().getEmail());
            addLabelValueRow(sheet, rowNum++, "Program", s.getProgram());
            addLabelValueRow(sheet, rowNum++, "Semester", String.valueOf(s.getSemester()));
            
            // Get all subjects for this student's program/semester
            List<Subject> subjects = subjectRepository.findByProgramAndSemester(s.getProgram(), s.getSemester());
            long enrolledCount = subjects.size();
            addLabelValueRow(sheet, rowNum++, "Enrolled Subjects", String.valueOf(enrolledCount));

            List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
            if (!attendances.isEmpty()) {
                long presentCount = attendances.stream().filter(a -> Attendance.AttendanceStatus.PRESENT.equals(a.getStatus())).count();
                long absentCount = attendances.stream().filter(a -> Attendance.AttendanceStatus.ABSENT.equals(a.getStatus())).count();

                double attendancePercentage = !attendances.isEmpty() 
                    ? ((double) presentCount / attendances.size()) * 100 
                    : 0;

                addLabelValueRow(sheet, rowNum++, "Total Attendance Records", String.valueOf(attendances.size()));
                addLabelValueRow(sheet, rowNum++, "Present Count", String.valueOf(presentCount));
                addLabelValueRow(sheet, rowNum++, "Absent Count", String.valueOf(absentCount));
                addLabelValueRow(sheet, rowNum, "Attendance Percentage", String.format("%.2f%%", attendancePercentage));
            }
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void addAttendanceDetails(Sheet sheet, Long studentId) {
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        String[] headers = {"Date", "Subject", "Status"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        int rowNum = 1;
        for (Attendance attendance : attendances) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(attendance.getAttendanceDate() != null ? attendance.getAttendanceDate().toString() : "");
            row.createCell(1).setCellValue(attendance.getSubject() != null ? attendance.getSubject().getSubjectName() : "");
            row.createCell(2).setCellValue(attendance.getStatus() != null ? attendance.getStatus().toString() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void addEnrollmentDetails(Sheet sheet, Long studentId) {
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 11);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        String[] headers = {"Subject Code", "Subject Name", "Teacher", "Semester", "Credits", "Total Classes"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        var student = studentRepository.findById(studentId);
        if (student.isPresent()) {
            String program = student.get().getProgram();
            Integer semester = student.get().getSemester();
            List<Subject> subjects = subjectRepository.findByProgramAndSemester(program, semester);
            
            int rowNum = 1;
            for (var subject : subjects) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(subject.getSubjectCode());
                row.createCell(1).setCellValue(subject.getSubjectName());
                row.createCell(2).setCellValue(subject.getTeacher() != null ? subject.getTeacher().getUser().getFullName() : "");
                row.createCell(3).setCellValue(subject.getSemester());
                row.createCell(4).setCellValue(subject.getCredits());
                
                // Count total classes for this student in this subject
                long totalClasses = attendanceRepository.countTotalDays(studentId, subject.getId());
                row.createCell(5).setCellValue(totalClasses);
            }
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void addLabelValueRow(Sheet sheet, int rowNum, String label, String value) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);

        Font boldFont = sheet.getWorkbook().createFont();
        boldFont.setBold(true);
        CellStyle boldStyle = sheet.getWorkbook().createCellStyle();
        boldStyle.setFont(boldFont);
        labelCell.setCellStyle(boldStyle);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
    }


}

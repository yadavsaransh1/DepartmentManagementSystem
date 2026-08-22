package com.department.service;

import com.department.dto.RoutineDTO;
import com.department.model.Routine;
import com.department.model.User;
import com.department.model.Teacher;
import com.department.repository.RoutineRepository;
import com.department.repository.UserRepository;
import com.department.repository.TeacherRepository;
import com.department.utils.TimeRangeParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoutineService {

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    public RoutineDTO uploadRoutine(MultipartFile file, String semester, String academicYear, 
                                     String description, String uploadedByEmail) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 50MB");
        }

        @SuppressWarnings("unused")
        User uploader = userRepository.findById(uploadedByEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String filePath = "routines/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Routine routine = new Routine();
        routine.setFileName(file.getOriginalFilename());
        routine.setFileType(file.getContentType());
        routine.setFileSize(file.getSize());
        routine.setFilePath(filePath);
        routine.setSemester(semester);
        routine.setAcademicYear(academicYear);
        routine.setDescription(description);
        routine.setUploadedByEmail(uploadedByEmail);
        routine.setDownloadCount(0);
        routine.setCreatedAt(LocalDateTime.now());
        routine.setUpdatedAt(LocalDateTime.now());

        Routine savedRoutine = routineRepository.save(routine);
        return convertToDTO(savedRoutine);
    }

    public List<RoutineDTO> getRoutinesBySemester(String semester) {
        return routineRepository.findBySemester(semester).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoutineDTO> getAllRoutines() {
        return routineRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoutineDTO> getRoutinesByUploader(Long uploadedById) {
        // Backward compatibility: old numeric reference is no longer primary,
        // so we return all or filter by teacher if possible.
        List<Routine> routines = routineRepository.findAll();
        return routines.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoutineDTO> getRoutinesByUploaderIdentifier(String uploadedByIdentifier) {
        if (uploadedByIdentifier == null || uploadedByIdentifier.trim().isEmpty()) {
            return getAllRoutines();
        }

        // If this looks like an email, use email lookup.
        if (uploadedByIdentifier.contains("@")) {
            return getRoutinesByUploaderEmail(uploadedByIdentifier);
        }

        // Fallback: try to parse as teacher or student numeric id and get all routines for that user session.
        try {
            Long parsedId = Long.parseLong(uploadedByIdentifier);
            // The user repository no longer supports numeric PK; but we can try teacher or student id references
            return routineRepository.findByTeacherIdOrderByCreatedAtDesc(parsedId).stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (NumberFormatException ignored) {
        }

        return getAllRoutines();
    }

    public List<RoutineDTO> getRoutinesByUploaderEmail(String uploaderEmail) {
        if (uploaderEmail == null || uploaderEmail.trim().isEmpty()) {
            return getAllRoutines();
        }
        return routineRepository.findByUploadedByEmailOrderByCreatedAtDesc(uploaderEmail).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoutineDTO> getRoutinesByTeacher(Long teacherId) {
        if (teacherId == null) {
            return getAllRoutines();
        }
        return routineRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoutineDTO> getRoutinesByTeacherIdentifier(String teacherIdentifier) {
        System.out.println("DEBUG: getRoutinesByTeacherIdentifier called with: [" + teacherIdentifier + "]");
        
        if (teacherIdentifier == null || teacherIdentifier.trim().isEmpty()) {
            System.out.println("DEBUG: teacherIdentifier is null/empty, returning ALL routines");
            return getAllRoutines();
        }

        // numeric ID path
        try {
            Long teacherId = Long.parseLong(teacherIdentifier);
            System.out.println("DEBUG: Successfully parsed as numeric ID: " + teacherId);
            List<RoutineDTO> result = getRoutinesByTeacher(teacherId);
            System.out.println("DEBUG: Found " + result.size() + " routines for teacher ID " + teacherId);
            return result;
        } catch (NumberFormatException e) {
            System.out.println("DEBUG: Failed to parse as numeric ID, trying email lookup");
        }

        // email path
        System.out.println("DEBUG: Attempting email lookup for: " + teacherIdentifier);
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(teacherIdentifier);
        if (teacherOpt.isPresent()) {
            Long teacherId = teacherOpt.get().getId();
            System.out.println("DEBUG: Found teacher with ID " + teacherId + " for email " + teacherIdentifier);
            List<RoutineDTO> result = getRoutinesByTeacher(teacherId);
            System.out.println("DEBUG: Found " + result.size() + " routines for this teacher");
            return result;
        }

        System.out.println("DEBUG: No teacher found, returning ALL routines (fallback)");
        return getAllRoutines();
    }

    public Optional<Routine> getRoutineFile(Long routineId) {
        Optional<Routine> routine = routineRepository.findById(routineId);
        if (routine.isPresent()) {
            routine.get().setDownloadCount(routine.get().getDownloadCount() + 1);
            routineRepository.save(routine.get());
        }
        return routine;
    }

    public RoutineDTO getRoutineDetails(Long routineId) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new RuntimeException("Routine not found"));
        return convertToDTO(routine);
    }

    public boolean deleteRoutine(Long routineId) {
        if (routineRepository.existsById(routineId)) {
            routineRepository.deleteById(routineId);
            return true;
        }
        return false;
    }

    public RoutineDTO updateRoutine(Long routineId, String course, String semester, String academicYear, String description, Long teacherId) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new RuntimeException("Routine not found"));

        if (course != null) routine.setCourse(course);
        if (semester != null) routine.setSemester(semester);
        if (academicYear != null) routine.setAcademicYear(academicYear);
        if (description != null) routine.setDescription(description);
        
        if (teacherId != null) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            routine.setTeacher(teacher);
        }
        
        routine.setUpdatedAt(LocalDateTime.now());

        Routine updatedRoutine = routineRepository.save(routine);
        return convertToDTO(updatedRoutine);
    }

    private RoutineDTO convertToDTO(Routine routine) {
        RoutineDTO dto = new RoutineDTO();
        dto.setId(routine.getId());
        dto.setFileName(routine.getFileName());
        dto.setFileType(routine.getFileType());
        dto.setFileSize(routine.getFileSize());
        dto.setCourse(routine.getCourse());
        dto.setSemester(routine.getSemester());
        dto.setAcademicYear(routine.getAcademicYear());
        dto.setDescription(routine.getDescription());
        dto.setDownloadCount(routine.getDownloadCount());

        // Add new time fields
        if (routine.getStartTime() != null) {
            dto.setStartTime(routine.getStartTime().toString()); // Format: "09:30"
        }
        if (routine.getEndTime() != null) {
            dto.setEndTime(routine.getEndTime().toString()); // Format: "10:30"
        }

        // Use the email field directly
        if (routine.getUploadedByEmail() != null) {
            dto.setUploadedBy(routine.getUploadedByEmail());
        }

        if (routine.getTeacher() != null) {
            dto.setTeacherId(routine.getTeacher().getId());
            if (routine.getTeacher().getUser() != null) {
                dto.setTeacherName(routine.getTeacher().getUser().getFullName());
            }
        }

        if (routine.getCreatedAt() != null) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                dto.setCreatedAt(routine.getCreatedAt().format(formatter));
            } catch (Exception e) {
                dto.setCreatedAt(null);
                System.err.println("Warning: unable to format routine createdAt for routine id " + routine.getId() + ": " + e.getMessage());
            }
        }

        return dto;
    }

    public String uploadRoutineFromExcel(MultipartFile file, String userEmail) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        String filename = file.getOriginalFilename();
        if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
            throw new IllegalArgumentException("File must be in Excel format (.xlsx or .xls)");
        }

        User uploader = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int routinesCreated = 0;
        int skippedRows = 0;
        List<String> errors = new ArrayList<>();
        Workbook workbook = null;
        
        try {
            // Create appropriate workbook type based on file extension
            if (filename.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(file.getInputStream());
            } else {
                workbook = new HSSFWorkbook(file.getInputStream());
            }
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Expected Excel Format (Row 1 = Headers, Row 2+ = Data):
            // Column A: TeacherName | Column B: Email | Column C: Subject | Column D: Course | 
            // Column E: Semester | Column F: Day | Column G: StartTime | Column H: Room | Column I: EndTime | Column J: Notes
            
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;

                try {
                    String teacherName = getCellValue(row.getCell(0));
                    String teacherEmail = getCellValue(row.getCell(1));
                    String subjectName = getCellValue(row.getCell(2));
                    String course = getCellValue(row.getCell(3));
                    String semesterStr = getCellValue(row.getCell(4));
                    String day = getCellValue(row.getCell(5));
                    String startTimeStr = getCellValue(row.getCell(6));
                    String room = getCellValue(row.getCell(7));
                    String endTimeStr = getCellValue(row.getCell(8));
                    String notes = getCellValue(row.getCell(9));

                    // Skip if critical fields are empty
                    if (teacherEmail == null || teacherEmail.trim().isEmpty()) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": Teacher email is required");
                        continue;
                    }

                    // Find or create teacher
                    Optional<User> teacherUser = userRepository.findByEmail(teacherEmail);
                    if (!teacherUser.isPresent()) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": Teacher with email '" + teacherEmail + "' not found");
                        continue;
                    }

                    Teacher teacher = teacherRepository.findByUserEmail(teacherUser.get().getEmail()).orElse(null);
                    if (teacher == null) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": No teacher record found for " + teacherEmail);
                        continue;
                    }

                    // Validate and parse time fields
                    if (startTimeStr == null || startTimeStr.trim().isEmpty()) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": Start time is required");
                        continue;
                    }

                    // Parse times using TimeRangeParser (supports multiple formats)
                    LocalTime startTime, endTime;
                    try {
                        startTime = TimeRangeParser.parseTime(startTimeStr);
                        
                        // If endTime is not provided, default to 1 hour after startTime
                        if (endTimeStr == null || endTimeStr.trim().isEmpty()) {
                            endTime = startTime.plusHours(1);
                            System.out.println("Row " + (rowIndex + 1) + ": No end time provided, defaulting to 1 hour after start: " + startTime + " -> " + endTime);
                        } else {
                            endTime = TimeRangeParser.parseTime(endTimeStr);
                        }

                        // Validate time range
                        if (!startTime.isBefore(endTime)) {
                            throw new IllegalArgumentException(
                                    "End time (" + TimeRangeParser.formatTime(endTime) + 
                                    ") must be after start time (" + TimeRangeParser.formatTime(startTime) + ")"
                            );
                        }
                    } catch (IllegalArgumentException e) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": Invalid time format - " + e.getMessage());
                        continue;
                    }

                    // Validate day field
                    if (day == null || day.trim().isEmpty()) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": Day is required");
                        continue;
                    }

                    String normalizedDay;
                    try {
                        normalizedDay = TimeRangeParser.normalizeDay(day);
                    } catch (IllegalArgumentException e) {
                        skippedRows++;
                        errors.add("Row " + (rowIndex + 1) + ": " + e.getMessage());
                        continue;
                    }

                    // Create routine description with all details
                    String description = buildRoutineDescription(teacherName, subjectName, course, semesterStr, normalizedDay, 
                            TimeRangeParser.formatTime(startTime), room, notes);

                    // Create a routine entry for this teacher
                    Routine routine = new Routine();
                    routine.setFileName(teacherName + "_Routine_" + System.currentTimeMillis());
                    routine.setFileType("text/plain");
                    routine.setFileSize(0L); // No actual file
                    routine.setFilePath("routines/excel_import_" + System.currentTimeMillis());
                    routine.setSemester("Semester " + (semesterStr != null ? semesterStr : "1"));
                    routine.setAcademicYear(LocalDateTime.now().getYear() + "-" + (LocalDateTime.now().getYear() + 1));
                    routine.setDescription(description);
                    routine.setUploadedByEmail(uploader.getEmail());
                    routine.setTeacher(teacher);
                    routine.setDownloadCount(0);
                    routine.setCreatedAt(LocalDateTime.now());
                    routine.setUpdatedAt(LocalDateTime.now());

                    // Set the new time fields
                    routine.setStartTime(startTime);
                    routine.setEndTime(endTime);

                    routineRepository.save(routine);
                    routinesCreated++;

                } catch (Exception e) {
                    // Log individual row errors but continue processing
                    skippedRows++;
                    errors.add("Row " + (rowIndex + 1) + ": " + e.getMessage());
                    System.err.println("Error processing routine row " + rowIndex + ": " + e.getMessage());
                }
            }
        } finally {
            if (workbook != null) {
                workbook.close();
            }
        }

        if (routinesCreated == 0) {
            String errorMsg = "No routines could be created. ";
            if (skippedRows > 0) {
                errorMsg += "All " + skippedRows + " rows were skipped. errors: " + String.join("; ", errors);
            }
            throw new IllegalArgumentException(errorMsg);
        }

        String successMsg = "Successfully imported " + routinesCreated + " routine(s)";
        if (skippedRows > 0) {
            successMsg += ". Warning: " + skippedRows + " rows skipped.";
            // Log the skip reasons for debugging
            System.out.println("Skipped row details: " + String.join(" | ", errors));
        }
        return successMsg;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return null;
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    // Extract time from Excel date value (to handle time-only cells)
                    java.util.Date dateValue = cell.getDateCellValue();
                    Calendar cal = Calendar.getInstance();
                    cal.setTime(dateValue);
                    
                    // Format as HH:mm for time cells
                    int hours = cal.get(Calendar.HOUR_OF_DAY);
                    int minutes = cal.get(Calendar.MINUTE);
                    
                    // Return time in HH:mm format
                    return String.format("%02d:%02d", hours, minutes);
                } else {
                    return String.valueOf((int) cell.getNumericCellValue());
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    private String buildRoutineDescription(String teacherName, String subject, String course, String semester, String day, String time, String room, String notes) {
        StringBuilder sb = new StringBuilder();
        
        if (teacherName != null && !teacherName.isEmpty()) {
            sb.append("Teacher: ").append(teacherName).append("\n");
        }
        if (subject != null && !subject.isEmpty()) {
            sb.append("Subject: ").append(subject).append("\n");
        }
        if (course != null && !course.isEmpty()) {
            sb.append("Course: ").append(course).append("\n");
        }
        if (semester != null && !semester.isEmpty()) {
            sb.append("Semester: ").append(semester).append("\n");
        }
        if (day != null && !day.isEmpty()) {
            sb.append("Day: ").append(day).append("\n");
        }
        if (time != null && !time.isEmpty()) {
            sb.append("Time: ").append(time).append("\n");
        }
        if (room != null && !room.isEmpty()) {
            sb.append("Room: ").append(room).append("\n");
        }
        if (notes != null && !notes.isEmpty()) {
            sb.append("Notes: ").append(notes);
        }
        
        return sb.toString();
    }
}

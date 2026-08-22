package com.department.service;

import com.department.model.Student;
import com.department.model.User;
import com.department.repository.StudentRepository;
import com.department.repository.UserRepository;
import jakarta.persistence.PersistenceContext;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.*;
import java.util.logging.Logger;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BulkStudentUploadService {
    
    private static final Logger logger = Logger.getLogger(BulkStudentUploadService.class.getName());

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SubjectEnrollmentService subjectEnrollmentService;

    @PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public Map<String, Object> uploadStudentsFromCSV(MultipartFile file, String uploadedBy) throws Exception {
        if (!file.getOriginalFilename().endsWith(".csv")) {
            throw new IllegalArgumentException("File must be a CSV file");
        }

        BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
        
        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;
        
        String headerLine = reader.readLine();
        if (headerLine == null) {
            throw new RuntimeException("CSV file is empty");
        }

        String[] headers = headerLine.split(",");
        Map<String, Integer> columnIndexes = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            // Normalize column names: trim, lowercase, and remove spaces
            String columnName = headers[i].trim().toLowerCase().replaceAll(" ", "");
            columnIndexes.put(columnName, i);
            logger.info("CSV column found: '" + columnName + "' at index " + i);
        }
        logger.info("CSV Total columns found: " + columnIndexes.size());
        logger.info("CSV Column map keys: " + columnIndexes.keySet().toString());

        String line;
        int rowNum = 2;
        while ((line = reader.readLine()) != null) {
            try {
                String[] values = line.split(",");
                
                String email = getValueAt(values, findColumnIndex(columnIndexes, "email"));
                String fullName = getValueAt(values, findColumnIndex(columnIndexes, "fullname", "full_name", "name"));
                String course = getValueAt(values, findColumnIndex(columnIndexes, "course", "program"));
                String semesterStr = getValueAt(values, findColumnIndex(columnIndexes, "semester", "sem"));
                String password = getValueAt(values, findColumnIndex(columnIndexes, "password", "pwd", "pass"));
                String studentId = getValueAt(values, findColumnIndex(columnIndexes, "studentid", "student_id", "studentno", "id"));
                String contactNo = getValueAt(values, findColumnIndex(columnIndexes, "contactno", "contact_no", "phonenumber", "phone_number", "phone", "mobile", "contactnumber", "phoneno"));

                logger.info("CSV Row " + rowNum + " data extracted: email=" + email + ", studentId=" + studentId + 
                           ", fullName=" + fullName + ", contactNo='" + contactNo + "', course=" + course + ", semester=" + semesterStr);

                // Collect additional custom fields
                Map<String, String> customFields = new HashMap<>();
                // Include all known variations of standard field names
                Set<String> standardFields = new HashSet<>(Arrays.asList(
                    "email", "fullname", "full_name", "name", "course", "program", "semester", "sem", 
                    "password", "pwd", "pass", "studentid", "student_id", "studentno", "id", 
                    "contactno", "contact_no", "phonenumber", "phone_number", "phone", "mobile", "contactnumber", "phoneno"
                ));
                for (Map.Entry<String, Integer> entry : columnIndexes.entrySet()) {
                    if (!standardFields.contains(entry.getKey())) {
                        String value = getValueAt(values, entry.getValue());
                        if (value != null && !value.isEmpty()) {
                            customFields.put(entry.getKey(), value);
                        }
                    }
                }

                if (email == null || email.isEmpty()) {
                    errors.add("Row " + rowNum + ": Email is required");
                    failureCount++;
                    rowNum++;
                    continue;
                }

                int semester = 1;
                try {
                    semester = Integer.parseInt(semesterStr != null ? semesterStr : "1");
                } catch (NumberFormatException e) {
                    semester = 1;
                }

                // Convert custom fields to JSON
                String customFieldsJson = customFields.isEmpty() ? null : new ObjectMapper().writeValueAsString(customFields);

                // Create student in separate transaction
                boolean created = createStudentInNewTransaction(email, fullName, course, semester, password, studentId, contactNo, customFieldsJson);
                if (created) {
                    successCount++;
                } else {
                    failureCount++;
                    errors.add("Row " + rowNum + ": Failed to create student");
                }
            } catch (Exception e) {
                failureCount++;
                errors.add("Row " + rowNum + ": " + e.getMessage());
                logger.severe("Error uploading student from CSV at row " + rowNum + ": " + e.getMessage());
            }
            rowNum++;
        }

        reader.close();

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("totalCount", successCount + failureCount);
        result.put("errors", errors);

        return result;
    }

    public Map<String, Object> uploadStudentsFromExcel(MultipartFile file, String uploadedBy) throws Exception {
        String filename = file.getOriginalFilename();
        if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
            throw new IllegalArgumentException("File must be an Excel file (.xlsx or .xls)");
        }

        Workbook workbook;
        if (filename.endsWith(".xlsx")) {
            workbook = new XSSFWorkbook(file.getInputStream());
        } else {
            workbook = new HSSFWorkbook(file.getInputStream());
        }
        Sheet sheet = workbook.getSheetAt(0);

        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int failureCount = 0;

        int headerRowIndex = 0;
        Row headerRow = sheet.getRow(headerRowIndex);
        if (headerRow == null) {
            throw new RuntimeException("Excel header row not found");
        }

        Map<String, Integer> columnIndexes = new HashMap<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                // Normalize column names: trim, lowercase, and remove spaces
                String columnName = cell.getStringCellValue().trim().toLowerCase().replaceAll(" ", "");
                columnIndexes.put(columnName, i);
                logger.info("Found column: '" + columnName + "' at index " + i);
            }
        }
        logger.info("Total columns found: " + columnIndexes.size());
        logger.info("Column map keys: " + columnIndexes.keySet().toString());
        logger.info("Column map: " + columnIndexes.keySet().toString());

        for (int rowIndex = headerRowIndex + 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null) continue;

            try {
                String email = getCellValueAsString(row, findColumnIndex(columnIndexes, "email"));
                String fullName = getCellValueAsString(row, findColumnIndex(columnIndexes, "fullname", "full_name", "name"));
                String course = getCellValueAsString(row, findColumnIndex(columnIndexes, "course", "program"));
                String semesterStr = getCellValueAsString(row, findColumnIndex(columnIndexes, "semester", "sem"));
                String password = getCellValueAsString(row, findColumnIndex(columnIndexes, "password", "pwd", "pass"));
                String studentId = getCellValueAsString(row, findColumnIndex(columnIndexes, "studentid", "student_id", "studentno", "id"));
                String contactNo = getCellValueAsString(row, findColumnIndex(columnIndexes, "contactno", "contact_no", "phonenumber", "phone_number", "phone", "mobile", "contactnumber", "phoneno"));

                logger.info("Row " + (rowIndex + 1) + " data extracted: email=" + email + ", studentId=" + studentId + 
                           ", fullName=" + fullName + ", contactNo='" + contactNo + "', course=" + course + ", semester=" + semesterStr);

                // Collect additional custom fields
                Map<String, String> customFields = new HashMap<>();
                // Include all known variations of standard field names
                Set<String> standardFields = new HashSet<>(Arrays.asList(
                    "email", "fullname", "full_name", "name", "course", "program", "semester", "sem", 
                    "password", "pwd", "pass", "studentid", "student_id", "studentno", "id", 
                    "contactno", "contact_no", "phonenumber", "phone_number", "phone", "mobile", "contactnumber", "phoneno"
                ));
                for (Map.Entry<String, Integer> entry : columnIndexes.entrySet()) {
                    if (!standardFields.contains(entry.getKey())) {
                        String value = getCellValueAsString(row, entry.getValue());
                        if (value != null && !value.isEmpty()) {
                            customFields.put(entry.getKey(), value);
                        }
                    }
                }

                if (email == null || email.isEmpty()) {
                    failureCount++;
                    errors.add("Row " + (rowIndex + 1) + ": Email is required");
                    continue;
                }

                int semester = 1;
                try {
                    semester = Integer.parseInt(semesterStr != null ? semesterStr : "1");
                } catch (NumberFormatException e) {
                    semester = 1;
                }

                // Convert custom fields to JSON
                String customFieldsJson = customFields.isEmpty() ? null : new ObjectMapper().writeValueAsString(customFields);

                // Create student in separate transaction
                boolean created = createStudentInNewTransaction(email, fullName, course, semester, password, studentId, contactNo, customFieldsJson);
                if (created) {
                    successCount++;
                } else {
                    failureCount++;
                    errors.add("Row " + (rowIndex + 1) + ": Failed to create student");
                }
            } catch (Exception e) {
                failureCount++;
                errors.add("Row " + (rowIndex + 1) + ": " + e.getMessage());
                logger.severe("Error uploading student from Excel at row " + (rowIndex + 1) + ": " + e.getMessage());
            }
        }

        workbook.close();

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", successCount);
        result.put("failureCount", failureCount);
        result.put("totalCount", successCount + failureCount);
        result.put("errors", errors);

        return result;
    }

    private String getValueAt(String[] values, Integer index) {
        if (index == null || index < 0 || index >= values.length) {
            return null;
        }
        String value = values[index].trim();
        return value.isEmpty() ? null : value;
    }

    private String getCellValueAsString(Row row, Integer cellIndex) {
        if (cellIndex == null || cellIndex < 0) {
            return null;
        }

        Cell cell = row.getCell(cellIndex);
        if (cell == null) {
            return null;
        }

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                // Use long instead of int to support large numbers like phone numbers
                // Phone numbers can be 10+ digits which overflow int (max 2147483647)
                long numericValue = (long) cell.getNumericCellValue();
                return String.valueOf(numericValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return null;
        }
    }

    /**
     * Find the best matching column index for a given field name
     * Supports common variations (e.g., "Contact Number", "Contact No", "Phone", etc.)
     */
    private Integer findColumnIndex(Map<String, Integer> columnIndexes, String... possibleNames) {
        for (String name : possibleNames) {
            if (columnIndexes.containsKey(name)) {
                logger.info("Found column match for '" + name + "': index " + columnIndexes.get(name));
                return columnIndexes.get(name);
            }
        }
        logger.warning("No column found for any of: " + Arrays.toString(possibleNames));
        return null;
    }

    /**
     * Create a single student in a new transaction
     * This allows individual student creation to succeed or fail independently
     * without affecting other students in the batch
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean createStudentInNewTransaction(String email, String fullName, String course, int semester, String password, String studentId, String contactNo, String customFieldsJson) {
        try {
            logger.info("=== CREATING STUDENT ===");
            logger.info("Email: " + email + ", StudentId: " + studentId + ", ContactNo (RAW): '" + contactNo + "'");
            
            User savedUser = null;
            
            // Check if user already exists
            var existingUserOpt = userRepository.findByEmail(email);
            if (existingUserOpt.isPresent()) {
                // User exists - just use its ID directly to avoid cascade issues
                savedUser = existingUserOpt.get();
                logger.info("User already exists for email: " + email);
            } else {
                // Create new user
                User user = new User();
                user.setEmail(email);
                user.setFullName(fullName != null ? fullName : "Student " + email);
                user.setPassword(passwordEncoder.encode(password != null ? password : "Default@123"));
                user.setRole(User.UserRole.STUDENT);
                user.setIsActive(true);
                user.setCreatedAt(LocalDateTime.now());
                user.setUpdatedAt(LocalDateTime.now());

                savedUser = userRepository.save(user);
                logger.info("User created: " + savedUser.getEmail() + " for email: " + email);
            }

            // Create student
            Student student = new Student();
            student.setUser(savedUser);
            student.setProgram(course != null && !course.isEmpty() ? course : "B.Tech");
            student.setSemester(semester);
            student.setStudentId(studentId != null && !studentId.isEmpty() ? studentId : "STU-" + System.currentTimeMillis());
            // Enrollment number is now optional - will be set during form submission if provided
            
            // Set contact number - ensure it's not null or empty
            logger.info("ContactNo parameter before processing: '" + contactNo + "' (type: " + (contactNo != null ? contactNo.getClass().getName() : "null") + ")");
            if (contactNo != null && !contactNo.trim().isEmpty()) {
                String trimmedContactNo = contactNo.trim();
                student.setContactNo(trimmedContactNo);
                logger.info("✓ ContactNo SET to: '" + trimmedContactNo + "' for student: " + studentId);
            } else {
                student.setContactNo("");
                logger.warning("✗ ContactNo is empty or null for student: " + studentId + ", setting to empty string");
            }
            
            // Set custom fields if provided
            if (customFieldsJson != null && !customFieldsJson.isEmpty()) {
                student.setCustomFields(customFieldsJson);
                logger.info("Custom fields set for student: " + studentId);
            }
            
            student.setDepartment(course != null && !course.isEmpty() ? course : "IT");

            Student savedStudent = studentRepository.save(student);
            logger.info("✓ Student record SAVED with ID: " + savedStudent.getId());
            logger.info("  - ContactNo IN OBJECT: '" + savedStudent.getContactNo() + "'");
            
            // Verify by fetching from database
            Student verifyStudent = studentRepository.findById(savedStudent.getId()).orElse(null);
            if (verifyStudent != null) {
                logger.info("  - ContactNo FROM DB: '" + verifyStudent.getContactNo() + "'");
            }

            // Auto-enroll in subjects
            try {
                subjectEnrollmentService.enrollStudentInSubjects(savedStudent);
                logger.info("Student " + email + " auto-enrolled in subjects");
            } catch (Exception e) {
                logger.warning("Could not auto-enroll student " + email + ": " + e.getMessage());
                // Don't fail the entire student creation if auto-enrollment fails
            }

            return true;
        } catch (Exception e) {
            logger.severe("Error creating student " + email + ": " + e.getMessage());
            logger.severe("Root cause: " + e.getClass().getName());
            if (e.getCause() != null) {
                logger.severe("Caused by: " + e.getCause().getMessage());
                if (e.getCause().getCause() != null) {
                    logger.severe("Deep cause: " + e.getCause().getCause().getMessage());
                }
            }
            // Print full stack trace
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            logger.severe("Full stack trace:\n" + sw.toString());
            return false;
        }
    }
}

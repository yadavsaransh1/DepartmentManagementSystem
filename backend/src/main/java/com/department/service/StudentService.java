package com.department.service;

import com.department.dto.StudentDTO;
import com.department.model.Student;
import com.department.model.User;
import com.department.model.Program;
import com.department.repository.StudentRepository;
import com.department.repository.UserRepository;
import com.department.repository.AttendanceRepository;
import com.department.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class StudentService {
    private static final Logger logger = Logger.getLogger(StudentService.class.getName());

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectEnrollmentService subjectEnrollmentService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private AlumniService alumniService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Integer> getStudentCount() {
        logger.info("getStudentCount() - Testing JdbcTemplate");
        try {
            String sql = "SELECT COUNT(*) as cnt FROM students";
            List<Integer> result = jdbcTemplate.queryForList(sql, Integer.class);
            logger.info("getStudentCount() - Result: " + result);
            return result;
        } catch (Exception e) {
            logger.severe("getStudentCount() - ERROR: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get student count: " + e.getMessage(), e);
        }
    }

    public List<StudentDTO> getAllStudents() {
        List<StudentDTO> dtos = new ArrayList<>();
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            // Calculate attendance percentage from attendance records
            updateAttendancePercentage(student);
            dtos.add(studentToDTO(student));
        }
        return dtos;
    }

    public StudentDTO getStudentByEmail(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return studentToDTO(student);
    }

    @Transactional(readOnly = true)
    public StudentDTO getStudentById(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return studentToDTO(student);
    }

    public void deleteStudent(Long studentId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            String userEmail = student.getUser() != null ? student.getUser().getEmail() : null;
            
            // JPA will handle cascade deletion of all related records:
            // Alumni, SubjectEnrollment, Attendance, Marks, AssignmentSubmission,
            // SupervisorAllocation, StudentPerformance
            logger.info("Deleting student and all related records: " + studentId);
            studentRepository.deleteById(studentId);
            
            // Delete User record
            if (userEmail != null) {
                logger.info("Deleting user: " + userEmail);
                userRepository.deleteById(userEmail);
            }
            
            logger.info("Student deleted successfully: " + studentId);
        } catch (Exception e) {
            logger.severe("Error deleting student: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Could not delete student: " + e.getMessage());
        }
    }

    public StudentDTO updateStudent(Long studentId, StudentDTO dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Update User fields (email, fullName)
        User user = student.getUser();
        if (user != null) {
            if (dto.getFullName() != null && !dto.getFullName().isEmpty()) {
                user.setFullName(dto.getFullName());
            }
            // Allow email updates with duplicate check
            if (dto.getEmail() != null && !dto.getEmail().isEmpty() && !dto.getEmail().equals(user.getEmail())) {
                // Check if new email is already taken by another user
                if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                    throw new RuntimeException("Email already in use by another user");
                }
                user.setEmail(dto.getEmail());
            }
            userRepository.save(user);
        }
        
        boolean courseOrSemesterChanged = false;
        
        // Update Student fields
        if (dto.getProgram() != null && !dto.getProgram().equals(student.getProgram())) {
            student.setProgram(dto.getProgram());
            courseOrSemesterChanged = true;
        }
        if (dto.getDepartment() != null) {
            student.setDepartment(dto.getDepartment());
        }
        if (dto.getSemester() != null && !dto.getSemester().equals(student.getSemester())) {
            student.setSemester(dto.getSemester());
            courseOrSemesterChanged = true;
        }
        if (dto.getAttendancePercentage() != null) {
            student.setAttendancePercentage(dto.getAttendancePercentage());
        }
        if (dto.getStudentId() != null && !dto.getStudentId().isEmpty()) {
            student.setStudentId(dto.getStudentId());
        }
        if (dto.getContactNo() != null) {
            student.setContactNo(dto.getContactNo());
        }
        // Allow enrollment number updates
        if (dto.getEnrollmentNumber() != null && !dto.getEnrollmentNumber().isEmpty()) {
            student.setEnrollmentNumber(dto.getEnrollmentNumber());
        }
        // Handle custom fields update
        if (dto.getCustomFields() != null && !dto.getCustomFields().isEmpty()) {
            student.setCustomFields(dto.getCustomFields());
        }
        
        Student updated = studentRepository.save(student);
        
        // If course or semester changed, re-enroll student in appropriate subjects
        if (courseOrSemesterChanged) {
            subjectEnrollmentService.enrollStudentInSubjects(updated);
        }
        
        return studentToDTO(updated);
    }

    public StudentDTO updateStudentAttendance(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Calculate attendance percentage across all subjects
        // This would be done from attendance records
        updateAttendancePercentage(student);
        
        Student updated = studentRepository.save(student);
        return studentToDTO(updated);
    }

    private void updateAttendancePercentage(Student student) {
        // Calculate attendance percentage across all subjects
        // For now, use a simplified approach - calculate average from all attendance records
        try {
            long totalPresentDays = 0;
            long totalDays = 0;
            
            // Get all attendance records for this student
            var studentAttendances = attendanceRepository.findByStudentId(student.getId());
            
            if (studentAttendances.isEmpty()) {
                student.setAttendancePercentage(0.0f);
                return;
            }
            
            // Count present and total days
            for (var attendance : studentAttendances) {
                totalDays++;
                if ("PRESENT".equals(attendance.getStatus().toString())) {
                    totalPresentDays++;
                }
            }
            
            float attendancePercentage = totalDays > 0 ? (totalPresentDays * 100.0f) / totalDays : 0.0f;
            student.setAttendancePercentage(attendancePercentage);
        } catch (Exception e) {
            logger.warning("Error calculating attendance percentage: " + e.getMessage());
            student.setAttendancePercentage(0.0f);
        }
    }

    public Map<String, Object> bulkUpdateSemester() {
        try {
            List<Student> allStudents = studentRepository.findAll();
            logger.info("Starting bulk semester update for " + allStudents.size() + " students");
            
            int updatedCount = 0;
            int failedCount = 0;
            int addedToAlumniCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (Student student : allStudents) {
                try {
                    // Get program's max semester from database
                    Program program = programRepository.findByName(student.getProgram()).orElse(null);
                    Integer maxSemester = (program != null && program.getSemesterCount() != null) ? program.getSemesterCount() : 8;
                    
                    Integer currentSemester = student.getSemester();
                    
                    // Increment semester
                    if (currentSemester == null) {
                        student.setSemester(1);
                    } else if (currentSemester < maxSemester) {
                        student.setSemester(currentSemester + 1);
                    } else {
                        // Student has completed all semesters - add to Alumni
                        logger.info("Student " + student.getStudentId() + " completed all semesters, adding to Alumni");
                        try {
                            alumniService.createAlumniRecord(student.getId(), student.getProgram(), maxSemester, null, null, "");
                            addedToAlumniCount++;
                            continue; // Don't save student again, already moved to alumni
                        } catch (Exception e) {
                            logger.warning("Failed to add student to alumni: " + e.getMessage());
                        }
                    }
                    
                    Student updatedStudent = studentRepository.save(student);
                    logger.info("Updated student " + student.getStudentId() + " to semester " + updatedStudent.getSemester());
                    
                    // Re-enroll student in subjects based on new semester
                    try {
                        subjectEnrollmentService.enrollStudentInSubjects(student);
                        logger.info("Re-enrolled student " + student.getStudentId() + " in subjects");
                    } catch (Exception e) {
                        logger.warning("Failed to re-enroll student " + student.getStudentId() + ": " + e.getMessage());
                    }
                    
                    updatedCount++;
                } catch (Exception e) {
                    failedCount++;
                    String errorMsg = "Failed to update student " + student.getStudentId() + ": " + e.getMessage();
                    logger.severe(errorMsg);
                    errors.add(errorMsg);
                }
            }
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("totalStudents", allStudents.size());
            result.put("updatedCount", updatedCount);
            result.put("addedToAlumniCount", addedToAlumniCount);
            result.put("failedCount", failedCount);
            result.put("message", "Bulk semester update completed. Updated: " + updatedCount + ", Added to Alumni: " + addedToAlumniCount + ", Failed: " + failedCount);
            if (!errors.isEmpty()) {
                result.put("errors", errors);
            }
            
            logger.info("Bulk semester update completed: " + updatedCount + " updated, " + addedToAlumniCount + " added to alumni, " + failedCount + " failed");
            return result;
        } catch (Exception e) {
            logger.severe("Exception in bulkUpdateSemester: " + e.getMessage());
            Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Bulk semester update failed: " + e.getMessage());
            return errorResult;
        }
    }

    public Map<String, Object> bulkUpdateSemesterByProgram(String programName) {
        try {
            List<Student> programStudents = studentRepository.findByProgram(programName);
            logger.info("Starting bulk semester update for " + programStudents.size() + " students in program: " + programName);
            
            Program program = programRepository.findByName(programName).orElse(null);
            Integer maxSemester = (program != null && program.getSemesterCount() != null) ? program.getSemesterCount() : 8;
            
            int updatedCount = 0;
            int failedCount = 0;
            int addedToAlumniCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (Student student : programStudents) {
                try {
                    Integer currentSemester = student.getSemester();
                    
                    // Increment semester
                    if (currentSemester == null) {
                        student.setSemester(1);
                    } else if (currentSemester < maxSemester) {
                        student.setSemester(currentSemester + 1);
                    } else {
                        // Student has completed all semesters - add to Alumni
                        logger.info("Student " + student.getStudentId() + " completed all semesters in " + programName + ", adding to Alumni");
                        try {
                            alumniService.createAlumniRecord(student.getId(), programName, maxSemester, null, null, "");
                            addedToAlumniCount++;
                            continue;
                        } catch (Exception e) {
                            logger.warning("Failed to add student to alumni: " + e.getMessage());
                        }
                    }
                    
                    Student updatedStudent = studentRepository.save(student);
                    logger.info("Updated student " + student.getStudentId() + " to semester " + updatedStudent.getSemester());
                    
                    // Re-enroll student in subjects based on new semester
                    try {
                        subjectEnrollmentService.enrollStudentInSubjects(student);
                        logger.info("Re-enrolled student " + student.getStudentId() + " in subjects");
                    } catch (Exception e) {
                        logger.warning("Failed to re-enroll student " + student.getStudentId() + ": " + e.getMessage());
                    }
                    
                    updatedCount++;
                } catch (Exception e) {
                    failedCount++;
                    String errorMsg = "Failed to update student " + student.getStudentId() + ": " + e.getMessage();
                    logger.severe(errorMsg);
                    errors.add(errorMsg);
                }
            }
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("program", programName);
            result.put("maxSemester", maxSemester);
            result.put("totalStudents", programStudents.size());
            result.put("updatedCount", updatedCount);
            result.put("addedToAlumniCount", addedToAlumniCount);
            result.put("failedCount", failedCount);
            result.put("message", "Bulk semester update for " + programName + " completed. Updated: " + updatedCount + ", Added to Alumni: " + addedToAlumniCount + ", Failed: " + failedCount);
            if (!errors.isEmpty()) {
                result.put("errors", errors);
            }
            
            logger.info("Bulk semester update for program " + programName + " completed: " + updatedCount + " updated, " + addedToAlumniCount + " added to alumni, " + failedCount + " failed");
            return result;
        } catch (Exception e) {
            logger.severe("Exception in bulkUpdateSemesterByProgram: " + e.getMessage());
            Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("program", programName);
            errorResult.put("message", "Bulk semester update for program failed: " + e.getMessage());
            return errorResult;
        }
    }

    public List<StudentDTO> getStudentsByProgramAndSemester(String programName, Integer semester) {
        try {
            logger.info("Fetching students for program: " + programName + ", semester: " + semester);
            List<Student> students = studentRepository.findByProgramAndSemester(programName, semester);
            List<StudentDTO> dtos = new ArrayList<>();
            for (Student student : students) {
                dtos.add(studentToDTO(student));
            }
            logger.info("Found " + dtos.size() + " students in " + programName + " semester " + semester);
            return dtos;
        } catch (Exception e) {
            logger.severe("Error fetching students by program and semester: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public Map<String, Object> bulkUpdateSemesterByIds(List<Long> studentIds) {
        try {
            logger.info("Starting bulk semester update for " + studentIds.size() + " selected students");
            
            int updatedCount = 0;
            int failedCount = 0;
            int addedToAlumniCount = 0;
            List<String> errors = new ArrayList<>();
            
            for (Long studentId : studentIds) {
                try {
                    Student student = studentRepository.findById(studentId).orElse(null);
                    if (student == null) {
                        failedCount++;
                        String errorMsg = "Student with ID " + studentId + " not found";
                        logger.warning(errorMsg);
                        errors.add(errorMsg);
                        continue;
                    }
                    
                    // Get program's max semester from database
                    Program program = programRepository.findByName(student.getProgram()).orElse(null);
                    Integer maxSemester = (program != null && program.getSemesterCount() != null) ? program.getSemesterCount() : 8;
                    
                    Integer currentSemester = student.getSemester();
                    
                    // Increment semester
                    if (currentSemester == null) {
                        student.setSemester(1);
                    } else if (currentSemester < maxSemester) {
                        student.setSemester(currentSemester + 1);
                    } else {
                        // Student has completed all semesters - add to Alumni
                        logger.info("Student " + student.getStudentId() + " completed all semesters, adding to Alumni");
                        try {
                            alumniService.createAlumniRecord(student.getId(), student.getProgram(), maxSemester, null, null, "");
                            addedToAlumniCount++;
                            continue;
                        } catch (Exception e) {
                            logger.warning("Failed to add student to alumni: " + e.getMessage());
                        }
                    }
                    
                    Student updatedStudent = studentRepository.save(student);
                    logger.info("Updated student " + student.getStudentId() + " to semester " + updatedStudent.getSemester());
                    
                    // Re-enroll student in subjects based on new semester
                    try {
                        subjectEnrollmentService.enrollStudentInSubjects(student);
                        logger.info("Re-enrolled student " + student.getStudentId() + " in subjects");
                    } catch (Exception e) {
                        logger.warning("Failed to re-enroll student " + student.getStudentId() + ": " + e.getMessage());
                    }
                    
                    updatedCount++;
                } catch (Exception e) {
                    failedCount++;
                    String errorMsg = "Failed to update student " + studentId + ": " + e.getMessage();
                    logger.severe(errorMsg);
                    errors.add(errorMsg);
                }
            }
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("totalStudents", studentIds.size());
            result.put("updatedCount", updatedCount);
            result.put("addedToAlumniCount", addedToAlumniCount);
            result.put("failedCount", failedCount);
            result.put("message", "Bulk semester update completed. Updated: " + updatedCount + ", Added to Alumni: " + addedToAlumniCount + ", Failed: " + failedCount);
            if (!errors.isEmpty()) {
                result.put("errors", errors);
            }
            
            logger.info("Bulk semester update by IDs completed: " + updatedCount + " updated, " + addedToAlumniCount + " added to alumni, " + failedCount + " failed");
            return result;
        } catch (Exception e) {
            logger.severe("Exception in bulkUpdateSemesterByIds: " + e.getMessage());
            Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Bulk semester update failed: " + e.getMessage());
            return errorResult;
        }
    }

    private StudentDTO studentToDTO(Student student) {
        StudentDTO dto = new StudentDTO();
        dto.setId(student.getId());
        
        // Safely access User with null check and fallback query
        User user = student.getUser();
        
        // If user is null, try to fetch it directly from database using email stored in students table
        if (user == null && student.getId() != null) {
            try {
                // Get user_email from students table (the foreign key)
                String userEmail = jdbcTemplate.queryForObject(
                    "SELECT user_email FROM students WHERE id = ?", 
                    String.class, 
                    student.getId()
                );
                if (userEmail != null && !userEmail.isBlank()) {
                    // Query User by email (email is the primary key)
                    user = userRepository.findByEmail(userEmail).orElse(null);
                }
            } catch (Exception e) {
                // Silent fail - no excessive logging
            }
        }
        
        if (user != null) {
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            dto.setUserEmail(user.getEmail());
        }
        
        dto.setStudentId(student.getStudentId());
        dto.setEnrollmentNumber(student.getEnrollmentNumber());
        dto.setContactNo(student.getContactNo());
        dto.setDepartment(student.getDepartment());
        
        // Get program with multiple fallback strategies
        String program = student.getProgram();
        if (program == null || program.isBlank()) {
            program = student.getProgram(); // Try again from JPA eager-loaded relationship
        }
        
        // Fallback: query database directly for program or course
        if ((program == null || program.isBlank()) && student.getId() != null) {
            try {
                String dbProgram = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(program, course) FROM students WHERE id = ?", 
                    String.class, 
                    student.getId()
                );
                if (dbProgram != null && !dbProgram.isBlank()) {
                    program = dbProgram;
                }
            } catch (Exception e) {
                // Silent fail
            }
        }
        
        dto.setProgram(program);

        dto.setSemester(student.getSemester());
        dto.setCustomFields(student.getCustomFields());

        // Pull optional profile fields from customFields JSON if present
        try {
            String custom = student.getCustomFields();
            if (custom != null && !custom.isBlank()) {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(custom);
                if (root.has("address")) {
                    dto.setAddress(root.get("address").asText(null));
                }
                if (root.has("gender")) {
                    dto.setGender(root.get("gender").asText(null));
                }
                if (root.has("state")) {
                    dto.setState(root.get("state").asText(null));
                }
                if (root.has("district")) {
                    dto.setDistrict(root.get("district").asText(null));
                }
                // Keep backward compatibility for course field - use as program fallback
                if ((dto.getProgram() == null || dto.getProgram().isBlank()) && root.has("course")) {
                    String courseVal = root.get("course").asText(null);
                    if (courseVal != null && !courseVal.isBlank()) {
                        dto.setProgram(courseVal);
                        logger.info("Program set from customFields.course for student " + student.getId() + ": " + courseVal);
                    }
                }
            }
        } catch (Exception e) {
            logger.warning("Error parsing student customFields: " + e.getMessage());
        }

        dto.setAttendancePercentage(student.getAttendancePercentage() != null && student.getAttendancePercentage() > 0 ? student.getAttendancePercentage() : null);
        
        logger.info("Student " + student.getId() + " converted successfully. Program: " + dto.getProgram());
        
        return dto;
    }

    @Transactional
    public Map<String, Object> populateMissingCasteData() {
        try {
            logger.info("=== Starting population of missing category data ===");
            List<Student> allStudents = studentRepository.findAll();
            int updatedCount = 0;
            int skippedCount = 0;
            List<String> updatedStudents = new ArrayList<>();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

            for (Student student : allStudents) {
                try {
                    String customFields = student.getCustomFields();
                    com.fasterxml.jackson.databind.JsonNode root = null;
                    com.fasterxml.jackson.databind.node.ObjectNode customFieldsObj = mapper.createObjectNode();

                    // Parse existing customFields if present
                    if (customFields != null && !customFields.isBlank()) {
                        try {
                            root = mapper.readTree(customFields);
                            if (root instanceof com.fasterxml.jackson.databind.node.ObjectNode) {
                                customFieldsObj = (com.fasterxml.jackson.databind.node.ObjectNode) root;
                            }
                        } catch (Exception e) {
                            logger.warning("Could not parse customFields for student " + student.getId() + ", creating new object");
                        }
                    }

                    // Check if category already exists and is not empty/null
                    String currentCategory = customFieldsObj.has("category") ? customFieldsObj.get("category").asText("") : "";
                    if (!currentCategory.isEmpty() && !currentCategory.equals("null")) {
                        skippedCount++;
                        logger.info("Student " + student.getStudentId() + " already has category: " + currentCategory);
                        continue;
                    }

                    // Set default category to "General" if missing
                    String categoryValue = "General";
                    customFieldsObj.put("category", categoryValue);
                    student.setCustomFields(mapper.writeValueAsString(customFieldsObj));
                    studentRepository.save(student);
                    updatedCount++;
                    updatedStudents.add(student.getStudentId() + " (category: " + categoryValue + ")");
                    logger.info("Updated student " + student.getStudentId() + " with default category: General");
                } catch (Exception e) {
                    logger.severe("Error updating student " + student.getId() + ": " + e.getMessage());
                }
            }

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("totalStudents", allStudents.size());
            result.put("updatedCount", updatedCount);
            result.put("skippedCount", skippedCount);
            result.put("message", "Populated category data for " + updatedCount + " students. Skipped " + skippedCount + " students with existing category data.");
            if (!updatedStudents.isEmpty() && updatedStudents.size() <= 10) {
                result.put("updatedStudents", updatedStudents);
            }
            logger.info("=== Category data population complete: " + updatedCount + " updated, " + skippedCount + " skipped ===");
            return result;
        } catch (Exception e) {
            logger.severe("Error in populateMissingCasteData: " + e.getMessage());
            Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Failed to populate category data: " + e.getMessage());
            return errorResult;
        }
    }

    @Transactional
    public Map<String, Object> updateStudentCaste(Long studentId, String caste) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode customFieldsObj = mapper.createObjectNode();

            // Parse existing customFields if present
            String customFields = student.getCustomFields();
            if (customFields != null && !customFields.isBlank()) {
                try {
                    com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(customFields);
                    if (root instanceof com.fasterxml.jackson.databind.node.ObjectNode) {
                        customFieldsObj = (com.fasterxml.jackson.databind.node.ObjectNode) root;
                    }
                } catch (Exception e) {
                    logger.warning("Could not parse existing customFields, creating new object");
                }
            }

            customFieldsObj.put("caste", caste);
            student.setCustomFields(mapper.writeValueAsString(customFieldsObj));
            Student updated = studentRepository.save(student);

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("studentId", updated.getStudentId());
            result.put("caste", caste);
            result.put("message", "Caste updated successfully for student " + updated.getStudentId());
            logger.info("Updated caste for student " + updated.getStudentId() + " to " + caste);
            return result;
        } catch (Exception e) {
            logger.severe("Error updating student caste: " + e.getMessage());
            Map<String, Object> errorResult = new java.util.HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", "Failed to update caste: " + e.getMessage());
            return errorResult;
        }
    }
    
}

package com.department.controller;

import com.department.dto.StudentDTO;
import com.department.model.Subject;
import com.department.model.Student;
import com.department.repository.SubjectRepository;
import com.department.repository.StudentRepository;
import com.department.service.StudentService;
import com.department.service.SubjectEnrollmentService;
import com.department.service.BulkStudentUploadService;
import com.department.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private SubjectEnrollmentService subjectEnrollmentService;

    @Autowired
    private BulkStudentUploadService bulkStudentUploadService;

    @Autowired
    private ExportService exportService;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/test-jdbc")
    public ResponseEntity<String> testJdbc() {
        System.out.println("DEBUG: StudentController.testJdbc() called");
        try {
            // Try to use JdbcTemplate directly
            java.util.List<Integer> result = studentService.getStudentCount();
            System.out.println("DEBUG: testJdbc() - Student count from JDBC: " + result);
            return ResponseEntity.ok("Student count: " + result);
        } catch (Exception e) {
            System.err.println("ERROR in testJdbc(): " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("JDBC Test failed: " + e.getMessage(), e);
        }
    }

    @GetMapping("")
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        try {
            List<StudentDTO> students = studentService.getAllStudents();
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            System.err.println("ERROR in StudentController.getAllStudents(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudentDTO> getStudentProfile(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                System.out.println("DEBUG: Authentication is null or has no name");
                return ResponseEntity.status(401).body(null);
            }
            String email = authentication.getName();
            System.out.println("DEBUG: Getting student profile for email: " + email);
            return ResponseEntity.ok(studentService.getStudentByEmail(email));
        } catch (Exception e) {
            System.out.println("ERROR in getStudentProfile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/profile/all-subjects")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getMyAvailableSubjects(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(new java.util.ArrayList<>());
            }
            String email = authentication.getName();
            StudentDTO student = studentService.getStudentByEmail(email);
            System.out.println("DEBUG: getMyAvailableSubjects - Getting subjects for Program: " + student.getProgram() + ", Semester: " + student.getSemester());
            
            // Simply return ALL subjects from the database
            // This ensures students can see all available courses for feedback
            List<Subject> allSubjects = subjectEnrollmentService.getAllSubjects();
            System.out.println("DEBUG: Returning " + allSubjects.size() + " total subjects from database");
            
            // Convert to maps with proper field names
            List<Map<String, Object>> subjectDTOs = allSubjects.stream().map(subject -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", subject.getId());
                map.put("subjectCode", subject.getCourseCode());
                map.put("subjectName", subject.getCourseName()); // Map courseName to subjectName
                map.put("courseName", subject.getCourseName()); // Also keep courseName for backward compatibility
                map.put("semester", subject.getSemester());
                map.put("credits", subject.getCredits());
                map.put("programName", subject.getProgramName());
                map.put("description", subject.getDescription());
                if (subject.getTeacher() != null) {
                    map.put("teacherId", subject.getTeacher().getId());
                    map.put("teacherName", subject.getTeacher().getUser() != null ? subject.getTeacher().getUser().getFullName() : "Unknown");
                }
                return map;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(subjectDTOs);
        } catch (Exception e) {
            System.out.println("DEBUG: Error in getMyAvailableSubjects: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<StudentDTO>> getStudentsBySubject(@PathVariable Long subjectId) {
        try {
            // Get the subject to find its program and semester
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            
            String program = subject.getProgramName() != null ? subject.getProgramName() : 
                            (subject.getProgram() != null ? subject.getProgram().getName() : "");
            
            // Get all students for this program/semester (they automatically have all subjects)
            List<Student> students = studentRepository.findByProgramAndSemester(program, subject.getSemester());
            
            List<StudentDTO> studentDTOs = students.stream()
                    .map(student -> {
                        StudentDTO dto = new StudentDTO();
                        dto.setId(student.getId());
                        dto.setStudentId(student.getStudentId());
                        dto.setEnrollmentNumber(student.getEnrollmentNumber());
                        dto.setEmail(student.getUser() != null ? student.getUser().getEmail() : "");
                        dto.setFullName(student.getUser() != null ? student.getUser().getFullName() : "");
                        dto.setContactNo(student.getContactNo());
                        dto.setProgram(student.getProgram());
                        dto.setSemester(student.getSemester());
                        return dto;
                    })
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(studentDTOs);
        } catch (Exception e) {
            System.out.println("Error fetching students by subject: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<?> getStudentById(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            return ResponseEntity.ok(student);
        } catch (Exception e) {
            System.out.println("Error fetching student: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(404).body(Map.of("error", "Student not found", "message", e.getMessage()));
        }
    }

    @GetMapping("/{studentId}/subjects")
    public ResponseEntity<List<Map<String, Object>>> getStudentSubjects(@PathVariable Long studentId) {
        StudentDTO student = studentService.getStudentById(studentId);
        List<Subject> subjects = subjectEnrollmentService.getStudentSubjects(studentId, student.getProgram(), student.getSemester());
        System.out.println("DEBUG: getStudentSubjects - studentId: " + studentId + ", found " + subjects.size() + " subjects");
        
        // If no subjects found through enrollments, try to get them by program and semester
        if (subjects.isEmpty()) {
            try {
                if (student.getProgram() != null && student.getSemester() != null) {
                    System.out.println("DEBUG: No enrollments found, trying Program: " + student.getProgram() + ", Semester: " + student.getSemester());
                    // This would need a new service method to fetch by program/semester
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Error getting subject info: " + e.getMessage());
            }
        }
        
        // Convert to simplified maps to avoid circular references
        List<Map<String, Object>> result = subjects.stream().map(subject -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", subject.getId());
            map.put("subjectCode", subject.getCourseCode());
            map.put("subjectName", subject.getCourseName());
            map.put("semester", subject.getSemester());
            map.put("credits", subject.getCredits());
            if (subject.getTeacher() != null && subject.getTeacher().getUser() != null) {
                map.put("teacherName", subject.getTeacher().getUser().getFullName());
            }
            return map;
        }).collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{studentId}/all-subjects")
    public ResponseEntity<List<Map<String, Object>>> getStudentAvailableSubjects(@PathVariable Long studentId) {
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            System.out.println("DEBUG: getStudentAvailableSubjects - Getting subjects for Program: " + student.getProgram() + ", Semester: " + student.getSemester());
            
            if (student.getProgram() == null || student.getSemester() == null) {
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            // Get all subjects for the student's program and semester (regardless of enrollment status)
            List<Subject> subjectsFromDb = subjectEnrollmentService.getSubjectsByProgramAndSemester(student.getProgram(), student.getSemester());
            System.out.println("DEBUG: Found " + subjectsFromDb.size() + " subjects from database");
            
            // Convert to simplified maps to avoid circular references
            List<Map<String, Object>> result = subjectsFromDb.stream().map(subject -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", subject.getId());
                map.put("subjectCode", subject.getCourseCode());
                map.put("subjectName", subject.getCourseName());
                map.put("semester", subject.getSemester());
                map.put("credits", subject.getCredits());
                if (subject.getTeacher() != null && subject.getTeacher().getUser() != null) {
                    map.put("teacherName", subject.getTeacher().getUser().getFullName());
                }
                return map;
            }).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("DEBUG: Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/{studentId}/debug-subjects")
    public ResponseEntity<Map<String, Object>> debugStudentSubjects(@PathVariable Long studentId) {
        Map<String, Object> debug = new java.util.HashMap<>();
        try {
            StudentDTO student = studentService.getStudentById(studentId);
            debug.put("studentId", studentId);
            debug.put("program", student.getProgram());
            debug.put("semester", student.getSemester());
            
            List<Subject> enrolled = subjectEnrollmentService.getStudentSubjects(studentId, student.getProgram(), student.getSemester());
            debug.put("enrolledSubjects", enrolled.size());
            
            if (student.getProgram() != null && student.getSemester() != null) {
                List<Subject> available = subjectEnrollmentService.getSubjectsByProgramAndSemester(student.getProgram(), student.getSemester());
                debug.put("availableSubjects", available.size());
            }
            
            System.out.println("DEBUG: Student " + studentId + " - Program: " + student.getProgram() + ", Semester: " + student.getSemester() + ", Enrolled: " + enrolled.size());
            
            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            debug.put("error", e.getMessage());
            return ResponseEntity.ok(debug);
        }
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.ok(new com.department.dto.MessageDTO("Student deleted successfully"));
    }

    @PutMapping("/{studentId}/attendance")
    public ResponseEntity<StudentDTO> updateAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentService.updateStudentAttendance(studentId));
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<StudentDTO> updateStudent(@PathVariable Long studentId, @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(studentId, studentDTO));
    }

    @PostMapping("/bulk-upload/csv")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadStudentsFromCSV(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: No valid authentication token."));
            }
            String email = authentication.getName();
            Map<String, Object> result = bulkStudentUploadService.uploadStudentsFromCSV(file, email);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process file: " + e.getMessage()));
        }
    }

    @PostMapping("/bulk-upload/excel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> uploadStudentsFromExcel(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: No valid authentication token."));
            }
            String email = authentication.getName();
            Map<String, Object> result = bulkStudentUploadService.uploadStudentsFromExcel(file, email);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to process file: " + e.getMessage()));
        }
    }

    @GetMapping("/{studentId}/statistics/export")
    public ResponseEntity<?> exportStudentStatistics(@PathVariable Long studentId, @RequestParam(defaultValue = "excel") String format) {
        try {
            byte[] data;
            String fileName;
            String contentType;
            
            if ("pdf".equalsIgnoreCase(format)) {
                data = exportService.exportStudentStatisticsAsPDF(studentId);
                fileName = "Student_Statistics_" + studentId + "_" + System.currentTimeMillis() + ".pdf";
                contentType = "application/pdf";
            } else {
                data = exportService.exportStudentStatisticsAsExcel(studentId);
                fileName = "Student_Statistics_" + studentId + "_" + System.currentTimeMillis() + ".xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to export: " + e.getMessage()));
        }
    }

    @GetMapping("/program/{programName}/semester/{semester}")
    public ResponseEntity<?> getStudentsByProgramAndSemester(
            @PathVariable String programName,
            @PathVariable Integer semester) {
        try {
            System.out.println("DEBUG: Fetching students for program: " + programName + ", semester: " + semester);
            if (programName == null || programName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Program name cannot be empty", "received_program", programName));
            }
            if (semester == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Semester cannot be null", "received_semester", semester));
            }
            List<StudentDTO> students = studentService.getStudentsByProgramAndSemester(programName, semester);
            System.out.println("DEBUG: Found " + students.size() + " students");
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("ERROR in getStudentsByProgramAndSemester: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to fetch students",
                "message", e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/bulk-update-semester")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkUpdateSemester(
            @RequestBody(required = false) Map<String, Object> requestBody) {
        try {
            Map<String, Object> result;
            
            if (requestBody != null && requestBody.containsKey("studentIds")) {
                // Update selected students only
                List<?> rawIds = (List<?>) requestBody.get("studentIds");
                List<Long> studentIds = new ArrayList<>();
                for (Object id : rawIds) {
                    if (id instanceof Number) {
                        studentIds.add(((Number) id).longValue());
                    }
                }
                result = studentService.bulkUpdateSemesterByIds(studentIds);
            } else if (requestBody != null && requestBody.containsKey("programName")) {
                // Update all students in program
                String programName = (String) requestBody.get("programName");
                result = studentService.bulkUpdateSemesterByProgram(programName);
            } else {
                // Update all students
                result = studentService.bulkUpdateSemester();
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update semesters: " + e.getMessage()));
        }
    }

    @PostMapping("/populate-caste-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> populateMissingCasteData() {
        try {
            Map<String, Object> result = studentService.populateMissingCasteData();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to populate caste data: " + e.getMessage()));
        }
    }

    @PutMapping("/{studentId}/caste")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStudentCaste(
            @PathVariable Long studentId,
            @RequestBody Map<String, String> payload) {
        try {
            String caste = payload.get("caste");
            if (caste == null || caste.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Caste value is required"));
            }
            Map<String, Object> result = studentService.updateStudentCaste(studentId, caste);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update caste: " + e.getMessage()));
        }
    }
}

package com.department.controller;

import com.department.model.Marks;
import com.department.model.Student;
import com.department.model.Subject;
import com.department.service.MarksService;
import com.department.dto.AdminMarksRequestDTO;
import com.department.dto.UpdateMarksRequestDTO;
import com.department.dto.TeacherMarksSubmissionDTO;
import com.department.dto.MarksViewDTO;
import com.department.repository.StudentRepository;
import com.department.repository.SubjectRepository;
import com.department.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/marks")
public class MarksController {

    @Autowired
    private MarksService marksService;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canAddMarks()")
    public ResponseEntity<Marks> recordMarks(@RequestBody Marks marks) {
        Marks created = marksService.recordMarks(marks);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewMarks()")
    public ResponseEntity<Marks> getMarks(@PathVariable Long id) {
        Optional<Marks> marks = marksService.getMarksById(id);
        return marks.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Marks>> getStudentMarks(@PathVariable Long studentId) {
        // Support both user_id and student_id for backward compatibility
        // First try user_id (primary method)
        List<Marks> marks = marksService.getUserMarks(studentId);
        // If empty, try student_id (fallback for old data)
        if (marks.isEmpty()) {
            marks = marksService.getStudentMarks(studentId);
        }
        return ResponseEntity.ok(marks);
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewMarks()")
    public ResponseEntity<List<?>> getSubjectMarks(@PathVariable Long subjectId) {
        List<Marks> marks = marksService.getSubjectMarks(subjectId);
        
        // Convert to DTOs to avoid serialization issues
        java.util.List<Object> response = new java.util.ArrayList<>();
        for (Marks mark : marks) {
            com.department.dto.MarksViewDTO dto = new com.department.dto.MarksViewDTO(
                mark.getId(),
                mark.getStudent() != null ? mark.getStudent().getId() : null,
                mark.getStudent() != null && mark.getStudent().getUser() != null ? 
                    mark.getStudent().getUser().getFullName() : "Unknown",
                mark.getCourse() != null ? mark.getCourse().getId() : null,
                mark.getCourse() != null ? mark.getCourse().getCourseName() : "Unknown",
                mark.getExamType() != null ? mark.getExamType().toString() : null,
                mark.getExamTypeDescription(),
                mark.getMarks(),
                mark.getTotalMarks(),
                mark.getPercentage(),
                mark.getGrade(),
                mark.getSessionalMarks(),
                mark.getAssignmentMarks(),
                mark.getObtainedSessionalMarks(),
                mark.getObtainedAssignmentMarks(),
                mark.getComments(),
                mark.getMarkType() != null ? mark.getMarkType().toString() : null,
                mark.getCreatedAt()
            );
            response.add(dto);
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewMarks()")
    public ResponseEntity<List<Marks>> getStudentSubjectMarks(@PathVariable Long studentId, @PathVariable Long subjectId) {
        List<Marks> marks = marksService.getStudentSubjectMarks(studentId, subjectId);
        return ResponseEntity.ok(marks);
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewMarks()")
    public ResponseEntity<List<?>> getTeacherMarks(@PathVariable String teacherId) {
        try {
            System.out.println("\n=== getTeacherMarks called ===");
            System.out.println("TeacherId parameter: " + teacherId);
            
            List<Marks> marks;
            // Try to parse as Long first (numeric ID)
            try {
                Long id = Long.parseLong(teacherId);
                System.out.println("Parsed as numeric ID: " + id);
                marks = marksService.getTeacherMarks(id);
                System.out.println("Found " + marks.size() + " marks for numeric teacher ID");
            } catch (NumberFormatException e) {
                // If not a number, treat as email and find teacher by email
                System.out.println("Treating as email: " + teacherId);
                marks = marksService.getTeacherMarksByEmail(teacherId);
                System.out.println("Found " + marks.size() + " marks for teacher email");
                if (marks.size() > 0) {
                    System.out.println("First mark detail: student=" + marks.get(0).getStudent().getId() + 
                                     ", obtained=" + marks.get(0).getMarks() + 
                                     ", total=" + marks.get(0).getTotalMarks() +
                                     ", exam=" + marks.get(0).getExamType());
                }
            }
            
            // Convert to DTOs to avoid serialization issues
            java.util.List<Object> response = new java.util.ArrayList<>();
            for (Marks mark : marks) {
                com.department.dto.MarksViewDTO dto = new com.department.dto.MarksViewDTO(
                    mark.getId(),
                    mark.getStudent() != null ? mark.getStudent().getId() : null,
                    mark.getStudent() != null && mark.getStudent().getUser() != null ? 
                        mark.getStudent().getUser().getFullName() : "Unknown",
                    mark.getCourse() != null ? mark.getCourse().getId() : null,
                    mark.getCourse() != null ? mark.getCourse().getCourseName() : "Unknown",
                    mark.getExamType() != null ? mark.getExamType().toString() : null,
                    mark.getExamTypeDescription(),
                    mark.getMarks(),
                    mark.getTotalMarks(),
                    mark.getPercentage(),
                    mark.getGrade(),
                    mark.getSessionalMarks(),
                    mark.getAssignmentMarks(),
                    mark.getObtainedSessionalMarks(),
                    mark.getObtainedAssignmentMarks(),
                    mark.getComments(),
                    mark.getMarkType() != null ? mark.getMarkType().toString() : null,
                    mark.getCreatedAt()
                );
                response.add(dto);
            }
            
            System.out.println("Returning " + response.size() + " marks as DTOs");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in getTeacherMarks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/student/{studentId}/gpa")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewMarks()")
    public ResponseEntity<Double> getStudentGPA(@PathVariable Long studentId) {
        double gpa = marksService.calculateStudentGPA(studentId);
        return ResponseEntity.ok(gpa);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canEditMarks()")
    public ResponseEntity<MarksViewDTO> updateMarks(@PathVariable Long id, @RequestBody UpdateMarksRequestDTO request) {
        try {
            Marks updated = marksService.updateMarksFromDTO(id, request);
            if (updated != null) {
                // Convert to DTO to avoid serialization issues
                MarksViewDTO dto = new MarksViewDTO(
                    updated.getId(),
                    updated.getStudent() != null ? updated.getStudent().getId() : null,
                    updated.getStudent() != null && updated.getStudent().getUser() != null ? 
                        updated.getStudent().getUser().getFullName() : "Unknown",
                    updated.getCourse() != null ? updated.getCourse().getId() : null,
                    updated.getCourse() != null ? updated.getCourse().getCourseName() : "Unknown",
                    updated.getExamType() != null ? updated.getExamType().toString() : null,
                    updated.getExamTypeDescription(),
                    updated.getMarks(),
                    updated.getTotalMarks(),
                    updated.getPercentage(),
                    updated.getGrade(),
                    updated.getSessionalMarks(),
                    updated.getAssignmentMarks(),
                    updated.getObtainedSessionalMarks(),
                    updated.getObtainedAssignmentMarks(),
                    updated.getComments(),
                    updated.getMarkType() != null ? updated.getMarkType().toString() : null,
                    updated.getCreatedAt()
                );
                return ResponseEntity.ok(dto);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMarks(@PathVariable Long id) {
        marksService.deleteMarks(id);
        return ResponseEntity.noContent().build();
    }

    // New endpoints for marks breakdown management
    @PutMapping("/{id}/semester-marks")
    public ResponseEntity<Marks> updateSemesterMarks(@PathVariable Long id, @RequestBody Marks marksData) {
        Marks updated = marksService.updateSemesterMarks(id, marksData.getObtainedSemesterMarks());
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/sessional-marks")
    public ResponseEntity<Marks> updateSessionalMarks(@PathVariable Long id, @RequestBody Marks marksData) {
        Marks updated = marksService.updateSessionalMarks(id, marksData.getObtainedSessionalMarks());
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/assignment-marks")
    public ResponseEntity<Marks> updateAssignmentMarks(@PathVariable Long id, @RequestBody Marks marksData) {
        Marks updated = marksService.updateAssignmentMarks(id, marksData.getObtainedAssignmentMarks());
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/breakdown/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<Marks> getStudentSubjectMarksBreakdown(@PathVariable Long studentId, @PathVariable Long subjectId) {
        Marks marks = marksService.getStudentSubjectMarksBreakdown(studentId, subjectId);
        if (marks != null) {
            return ResponseEntity.ok(marks);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/breakdown")
    public ResponseEntity<Marks> recordMarksWithBreakdown(@RequestBody Marks marks) {
        Marks created = marksService.recordMarksWithBreakdown(marks);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/teacher-submission")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitTeacherMarks(@RequestBody TeacherMarksSubmissionDTO dto, Authentication authentication) {
        try {
            // Validate IDs
            if (dto.getStudentId() == null || dto.getCourseId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Student ID and Course ID are required"
                ));
            }

            // Fetch Student
            Optional<Student> studentOpt = studentRepository.findById(dto.getStudentId());
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Student not found with ID: " + dto.getStudentId()
                ));
            }

            // Fetch Subject/Course
            Optional<Subject> subjectOpt = subjectRepository.findById(dto.getCourseId());
            if (!subjectOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Course not found with ID: " + dto.getCourseId()
                ));
            }

            // Create Marks entity
            Marks marks = new Marks();
            marks.setStudent(studentOpt.get());
            marks.setCourse(subjectOpt.get());
            
            // Get the current authenticated user's email
            String userEmail = authentication.getName();
            
            // Try to find and set the teacher for this user
            try {
                Optional<com.department.model.Teacher> teacherOpt = teacherRepository.findByUserEmail(userEmail);
                if (teacherOpt.isPresent()) {
                    marks.setTeacher(teacherOpt.get());
                    System.out.println("DEBUG: Set teacher: " + teacherOpt.get().getId() + " for email: " + userEmail);
                }
            } catch (Exception e) {
                System.out.println("DEBUG: Could not find teacher for email: " + userEmail + ", error: " + e.getMessage());
            }
            
            // Map exam type - handle various input formats
            // Store the original user-entered exam type in examTypeDescription for display
            String originalExamType = dto.getExamType() != null ? dto.getExamType().trim() : "INTERNAL";
            marks.setExamTypeDescription(originalExamType);  // Store the original text for display
            
            String examTypeStr = originalExamType.toUpperCase();
            
            // Map user input to enum values
            if (examTypeStr.contains("SESSIONAL") || examTypeStr.contains("SESSION")) {
                marks.setExamType(Marks.ExamType.INTERNAL);
                System.out.println("DEBUG: Mapped '" + originalExamType + "' to INTERNAL, stored description: " + originalExamType);
            } else {
                try {
                    examTypeStr = examTypeStr.replace("-", "_").replace(" ", "_");
                    marks.setExamType(Marks.ExamType.valueOf(examTypeStr));
                    System.out.println("DEBUG: Set exam type to " + marks.getExamType() + ", description: " + originalExamType);
                } catch (IllegalArgumentException e) {
                    // Default to INTERNAL if we can't parse
                    System.out.println("DEBUG: Could not parse exam type '" + originalExamType + "', using INTERNAL");
                    marks.setExamType(Marks.ExamType.INTERNAL);
                }
            }
            
            marks.setSessionalMarks(dto.getSessionalMarks() != null ? dto.getSessionalMarks() : BigDecimal.ZERO);
            marks.setAssignmentMarks(dto.getAssignmentMarks() != null ? dto.getAssignmentMarks() : BigDecimal.ZERO);
            marks.setObtainedSessionalMarks(dto.getObtainedSessionalMarks() != null ? dto.getObtainedSessionalMarks() : BigDecimal.ZERO);
            marks.setObtainedAssignmentMarks(dto.getObtainedAssignmentMarks() != null ? dto.getObtainedAssignmentMarks() : BigDecimal.ZERO);
            marks.setComments(dto.getComments());
            marks.setMarkType(Marks.MarkType.TEACHER);
            
            // Set user-entered grade if provided (will not be auto-calculated)
            if (dto.getGrade() != null && !dto.getGrade().isEmpty()) {
                marks.setGrade(dto.getGrade());
                System.out.println("DEBUG: Set user-entered grade: " + dto.getGrade());
            }
            
            // Set passing status if provided
            if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
                try {
                    marks.setPassingStatus(Marks.PassingStatus.valueOf(dto.getStatus().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    marks.setPassingStatus(Marks.PassingStatus.PASS);
                }
            }
            
            // Calculate total obtained marks
            BigDecimal totalObtained = marks.getObtainedSessionalMarks().add(marks.getObtainedAssignmentMarks());
            marks.setMarks(totalObtained);
            
            // Set total marks
            BigDecimal totalMax = marks.getSessionalMarks().add(marks.getAssignmentMarks());
            marks.setTotalMarks(totalMax.intValue());

            System.out.println("DEBUG: Saving marks for student=" + dto.getStudentId() + 
                             ", course=" + dto.getCourseId() + 
                             ", examType=" + marks.getExamType() +
                             ", obtainedMarks=" + marks.getMarks() +
                             ", totalMarks=" + marks.getTotalMarks() +
                             ", teacher=" + (marks.getTeacher() != null ? marks.getTeacher().getId() : "null"));

            // Save marks
            Marks saved = marksService.recordMarks(marks);
            System.out.println("DEBUG: Marks saved successfully with ID: " + saved.getId());
            return new ResponseEntity<>(saved, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("ERROR: Exception in submitTeacherMarks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                "error", "Error saving marks: " + e.getMessage()
            ));
        }
    }

    // New endpoints for teacher marks management
    @GetMapping("/teacher/{teacherId}/type/{markType}")
    public ResponseEntity<List<Marks>> getTeacherMarksByType(@PathVariable Long teacherId, @PathVariable String markType) {
        try {
            Marks.MarkType type = Marks.MarkType.valueOf(markType.toUpperCase());
            List<Marks> marks = marksService.getTeacherMarksByMarkType(teacherId, type);
            return ResponseEntity.ok(marks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/teacher/{teacherId}/subject/{subjectId}/type/{markType}")
    public ResponseEntity<List<Marks>> getTeacherSubjectMarks(@PathVariable Long teacherId, @PathVariable Long subjectId, @PathVariable String markType) {
        try {
            Marks.MarkType type = Marks.MarkType.valueOf(markType.toUpperCase());
            List<Marks> marks = marksService.getTeacherSubjectMarks(teacherId, subjectId, type);
            return ResponseEntity.ok(marks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // New endpoints for admin marks management
    @GetMapping("/admin")
    public ResponseEntity<List<?>> getAdminMarks(
            @RequestParam(required = false) Long programId,
            @RequestParam(required = false) String semester) {
        
        try {
            List<Marks> marks;
            
            if (programId != null && semester != null) {
                // If parameters provided, get marks for specific program/semester
                marks = marksService.getAdminMarksForSemester(programId, semester);
            } else {
                // If no parameters, get ALL admin marks
                marks = marksService.getAllAdminMarks();
            }
            
            // Convert to DTOs to avoid serialization issues
            java.util.List<Object> response = new java.util.ArrayList<>();
            for (Marks mark : marks) {
                String studentProgram = mark.getStudent() != null ? mark.getStudent().getProgram() : null;
                Integer studentSemester = mark.getStudent() != null ? mark.getStudent().getSemester() : null;
                
                com.department.dto.MarksViewDTO dto = new com.department.dto.MarksViewDTO(
                    mark.getId(),
                    mark.getStudent() != null ? mark.getStudent().getId() : null,
                    mark.getStudent() != null && mark.getStudent().getUser() != null ? 
                        mark.getStudent().getUser().getFullName() : "Unknown",
                    studentProgram,
                    studentSemester,
                    mark.getCourse() != null ? mark.getCourse().getId() : null,
                    mark.getCourse() != null ? mark.getCourse().getCourseName() : "Unknown",
                    mark.getExamType() != null ? mark.getExamType().toString() : null,
                    mark.getExamTypeDescription(),
                    mark.getMarks(),
                    mark.getTotalMarks(),
                    mark.getPercentage(),
                    mark.getGrade(),
                    mark.getSessionalMarks(),
                    mark.getAssignmentMarks(),
                    mark.getObtainedSessionalMarks(),
                    mark.getObtainedAssignmentMarks(),
                    mark.getComments(),
                    mark.getMarkType() != null ? mark.getMarkType().toString() : null,
                    mark.getCreatedAt()
                );
                response.add(dto);
            }
            
            System.out.println("Returning " + response.size() + " admin marks as DTOs");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in getAdminMarks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/admin/teacher-added")
    public ResponseEntity<List<?>> getTeacherAddedMarks() {
        try {
            List<Marks> marks = marksService.getAllTeacherMarks();
            
            // Convert to DTOs to avoid serialization issues
            java.util.List<Object> response = new java.util.ArrayList<>();
            for (Marks mark : marks) {
                String studentProgram = mark.getStudent() != null ? mark.getStudent().getProgram() : null;
                Integer studentSemester = mark.getStudent() != null ? mark.getStudent().getSemester() : null;
                
                com.department.dto.MarksViewDTO dto = new com.department.dto.MarksViewDTO(
                    mark.getId(),
                    mark.getStudent() != null ? mark.getStudent().getId() : null,
                    mark.getStudent() != null && mark.getStudent().getUser() != null ? 
                        mark.getStudent().getUser().getFullName() : "Unknown",
                    studentProgram,
                    studentSemester,
                    mark.getCourse() != null ? mark.getCourse().getId() : null,
                    mark.getCourse() != null ? mark.getCourse().getCourseName() : "Unknown",
                    mark.getExamType() != null ? mark.getExamType().toString() : null,
                    mark.getExamTypeDescription(),
                    mark.getMarks(),
                    mark.getTotalMarks(),
                    mark.getPercentage(),
                    mark.getGrade(),
                    mark.getSessionalMarks(),
                    mark.getAssignmentMarks(),
                    mark.getObtainedSessionalMarks(),
                    mark.getObtainedAssignmentMarks(),
                    mark.getComments(),
                    mark.getMarkType() != null ? mark.getMarkType().toString() : null,
                    mark.getCreatedAt()
                );
                response.add(dto);
            }
            
            System.out.println("Returning " + response.size() + " teacher-added marks as DTOs");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in getTeacherAddedMarks: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(new java.util.ArrayList<>());
        }
    }

    @PostMapping("/admin")
    public ResponseEntity<Marks> recordAdminMarks(@RequestBody AdminMarksRequestDTO request) {
        Marks created = marksService.recordAdminMarksFromDTO(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/student/{studentId}/type/{markType}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<?>> getStudentMarksWithType(@PathVariable Long studentId, @PathVariable String markType, Authentication authentication) {
        try {
            Marks.MarkType type = Marks.MarkType.valueOf(markType.toUpperCase());
            
            // Get the authenticated user's email
            String userEmail = authentication.getName();
            
            // Call service using email-based method
            List<Marks> marks = marksService.getUserMarksWithTypeByEmail(userEmail, type);
            
            // Convert to DTOs to avoid serialization issues
            java.util.List<Object> response = new java.util.ArrayList<>();
            for (Marks mark : marks) {
                com.department.dto.MarksViewDTO dto = new com.department.dto.MarksViewDTO(
                    mark.getId(),
                    mark.getStudent() != null ? mark.getStudent().getId() : null,
                    mark.getStudent() != null && mark.getStudent().getUser() != null ? 
                        mark.getStudent().getUser().getFullName() : "Unknown",
                    mark.getCourse() != null ? mark.getCourse().getId() : null,
                    mark.getCourse() != null ? mark.getCourse().getCourseName() : "Unknown",
                    mark.getExamType() != null ? mark.getExamType().toString() : null,
                    mark.getExamTypeDescription(),
                    mark.getMarks(),
                    mark.getTotalMarks(),
                    mark.getPercentage(),
                    mark.getGrade(),
                    mark.getSessionalMarks(),
                    mark.getAssignmentMarks(),
                    mark.getObtainedSessionalMarks(),
                    mark.getObtainedAssignmentMarks(),
                    mark.getComments(),
                    mark.getMarkType() != null ? mark.getMarkType().toString() : null,
                    mark.getCreatedAt()
                );
                response.add(dto);
            }
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}/admin")
    public ResponseEntity<List<Marks>> getStudentAdminMarks(@PathVariable Long studentId) {
        List<Marks> marks = marksService.getStudentMarksWithType(studentId, Marks.MarkType.ADMIN);
        return ResponseEntity.ok(marks);
    }
}


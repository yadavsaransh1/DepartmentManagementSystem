package com.department.controller;

import com.department.model.TeacherFeedback;
import com.department.model.Student;
import com.department.model.Teacher;
import com.department.model.Subject;
import com.department.dto.TeacherFeedbackDTO;
import com.department.service.TeacherFeedbackService;
import com.department.repository.StudentRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/teacher-feedback")
public class TeacherFeedbackController {

    @Autowired
    private TeacherFeedbackService feedbackService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    // Feedback endpoints
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> submitFeedback(@RequestBody TeacherFeedbackDTO feedbackDTO) {
        try {
            System.out.println("DEBUG: Received feedback submission with studentId: " + feedbackDTO.getStudentId() + 
                             ", teacherId: " + feedbackDTO.getTeacherId() + 
                             ", subjectId: " + feedbackDTO.getSubjectId());
            
            // Fetch the required entities
            Optional<Student> studentOpt = studentRepository.findById(feedbackDTO.getStudentId());
            Optional<Teacher> teacherOpt = teacherRepository.findById(feedbackDTO.getTeacherId());
            Optional<Subject> subjectOpt = subjectRepository.findById(feedbackDTO.getSubjectId());
            
            if (!studentOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student not found"));
            }
            if (!teacherOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Teacher not found"));
            }
            if (!subjectOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject not found"));
            }
            
            // Create the feedback entity
            TeacherFeedback feedback = new TeacherFeedback();
            feedback.setStudent(studentOpt.get());
            feedback.setTeacher(teacherOpt.get());
            feedback.setSubject(subjectOpt.get());
            feedback.setProgram(feedbackDTO.getProgram());
            feedback.setSemester(feedbackDTO.getSemester());
            feedback.setTeachingQuality(feedbackDTO.getTeachingQuality());
            feedback.setCommunication(feedbackDTO.getCommunication());
            feedback.setAvailability(feedbackDTO.getAvailability());
            feedback.setCourseContent(feedbackDTO.getCourseContent());
            // Convert Integer to BigDecimal
            feedback.setOverallRating(new BigDecimal(feedbackDTO.getOverallRating()));
            feedback.setComments(feedbackDTO.getComments());
            feedback.setPositiveAspects(feedbackDTO.getPositiveAspects());
            feedback.setAreasForImprovement(feedbackDTO.getAreasForImprovement());
            feedback.setIsAnonymous(feedbackDTO.getIsAnonymous() != null ? feedbackDTO.getIsAnonymous() : false);
            
            TeacherFeedback savedFeedback = feedbackService.submitFeedback(feedback);
            System.out.println("DEBUG: Feedback saved successfully with id: " + savedFeedback.getId());
            
            return new ResponseEntity<>(savedFeedback, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("ERROR: Exception submitting feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit feedback: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Object>> getAllFeedback() {
        try {
            List<TeacherFeedback> feedbacks = feedbackService.getAllFeedback();
            List<Object> responses = new java.util.ArrayList<>();
            for (TeacherFeedback feedback : feedbacks) {
                Map<String, Object> feedbackMap = new java.util.HashMap<>();
                feedbackMap.put("id", feedback.getId());
                feedbackMap.put("studentId", feedback.getStudent() != null ? feedback.getStudent().getStudentId() : null);
                feedbackMap.put("studentName", feedback.getStudent() != null && feedback.getStudent().getUser() != null ? 
                               feedback.getStudent().getUser().getFullName() : "Anonymous");
                feedbackMap.put("studentEnrollmentNumber", feedback.getStudent() != null ? feedback.getStudent().getEnrollmentNumber() : null);
                feedbackMap.put("teacherId", feedback.getTeacher() != null ? feedback.getTeacher().getId() : null);
                feedbackMap.put("teacherName", feedback.getTeacher() != null && feedback.getTeacher().getUser() != null ? 
                               feedback.getTeacher().getUser().getFullName() : "Unknown");
                feedbackMap.put("subjectId", feedback.getSubject() != null ? feedback.getSubject().getId() : null);
                feedbackMap.put("subjectName", feedback.getSubject() != null ? feedback.getSubject().getCourseName() : "Unknown");
                feedbackMap.put("program", feedback.getProgram());
                feedbackMap.put("semester", feedback.getSemester());
                feedbackMap.put("teachingQuality", feedback.getTeachingQuality());
                feedbackMap.put("communication", feedback.getCommunication());
                feedbackMap.put("availability", feedback.getAvailability());
                feedbackMap.put("courseContent", feedback.getCourseContent());
                feedbackMap.put("overallRating", feedback.getOverallRating());
                feedbackMap.put("comments", feedback.getComments());
                feedbackMap.put("positiveAspects", feedback.getPositiveAspects());
                feedbackMap.put("areasForImprovement", feedback.getAreasForImprovement());
                feedbackMap.put("isAnonymous", feedback.getIsAnonymous());
                feedbackMap.put("createdAt", feedback.getCreatedAt());
                responses.add(feedbackMap);
            }
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.out.println("Error fetching all feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherFeedback> getFeedbackById(@PathVariable Long id) {
        Optional<TeacherFeedback> feedback = feedbackService.getFeedbackById(id);
        return feedback.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Object>> getFeedbackForTeacher(@PathVariable Long teacherId) {
        List<TeacherFeedback> feedbacks = feedbackService.getFeedbackForTeacher(teacherId);
        
        // Convert to DTOs to avoid circular reference serialization issues
        List<Object> responses = new java.util.ArrayList<>();
        for (TeacherFeedback feedback : feedbacks) {
            Map<String, Object> feedbackMap = new java.util.HashMap<>();
            feedbackMap.put("id", feedback.getId());
            feedbackMap.put("studentId", feedback.getStudent() != null ? feedback.getStudent().getStudentId() : null);
            feedbackMap.put("studentName", feedback.getStudent() != null && feedback.getStudent().getUser() != null ? 
                           feedback.getStudent().getUser().getFullName() : "Anonymous");
            feedbackMap.put("studentEnrollmentNumber", feedback.getStudent() != null ? feedback.getStudent().getEnrollmentNumber() : null);
            feedbackMap.put("teacherId", feedback.getTeacher() != null ? feedback.getTeacher().getId() : null);
            feedbackMap.put("teacherName", feedback.getTeacher() != null && feedback.getTeacher().getUser() != null ? 
                           feedback.getTeacher().getUser().getFullName() : "Unknown");
            feedbackMap.put("subjectId", feedback.getSubject() != null ? feedback.getSubject().getId() : null);
            feedbackMap.put("subjectName", feedback.getSubject() != null ? feedback.getSubject().getCourseName() : "Unknown");
            feedbackMap.put("program", feedback.getProgram());
            feedbackMap.put("semester", feedback.getSemester());
            feedbackMap.put("teachingQuality", feedback.getTeachingQuality());
            feedbackMap.put("communication", feedback.getCommunication());
            feedbackMap.put("availability", feedback.getAvailability());
            feedbackMap.put("courseContent", feedback.getCourseContent());
            feedbackMap.put("overallRating", feedback.getOverallRating());
            feedbackMap.put("comments", feedback.getComments());
            feedbackMap.put("positiveAspects", feedback.getPositiveAspects());
            feedbackMap.put("areasForImprovement", feedback.getAreasForImprovement());
            feedbackMap.put("isAnonymous", feedback.getIsAnonymous());
            feedbackMap.put("createdAt", feedback.getCreatedAt());
            responses.add(feedbackMap);
        }
        
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TeacherFeedback>> getFeedbackByStudent(@PathVariable Long studentId) {
        List<TeacherFeedback> feedbacks = feedbackService.getFeedbackByStudent(studentId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/student/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Object>> getMyFeedback(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(401).body(new java.util.ArrayList<>());
            }
            
            // Get authenticated user's email
            String userEmail = authentication.getName();
            System.out.println("DEBUG: Fetching feedback for student email: " + userEmail);
            
            // Find student by email
            Optional<Student> studentOpt = studentRepository.findByUserEmail(userEmail);
            if (!studentOpt.isPresent()) {
                System.out.println("DEBUG: No student found for email: " + userEmail);
                return ResponseEntity.ok(new java.util.ArrayList<>());
            }
            
            Student student = studentOpt.get();
            System.out.println("DEBUG: Student found: " + student.getId());
            
            // Get feedback submitted by this student
            List<TeacherFeedback> feedbacks = feedbackService.getFeedbackByStudent(student.getId());
            System.out.println("DEBUG: Found " + feedbacks.size() + " feedback records for student");
            
            // Convert to response DTOs to avoid serialization issues
            List<Object> responses = new java.util.ArrayList<>();
            for (TeacherFeedback feedback : feedbacks) {
                Map<String, Object> feedbackMap = new java.util.HashMap<>();
                feedbackMap.put("id", feedback.getId());
                feedbackMap.put("studentId", feedback.getStudent() != null ? feedback.getStudent().getId() : null);
                feedbackMap.put("studentName", feedback.getStudent() != null && feedback.getStudent().getUser() != null ? 
                               feedback.getStudent().getUser().getFullName() : "You");
                feedbackMap.put("teacherId", feedback.getTeacher() != null ? feedback.getTeacher().getId() : null);
                feedbackMap.put("teacherName", feedback.getTeacher() != null && feedback.getTeacher().getUser() != null ? 
                               feedback.getTeacher().getUser().getFullName() : "Unknown");
                feedbackMap.put("subjectId", feedback.getSubject() != null ? feedback.getSubject().getId() : null);
                feedbackMap.put("subjectName", feedback.getSubject() != null ? feedback.getSubject().getCourseName() : "Unknown");
                feedbackMap.put("program", feedback.getProgram());
                feedbackMap.put("semester", feedback.getSemester());
                feedbackMap.put("teachingQuality", feedback.getTeachingQuality());
                feedbackMap.put("communication", feedback.getCommunication());
                feedbackMap.put("availability", feedback.getAvailability());
                feedbackMap.put("courseContent", feedback.getCourseContent());
                feedbackMap.put("overallRating", feedback.getOverallRating());
                feedbackMap.put("comments", feedback.getComments());
                feedbackMap.put("positiveAspects", feedback.getPositiveAspects());
                feedbackMap.put("areasForImprovement", feedback.getAreasForImprovement());
                feedbackMap.put("isAnonymous", feedback.getIsAnonymous());
                feedbackMap.put("createdAt", feedback.getCreatedAt());
                responses.add(feedbackMap);
            }
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.out.println("Error fetching my feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }

    @GetMapping("/program-semester")
    public ResponseEntity<List<TeacherFeedback>> getFeedbackByProgramAndSemester(
            @RequestParam String program,
            @RequestParam Integer semester) {
        List<TeacherFeedback> feedbacks = feedbackService.getFeedbackByProgramAndSemester(program, semester);
        return ResponseEntity.ok(feedbacks);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateFeedback(@PathVariable Long id, @RequestBody TeacherFeedbackDTO feedbackDTO, Authentication authentication) {
        try {
            // Check if feedback exists
            Optional<TeacherFeedback> existingOpt = feedbackService.getFeedbackById(id);
            if (!existingOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            TeacherFeedback existing = existingOpt.get();

            // Verify that the authenticated user is the student who submitted this feedback
            String userEmail = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByUserEmail(userEmail);
            if (!studentOpt.isPresent() || !existing.getStudent().getId().equals(studentOpt.get().getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only update your own feedback"));
            }

            // Update the feedback fields
            existing.setTeachingQuality(feedbackDTO.getTeachingQuality());
            existing.setCommunication(feedbackDTO.getCommunication());
            existing.setAvailability(feedbackDTO.getAvailability());
            existing.setCourseContent(feedbackDTO.getCourseContent());
            existing.setOverallRating(new BigDecimal(feedbackDTO.getOverallRating()));
            existing.setComments(feedbackDTO.getComments());
            existing.setPositiveAspects(feedbackDTO.getPositiveAspects());
            existing.setAreasForImprovement(feedbackDTO.getAreasForImprovement());
            existing.setIsAnonymous(feedbackDTO.getIsAnonymous() != null ? feedbackDTO.getIsAnonymous() : false);

            TeacherFeedback updated = feedbackService.submitFeedback(existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            System.out.println("ERROR: Exception updating feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update feedback: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")    @PreAuthorize("isAuthenticated()")    public ResponseEntity<?> deleteFeedback(@PathVariable Long id, Authentication authentication) {
        try {
            // Check if feedback exists
            Optional<TeacherFeedback> feedbackOpt = feedbackService.getFeedbackById(id);
            if (!feedbackOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            TeacherFeedback feedback = feedbackOpt.get();

            // Verify that the authenticated user is the student who submitted this feedback or is admin
            String userEmail = authentication.getName();
            Optional<Student> studentOpt = studentRepository.findByUserEmail(userEmail);
            
            boolean isOwner = studentOpt.isPresent() && feedback.getStudent().getId().equals(studentOpt.get().getId());
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isOwner && !isAdmin) {
                return ResponseEntity.status(403).body(Map.of("error", "You can only delete your own feedback"));
            }

            feedbackService.softDeleteFeedback(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("ERROR: Exception deleting feedback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete feedback: " + e.getMessage()));
        }
    }
}


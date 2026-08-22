package com.department.controller;

import com.department.dto.AssignmentDTO;
import com.department.model.Assignment;
import com.department.model.Teacher;
import com.department.model.Subject;
import com.department.service.AssignmentService;
import com.department.repository.SubjectRepository;
import com.department.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;


    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canManageAssignment()")
    public ResponseEntity<?> createAssignment(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("instructions") String instructions,
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("teacherId") Long teacherId,
            @RequestParam("maxScore") int maxScore,
            @RequestParam("dueDate") String dueDate,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "visibleToAllStudents", defaultValue = "true") Boolean visibleToAllStudents,
            @RequestParam(value = "visibleStudentIds", required = false) String visibleStudentIds) {
        try {
            // Load Subject and Teacher from database
            Optional<Subject> subjectOpt = subjectRepository.findById(subjectId);
            Optional<Teacher> teacherOpt = teacherRepository.findById(teacherId);
            
            if (!subjectOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Subject not found"));
            }
            if (!teacherOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Teacher not found"));
            }
            
            // Create Assignment with relationships
            Assignment assignment = new Assignment();
            assignment.setTitle(title);
            assignment.setDescription(description);
            assignment.setInstructions(instructions);
            assignment.setDueDate(LocalDateTime.parse(dueDate));
            assignment.setMaxScore(maxScore);
            assignment.setSubject(subjectOpt.get());
            assignment.setTeacher(teacherOpt.get());
            assignment.setVisibleToAllStudents(visibleToAllStudents);
            assignment.setVisibleStudentIds(visibleStudentIds);
            
            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                try {
                    String uploadDir = "uploads/assignments";
                    File uploadDirFile = new File(uploadDir);
                    if (!uploadDirFile.exists()) {
                        uploadDirFile.mkdirs();
                    }
                    
                    String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                    Path path = Paths.get(uploadDir, filename);
                    Files.write(path, file.getBytes());
                    
                    assignment.setFileName(file.getOriginalFilename());
                    assignment.setFilePath(path.toString());
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
                }
            }
            
            Assignment created = assignmentService.createAssignment(assignment);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID format: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignment(@PathVariable Long id) {
        Optional<Assignment> assignment = assignmentService.getAssignmentById(id);
        return assignment.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments() {
        List<Assignment> assignments = assignmentService.getAllAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<AssignmentDTO>> getAssignmentsBySubject(@PathVariable Long subjectId) {
        List<Assignment> assignments = assignmentService.getAssignmentsBySubject(subjectId);
        List<AssignmentDTO> assignmentDTOs = assignments.stream()
                .map(a -> new AssignmentDTO(
                        a.getId(),
                        a.getTitle(),
                        a.getDescription(),
                        a.getInstructions(),
                        a.getFilePath(),
                        a.getFileName(),
                        a.getDueDate(),
                        a.getMaxScore(),
                        a.getCourse() != null ? a.getCourse().getId() : null,
                        a.getCourse() != null ? a.getCourse().getCourseName() : null,
                        a.getTeacher() != null ? a.getTeacher().getId() : null,
                        a.getTeacher() != null ? a.getTeacher().getUser().getFullName() : null,
                        a.getCreatedAt(),
                        a.getUpdatedAt()
                ))
                .toList();
        return ResponseEntity.ok(assignmentDTOs);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByTeacher(@PathVariable Long teacherId) {
        List<Assignment> assignments = assignmentService.getAssignmentsByTeacher(teacherId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Assignment>> getUpcomingAssignments(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        List<Assignment> assignments = assignmentService.getUpcomingAssignments(startDate, endDate);
        return ResponseEntity.ok(assignments);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canManageAssignment()")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable Long id, @RequestBody Assignment assignment) {
        Assignment updated = assignmentService.updateAssignment(id, assignment);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canManageAssignment()")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        try {
            assignmentService.deleteAssignment(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete assignment: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/download-file")
    public ResponseEntity<byte[]> downloadAssignmentFile(@PathVariable Long id) {
        try {
            Optional<Assignment> assignmentOpt = assignmentService.getAssignmentById(id);
            if (!assignmentOpt.isPresent() || assignmentOpt.get().getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            
            Assignment assignment = assignmentOpt.get();
            Path path = Paths.get(assignment.getFilePath());
            
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] content = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + assignment.getFileName() + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}


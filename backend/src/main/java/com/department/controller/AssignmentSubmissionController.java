package com.department.controller;

import com.department.model.AssignmentSubmission;
import com.department.service.AssignmentSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/submissions")
public class AssignmentSubmissionController {

    @Autowired
    private AssignmentSubmissionService submissionService;

    @PostMapping
    public ResponseEntity<?> submitAssignment(
            @RequestParam Long assignmentId,
            @RequestParam Long studentId,
            @RequestParam(required = false) String submissionText,
            @RequestParam(required = false) MultipartFile file,
            Authentication authentication) {
        try {
            AssignmentSubmission submission = submissionService.createSubmission(
                assignmentId, 
                studentId, 
                submissionText, 
                file,
                authentication != null ? authentication.getName() : null
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentSubmission> getSubmission(@PathVariable Long id) {
        Optional<AssignmentSubmission> submission = submissionService.getSubmissionById(id);
        return submission.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        List<AssignmentSubmission> submissions = submissionService.getSubmissionsByAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AssignmentSubmission>> getSubmissionsByStudent(@PathVariable Long studentId) {
        List<AssignmentSubmission> submissions = submissionService.getSubmissionsByStudent(studentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/assignment/{assignmentId}/student/{studentId}")
    public ResponseEntity<AssignmentSubmission> getStudentSubmission(@PathVariable Long assignmentId, @PathVariable Long studentId) {
        Optional<AssignmentSubmission> submission = submissionService.getStudentSubmission(assignmentId, studentId);
        return submission.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> gradeData) {
        try {
            Integer score = (Integer) gradeData.get("score");
            String feedback = (String) gradeData.get("feedback");
            
            AssignmentSubmission graded = submissionService.gradeSubmission(id, score, feedback);
            if (graded != null) {
                return ResponseEntity.ok(graded);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssignmentSubmission> updateSubmission(@PathVariable Long id, @RequestBody AssignmentSubmission submission) {
        AssignmentSubmission updated = submissionService.updateSubmission(id, submission);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/assignment/{assignmentId}/statistics")
    public ResponseEntity<Map<String, Object>> getSubmissionStatistics(@PathVariable Long assignmentId) {
        long total = submissionService.countSubmissionsByStatus(assignmentId, null);
        long submitted = submissionService.countSubmissionsByStatus(assignmentId, AssignmentSubmission.SubmissionStatus.SUBMITTED);
        long graded = submissionService.countSubmissionsByStatus(assignmentId, AssignmentSubmission.SubmissionStatus.GRADED);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("submitted", submitted);
        stats.put("graded", graded);
        stats.put("pending", submitted - graded);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{id}/download-file")
    public ResponseEntity<byte[]> downloadSubmissionFile(@PathVariable Long id) {
        try {
            Optional<AssignmentSubmission> submissionOpt = submissionService.getSubmissionById(id);
            if (!submissionOpt.isPresent() || submissionOpt.get().getSubmissionFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            
            AssignmentSubmission submission = submissionOpt.get();
            Path path = Paths.get(submission.getSubmissionFilePath());
            
            if (!Files.exists(path)) {
                return ResponseEntity.notFound().build();
            }
            
            byte[] content = Files.readAllBytes(path);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + submission.getSubmissionFileName() + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(content);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

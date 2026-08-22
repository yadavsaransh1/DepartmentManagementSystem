package com.department.service;

import com.department.model.AssignmentSubmission;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionService {
    AssignmentSubmission submitAssignment(AssignmentSubmission submission);
    AssignmentSubmission createSubmission(Long assignmentId, Long studentId, String submissionText, MultipartFile file, String userEmail);
    Optional<AssignmentSubmission> getSubmissionById(Long id);
    List<AssignmentSubmission> getSubmissionsByAssignment(Long assignmentId);
    List<AssignmentSubmission> getSubmissionsByStudent(Long studentId);
    List<AssignmentSubmission> getSubmissionsByStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status);
    Optional<AssignmentSubmission> getStudentSubmission(Long assignmentId, Long studentId);
    AssignmentSubmission gradeSubmission(Long submissionId, Integer score, String feedback);
    AssignmentSubmission updateSubmission(Long id, AssignmentSubmission submission);
    void deleteSubmission(Long id);
    long countSubmissionsByStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status);
}

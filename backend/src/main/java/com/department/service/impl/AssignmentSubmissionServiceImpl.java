package com.department.service.impl;

import com.department.model.*;
import com.department.repository.*;
import com.department.service.AssignmentSubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AssignmentSubmissionServiceImpl implements AssignmentSubmissionService {

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    private static final String SUBMISSIONS_UPLOAD_DIR = "uploads/submissions/";

    @Override
    public AssignmentSubmission submitAssignment(AssignmentSubmission submission) {
        submission.setStatus(AssignmentSubmission.SubmissionStatus.SUBMITTED);
        submission.setSubmittedAt(LocalDateTime.now());
        return submissionRepository.save(submission);
    }

    @Override
    public AssignmentSubmission createSubmission(Long assignmentId, Long studentId, String submissionText, MultipartFile file, String userEmail) {
        try {
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            User user = userRepository.findByEmail(userEmail)
                    .orElse(student.getUser());

            // Check if student already has a submission for this assignment
            Optional<AssignmentSubmission> existingSubmission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
            
            AssignmentSubmission submission;
            if (existingSubmission.isPresent()) {
                submission = existingSubmission.get();
                submission.setUpdatedAt(LocalDateTime.now());
            } else {
                submission = new AssignmentSubmission();
                submission.setAssignment(assignment);
                submission.setStudent(student);
                submission.setUser(user);
            }

            submission.setSubmissionText(submissionText);

            // Handle file upload if provided
            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                String filePath = SUBMISSIONS_UPLOAD_DIR + fileName;
                
                Files.createDirectories(Paths.get(SUBMISSIONS_UPLOAD_DIR));
                Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);
                
                submission.setSubmissionFileName(file.getOriginalFilename());
                submission.setSubmissionFilePath(filePath);
            }

            // Determine if submission is late
            boolean isLate = LocalDateTime.now().isAfter(assignment.getDueDate());
            submission.setIsLate(isLate);
            
            // Set status
            if (existingSubmission.isPresent() && existingSubmission.get().getStatus() == AssignmentSubmission.SubmissionStatus.GRADED) {
                submission.setStatus(AssignmentSubmission.SubmissionStatus.SUBMITTED); // Resubmission after grading
            } else {
                submission.setStatus(isLate ? AssignmentSubmission.SubmissionStatus.LATE_SUBMITTED : AssignmentSubmission.SubmissionStatus.SUBMITTED);
            }

            submission.setSubmittedAt(LocalDateTime.now());
            
            return submissionRepository.save(submission);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
    }

    @Override
    public Optional<AssignmentSubmission> getSubmissionById(Long id) {
        return submissionRepository.findById(id);
    }

    @Override
    public List<AssignmentSubmission> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    @Override
    public List<AssignmentSubmission> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    @Override
    public List<AssignmentSubmission> getSubmissionsByStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status) {
        return submissionRepository.findByAssignmentIdAndStatus(assignmentId, status);
    }

    @Override
    public Optional<AssignmentSubmission> getStudentSubmission(Long assignmentId, Long studentId) {
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
    }

    @Override
    public AssignmentSubmission gradeSubmission(Long submissionId, Integer score, String feedback) {
        Optional<AssignmentSubmission> submission = submissionRepository.findById(submissionId);
        if (submission.isPresent()) {
            AssignmentSubmission sub = submission.get();
            sub.setScore(score);
            sub.setFeedback(feedback);
            sub.setStatus(AssignmentSubmission.SubmissionStatus.GRADED);
            sub.setGradedAt(LocalDateTime.now());
            return submissionRepository.save(sub);
        }
        return null;
    }

    @Override
    public AssignmentSubmission updateSubmission(Long id, AssignmentSubmission submission) {
        if (submissionRepository.existsById(id)) {
            submission.setId(id);
            return submissionRepository.save(submission);
        }
        return null;
    }

    @Override
    public void deleteSubmission(Long id) {
        submissionRepository.deleteById(id);
    }

    @Override
    public long countSubmissionsByStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status) {
        if (status == null) {
            return submissionRepository.countByAssignmentId(assignmentId);
        }
        return submissionRepository.countByAssignmentIdAndStatus(assignmentId, status);
    }
}

package com.department.repository;

import com.department.model.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignmentId(Long assignmentId);
    List<AssignmentSubmission> findByStudentId(Long studentId);
    List<AssignmentSubmission> findByAssignmentIdAndStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    long countByAssignmentIdAndStatus(Long assignmentId, AssignmentSubmission.SubmissionStatus status);
    long countByStudentIdAndStatus(Long studentId, AssignmentSubmission.SubmissionStatus status);
    long countByAssignmentId(Long assignmentId);
}

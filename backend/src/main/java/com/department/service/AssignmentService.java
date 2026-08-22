package com.department.service;

import com.department.model.Assignment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AssignmentService {
    Assignment createAssignment(Assignment assignment);
    Optional<Assignment> getAssignmentById(Long id);
    List<Assignment> getAllAssignments();
    List<Assignment> getAssignmentsBySubject(Long subjectId);
    List<Assignment> getAssignmentsByTeacher(Long teacherId);
    List<Assignment> getUpcomingAssignments(LocalDateTime startDate, LocalDateTime endDate);
    Assignment updateAssignment(Long id, Assignment assignment);
    void deleteAssignment(Long id);
    List<Assignment> getAssignmentsBySubjectOrderByDue(Long subjectId);
}

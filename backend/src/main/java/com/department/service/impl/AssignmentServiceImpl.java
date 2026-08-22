package com.department.service.impl;

import com.department.model.Assignment;
import com.department.repository.AssignmentRepository;
import com.department.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Override
    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @Override
    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepository.findById(id);
    }

    @Override
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @Override
    public List<Assignment> getAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.findBySubjectId(subjectId);
    }

    @Override
    public List<Assignment> getAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.findByTeacherId(teacherId);
    }

    @Override
    public List<Assignment> getUpcomingAssignments(LocalDateTime startDate, LocalDateTime endDate) {
        return assignmentRepository.findByDueDateBetween(startDate, endDate);
    }

    @Override
    public Assignment updateAssignment(Long id, Assignment assignment) {
        if (assignmentRepository.existsById(id)) {
            assignment.setId(id);
            return assignmentRepository.save(assignment);
        }
        return null;
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }

    @Override
    public List<Assignment> getAssignmentsBySubjectOrderByDue(Long subjectId) {
        return assignmentRepository.findBySubjectIdOrderByDueDateAsc(subjectId);
    }
}

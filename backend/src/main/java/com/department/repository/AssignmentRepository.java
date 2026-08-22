package com.department.repository;

import com.department.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByTeacherId(Long teacherId);
    List<Assignment> findByDueDateBetween(LocalDateTime start, LocalDateTime end);
    List<Assignment> findByCourseIdOrderByDueDateAsc(Long courseId);
    
    // Backward compatibility: subjectId -> courseId
    default List<Assignment> findBySubjectId(Long subjectId) {
        return findByCourseId(subjectId);
    }
    
    default List<Assignment> findBySubjectIdOrderByDueDateAsc(Long subjectId) {
        return findByCourseIdOrderByDueDateAsc(subjectId);
    }
}

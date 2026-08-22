package com.department.repository;

import com.department.model.StudentPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentPerformanceRepository extends JpaRepository<StudentPerformance, Long> {
    Optional<StudentPerformance> findByStudentId(Long studentId);
    List<StudentPerformance> findByPerformanceLevel(StudentPerformance.PerformanceLevel level);
    List<StudentPerformance> findAllByOrderByOverallGpaDesc();
}

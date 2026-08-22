package com.department.repository;

import com.department.model.TeacherPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TeacherPerformanceRepository extends JpaRepository<TeacherPerformance, Long> {
    Optional<TeacherPerformance> findByTeacherId(Long teacherId);
    List<TeacherPerformance> findAllByOrderByPerformanceRatingDesc();
}

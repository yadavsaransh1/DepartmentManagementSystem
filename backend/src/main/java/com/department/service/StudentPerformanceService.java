package com.department.service;

import com.department.model.StudentPerformance;
import java.util.List;
import java.util.Optional;

public interface StudentPerformanceService {
    StudentPerformance calculatePerformance(Long studentId);
    Optional<StudentPerformance> getPerformance(Long studentId);
    List<StudentPerformance> getAllPerformances();
    List<StudentPerformance> getPerformancesByLevel(StudentPerformance.PerformanceLevel level);
    List<StudentPerformance> getTopPerformers();
    StudentPerformance updatePerformance(Long studentId, StudentPerformance performance);
    void deletePerformance(Long studentId);
    void recalculateAllPerformances();
    double calculateOverallGPA(Long studentId);
}

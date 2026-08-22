package com.department.service;

import com.department.model.TeacherPerformance;
import java.util.List;
import java.util.Optional;

public interface TeacherPerformanceService {
    TeacherPerformance calculatePerformance(Long teacherId);
    Optional<TeacherPerformance> getPerformance(Long teacherId);
    List<TeacherPerformance> getAllPerformances();
    List<TeacherPerformance> getTopPerformers();
    TeacherPerformance updatePerformance(Long teacherId, TeacherPerformance performance);
    void deletePerformance(Long teacherId);
    void recalculateAllPerformances();
    void incrementClassesTaught(Long teacherId);
    void incrementSubmissionsGraded(Long teacherId);
}

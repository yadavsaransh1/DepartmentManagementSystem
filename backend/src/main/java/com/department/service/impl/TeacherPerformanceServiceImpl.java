package com.department.service.impl;

import com.department.model.TeacherPerformance;
import com.department.model.Teacher;
import com.department.repository.TeacherPerformanceRepository;
import com.department.repository.TeacherRepository;
import com.department.service.TeacherPerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherPerformanceServiceImpl implements TeacherPerformanceService {

    @Autowired
    private TeacherPerformanceRepository performanceRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    public TeacherPerformance calculatePerformance(Long teacherId) {
        Optional<Teacher> teacher = teacherRepository.findById(teacherId);
        if (teacher.isEmpty()) {
            return null;
        }
        
        Optional<TeacherPerformance> existing = performanceRepository.findByTeacherId(teacherId);
        TeacherPerformance performance = existing.orElseGet(TeacherPerformance::new);
        
        performance.setTeacher(teacher.get());
        
        // Calculate performance rating based on metrics
        Integer totalGraded = performance.getTotalSubmissionsGraded() != null ? performance.getTotalSubmissionsGraded() : 0;
        Integer avgGradingTime = performance.getAvgGradingTime() != null ? performance.getAvgGradingTime() : 0;
        
        // Rating formula: based on grading speed and number of submissions graded
        double rating = Math.min(5.0, (totalGraded / 100.0) * 5.0 - (avgGradingTime / 24.0));
        performance.setPerformanceRating(new BigDecimal(Math.max(0, rating)));
        
        return performanceRepository.save(performance);
    }

    @Override
    public Optional<TeacherPerformance> getPerformance(Long teacherId) {
        return performanceRepository.findByTeacherId(teacherId);
    }

    @Override
    public List<TeacherPerformance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    @Override
    public List<TeacherPerformance> getTopPerformers() {
        return performanceRepository.findAllByOrderByPerformanceRatingDesc();
    }

    @Override
    public TeacherPerformance updatePerformance(Long teacherId, TeacherPerformance performance) {
        Optional<Teacher> teacher = teacherRepository.findById(teacherId);
        if (teacher.isPresent()) {
            performance.setTeacher(teacher.get());
        }
        return performanceRepository.save(performance);
    }

    @Override
    public void deletePerformance(Long teacherId) {
        Optional<TeacherPerformance> performance = performanceRepository.findByTeacherId(teacherId);
        performance.ifPresent(p -> performanceRepository.delete(p));
    }

    @Override
    public void recalculateAllPerformances() {
        List<TeacherPerformance> allPerformances = getAllPerformances();
        for (TeacherPerformance performance : allPerformances) {
            if (performance.getTeacher() != null) {
                calculatePerformance(performance.getTeacher().getId());
            }
        }
    }

    @Override
    public void incrementClassesTaught(Long teacherId) {
        Optional<TeacherPerformance> performance = getPerformance(teacherId);
        if (performance.isPresent()) {
            TeacherPerformance p = performance.get();
            p.setTotalClasses((p.getTotalClasses() != null ? p.getTotalClasses() : 0) + 1);
            performanceRepository.save(p);
        }
    }

    @Override
    public void incrementSubmissionsGraded(Long teacherId) {
        Optional<TeacherPerformance> performance = getPerformance(teacherId);
        if (performance.isPresent()) {
            TeacherPerformance p = performance.get();
            p.setTotalSubmissionsGraded((p.getTotalSubmissionsGraded() != null ? p.getTotalSubmissionsGraded() : 0) + 1);
            performanceRepository.save(p);
        }
    }
}

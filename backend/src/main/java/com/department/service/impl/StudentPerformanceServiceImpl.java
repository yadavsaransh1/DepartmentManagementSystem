package com.department.service.impl;

import com.department.model.StudentPerformance;
import com.department.model.Marks;
import com.department.model.Student;
import com.department.repository.StudentPerformanceRepository;
import com.department.repository.MarksRepository;
import com.department.repository.StudentRepository;
import com.department.service.StudentPerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class StudentPerformanceServiceImpl implements StudentPerformanceService {

    @Autowired
    private StudentPerformanceRepository performanceRepository;

    @Autowired
    private MarksRepository marksRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    @Override
    public StudentPerformance calculatePerformance(Long studentId) {
        Optional<Student> student = studentRepository.findById(studentId);
        if (student.isEmpty()) {
            return null;
        }
        
        Optional<StudentPerformance> existing = performanceRepository.findByStudentId(studentId);
        StudentPerformance performance = existing.orElseGet(StudentPerformance::new);
        
        performance.setStudent(student.get());
        double gpaValue = calculateOverallGPA(studentId);
        performance.setOverallGpa(new BigDecimal(gpaValue));
        
        // Determine performance level based on GPA
        if (gpaValue > 0) {
            if (gpaValue >= 3.7) {
                performance.setPerformanceLevel(StudentPerformance.PerformanceLevel.EXCELLENT);
            } else if (gpaValue >= 3.0) {
                performance.setPerformanceLevel(StudentPerformance.PerformanceLevel.GOOD);
            } else if (gpaValue >= 2.0) {
                performance.setPerformanceLevel(StudentPerformance.PerformanceLevel.SATISFACTORY);
            } else {
                performance.setPerformanceLevel(StudentPerformance.PerformanceLevel.NEEDS_IMPROVEMENT);
            }
        }
        
        return performanceRepository.save(performance);
    }

    @Override
    public Optional<StudentPerformance> getPerformance(Long studentId) {
        return performanceRepository.findByStudentId(studentId);
    }

    @Override
    public List<StudentPerformance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    @Override
    public List<StudentPerformance> getPerformancesByLevel(StudentPerformance.PerformanceLevel level) {
        return performanceRepository.findByPerformanceLevel(level);
    }

    @Override
    public List<StudentPerformance> getTopPerformers() {
        return performanceRepository.findAllByOrderByOverallGpaDesc();
    }

    @Override
    public StudentPerformance updatePerformance(Long studentId, StudentPerformance performance) {
        Optional<Student> student = studentRepository.findById(studentId);
        if (student.isPresent()) {
            performance.setStudent(student.get());
        }
        return performanceRepository.save(performance);
    }

    @Override
    public void deletePerformance(Long studentId) {
        Optional<StudentPerformance> performance = performanceRepository.findByStudentId(studentId);
        performance.ifPresent(p -> performanceRepository.delete(p));
    }

    @Override
    public void recalculateAllPerformances() {
        List<StudentPerformance> allPerformances = getAllPerformances();
        for (StudentPerformance performance : allPerformances) {
            if (performance.getStudent() != null) {
                calculatePerformance(performance.getStudent().getId());
            }
        }
    }

    @Override
    public double calculateOverallGPA(Long studentId) {
        List<Marks> studentMarks = marksRepository.findByStudentId(studentId);
        if (studentMarks.isEmpty()) {
            return 0.0;
        }

        BigDecimal totalPercentage = BigDecimal.ZERO;
        for (Marks mark : studentMarks) {
            if (mark.getPercentage() != null) {
                totalPercentage = totalPercentage.add(mark.getPercentage());
            }
        }
        return totalPercentage.divide(BigDecimal.valueOf(studentMarks.size()), 2, java.math.RoundingMode.HALF_UP).doubleValue();
    }
}


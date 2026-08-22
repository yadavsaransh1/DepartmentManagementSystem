package com.department.controller;

import com.department.model.StudentPerformance;
import com.department.service.StudentPerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/performance/student")
public class StudentPerformanceController {

    @Autowired
    private StudentPerformanceService performanceService;

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentPerformance> getPerformance(@PathVariable Long studentId) {
        Optional<StudentPerformance> performance = performanceService.getPerformance(studentId);
        return performance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<StudentPerformance>> getAllPerformances() {
        List<StudentPerformance> performances = performanceService.getAllPerformances();
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/level/{level}")
    public ResponseEntity<List<StudentPerformance>> getPerformancesByLevel(@PathVariable String level) {
        StudentPerformance.PerformanceLevel perfLevel = StudentPerformance.PerformanceLevel.valueOf(level);
        List<StudentPerformance> performances = performanceService.getPerformancesByLevel(perfLevel);
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/top-performers")
    public ResponseEntity<List<StudentPerformance>> getTopPerformers() {
        List<StudentPerformance> performances = performanceService.getTopPerformers();
        return ResponseEntity.ok(performances);
    }

    @PostMapping("/{studentId}/calculate")
    public ResponseEntity<StudentPerformance> calculatePerformance(@PathVariable Long studentId) {
        StudentPerformance performance = performanceService.calculatePerformance(studentId);
        return new ResponseEntity<>(performance, HttpStatus.CREATED);
    }

    @GetMapping("/{studentId}/gpa")
    public ResponseEntity<Double> getGPA(@PathVariable Long studentId) {
        double gpa = performanceService.calculateOverallGPA(studentId);
        return ResponseEntity.ok(gpa);
    }

    @PostMapping("/recalculate-all")
    public ResponseEntity<Void> recalculateAllPerformances() {
        performanceService.recalculateAllPerformances();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deletePerformance(@PathVariable Long studentId) {
        performanceService.deletePerformance(studentId);
        return ResponseEntity.noContent().build();
    }
}

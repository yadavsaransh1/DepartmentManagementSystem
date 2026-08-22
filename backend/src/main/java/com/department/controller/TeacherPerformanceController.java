package com.department.controller;

import com.department.model.TeacherPerformance;
import com.department.service.TeacherPerformanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/performance/teacher")
public class TeacherPerformanceController {

    @Autowired
    private TeacherPerformanceService performanceService;

    @GetMapping("/{teacherId}")
    public ResponseEntity<TeacherPerformance> getPerformance(@PathVariable Long teacherId) {
        Optional<TeacherPerformance> performance = performanceService.getPerformance(teacherId);
        return performance.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<TeacherPerformance>> getAllPerformances() {
        List<TeacherPerformance> performances = performanceService.getAllPerformances();
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/top-performers")
    public ResponseEntity<List<TeacherPerformance>> getTopPerformers() {
        List<TeacherPerformance> performances = performanceService.getTopPerformers();
        return ResponseEntity.ok(performances);
    }

    @PostMapping("/{teacherId}/calculate")
    public ResponseEntity<TeacherPerformance> calculatePerformance(@PathVariable Long teacherId) {
        TeacherPerformance performance = performanceService.calculatePerformance(teacherId);
        return new ResponseEntity<>(performance, HttpStatus.CREATED);
    }

    @PostMapping("/{teacherId}/increment-classes")
    public ResponseEntity<Void> incrementClassesTaught(@PathVariable Long teacherId) {
        performanceService.incrementClassesTaught(teacherId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{teacherId}/increment-submissions")
    public ResponseEntity<Void> incrementSubmissionsGraded(@PathVariable Long teacherId) {
        performanceService.incrementSubmissionsGraded(teacherId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recalculate-all")
    public ResponseEntity<Void> recalculateAllPerformances() {
        performanceService.recalculateAllPerformances();
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{teacherId}")
    public ResponseEntity<Void> deletePerformance(@PathVariable Long teacherId) {
        performanceService.deletePerformance(teacherId);
        return ResponseEntity.noContent().build();
    }
}

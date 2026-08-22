package com.department.controller;

import com.department.model.Report;
import com.department.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/attendance")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Report> generateAttendanceReport(
            @RequestParam Long studentId,
            @RequestParam Long subjectId,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reportService.generateAttendanceReport(studentId, subjectId, authentication.getName()));
    }

    @PostMapping("/student")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Report> generateStudentReport(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reportService.generateStudentReport(authentication.getName()));
    }

    @GetMapping("/type/{reportType}")
    public ResponseEntity<List<Report>> getReportsByType(@PathVariable Report.ReportType reportType) {
        return ResponseEntity.ok(reportService.getReportsByType(reportType));
    }

    @GetMapping("/my-reports")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Report>> getMyReports(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(reportService.getReportsByUser(authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Report>> getStudentReports(@PathVariable Long studentId) {
        return ResponseEntity.ok(reportService.getStudentReports(studentId));
    }
}


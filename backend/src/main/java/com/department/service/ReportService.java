package com.department.service;

import com.department.model.Report;
import com.department.model.User;
import com.department.repository.ReportRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceService attendanceService;

    public Report generateAttendanceReport(Long studentId, Long subjectId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = new Report();
        report.setReportCode(generateReportCode());
        report.setReportName("Attendance Report - Student " + studentId);
        report.setReportType(Report.ReportType.ATTENDANCE);
        report.setGeneratedBy(user);
        report.setGeneratedDate(LocalDateTime.now());
        report.setIsAutomated(false);

        // Generate report data
        Float percentage = attendanceService.getAttendancePercentage(studentId, subjectId);
        report.setReportData("Attendance Percentage: " + percentage + "%");

        return reportRepository.save(report);
    }

    public Report generateStudentReport(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Report report = new Report();
        report.setReportCode(generateReportCode());
        report.setReportName("Student Report - " + user.getFullName());
        report.setReportType(Report.ReportType.STUDENT);
        report.setGeneratedBy(user);
        report.setGeneratedDate(LocalDateTime.now());
        report.setIsAutomated(false);

        return reportRepository.save(report);
    }

    public List<Report> getReportsByType(Report.ReportType reportType) {
        return reportRepository.findByReportType(reportType);
    }

    public List<Report> getReportsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return reportRepository.findByGeneratedByEmail(user.getEmail());
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getStudentReports(Long studentId) {
        return reportRepository.findAll().stream()
                .filter(r -> r.getReportData() != null && r.getReportData().contains("Student " + studentId))
                .collect(java.util.stream.Collectors.toList());
    }

    private String generateReportCode() {
        return "RPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}

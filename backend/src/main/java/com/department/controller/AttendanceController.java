package com.department.controller;

import com.department.dto.AttendanceDTO;
import com.department.model.AttendanceSettings;
import com.department.service.AttendanceService;
import com.department.service.AttendanceExportService;
import com.department.service.AttendanceSettingsService;
import com.department.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceExportService attendanceExportService;

    @Autowired
    private AttendanceSettingsService attendanceSettingsService;

    @Autowired
    private ProgramRepository programRepository;

    @PostMapping("/mark")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canEditAttendance()")
    public ResponseEntity<AttendanceDTO> markAttendance(@RequestBody AttendanceDTO dto) {
        return ResponseEntity.ok(attendanceService.markAttendance(dto));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canEditAttendance()")
    public ResponseEntity<Map<String, Object>> markBulkAttendance(@RequestBody List<AttendanceDTO> dtoList) {
        int count = 0;
        for (AttendanceDTO dto : dtoList) {
            attendanceService.markAttendance(dto);
            count++;
        }
        return ResponseEntity.ok(Map.of("message", "Bulk attendance marked successfully", "count", count));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewAttendance()")
    public ResponseEntity<List<AttendanceDTO>> getAttendances(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ResponseEntity.ok(attendanceService.getStudentAllAttendance(studentId));
        }
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    // Student can view their own attendance (called with ?studentId=X)
    @GetMapping("/my-records")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendanceDTO>> getMyAttendanceRecords(@RequestParam(required = false) Long studentId) {
        if (studentId != null) {
            return ResponseEntity.ok(attendanceService.getStudentAllAttendance(studentId));
        }
        // If no studentId provided, return empty list (frontend should provide it)
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewAttendance()")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendance(
            @PathVariable Long studentId,
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, subjectId));
    }

    @GetMapping("/percentage")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewAttendance()")
    public ResponseEntity<Float> getAttendancePercentage(
            @RequestParam Long studentId,
            @RequestParam Long subjectId) {
        return ResponseEntity.ok(attendanceService.getAttendancePercentage(studentId, subjectId));
    }

    @GetMapping("/teacher/{teacherId}/subject/{subjectId}")
    @PreAuthorize("hasRole('ADMIN') or @teacherAuthorizationService.canViewAttendance()")
    public ResponseEntity<List<AttendanceDTO>> getTeacherRecords(
            @PathVariable Long teacherId,
            @PathVariable Long subjectId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getTeacherAttendanceRecords(teacherId, subjectId, startDate, endDate));
    }

    @GetMapping("/stats/subject/{subjectId}")
    public ResponseEntity<Map<String, Integer>> getSubjectStatistics(@PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getSubjectAttendanceStats(subjectId));
    }

    @GetMapping("/debug/total-count")
    public ResponseEntity<Map<String, Object>> debugAttendanceCount() {
        List<AttendanceDTO> allRecords = attendanceService.getAllAttendance();
        return ResponseEntity.ok(Map.of(
            "totalAttendanceRecords", allRecords.size(),
            "recordsFound", allRecords.isEmpty() ? "No records" : "Records exist"
        ));
    }

    @GetMapping("/student/{studentId}/stats/subject/{subjectId}")
    public ResponseEntity<Map<String, Integer>> getStudentSubjectStats(
            @PathVariable Long studentId,
            @PathVariable Long subjectId) {
        return ResponseEntity.ok(attendanceService.getStudentSubjectAttendanceStats(studentId, subjectId));
    }

    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<Map<String, Object>> getStudentOverallStats(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentOverallAttendanceStats(studentId));
    }

    // Date-based filtering endpoints
    @GetMapping("/student/{studentId}/date-range")
    public ResponseEntity<List<AttendanceDTO>> getStudentAttendanceByDateRange(
            @PathVariable Long studentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceByDateRange(studentId, startDate, endDate));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}/date-range")
    public ResponseEntity<List<AttendanceDTO>> getStudentSubjectAttendanceByDateRange(
            @PathVariable Long studentId,
            @PathVariable Long subjectId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentSubjectAttendanceByDateRange(studentId, subjectId, startDate, endDate));
    }

    @GetMapping("/percentage/date-range")
    public ResponseEntity<Float> getAttendancePercentageByDateRange(
            @RequestParam Long studentId,
            @RequestParam Long subjectId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendancePercentageByDateRange(studentId, subjectId, startDate, endDate));
    }

    @GetMapping("/subject/{subjectId}/date-range")
    public ResponseEntity<Map<String, Integer>> getSubjectStatisticsByDateRange(
            @PathVariable Long subjectId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getSubjectAttendanceStatsByDateRange(subjectId, startDate, endDate));
    }

    @GetMapping("/export")
    public ResponseEntity<List<Map<String, Object>>> exportAttendance(
            @RequestParam String program,
            @RequestParam Integer semester,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.exportAttendanceByProgramAndSemester(program, semester, startDate, endDate));
    }

    /* ===== PDF/Excel Export Endpoints ===== */

    /**
     * Export attendance report as PDF or Excel
     * @param program Program name
     * @param semester Semester number
     * @param format "pdf" or "excel"
     * @param nqCriteria NQ Criteria percentage (default: 75)
     * @param attendanceMarks Marks for attendance (default: 5)
     * @param startDate Optional start date for filtering
     * @param endDate Optional end date for filtering
     */
    @GetMapping("/export-report")
    public ResponseEntity<byte[]> exportAttendanceReport(
            @RequestParam String program,
            @RequestParam Integer semester,
            @RequestParam(defaultValue = "excel") String format,
            @RequestParam(defaultValue = "75") Float nqCriteria,
            @RequestParam(defaultValue = "5") Float attendanceMarks,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        
        try {
            byte[] fileContent;
            String fileName;
            String mediaType;
            
            if ("pdf".equalsIgnoreCase(format)) {
                fileContent = attendanceExportService.exportAttendanceAsPDF(program, semester, nqCriteria, attendanceMarks, startDate, endDate);
                fileName = "Attendance_" + program + "_Sem" + semester + ".pdf";
                mediaType = MediaType.APPLICATION_PDF_VALUE;
            } else {
                fileContent = attendanceExportService.exportAttendanceAsExcel(program, semester, nqCriteria, attendanceMarks, startDate, endDate);
                fileName = "Attendance_" + program + "_Sem" + semester + ".xlsx";
                mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, mediaType)
                    .body(fileContent);
                    
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Export attendance report for teacher's students by subject
     * @param teacherIdentifier Teacher ID or Email
     * @param subjectId Subject ID
     * @param format "pdf" or "excel"
     */
    @GetMapping("/teacher/{teacherIdentifier}/subject/{subjectId}/export")
    public ResponseEntity<byte[]> exportTeacherSubjectAttendance(
            @PathVariable String teacherIdentifier,
            @PathVariable Long subjectId,
            @RequestParam(defaultValue = "excel") String format) {
        
        try {
            byte[] fileContent;
            String fileName;
            String mediaType;
            
            if ("pdf".equalsIgnoreCase(format)) {
                fileContent = attendanceExportService.exportTeacherSubjectAttendanceAsPDF(teacherIdentifier, subjectId);
                fileName = "Attendance_Subject_" + subjectId + ".pdf";
                mediaType = MediaType.APPLICATION_PDF_VALUE;
            } else {
                fileContent = attendanceExportService.exportTeacherSubjectAttendanceAsExcel(teacherIdentifier, subjectId);
                fileName = "Attendance_Subject_" + subjectId + ".xlsx";
                mediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, mediaType)
                    .body(fileContent);
                    
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }

    /* ===== Attendance Settings Endpoints ===== */

    /**
     * Get current NQ criteria setting
     */
    @GetMapping("/settings")
    public ResponseEntity<AttendanceSettings> getSettings() {
        return ResponseEntity.ok(attendanceSettingsService.getSettings());
    }

    /**
     * Update NQ criteria
     */
    @PutMapping("/settings/nq-criteria")
    public ResponseEntity<AttendanceSettings> updateNqCriteria(@RequestParam Float criteria) {
        if (criteria < 0 || criteria > 100) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(attendanceSettingsService.updateNqCriteria(criteria));
    }

    /**
     * Get semester count for a program
     */
    @GetMapping("/program/{programName}/semesters")
    public ResponseEntity<Map<String, Object>> getProgramSemesters(@PathVariable String programName) {
        var program = programRepository.findByName(programName);
        if (program.isPresent()) {
            Integer semesterCount = program.get().getSemesterCount() != null ? program.get().getSemesterCount() : 8;
            return ResponseEntity.ok(Map.of(
                "program", programName,
                "semesterCount", semesterCount,
                "semesters", java.util.stream.IntStream.rangeClosed(1, semesterCount)
                    .boxed()
                    .toList()
            ));
        }
        return ResponseEntity.notFound().build();
    }
}


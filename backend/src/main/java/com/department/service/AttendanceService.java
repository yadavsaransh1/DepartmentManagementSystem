package com.department.service;

import com.department.dto.AttendanceDTO;
import com.department.model.Attendance;
import com.department.model.Student;
import com.department.model.Subject;
import com.department.model.Teacher;
import com.department.repository.AttendanceRepository;
import com.department.repository.StudentRepository;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    private static final Logger logger = Logger.getLogger(AttendanceService.class.getName());

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        Teacher teacher = subject.getTeacher();

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setSubject(subject);
        attendance.setTeacher(teacher);
        attendance.setAttendanceDate(dto.getAttendanceDate());
        attendance.setAttendanceTime(dto.getAttendanceTime());
        attendance.setStatus(Attendance.AttendanceStatus.valueOf(dto.getStatus().toUpperCase()));
        attendance.setRemarks(dto.getRemarks());

        Attendance saved = attendanceRepository.save(attendance);
        return attendanceToDTO(saved);
    }

    public List<AttendanceDTO> getStudentAttendance(Long studentId, Long subjectId) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndSubjectId(studentId, subjectId);
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getStudentAllAttendance(Long studentId) {
        List<Attendance> attendances = attendanceRepository.findByStudentId(studentId);
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAllAttendance() {
        List<Attendance> attendances = attendanceRepository.findAll();
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public Float getAttendancePercentage(Long studentId, Long subjectId) {
        long presentDays = attendanceRepository.countPresentDays(studentId, subjectId);
        long totalDays = attendanceRepository.countTotalDays(studentId, subjectId);

        if (totalDays == 0) {
            return 0.0f;
        }

        return (presentDays * 100.0f) / totalDays;
    }

    public List<AttendanceDTO> getTeacherAttendanceRecords(Long teacherId, Long subjectId, 
                                                           LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository
                .findByTeacherIdAndSubjectIdAndAttendanceDateBetween(teacherId, subjectId, startDate, endDate);
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public Map<String, Integer> getSubjectAttendanceStats(Long subjectId) {
        try {
            // Use repository query to get all attendance for subject
            List<Attendance> attendances = attendanceRepository.findBySubjectId(subjectId);
            
            logger.info("Found " + attendances.size() + " attendance records for subject " + subjectId);

            int present = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            int absent = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
            
            int total = present + absent;
            logger.info("Stats - Present: " + present + ", Absent: " + absent + ", Total: " + total);

            return Map.of(
                "present", present,
                "absent", absent,
                "total", total
            );
        } catch (Exception e) {
            logger.warning("Error fetching attendance stats for subject " + subjectId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty stats if error occurs
            return Map.of(
                "present", 0,
                "absent", 0,
                "late", 0,
                "leave", 0,
                "total", 0
            );
        }
    }

    public Map<String, Integer> getStudentSubjectAttendanceStats(Long studentId, Long subjectId) {
        try {
            List<Attendance> attendances = attendanceRepository.findByStudentIdAndSubjectId(studentId, subjectId);
            
            int present = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            int absent = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();

            int total = present + absent;
            
            return Map.of(
                "present", present,
                "absent", absent,
                "total", total
            );
        } catch (Exception e) {
            logger.warning("Error fetching student stats: " + e.getMessage());
            return Map.of("present", 0, "absent", 0, "total", 0);
        }
    }

    public Map<String, Object> getStudentOverallAttendanceStats(Long studentId) {
        try {
            List<Attendance> allAttendances = attendanceRepository.findByStudentId(studentId);
            
            int totalPresent = (int) allAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            int totalAbsent = (int) allAttendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
            int grandTotal = allAttendances.size();

            // Group by subject
            Map<String, Map<String, Integer>> subjectStats = allAttendances.stream()
                .collect(Collectors.groupingBy(
                    a -> a.getSubject().getSubjectName(),
                    Collectors.toMap(
                        a -> a.getStatus().toString(),
                        a -> 1,
                        Integer::sum
                    )
                ));

            return Map.of(
                "overall", Map.of(
                    "present", totalPresent,
                    "absent", totalAbsent,
                    "total", grandTotal
                ),
                "bySubject", subjectStats
            );
        } catch (Exception e) {
            logger.warning("Error fetching overall student stats: " + e.getMessage());
            return Map.of("overall", Map.of("present", 0, "absent", 0, "total", 0), "bySubject", Map.of());
        }
    }

    private AttendanceDTO attendanceToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getUser().getFullName());
        
        // Handle null subject gracefully
        if (attendance.getSubject() != null) {
            dto.setSubjectId(attendance.getSubject().getId());
            dto.setSubjectCode(attendance.getSubject().getSubjectCode());
            dto.setSubjectName(attendance.getSubject().getSubjectName());
        } else {
            dto.setSubjectId(null);
            dto.setSubjectCode("N/A");
            dto.setSubjectName("Unknown Subject");
        }
        
        dto.setAttendanceDate(attendance.getAttendanceDate());
        dto.setAttendanceTime(attendance.getAttendanceTime());
        dto.setStatus(attendance.getStatus().toString());
        dto.setRemarks(attendance.getRemarks());
        return dto;
    }

    // Date-based filtering methods
    public List<AttendanceDTO> getStudentAttendanceByDateRange(Long studentId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndAttendanceDateBetween(studentId, startDate, endDate);
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public List<AttendanceDTO> getStudentSubjectAttendanceByDateRange(Long studentId, Long subjectId, LocalDate startDate, LocalDate endDate) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndCourseIdAndAttendanceDateBetween(studentId, subjectId, startDate, endDate);
        return attendances.stream().map(this::attendanceToDTO).collect(Collectors.toList());
    }

    public Float getAttendancePercentageByDateRange(Long studentId, Long subjectId, LocalDate startDate, LocalDate endDate) {
        long presentDays = attendanceRepository.countPresentDaysBetween(studentId, subjectId, startDate, endDate);
        long totalDays = attendanceRepository.countTotalDaysBetween(studentId, subjectId, startDate, endDate);

        if (totalDays == 0) {
            return 0.0f;
        }

        return (presentDays * 100.0f) / totalDays;
    }

    public Map<String, Integer> getSubjectAttendanceStatsByDateRange(Long subjectId, LocalDate startDate, LocalDate endDate) {
        try {
            List<Attendance> attendances = attendanceRepository.findBySubjectIdAndAttendanceDateBetween(subjectId, startDate, endDate);

            int present = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            int absent = (int) attendances.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();


            int total = present + absent;

            return Map.of(
                "present", present,
                "absent", absent,
                "total", total
            );
        } catch (Exception e) {
            logger.warning("Error fetching attendance stats by date range: " + e.getMessage());
            return Map.of("present", 0, "absent", 0, "total", 0);
        }
    }

    // Export attendance by program and semester
    public List<Map<String, Object>> exportAttendanceByProgramAndSemester(String program, Integer semester, LocalDate startDate, LocalDate endDate) {
        try {
            // Get all students for this program and semester
            List<Student> students = studentRepository.findByProgramAndSemester(program, semester);
            
            List<Map<String, Object>> exportData = students.stream().map(student -> {
                // Get all attendance records for this student
                List<Attendance> attendances = startDate != null && endDate != null 
                    ? attendanceRepository.findByStudentIdAndAttendanceDateBetween(student.getId(), startDate, endDate)
                    : attendanceRepository.findByStudentId(student.getId());
                
                int totalClasses = attendances.size();
                int classesAttended = (int) attendances.stream()
                    .filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT)
                    .count();
                
                float attendancePercentage = totalClasses > 0 ? (classesAttended * 100.0f) / totalClasses : 0.0f;
                
                Map<String, Object> record = new HashMap<>();
                record.put("studentId", student.getStudentId());
                record.put("name", student.getUser().getFullName());
                record.put("totalClasses", totalClasses);
                record.put("classesAttended", classesAttended);
                record.put("attendancePercentage", String.format("%.2f", attendancePercentage));
                
                return record;
            }).collect(Collectors.toList());
            
            return exportData;
        } catch (Exception e) {
            logger.warning("Error exporting attendance: " + e.getMessage());
            throw new RuntimeException("Failed to export attendance data: " + e.getMessage());
        }
    }
}

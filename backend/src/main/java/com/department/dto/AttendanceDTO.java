package com.department.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class AttendanceDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long courseId;  // Changed from subjectId
    private String courseCode;  // Changed from subjectCode
    private String courseName;  // Changed from subjectName
    private LocalDate attendanceDate;
    private LocalTime attendanceTime;
    private String status;
    private String remarks;

    public AttendanceDTO() {}

    public AttendanceDTO(Long studentId, Long courseId, LocalDate attendanceDate, String status) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    
    // Backward compatibility methods
    public Long getSubjectId() { return courseId; }
    public void setSubjectId(Long subjectId) { this.courseId = subjectId; }

    public String getSubjectCode() { return courseCode; }
    public void setSubjectCode(String subjectCode) { this.courseCode = subjectCode; }

    public String getSubjectName() { return courseName; }
    public void setSubjectName(String subjectName) { this.courseName = subjectName; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public LocalTime getAttendanceTime() { return attendanceTime; }
    public void setAttendanceTime(LocalTime attendanceTime) { this.attendanceTime = attendanceTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

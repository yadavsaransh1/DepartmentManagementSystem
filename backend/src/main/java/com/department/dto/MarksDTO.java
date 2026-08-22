package com.department.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarksDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentProgram;  // Student's program
    private Integer studentSemester;  // Student's semester
    private Long courseId;  // Changed from subjectId
    private String courseName;  // Changed from subjectName
    private Long teacherId;
    private String teacherName;
    private String examType;
    private BigDecimal marks;
    private Integer totalMarks;
    private BigDecimal percentage;
    private String grade;
    private String comments;
    
    // New fields for marks breakdown
    private Integer semesterMarks;
    private Integer sessionalMarks;
    private Integer assignmentMarks;
    private Integer obtainedSemesterMarks;
    private Integer obtainedSessionalMarks;
    private Integer obtainedAssignmentMarks;
    private Integer totalObtainedMarks;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public MarksDTO() {}

    public MarksDTO(Long id, Long studentId, String studentName, Long courseId, String courseName,
                    String examType, BigDecimal marks, Integer totalMarks, BigDecimal percentage, String grade) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.courseId = courseId;
        this.courseName = courseName;
        this.examType = examType;
        this.marks = marks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.grade = grade;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    
    public String getStudentProgram() { return studentProgram; }
    public void setStudentProgram(String studentProgram) { this.studentProgram = studentProgram; }
    
    public Integer getStudentSemester() { return studentSemester; }
    public void setStudentSemester(Integer studentSemester) { this.studentSemester = studentSemester; }
    
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    
    // Backward compatibility methods
    public Long getSubjectId() { return courseId; }
    public void setSubjectId(Long subjectId) { this.courseId = subjectId; }
    
    public String getSubjectName() { return courseName; }
    public void setSubjectName(String subjectName) { this.courseName = subjectName; }
    
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    
    public BigDecimal getMarks() { return marks; }
    public void setMarks(BigDecimal marks) { this.marks = marks; }
    
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    
    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public Integer getSemesterMarks() { return semesterMarks; }
    public void setSemesterMarks(Integer semesterMarks) { this.semesterMarks = semesterMarks; }
    
    public Integer getSessionalMarks() { return sessionalMarks; }
    public void setSessionalMarks(Integer sessionalMarks) { this.sessionalMarks = sessionalMarks; }
    
    public Integer getAssignmentMarks() { return assignmentMarks; }
    public void setAssignmentMarks(Integer assignmentMarks) { this.assignmentMarks = assignmentMarks; }
    
    public Integer getObtainedSemesterMarks() { return obtainedSemesterMarks; }
    public void setObtainedSemesterMarks(Integer obtainedSemesterMarks) { this.obtainedSemesterMarks = obtainedSemesterMarks; }
    
    public Integer getObtainedSessionalMarks() { return obtainedSessionalMarks; }
    public void setObtainedSessionalMarks(Integer obtainedSessionalMarks) { this.obtainedSessionalMarks = obtainedSessionalMarks; }
    
    public Integer getObtainedAssignmentMarks() { return obtainedAssignmentMarks; }
    public void setObtainedAssignmentMarks(Integer obtainedAssignmentMarks) { this.obtainedAssignmentMarks = obtainedAssignmentMarks; }
    
    public Integer getTotalObtainedMarks() { return totalObtainedMarks; }
    public void setTotalObtainedMarks(Integer totalObtainedMarks) { this.totalObtainedMarks = totalObtainedMarks; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

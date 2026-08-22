package com.department.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MarksViewDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentProgram;  // Student's program
    private Integer studentSemester;  // Student's semester
    private Long courseId;
    private String courseName;
    private String examType;
    private String examTypeDescription;  // Store the user-entered exam type text
    private BigDecimal marks;
    private Integer totalMarks;
    private BigDecimal percentage;
    private String grade;
    private BigDecimal sessionalMarks;
    private BigDecimal assignmentMarks;
    private BigDecimal obtainedSessionalMarks;
    private BigDecimal obtainedAssignmentMarks;
    private String comments;
    private String markType;
    private LocalDateTime createdAt;

    public MarksViewDTO() {}

    public MarksViewDTO(Long id, Long studentId, String studentName, Long courseId, String courseName,
                        String examType, String examTypeDescription, BigDecimal marks, Integer totalMarks, BigDecimal percentage, 
                        String grade, BigDecimal sessionalMarks, BigDecimal assignmentMarks,
                        BigDecimal obtainedSessionalMarks, BigDecimal obtainedAssignmentMarks,
                        String comments, String markType, LocalDateTime createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.courseId = courseId;
        this.courseName = courseName;
        this.examType = examType;
        this.examTypeDescription = examTypeDescription;
        this.marks = marks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.grade = grade;
        this.sessionalMarks = sessionalMarks;
        this.assignmentMarks = assignmentMarks;
        this.obtainedSessionalMarks = obtainedSessionalMarks;
        this.obtainedAssignmentMarks = obtainedAssignmentMarks;
        this.comments = comments;
        this.markType = markType;
        this.createdAt = createdAt;
    }

    // Constructor with program and semester
    public MarksViewDTO(Long id, Long studentId, String studentName, String studentProgram, Integer studentSemester,
                        Long courseId, String courseName, String examType, String examTypeDescription, BigDecimal marks, 
                        Integer totalMarks, BigDecimal percentage, String grade, BigDecimal sessionalMarks, 
                        BigDecimal assignmentMarks, BigDecimal obtainedSessionalMarks, BigDecimal obtainedAssignmentMarks,
                        String comments, String markType, LocalDateTime createdAt) {
        this.id = id;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentProgram = studentProgram;
        this.studentSemester = studentSemester;
        this.courseId = courseId;
        this.courseName = courseName;
        this.examType = examType;
        this.examTypeDescription = examTypeDescription;
        this.marks = marks;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.grade = grade;
        this.sessionalMarks = sessionalMarks;
        this.assignmentMarks = assignmentMarks;
        this.obtainedSessionalMarks = obtainedSessionalMarks;
        this.obtainedAssignmentMarks = obtainedAssignmentMarks;
        this.comments = comments;
        this.markType = markType;
        this.createdAt = createdAt;
    }

    // Getters
    public Long getId() { return id; }
    public Long getStudentId() { return studentId; }
    public String getStudentName() { return studentName; }
    public String getStudentProgram() { return studentProgram; }
    public Integer getStudentSemester() { return studentSemester; }
    public Long getCourseId() { return courseId; }
    public String getCourseName() { return courseName; }
    public String getExamType() { return examType; }
    public String getExamTypeDescription() { return examTypeDescription; }
    public BigDecimal getMarks() { return marks; }
    public Integer getTotalMarks() { return totalMarks; }
    public BigDecimal getPercentage() { return percentage; }
    public String getGrade() { return grade; }
    public BigDecimal getSessionalMarks() { return sessionalMarks; }
    public BigDecimal getAssignmentMarks() { return assignmentMarks; }
    public BigDecimal getObtainedSessionalMarks() { return obtainedSessionalMarks; }
    public BigDecimal getObtainedAssignmentMarks() { return obtainedAssignmentMarks; }
    public String getComments() { return comments; }
    public String getMarkType() { return markType; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public void setStudentProgram(String studentProgram) { this.studentProgram = studentProgram; }
    public void setStudentSemester(Integer studentSemester) { this.studentSemester = studentSemester; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public void setExamType(String examType) { this.examType = examType; }
    public void setExamTypeDescription(String examTypeDescription) { this.examTypeDescription = examTypeDescription; }
    public void setMarks(BigDecimal marks) { this.marks = marks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    public void setGrade(String grade) { this.grade = grade; }
    public void setSessionalMarks(BigDecimal sessionalMarks) { this.sessionalMarks = sessionalMarks; }
    public void setAssignmentMarks(BigDecimal assignmentMarks) { this.assignmentMarks = assignmentMarks; }
    public void setObtainedSessionalMarks(BigDecimal obtainedSessionalMarks) { this.obtainedSessionalMarks = obtainedSessionalMarks; }
    public void setObtainedAssignmentMarks(BigDecimal obtainedAssignmentMarks) { this.obtainedAssignmentMarks = obtainedAssignmentMarks; }
    public void setComments(String comments) { this.comments = comments; }
    public void setMarkType(String markType) { this.markType = markType; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

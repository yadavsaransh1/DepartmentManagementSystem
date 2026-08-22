package com.department.dto;

import java.math.BigDecimal;

public class TeacherMarksSubmissionDTO {
    private Long studentId;
    private Long courseId;  // Subject/Course ID
    private String examType;
    private BigDecimal sessionalMarks;
    private BigDecimal assignmentMarks;
    private BigDecimal obtainedSessionalMarks;
    private BigDecimal obtainedAssignmentMarks;
    private String comments;
    private String markType;
    private String grade;      // User-entered grade
    private String status;     // Pass/Fail status

    // Constructors
    public TeacherMarksSubmissionDTO() {}

    public TeacherMarksSubmissionDTO(Long studentId, Long courseId, String examType,
                                    BigDecimal sessionalMarks, BigDecimal assignmentMarks,
                                    BigDecimal obtainedSessionalMarks, BigDecimal obtainedAssignmentMarks,
                                    String comments) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.examType = examType;
        this.sessionalMarks = sessionalMarks;
        this.assignmentMarks = assignmentMarks;
        this.obtainedSessionalMarks = obtainedSessionalMarks;
        this.obtainedAssignmentMarks = obtainedAssignmentMarks;
        this.comments = comments;
        this.markType = "TEACHER";
    }

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

    public BigDecimal getSessionalMarks() { return sessionalMarks; }
    public void setSessionalMarks(BigDecimal sessionalMarks) { this.sessionalMarks = sessionalMarks; }

    public BigDecimal getAssignmentMarks() { return assignmentMarks; }
    public void setAssignmentMarks(BigDecimal assignmentMarks) { this.assignmentMarks = assignmentMarks; }

    public BigDecimal getObtainedSessionalMarks() { return obtainedSessionalMarks; }
    public void setObtainedSessionalMarks(BigDecimal obtainedSessionalMarks) { this.obtainedSessionalMarks = obtainedSessionalMarks; }

    public BigDecimal getObtainedAssignmentMarks() { return obtainedAssignmentMarks; }
    public void setObtainedAssignmentMarks(BigDecimal obtainedAssignmentMarks) { this.obtainedAssignmentMarks = obtainedAssignmentMarks; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getMarkType() { return markType; }
    public void setMarkType(String markType) { this.markType = markType; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

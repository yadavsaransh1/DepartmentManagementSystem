package com.department.dto;

import java.math.BigDecimal;

public class UpdateMarksRequestDTO {
    private Long studentId;
    private Long programId;
    private Long courseId;  // Changed from subjectId
    private Long teacherId;
    private BigDecimal semesterMarks;
    private BigDecimal sessionalMarks;
    private BigDecimal assignmentMarks;
    private BigDecimal obtainedSemesterMarks;
    private BigDecimal obtainedSessionalMarks;
    private BigDecimal obtainedAssignmentMarks;
    private String semesterName;
    private String passingStatus;
    private String comments;
    private String markType;
    private String grade;
    private String examType;
    private BigDecimal obtainedMarks;
    private Integer totalMarks;

    // Constructors
    public UpdateMarksRequestDTO() {}

    // Getters and Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getProgramId() {
        return programId;
    }

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
    
    // Backward compatibility
    public Long getSubjectId() {
        return courseId;
    }

    public void setSubjectId(Long subjectId) {
        this.courseId = subjectId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public BigDecimal getSemesterMarks() {
        return semesterMarks;
    }

    public void setSemesterMarks(BigDecimal semesterMarks) {
        this.semesterMarks = semesterMarks;
    }

    public BigDecimal getSessionalMarks() {
        return sessionalMarks;
    }

    public void setSessionalMarks(BigDecimal sessionalMarks) {
        this.sessionalMarks = sessionalMarks;
    }

    public BigDecimal getAssignmentMarks() {
        return assignmentMarks;
    }

    public void setAssignmentMarks(BigDecimal assignmentMarks) {
        this.assignmentMarks = assignmentMarks;
    }

    public BigDecimal getObtainedSemesterMarks() {
        return obtainedSemesterMarks;
    }

    public void setObtainedSemesterMarks(BigDecimal obtainedSemesterMarks) {
        this.obtainedSemesterMarks = obtainedSemesterMarks;
    }

    public BigDecimal getObtainedSessionalMarks() {
        return obtainedSessionalMarks;
    }

    public void setObtainedSessionalMarks(BigDecimal obtainedSessionalMarks) {
        this.obtainedSessionalMarks = obtainedSessionalMarks;
    }

    public BigDecimal getObtainedAssignmentMarks() {
        return obtainedAssignmentMarks;
    }

    public void setObtainedAssignmentMarks(BigDecimal obtainedAssignmentMarks) {
        this.obtainedAssignmentMarks = obtainedAssignmentMarks;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getPassingStatus() {
        return passingStatus;
    }

    public void setPassingStatus(String passingStatus) {
        this.passingStatus = passingStatus;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getMarkType() {
        return markType;
    }

    public void setMarkType(String markType) {
        this.markType = markType;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public BigDecimal getObtainedMarks() {
        return obtainedMarks;
    }

    public void setObtainedMarks(BigDecimal obtainedMarks) {
        this.obtainedMarks = obtainedMarks;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
}

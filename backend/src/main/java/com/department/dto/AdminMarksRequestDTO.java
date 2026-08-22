package com.department.dto;

import java.math.BigDecimal;

public class AdminMarksRequestDTO {
    private Long studentId;
    private Long programId;
    private Long courseId;  // Subject/Course
    private String semesterName;
    private BigDecimal semesterMarks;
    private BigDecimal obtainedSemesterMarks;
    private Integer totalMarks;  // Total marks for this subject
    private String examType;  // Exam type description (e.g., Semester 2, Midterm)
    private String grade;  // Grade entered by admin
    private String passingStatus;
    private String comments;
    private String markType;

    // Constructors
    public AdminMarksRequestDTO() {}

    public AdminMarksRequestDTO(Long studentId, Long programId, Long courseId, String semesterName,
                               BigDecimal semesterMarks, BigDecimal obtainedSemesterMarks,
                               Integer totalMarks, String examType, String grade,
                               String passingStatus, String comments, String markType) {
        this.studentId = studentId;
        this.programId = programId;
        this.courseId = courseId;
        this.semesterName = semesterName;
        this.semesterMarks = semesterMarks;
        this.obtainedSemesterMarks = obtainedSemesterMarks;
        this.totalMarks = totalMarks;
        this.examType = examType;
        this.grade = grade;
        this.passingStatus = passingStatus;
        this.comments = comments;
        this.markType = markType;
    }

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

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public BigDecimal getSemesterMarks() {
        return semesterMarks;
    }

    public void setSemesterMarks(BigDecimal semesterMarks) {
        this.semesterMarks = semesterMarks;
    }

    public BigDecimal getObtainedSemesterMarks() {
        return obtainedSemesterMarks;
    }

    public void setObtainedSemesterMarks(BigDecimal obtainedSemesterMarks) {
        this.obtainedSemesterMarks = obtainedSemesterMarks;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
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
}

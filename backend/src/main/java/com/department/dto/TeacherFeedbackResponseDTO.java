package com.department.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TeacherFeedbackResponseDTO {
    private Long id;
    private String studentName;
    private String teacherName;
    private String subjectName;
    private String program;
    private Integer semester;
    private Integer teachingQuality;
    private Integer communication;
    private Integer availability;
    private Integer courseContent;
    private BigDecimal overallRating;
    private String comments;
    private String positiveAspects;
    private String areasForImprovement;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;

    public TeacherFeedbackResponseDTO() {}

    public TeacherFeedbackResponseDTO(Long id, String studentName, String teacherName, String subjectName, 
                                     String program, Integer semester, Integer teachingQuality, 
                                     Integer communication, Integer availability, Integer courseContent,
                                     BigDecimal overallRating, String comments, String positiveAspects,
                                     String areasForImprovement, Boolean isAnonymous, LocalDateTime createdAt) {
        this.id = id;
        this.studentName = studentName;
        this.teacherName = teacherName;
        this.subjectName = subjectName;
        this.program = program;
        this.semester = semester;
        this.teachingQuality = teachingQuality;
        this.communication = communication;
        this.availability = availability;
        this.courseContent = courseContent;
        this.overallRating = overallRating;
        this.comments = comments;
        this.positiveAspects = positiveAspects;
        this.areasForImprovement = areasForImprovement;
        this.isAnonymous = isAnonymous;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getTeachingQuality() { return teachingQuality; }
    public void setTeachingQuality(Integer teachingQuality) { this.teachingQuality = teachingQuality; }

    public Integer getCommunication() { return communication; }
    public void setCommunication(Integer communication) { this.communication = communication; }

    public Integer getAvailability() { return availability; }
    public void setAvailability(Integer availability) { this.availability = availability; }

    public Integer getCourseContent() { return courseContent; }
    public void setCourseContent(Integer courseContent) { this.courseContent = courseContent; }

    public BigDecimal getOverallRating() { return overallRating; }
    public void setOverallRating(BigDecimal overallRating) { this.overallRating = overallRating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getPositiveAspects() { return positiveAspects; }
    public void setPositiveAspects(String positiveAspects) { this.positiveAspects = positiveAspects; }

    public String getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

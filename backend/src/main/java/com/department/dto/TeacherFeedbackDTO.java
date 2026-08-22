package com.department.dto;

public class TeacherFeedbackDTO {
    private Long studentId;
    private Long teacherId;
    private Long courseId;  // Changed from subjectId
    private String program;
    private Integer semester;
    private Integer teachingQuality;
    private Integer communication;
    private Integer availability;
    private Integer courseContent;
    private Integer overallRating;
    private String comments;
    private String positiveAspects;
    private String areasForImprovement;
    private Boolean isAnonymous;

    public TeacherFeedbackDTO() {}

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    
    // Backward compatibility
    public Long getSubjectId() { return courseId; }
    public void setSubjectId(Long subjectId) { this.courseId = subjectId; }

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

    public Integer getOverallRating() { return overallRating; }
    public void setOverallRating(Integer overallRating) { this.overallRating = overallRating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getPositiveAspects() { return positiveAspects; }
    public void setPositiveAspects(String positiveAspects) { this.positiveAspects = positiveAspects; }

    public String getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }
}

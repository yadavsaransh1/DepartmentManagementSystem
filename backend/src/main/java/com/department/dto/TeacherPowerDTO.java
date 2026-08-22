package com.department.dto;

public class TeacherPowerDTO {
    private Long id;
    private Long teacherId;
    private String teacherEmail;
    private String teacherName;
    private Boolean canAccessHomePage;
    private Boolean canAccessStudentDetails;
    private Boolean canAccessTeacherDetails;
    private Boolean canAccessResults;
    private Boolean canAccessStudentStatistics;
    private Boolean canAccessProject;
    private Boolean canAccessFeedback;
    private Boolean canAccessAssignment;
    private Boolean canAccessCommittee;
    private Boolean isHoD;

    // Constructors
    public TeacherPowerDTO() {
        // Initialize all boolean fields to false
        this.canAccessHomePage = false;
        this.canAccessStudentDetails = false;
        this.canAccessTeacherDetails = false;
        this.canAccessResults = false;
        this.canAccessStudentStatistics = false;
        this.canAccessProject = false;
        this.canAccessFeedback = false;
        this.canAccessAssignment = false;
        this.canAccessCommittee = false;
        this.isHoD = false;
    }

    public TeacherPowerDTO(Long id, Long teacherId, String teacherEmail, String teacherName, 
                          Boolean canAccessHomePage, Boolean canAccessStudentDetails, Boolean canAccessTeacherDetails,
                          Boolean canAccessResults, Boolean canAccessStudentStatistics, Boolean canAccessProject,
                          Boolean canAccessFeedback, Boolean canAccessAssignment, Boolean canAccessCommittee, Boolean isHoD) {
        this.id = id;
        this.teacherId = teacherId;
        this.teacherEmail = teacherEmail;
        this.teacherName = teacherName;
        this.canAccessHomePage = canAccessHomePage;
        this.canAccessStudentDetails = canAccessStudentDetails;
        this.canAccessTeacherDetails = canAccessTeacherDetails;
        this.canAccessResults = canAccessResults;
        this.canAccessStudentStatistics = canAccessStudentStatistics;
        this.canAccessProject = canAccessProject;
        this.canAccessFeedback = canAccessFeedback;
        this.canAccessAssignment = canAccessAssignment;
        this.canAccessCommittee = canAccessCommittee;
        this.isHoD = isHoD;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Boolean getCanAccessHomePage() { return canAccessHomePage; }
    public void setCanAccessHomePage(Boolean canAccessHomePage) { this.canAccessHomePage = canAccessHomePage; }

    public Boolean getCanAccessStudentDetails() { return canAccessStudentDetails; }
    public void setCanAccessStudentDetails(Boolean canAccessStudentDetails) { this.canAccessStudentDetails = canAccessStudentDetails; }

    public Boolean getCanAccessTeacherDetails() { return canAccessTeacherDetails; }
    public void setCanAccessTeacherDetails(Boolean canAccessTeacherDetails) { this.canAccessTeacherDetails = canAccessTeacherDetails; }

    public Boolean getCanAccessResults() { return canAccessResults; }
    public void setCanAccessResults(Boolean canAccessResults) { this.canAccessResults = canAccessResults; }

    public Boolean getCanAccessStudentStatistics() { return canAccessStudentStatistics; }
    public void setCanAccessStudentStatistics(Boolean canAccessStudentStatistics) { this.canAccessStudentStatistics = canAccessStudentStatistics; }

    public Boolean getCanAccessProject() { return canAccessProject; }
    public void setCanAccessProject(Boolean canAccessProject) { this.canAccessProject = canAccessProject; }

    public Boolean getCanAccessFeedback() { return canAccessFeedback; }
    public void setCanAccessFeedback(Boolean canAccessFeedback) { this.canAccessFeedback = canAccessFeedback; }

    public Boolean getCanAccessAssignment() { return canAccessAssignment; }
    public void setCanAccessAssignment(Boolean canAccessAssignment) { this.canAccessAssignment = canAccessAssignment; }

    public Boolean getCanAccessCommittee() { return canAccessCommittee; }
    public void setCanAccessCommittee(Boolean canAccessCommittee) { this.canAccessCommittee = canAccessCommittee; }

    public Boolean getIsHoD() { return isHoD; }
    public void setIsHoD(Boolean isHoD) { this.isHoD = isHoD; }
}

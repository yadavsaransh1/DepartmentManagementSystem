package com.department.dto;

public class SubjectDTO {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private Long teacherId;
    private String teacherName;
    private Integer semester;
    private Integer credits;
    private Long programId;
    private String programName;
    private String course;  // Alias for programName - for backward compatibility
    private String description;

    public SubjectDTO() {}

    public SubjectDTO(Long id, String subjectCode, String subjectName, Long teacherId, String teacherName, Integer semester, Integer credits, Long programId, String programName) {
        this.id = id;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.semester = semester;
        this.credits = credits;
        this.programId = programId;
        this.programName = programName;
        this.course = programName;  // Set course as alias
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { 
        this.programName = programName;
        this.course = programName;  // Keep course in sync
    }

    public String getCourse() { return course; }
    public void setCourse(String course) { 
        this.course = course;
        this.programName = course;  // Keep programName in sync
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

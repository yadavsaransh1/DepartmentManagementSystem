package com.department.dto;

import java.time.LocalDateTime;

public class SupervisorAllocationDTO {
    private Long id;
    private Long studentDbId;  // Database ID for internal operations
    private String studentId;  // Formatted student ID (e.g., 23-CSE-BCA-00-005)
    private String studentName;
    private String studentEmail;
    private String studentProgram;
    private String studentSemester;
    private String projectTitle;
    private String projectDescription;
    private Long teacherId;
    private String supervisorName;
    private String supervisorEmail;
    private String allocationType;
    private String guideName;
    private String guideDepartment;
    private String specialization;
    private LocalDateTime allocationDate;

    public SupervisorAllocationDTO() {}

    public SupervisorAllocationDTO(Long studentDbId, String studentId, String studentName, Long teacherId, String supervisorName) {
        this.studentDbId = studentDbId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.teacherId = teacherId;
        this.supervisorName = supervisorName;
        this.allocationType = "SUPERVISOR";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentDbId() { return studentDbId; }
    public void setStudentDbId(Long studentDbId) { this.studentDbId = studentDbId; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentProgram() { return studentProgram; }
    public void setStudentProgram(String studentProgram) { this.studentProgram = studentProgram; }

    public String getStudentSemester() { return studentSemester; }
    public void setStudentSemester(String studentSemester) { this.studentSemester = studentSemester; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getSupervisorName() { return supervisorName; }
    public void setSupervisorName(String supervisorName) { this.supervisorName = supervisorName; }

    public String getSupervisorEmail() { return supervisorEmail; }
    public void setSupervisorEmail(String supervisorEmail) { this.supervisorEmail = supervisorEmail; }

    public String getAllocationType() { return allocationType; }
    public void setAllocationType(String allocationType) { this.allocationType = allocationType; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public String getGuideDepartment() { return guideDepartment; }
    public void setGuideDepartment(String guideDepartment) { this.guideDepartment = guideDepartment; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public LocalDateTime getAllocationDate() { return allocationDate; }
    public void setAllocationDate(LocalDateTime allocationDate) { this.allocationDate = allocationDate; }
}

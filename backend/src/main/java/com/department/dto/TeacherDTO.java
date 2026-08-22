package com.department.dto;

public class TeacherDTO {
    private Long id;
    private Long userId;  // Added: User ID for document access control
    private String email;
    private String fullName;
    private String teacherId;
    private String department;
    private String subject;
    private String specialization;
    private String designation;
    private String dateOfBirth;
    private String contactNumber;
    private String qualification;
    private String certification;
    private String customFields;
    private Boolean isHoD;
    private String adminPowers;

    public TeacherDTO() {}

    public TeacherDTO(Long id, String email, String fullName, String teacherId) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.teacherId = teacherId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserEmail(String userEmail) { this.email = userEmail; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getCertification() { return certification; }
    public void setCertification(String certification) { this.certification = certification; }

    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }

    public Boolean getIsHoD() { return isHoD != null ? isHoD : false; }
    public void setIsHoD(Boolean isHoD) { this.isHoD = isHoD != null ? isHoD : false; }

    public String getAdminPowers() { return adminPowers; }
    public void setAdminPowers(String adminPowers) { this.adminPowers = adminPowers; }
}

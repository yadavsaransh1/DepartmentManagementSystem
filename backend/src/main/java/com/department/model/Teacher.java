package com.department.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "teachers")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)  // Join on User.email (the PK)
    private User user;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Subject> subjects = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Routine> routines = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Assignment> assignments = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Attendance> attendances = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Marks> marks = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<SupervisorAllocation> supervisorAllocations = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private java.util.List<Certificate> certificates = new java.util.ArrayList<>();

    @OneToOne(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private TeacherDetails teacherDetails;

    @Column(unique = true, nullable = true)
    private String employeeId;

    @Column(unique = true, nullable = true)
    private String teacherId;

    @Column
    private String department;

    @Column
    private String subject;

    @Column
    private String specialization;

    @Column
    private String designation;

    @Column(columnDefinition = "TEXT")
    private String subjectsHandled;

    @Column
    private String dateOfBirth;

    @Column
    private String contactNumber;

    @Column
    private String qualification;

    @Column
    private String certification;

    @Column(columnDefinition = "LONGTEXT")
    private String customFields;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isHoD = false;

    @Column(columnDefinition = "LONGTEXT")
    private String adminPowers;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Teacher() {}

    public Teacher(User user, String employeeId) {
        this.user = user;
        this.employeeId = employeeId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

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

    public String getSubjectsHandled() { return subjectsHandled; }
    public void setSubjectsHandled(String subjectsHandled) { this.subjectsHandled = subjectsHandled; }

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

    public Boolean getIsHoD() { return isHoD; }
    public void setIsHoD(Boolean isHoD) { this.isHoD = isHoD != null ? isHoD : false; }

    public String getAdminPowers() { return adminPowers; }
    public void setAdminPowers(String adminPowers) { this.adminPowers = adminPowers; }

    public TeacherDetails getTeacherDetails() { return teacherDetails; }
    public void setTeacherDetails(TeacherDetails teacherDetails) { this.teacherDetails = teacherDetails; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

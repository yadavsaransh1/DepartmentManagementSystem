package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)  // EAGER load user so it's in JSON response
    @JoinColumn(name = "user_email", referencedColumnName = "email", nullable = false)  // Join on User.email (the PK)
    private User user;

    @Column(unique = true, nullable = false)
    private String studentId;

    @Column(unique = true, nullable = true)
    private String enrollmentNumber;

    @Column
    private String contactNo;

    @Column
    private String department;

    @Column
    private String program;

    @Column
    private Integer semester;

    @Column(nullable = false)
    private Float attendancePercentage = 0.0f;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "LONGTEXT")
    private String customFields; // JSON string storing additional fields from bulk upload

    // Cascade delete relationships
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alumni> alumni;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubjectEnrollment> enrollments;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Marks> marks;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AssignmentSubmission> assignmentSubmissions;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SupervisorAllocation> supervisorAllocations;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private StudentPerformance studentPerformance;

    public Student() {}

    public Student(User user, String studentId, String enrollmentNumber) {
        this.user = user;
        this.studentId = studentId;
        this.enrollmentNumber = enrollmentNumber;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { this.contactNo = contactNo; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Float getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Float attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }

    // Transient getter for fullName - computed from user.fullName for JSON serialization
    @Transient
    public String getFullName() {
        return user != null ? user.getFullName() : null;
    }
}

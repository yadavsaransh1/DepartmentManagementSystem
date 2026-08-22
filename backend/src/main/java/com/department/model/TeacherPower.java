package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_powers")
public class TeacherPower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_email", referencedColumnName = "email", nullable = false)
    private User teacher;  // Can be HOD or regular teacher with special powers

    // Tab-based access permissions (simplified to 8 main tabs)
    @Column(nullable = false)
    private Boolean canAccessHomePage = false;

    @Column(nullable = false)
    private Boolean canAccessStudentDetails = false;

    @Column(nullable = false)
    private Boolean canAccessTeacherDetails = false;

    @Column(nullable = false)
    private Boolean canAccessResults = false;  // Marks/Results tab

    @Column(nullable = false)
    private Boolean canAccessStudentStatistics = false;

    @Column(nullable = false)
    private Boolean canAccessProject = false;

    @Column(nullable = false)
    private Boolean canAccessFeedback = false;

    @Column(nullable = false)
    private Boolean canAccessAssignment = false;

    @Column(nullable = false)
    private Boolean canAccessCommittee = false;

    @Column(nullable = false)
    private Boolean isHoD = false;  // True if this teacher is a HoD

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public TeacherPower() {}

    public TeacherPower(User teacher, Boolean isHoD) {
        this.teacher = teacher;
        this.isHoD = isHoD;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

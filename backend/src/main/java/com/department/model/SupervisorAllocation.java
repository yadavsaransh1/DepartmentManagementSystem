package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "supervisor_allocations")
public class SupervisorAllocation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = true)
    private Teacher teacher;

    @Column(nullable = false)
    private String allocationType = "SUPERVISOR"; // SUPERVISOR or GUIDE

    @Column
    private String guideName;

    @Column
    private String guideDepartment;

    @Column
    private String specialization;

    @Column(columnDefinition = "TEXT")
    private String projectTitle;

    @Column(columnDefinition = "TEXT")
    private String projectDescription;

    @Column
    private LocalDateTime allocationDate = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Cascade delete relationships
    @OneToMany(mappedBy = "allocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectMessage> projectMessages;

    @OneToMany(mappedBy = "allocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectDocument> projectDocuments;

    public SupervisorAllocation() {}

    public SupervisorAllocation(Student student, Teacher teacher) {
        this.student = student;
        this.teacher = teacher;
        this.allocationType = "SUPERVISOR";
        this.allocationDate = LocalDateTime.now();
    }

    public SupervisorAllocation(Student student, String guideName, String guideDepartment, String specialization) {
        this.student = student;
        this.guideName = guideName;
        this.guideDepartment = guideDepartment;
        this.specialization = specialization;
        this.allocationType = "GUIDE";
        this.allocationDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public String getAllocationType() { return allocationType; }
    public void setAllocationType(String allocationType) { this.allocationType = allocationType; }

    public String getGuideName() { return guideName; }
    public void setGuideName(String guideName) { this.guideName = guideName; }

    public String getGuideDepartment() { return guideDepartment; }
    public void setGuideDepartment(String guideDepartment) { this.guideDepartment = guideDepartment; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getProjectDescription() { return projectDescription; }
    public void setProjectDescription(String projectDescription) { this.projectDescription = projectDescription; }

    public LocalDateTime getAllocationDate() { return allocationDate; }
    public void setAllocationDate(LocalDateTime allocationDate) { this.allocationDate = allocationDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

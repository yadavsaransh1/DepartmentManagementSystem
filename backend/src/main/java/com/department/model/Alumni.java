package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alumni")
public class Alumni {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private String program;

    @Column(nullable = false)
    private Integer semester;

    @Column
    private Float marks;

    @Column
    private String passFail;

    @Column
    private LocalDate joinDate;

    @Column
    private LocalDate passingDate;

    @Column
    private String currentOccupation;

    @Column
    private String company;

    @Column(columnDefinition = "LONGTEXT")
    private String customFields;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Alumni() {}

    public Alumni(Student student, String program, Integer semester) {
        this.student = student;
        this.program = program;
        this.semester = semester;
        this.joinDate = LocalDate.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Float getMarks() { return marks; }
    public void setMarks(Float marks) { this.marks = marks; }

    public String getPassFail() { return passFail; }
    public void setPassFail(String passFail) { this.passFail = passFail; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public LocalDate getPassingDate() { return passingDate; }
    public void setPassingDate(LocalDate passingDate) { this.passingDate = passingDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCurrentOccupation() { return currentOccupation; }
    public void setCurrentOccupation(String currentOccupation) { this.currentOccupation = currentOccupation; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
}

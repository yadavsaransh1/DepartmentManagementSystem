package com.department.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment")
public class Assignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Subject course;  // Consolidated from subject_id

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "assignment")
    private java.util.List<AssignmentSubmission> submissions;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    private String instructions;
    private String filePath;
    private String fileName;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private Integer maxScore = 100;

    @Column(name = "visible_to_all_students")
    private Boolean visibleToAllStudents = true;

    @Column(name = "visible_student_ids", columnDefinition = "LONGTEXT")
    private String visibleStudentIds;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Subject getCourse() { return course; }
    public void setCourse(Subject course) { this.course = course; }
    // Backward compatibility
    public Subject getSubject() { return course; }
    public void setSubject(Subject subject) { this.course = subject; }
    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Integer getMaxScore() { return maxScore; }
    public void setMaxScore(Integer maxScore) { this.maxScore = maxScore; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public java.util.List<AssignmentSubmission> getSubmissions() { return submissions; }
    public void setSubmissions(java.util.List<AssignmentSubmission> submissions) { this.submissions = submissions; }
    public Boolean getVisibleToAllStudents() { return visibleToAllStudents; }
    public void setVisibleToAllStudents(Boolean visibleToAllStudents) { this.visibleToAllStudents = visibleToAllStudents; }
    public String getVisibleStudentIds() { return visibleStudentIds; }
    public void setVisibleStudentIds(String visibleStudentIds) { this.visibleStudentIds = visibleStudentIds; }
}

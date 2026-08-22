package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "teacher_feedback")
public class TeacherFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Subject course;  // Consolidated from subject_id

    @Column(nullable = false)
    private String program;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private Integer teachingQuality;

    @Column(nullable = false)
    private Integer communication;

    @Column(nullable = false)
    private Integer availability;

    @Column(nullable = false)
    private Integer courseContent;

    @Column(nullable = false)
    private BigDecimal overallRating;

    @Column(columnDefinition = "LONGTEXT")
    private String comments;

    @Column(columnDefinition = "LONGTEXT")
    private String positiveAspects;

    @Column(columnDefinition = "LONGTEXT")
    private String areasForImprovement;

    @Column(nullable = false)
    private Boolean isAnonymous = false;

    @Column(nullable = false)
    private Boolean isDeleted = false;

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

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Subject getCourse() { return course; }
    public void setCourse(Subject course) { this.course = course; }
    // Backward compatibility
    public Subject getSubject() { return course; }
    public void setSubject(Subject subject) { this.course = subject; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getTeachingQuality() { return teachingQuality; }
    public void setTeachingQuality(Integer teachingQuality) { this.teachingQuality = teachingQuality; }

    public Integer getCommunication() { return communication; }
    public void setCommunication(Integer communication) { this.communication = communication; }

    public Integer getAvailability() { return availability; }
    public void setAvailability(Integer availability) { this.availability = availability; }

    public Integer getCourseContent() { return courseContent; }
    public void setCourseContent(Integer courseContent) { this.courseContent = courseContent; }

    public BigDecimal getOverallRating() { return overallRating; }
    public void setOverallRating(BigDecimal overallRating) { this.overallRating = overallRating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getPositiveAspects() { return positiveAspects; }
    public void setPositiveAspects(String positiveAspects) { this.positiveAspects = positiveAspects; }

    public String getAreasForImprovement() { return areasForImprovement; }
    public void setAreasForImprovement(String areasForImprovement) { this.areasForImprovement = areasForImprovement; }

    public Boolean getIsAnonymous() { return isAnonymous; }
    public void setIsAnonymous(Boolean isAnonymous) { this.isAnonymous = isAnonymous; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

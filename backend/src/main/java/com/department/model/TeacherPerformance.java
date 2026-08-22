package com.department.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_performance")
public class TeacherPerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "teacher_id", nullable = false, unique = true)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Integer totalClasses = 0;
    private Integer totalAttendanceMarked = 0;
    private Integer totalAssignmentsGiven = 0;
    private Integer totalSubmissionsGraded = 0;
    private Integer avgGradingTime = 0;
    private Integer studentsEngaged = 0;
    private BigDecimal performanceRating;
    private LocalDateTime lastEvaluationDate;

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
    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getTotalClasses() { return totalClasses; }
    public void setTotalClasses(Integer totalClasses) { this.totalClasses = totalClasses; }
    public Integer getTotalAttendanceMarked() { return totalAttendanceMarked; }
    public void setTotalAttendanceMarked(Integer totalAttendanceMarked) { this.totalAttendanceMarked = totalAttendanceMarked; }
    public Integer getTotalAssignmentsGiven() { return totalAssignmentsGiven; }
    public void setTotalAssignmentsGiven(Integer totalAssignmentsGiven) { this.totalAssignmentsGiven = totalAssignmentsGiven; }
    public Integer getTotalSubmissionsGraded() { return totalSubmissionsGraded; }
    public void setTotalSubmissionsGraded(Integer totalSubmissionsGraded) { this.totalSubmissionsGraded = totalSubmissionsGraded; }
    public Integer getAvgGradingTime() { return avgGradingTime; }
    public void setAvgGradingTime(Integer avgGradingTime) { this.avgGradingTime = avgGradingTime; }
    public Integer getStudentsEngaged() { return studentsEngaged; }
    public void setStudentsEngaged(Integer studentsEngaged) { this.studentsEngaged = studentsEngaged; }
    public BigDecimal getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(BigDecimal performanceRating) { this.performanceRating = performanceRating; }
    public LocalDateTime getLastEvaluationDate() { return lastEvaluationDate; }
    public void setLastEvaluationDate(LocalDateTime lastEvaluationDate) { this.lastEvaluationDate = lastEvaluationDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

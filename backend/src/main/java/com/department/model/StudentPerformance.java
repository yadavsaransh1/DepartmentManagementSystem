package com.department.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_performance")
public class StudentPerformance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal overallGpa;
    private Integer totalAssignments = 0;
    private Integer assignmentsCompleted = 0;
    private Integer assignmentsPending = 0;
    private BigDecimal totalMarks;
    private BigDecimal averageScore;
    private BigDecimal attendancePercentage;

    @Enumerated(EnumType.STRING)
    private PerformanceLevel performanceLevel = PerformanceLevel.SATISFACTORY;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    public enum PerformanceLevel {
        EXCELLENT, GOOD, SATISFACTORY, NEEDS_IMPROVEMENT
    }

    @PrePersist
    @PreUpdate
    public void updateLastUpdated() {
        this.lastUpdated = LocalDateTime.now();
        updatePerformanceLevel();
    }

    private void updatePerformanceLevel() {
        if (overallGpa != null) {
            double gpaValue = overallGpa.doubleValue();
            if (gpaValue >= 3.7) {
                this.performanceLevel = PerformanceLevel.EXCELLENT;
            } else if (gpaValue >= 3.0) {
                this.performanceLevel = PerformanceLevel.GOOD;
            } else if (gpaValue >= 2.0) {
                this.performanceLevel = PerformanceLevel.SATISFACTORY;
            } else {
                this.performanceLevel = PerformanceLevel.NEEDS_IMPROVEMENT;
            }
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public BigDecimal getOverallGpa() { return overallGpa; }
    public void setOverallGpa(BigDecimal overallGpa) { this.overallGpa = overallGpa; }
    public Integer getTotalAssignments() { return totalAssignments; }
    public void setTotalAssignments(Integer totalAssignments) { this.totalAssignments = totalAssignments; }
    public Integer getAssignmentsCompleted() { return assignmentsCompleted; }
    public void setAssignmentsCompleted(Integer assignmentsCompleted) { this.assignmentsCompleted = assignmentsCompleted; }
    public Integer getAssignmentsPending() { return assignmentsPending; }
    public void setAssignmentsPending(Integer assignmentsPending) { this.assignmentsPending = assignmentsPending; }
    public BigDecimal getTotalMarks() { return totalMarks; }
    public void setTotalMarks(BigDecimal totalMarks) { this.totalMarks = totalMarks; }
    public BigDecimal getAverageScore() { return averageScore; }
    public void setAverageScore(BigDecimal averageScore) { this.averageScore = averageScore; }
    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public PerformanceLevel getPerformanceLevel() { return performanceLevel; }
    public void setPerformanceLevel(PerformanceLevel performanceLevel) { this.performanceLevel = performanceLevel; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}

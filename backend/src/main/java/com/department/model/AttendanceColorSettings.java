package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_color_settings")
public class AttendanceColorSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String role;  // ADMIN, TEACHER, STUDENT

    @Column(nullable = false)
    private Integer lowThreshold = 40;  // < 40% = Red color

    @Column(nullable = false)
    private Integer mediumThreshold = 75;  // 40-75% = Orange, >75% = Green

    @Column(nullable = false)
    private String lowColor = "#e74c3c";  // Red

    @Column(nullable = false)
    private String mediumColor = "#f39c12";  // Orange

    @Column(nullable = false)
    private String highColor = "#27ae60";  // Green

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public AttendanceColorSettings() {}

    public AttendanceColorSettings(String role) {
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getLowThreshold() { return lowThreshold; }
    public void setLowThreshold(Integer lowThreshold) { this.lowThreshold = lowThreshold; }

    public Integer getMediumThreshold() { return mediumThreshold; }
    public void setMediumThreshold(Integer mediumThreshold) { this.mediumThreshold = mediumThreshold; }

    public String getLowColor() { return lowColor; }
    public void setLowColor(String lowColor) { this.lowColor = lowColor; }

    public String getMediumColor() { return mediumColor; }
    public void setMediumColor(String mediumColor) { this.mediumColor = mediumColor; }

    public String getHighColor() { return highColor; }
    public void setHighColor(String highColor) { this.highColor = highColor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

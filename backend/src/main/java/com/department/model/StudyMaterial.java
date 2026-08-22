package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_materials")
public class StudyMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StudyMaterialCategory category = StudyMaterialCategory.LECTURE_NOTES;

    @Column
    private String otherCategoryValue;

    @Column
    private String filePath;

    @Column
    private Long fileSize;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_email", nullable = false)
    private User uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Document.DocumentVisibility visibility = Document.DocumentVisibility.PUBLIC;

    @Column
    private String allowedRoles;

    @Column(columnDefinition = "TEXT")
    private String allowedUserEmails;

    @Column(columnDefinition = "TEXT")
    private String allowedCourses;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    private Integer downloadCount = 0;

    public StudyMaterial() {}

    public StudyMaterial(String title, User uploadedBy) {
        this.title = title;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public StudyMaterialCategory getCategory() { return category; }
    public void setCategory(StudyMaterialCategory category) { this.category = category; }

    public String getOtherCategoryValue() { return otherCategoryValue; }
    public void setOtherCategoryValue(String otherCategoryValue) { this.otherCategoryValue = otherCategoryValue; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public Document.DocumentVisibility getVisibility() { return visibility; }
    public void setVisibility(Document.DocumentVisibility visibility) { this.visibility = visibility; }

    public String getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(String allowedRoles) { this.allowedRoles = allowedRoles; }

    public String getAllowedUserEmails() { return allowedUserEmails; }
    public void setAllowedUserEmails(String allowedUserEmails) { this.allowedUserEmails = allowedUserEmails; }

    public String getAllowedCourses() { return allowedCourses; }
    public void setAllowedCourses(String allowedCourses) { this.allowedCourses = allowedCourses; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    // Enum for study material categories
    public enum StudyMaterialCategory {
        LECTURE_NOTES, ASSIGNMENT, SYLLABUS, EXAM_PAPER, REFERENCE, OTHER
    }
}

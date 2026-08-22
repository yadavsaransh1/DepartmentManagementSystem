package com.department.dto;

import com.department.model.Document;
import java.time.LocalDateTime;

public class StudyMaterialDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String otherCategoryValue;
    private String filePath;
    private Long fileSize;
    private String uploadedByEmail;
    private String uploadedByName;
    private Document.DocumentVisibility visibility;
    private String allowedRoles;
    private String allowedUserEmails;
    private String allowedCourses;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer downloadCount;

    public StudyMaterialDTO() {}

    public StudyMaterialDTO(Long id, String title, String description, String category, 
                            String uploadedByEmail, String uploadedByName, Document.DocumentVisibility visibility, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.uploadedByEmail = uploadedByEmail;
        this.uploadedByName = uploadedByName;
        this.visibility = visibility;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getOtherCategoryValue() { return otherCategoryValue; }
    public void setOtherCategoryValue(String otherCategoryValue) { this.otherCategoryValue = otherCategoryValue; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getUploadedByEmail() { return uploadedByEmail; }
    public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

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
}

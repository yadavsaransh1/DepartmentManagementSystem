package com.department.dto;

import java.time.LocalDateTime;

public class DocumentDTO {
    private Long id;
    private String documentCode;
    private String documentName;
    private String description;
    private String visibility;
    private String allowedRoles;
    private String allowedUserIds;
    private String allowedUserEmails;  // Primary field for email addresses (was allowedUserIds)
    private String allowedCourses;
    private String uploadedByEmail;
    private String uploadedByName;
    private String uploadedBy;
    private Integer downloadCount;
    private LocalDateTime createdAt;
    private String category;
    private String otherCategoryValue;
    private LocalDateTime uploadmentDate;
    private String filePath;

    public DocumentDTO() {}

    public DocumentDTO(String documentCode, String documentName) {
        this.documentCode = documentCode;
        this.documentName = documentName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumentCode() { return documentCode; }
    public void setDocumentCode(String documentCode) { this.documentCode = documentCode; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(String allowedRoles) { this.allowedRoles = allowedRoles; }

    public String getAllowedUserIds() { return allowedUserIds; }
    public void setAllowedUserIds(String allowedUserIds) { this.allowedUserIds = allowedUserIds; }

    public String getAllowedUserEmails() { return allowedUserEmails; }
    public void setAllowedUserEmails(String allowedUserEmails) { this.allowedUserEmails = allowedUserEmails; }

    public String getAllowedCourses() { return allowedCourses; }
    public void setAllowedCourses(String allowedCourses) { this.allowedCourses = allowedCourses; }

    public String getUploadedByEmail() { return uploadedByEmail; }
    public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getOtherCategoryValue() { return otherCategoryValue; }
    public void setOtherCategoryValue(String otherCategoryValue) { this.otherCategoryValue = otherCategoryValue; }

    public LocalDateTime getUploadmentDate() { return uploadmentDate; }
    public void setUploadmentDate(LocalDateTime uploadmentDate) { this.uploadmentDate = uploadmentDate; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
}

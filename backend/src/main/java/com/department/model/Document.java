package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String documentCode;

    @Column(nullable = false)
    private String documentName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String filePath;

    @Column
    private Long fileSize;

    @ManyToOne
    @JoinColumn(name = "uploaded_by_email", nullable = false)
    private User uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentVisibility visibility = DocumentVisibility.PRIVATE;

    @Column
    private String allowedRoles;

    @Column(columnDefinition = "TEXT")
    private String allowedUserEmails;

    @Column(columnDefinition = "TEXT")
    private String allowedCourses;

    @Column(nullable = false)
    private Integer downloadCount = 0;

    @Column
    private String category; // ACADEMIC, CERTIFICATE, RESULT, IDENTITY, ADMISSION - For academic documents only
                             // Study materials are now in StudyMaterial table instead

    @Column
    private String otherCategoryValue;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Document() {}

    public Document(String documentCode, String documentName, User uploadedBy) {
        this.documentCode = documentCode;
        this.documentName = documentName;
        this.uploadedBy = uploadedBy;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocumentCode() { return documentCode; }
    public void setDocumentCode(String documentCode) { this.documentCode = documentCode; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public DocumentVisibility getVisibility() { return visibility; }
    public void setVisibility(DocumentVisibility visibility) { this.visibility = visibility; }

    public String getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(String allowedRoles) { this.allowedRoles = allowedRoles; }

    public String getAllowedUserEmails() { return allowedUserEmails; }
    public void setAllowedUserEmails(String allowedUserEmails) { this.allowedUserEmails = allowedUserEmails; }

    // Backward compatibility getters/setters
    public String getAllowedUserIds() { return allowedUserEmails; }
    public void setAllowedUserIds(String allowedUserIds) { this.allowedUserEmails = allowedUserIds; }

    public String getAllowedCourses() { return allowedCourses; }
    public void setAllowedCourses(String allowedCourses) { this.allowedCourses = allowedCourses; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getOtherCategoryValue() { return otherCategoryValue; }
    public void setOtherCategoryValue(String otherCategoryValue) { this.otherCategoryValue = otherCategoryValue; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum DocumentVisibility {
        PUBLIC, PRIVATE, RESTRICTED, COURSE
    }
}

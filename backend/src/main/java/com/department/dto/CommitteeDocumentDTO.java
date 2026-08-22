package com.department.dto;

import java.time.LocalDateTime;

public class CommitteeDocumentDTO {
    private Long id;
    private Long committeeId;
    private String documentName;
    private String filePath;
    private String documentType;
    private String uploadedByEmail;
    private String uploadedByName;
    private String description;
    private LocalDateTime uploadedAt;
    private Long fileSize;

    public CommitteeDocumentDTO() {}

    public CommitteeDocumentDTO(Long id, String documentName, String filePath, String uploadedByEmail, String uploadedByName, LocalDateTime uploadedAt) {
        this.id = id;
        this.documentName = documentName;
        this.filePath = filePath;
        this.uploadedByEmail = uploadedByEmail;
        this.uploadedByName = uploadedByName;
        this.uploadedAt = uploadedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommitteeId() { return committeeId; }
    public void setCommitteeId(Long committeeId) { this.committeeId = committeeId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getUploadedByEmail() { return uploadedByEmail; }
    public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
}

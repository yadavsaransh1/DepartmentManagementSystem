package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_documents")
public class ProjectDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "allocation_id", nullable = false)
    private SupervisorAllocation allocation;

    @Column(nullable = false)
    private String documentName;

    @Column
    private String documentTitle;

    @Column
    private String documentPath;

    @Column
    private Long fileSize;

    @Column(nullable = false)
    private String uploadedBy; // "STUDENT" or "TEACHER"

    @ManyToOne
    @JoinColumn(name = "uploaded_by_user", nullable = false)
    private User uploadedByUser;

    @Column(nullable = false)
    private LocalDateTime uploadDate = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(nullable = false)
    private String visibility = "EVERYONE"; // EVERYONE or SPECIFIC_STUDENT

    public ProjectDocument() {}

    public ProjectDocument(SupervisorAllocation allocation, String documentName, String documentTitle, String uploadedBy, User uploadedByUser) {
        this.allocation = allocation;
        this.documentName = documentName;
        this.documentTitle = documentTitle;
        this.uploadedBy = uploadedBy;
        this.uploadedByUser = uploadedByUser;
        this.uploadDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SupervisorAllocation getAllocation() { return allocation; }
    public void setAllocation(SupervisorAllocation allocation) { this.allocation = allocation; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getDocumentPath() { return documentPath; }
    public void setDocumentPath(String documentPath) { this.documentPath = documentPath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public User getUploadedByUser() { return uploadedByUser; }
    public void setUploadedByUser(User uploadedByUser) { this.uploadedByUser = uploadedByUser; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}

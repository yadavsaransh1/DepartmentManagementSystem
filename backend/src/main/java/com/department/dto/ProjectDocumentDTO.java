package com.department.dto;

import java.time.LocalDateTime;

public class ProjectDocumentDTO {
    private Long id;
    private Long allocationId;
    private String documentName;
    private String documentTitle;
    private String uploadedBy;
    private String uploadedByUserName;
    private String uploadedByUserEmail;
    private LocalDateTime uploadDate;
    private String visibility;

    public ProjectDocumentDTO() {}

    public ProjectDocumentDTO(Long id, Long allocationId, String documentName, String documentTitle, String uploadedBy, 
                            String uploadedByUserName, LocalDateTime uploadDate) {
        this.id = id;
        this.allocationId = allocationId;
        this.documentName = documentName;
        this.documentTitle = documentTitle;
        this.uploadedBy = uploadedBy;
        this.uploadedByUserName = uploadedByUserName;
        this.uploadDate = uploadDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAllocationId() { return allocationId; }
    public void setAllocationId(Long allocationId) { this.allocationId = allocationId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getUploadedByUserName() { return uploadedByUserName; }
    public void setUploadedByUserName(String uploadedByUserName) { this.uploadedByUserName = uploadedByUserName; }

    public String getUploadedByUserEmail() { return uploadedByUserEmail; }
    public void setUploadedByUserEmail(String uploadedByUserEmail) { this.uploadedByUserEmail = uploadedByUserEmail; }

    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
}

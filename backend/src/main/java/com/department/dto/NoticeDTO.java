package com.department.dto;

import java.time.LocalDateTime;

public class NoticeDTO {
    private Long id;
    private String title;
    private String fileName;
    private String tag;
    private LocalDateTime createdAt;
    private String uploadedBy;
    private Boolean isActive;
    
    public NoticeDTO() {}
    
    public NoticeDTO(Long id, String title, String fileName, String tag, LocalDateTime createdAt, String uploadedBy, Boolean isActive) {
        this.id = id;
        this.title = title;
        this.fileName = fileName;
        this.tag = tag;
        this.createdAt = createdAt;
        this.uploadedBy = uploadedBy;
        this.isActive = isActive;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getTag() {
        return tag;
    }
    
    public void setTag(String tag) {
        this.tag = tag;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getUploadedBy() {
        return uploadedBy;
    }
    
    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

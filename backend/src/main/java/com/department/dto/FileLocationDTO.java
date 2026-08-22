package com.department.dto;

import java.time.LocalDateTime;

public class FileLocationDTO {
    private Long id;
    private String fileName;
    private String almirahName;
    private String additionalInformation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FileLocationDTO() {}

    public FileLocationDTO(Long id, String fileName, String almirahName) {
        this.id = id;
        this.fileName = fileName;
        this.almirahName = almirahName;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getAlmirahName() { return almirahName; }
    public void setAlmirahName(String almirahName) { this.almirahName = almirahName; }

    public String getAdditionalInformation() { return additionalInformation; }
    public void setAdditionalInformation(String additionalInformation) { this.additionalInformation = additionalInformation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

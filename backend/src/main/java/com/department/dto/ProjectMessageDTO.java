package com.department.dto;

import java.time.LocalDateTime;

public class ProjectMessageDTO {
    private Long id;
    private Long allocationId;
    private String messageText;
    private String senderRole;
    private String senderName;
    private LocalDateTime createdAt;

    public ProjectMessageDTO() {}

    public ProjectMessageDTO(Long id, Long allocationId, String messageText, String senderRole, String senderName, LocalDateTime createdAt) {
        this.id = id;
        this.allocationId = allocationId;
        this.messageText = messageText;
        this.senderRole = senderRole;
        this.senderName = senderName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAllocationId() { return allocationId; }
    public void setAllocationId(Long allocationId) { this.allocationId = allocationId; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

package com.department.dto;

import java.time.LocalDateTime;

public class CommitteeMessageDTO {
    private Long id;
    private Long committeeId;
    private String senderEmail;
    private String senderName;
    private String messageText;
    private LocalDateTime createdAt;

    public CommitteeMessageDTO() {}

    public CommitteeMessageDTO(Long id, String senderEmail, String senderName, String messageText, LocalDateTime createdAt) {
        this.id = id;
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.messageText = messageText;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommitteeId() { return committeeId; }
    public void setCommitteeId(Long committeeId) { this.committeeId = committeeId; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

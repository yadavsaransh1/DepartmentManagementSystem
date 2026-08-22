package com.department.dto;

public class NotificationReplyDTO {
    private Long id;
    private Long notificationId;
    private Long repliedById;
    private String repliedByName;
    private String repliedByRole;
    private String replyContent;
    private String createdAt;

    public NotificationReplyDTO() {}

    public NotificationReplyDTO(Long id, Long notificationId, String replyContent) {
        this.id = id;
        this.notificationId = notificationId;
        this.replyContent = replyContent;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }

    public Long getRepliedById() { return repliedById; }
    public void setRepliedById(Long repliedById) { this.repliedById = repliedById; }
    public void setRepliedByEmail(String repliedByEmail) { this.repliedByName = repliedByEmail; }

    public String getRepliedByName() { return repliedByName; }
    public void setRepliedByName(String repliedByName) { this.repliedByName = repliedByName; }

    public String getRepliedByRole() { return repliedByRole; }
    public void setRepliedByRole(String repliedByRole) { this.repliedByRole = repliedByRole; }

    public String getReplyContent() { return replyContent; }
    public void setReplyContent(String replyContent) { this.replyContent = replyContent; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

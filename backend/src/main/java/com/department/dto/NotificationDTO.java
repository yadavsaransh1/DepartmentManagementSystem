package com.department.dto;

import java.util.List;

public class NotificationDTO {
    private Long id;
    private String title;
    private String content;
    private Long createdById;
    private String createdByName;
    private String visibility; // PUBLIC, RESTRICTED, PRIVATE
    private String allowedRoles; // Comma-separated for RESTRICTED
    private String allowedUserIds; // Comma-separated for PRIVATE (emails)
    private List<String> allowedRolesList; // For convenience
    private List<String> allowedUserIdsList; // For convenience (emails and / or IDs)
    private Boolean isActive;
    private Integer replyCount;
    private String createdAt;

    public NotificationDTO() {}

    public NotificationDTO(Long id, String title, String content, String visibility) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.visibility = visibility;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByName = createdByEmail; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }

    public String getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(String allowedRoles) { this.allowedRoles = allowedRoles; }

    public String getAllowedUserIds() { return allowedUserIds; }
    public void setAllowedUserIds(String allowedUserIds) { this.allowedUserIds = allowedUserIds; }

    public List<String> getAllowedRolesList() { return allowedRolesList; }
    public void setAllowedRolesList(List<String> allowedRolesList) { this.allowedRolesList = allowedRolesList; }

    public List<String> getAllowedUserIdsList() { return allowedUserIdsList; }
    public void setAllowedUserIdsList(List<String> allowedUserIdsList) { this.allowedUserIdsList = allowedUserIdsList; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getReplyCount() { return replyCount; }
    public void setReplyCount(Integer replyCount) { this.replyCount = replyCount; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

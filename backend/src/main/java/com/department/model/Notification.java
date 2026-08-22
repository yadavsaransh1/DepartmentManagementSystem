package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "created_by_email", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisibilityType visibility = VisibilityType.PUBLIC;

    @Column
    private String allowedRoles; // Comma-separated roles for RESTRICTED visibility

    @Column
    private String allowedUserEmails; // Comma-separated user emails for PRIVATE visibility

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "notification", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<NotificationReply> replies = new java.util.ArrayList<>();

    public enum VisibilityType {
        PUBLIC,      // Everyone can see
        RESTRICTED,  // Only specific roles (teachers, students, etc.)
        PRIVATE      // Only specific users
    }

    public Notification() {}

    public Notification(String title, String content, User createdBy, VisibilityType visibility) {
        this.title = title;
        this.content = content;
        this.createdBy = createdBy;
        this.visibility = visibility;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public VisibilityType getVisibility() { return visibility; }
    public void setVisibility(VisibilityType visibility) { this.visibility = visibility; }

    public String getAllowedRoles() { return allowedRoles; }
    public void setAllowedRoles(String allowedRoles) { this.allowedRoles = allowedRoles; }

    public String getAllowedUserEmails() { return allowedUserEmails; }
    public void setAllowedUserEmails(String allowedUserEmails) { this.allowedUserEmails = allowedUserEmails; }

    // Backward compatibility getters/setters
    public String getAllowedUserIds() { return allowedUserEmails; }
    public void setAllowedUserIds(String allowedUserIds) { this.allowedUserEmails = allowedUserIds; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public java.util.List<NotificationReply> getReplies() { return replies; }
    public void setReplies(java.util.List<NotificationReply> replies) { this.replies = replies; }
}

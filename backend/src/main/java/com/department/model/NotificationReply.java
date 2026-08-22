package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notification_replies")
public class NotificationReply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne
    @JoinColumn(name = "reply_by", nullable = false)
    private User repliedBy;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String replyContent;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public NotificationReply() {}

    public NotificationReply(Notification notification, User repliedBy, String replyContent) {
        this.notification = notification;
        this.repliedBy = repliedBy;
        this.replyContent = replyContent;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Notification getNotification() { return notification; }
    public void setNotification(Notification notification) { this.notification = notification; }

    public User getRepliedBy() { return repliedBy; }
    public void setRepliedBy(User repliedBy) { this.repliedBy = repliedBy; }

    public String getReplyContent() { return replyContent; }
    public void setReplyContent(String replyContent) { this.replyContent = replyContent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

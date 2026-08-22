package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_messages")
public class ProjectMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "allocation_id", nullable = false)
    private SupervisorAllocation allocation;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Column(nullable = false)
    private String senderRole; // "STUDENT" or "TEACHER"

    @ManyToOne
    @JoinColumn(name = "sender_email", nullable = false)
    private User sender;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProjectMessage() {}

    public ProjectMessage(SupervisorAllocation allocation, String messageText, String senderRole, User sender) {
        this.allocation = allocation;
        this.messageText = messageText;
        this.senderRole = senderRole;
        this.sender = sender;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SupervisorAllocation getAllocation() { return allocation; }
    public void setAllocation(SupervisorAllocation allocation) { this.allocation = allocation; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

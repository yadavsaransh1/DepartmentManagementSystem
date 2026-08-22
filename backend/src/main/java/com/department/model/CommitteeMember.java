package com.department.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "committee_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"committee_id", "teacher_email"})
})
public class CommitteeMember {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "committee_id", nullable = false)
    private Committee committee;

    @ManyToOne
    @JoinColumn(name = "teacher_email", referencedColumnName = "email", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private String role; // "Member", "Chairman", "Convenor", etc.

    @Column(columnDefinition = "LONGTEXT")
    private String powers; // JSON array of powers

    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedDate = LocalDateTime.now();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public CommitteeMember() {}

    public CommitteeMember(Committee committee, User teacher, String role) {
        this.committee = committee;
        this.teacher = teacher;
        this.role = role;
        this.joinedDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Committee getCommittee() { return committee; }
    public void setCommittee(Committee committee) { this.committee = committee; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPowers() { return powers; }
    public void setPowers(String powers) { this.powers = powers; }

    public LocalDateTime getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDateTime joinedDate) { this.joinedDate = joinedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

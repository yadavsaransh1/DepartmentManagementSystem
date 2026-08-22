package com.department.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommitteeMemberDTO {
    private Long id;
    private Long committeeId;
    private String teacherEmail;
    private String teacherName;
    private String role;
    private List<String> powers;
    private LocalDateTime joinedDate;

    public CommitteeMemberDTO() {}

    public CommitteeMemberDTO(Long id, String teacherEmail, String teacherName, String role) {
        this.id = id;
        this.teacherEmail = teacherEmail;
        this.teacherName = teacherName;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCommitteeId() { return committeeId; }
    public void setCommitteeId(Long committeeId) { this.committeeId = committeeId; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getPowers() { return powers; }
    public void setPowers(List<String> powers) { this.powers = powers; }

    public LocalDateTime getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDateTime joinedDate) { this.joinedDate = joinedDate; }
}

package com.department.dto;

import java.time.LocalDateTime;
import java.util.List;

public class CommitteeDTO {
    private Long id;
    private String name;
    private String description;
    private String createdByEmail;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommitteeMemberDTO> members;
    private Integer memberCount;

    public CommitteeDTO() {}

    public CommitteeDTO(Long id, String name, String description, String createdByEmail, String createdByName, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdByEmail = createdByEmail;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<CommitteeMemberDTO> getMembers() { return members; }
    public void setMembers(List<CommitteeMemberDTO> members) { this.members = members; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }
}

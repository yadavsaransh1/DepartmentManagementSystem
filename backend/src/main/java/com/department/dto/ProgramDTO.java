package com.department.dto;

import java.util.List;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ProgramDTO {
    private Long id;
    
    @NotBlank(message = "Program name is required")
    private String name;
    
    @Min(value = 0, message = "Semester count must be 0 or greater")
    private Integer semesterCount;
    
    private String description;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;

    public ProgramDTO() {}

    public ProgramDTO(Long id, String name, Integer semesterCount, String description, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.semesterCount = semesterCount;
        this.description = description;
        this.isActive = isActive;
    }

    public ProgramDTO(Long id, String name, Integer semesterCount, String description, Boolean isActive, List<SemesterDTO> semesters) {
        this.id = id;
        this.name = name;
        this.semesterCount = semesterCount;
        this.description = description;
        this.isActive = isActive;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSemesterCount() { return semesterCount; }
    public void setSemesterCount(Integer semesterCount) { this.semesterCount = semesterCount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

  
}

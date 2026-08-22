package com.department.dto;

public class SemesterDTO {
    private String id;  // Composite ID: "programId:semesterNumber"
    private Long programId;
    private String name;
    private Integer semesterNumber;

    public SemesterDTO() {}

    public SemesterDTO(Long programId, Integer semesterNumber, String name) {
        this.programId = programId;
        this.semesterNumber = semesterNumber;
        this.name = name;
        // Generate composite ID to ensure uniqueness across programs
        this.id = programId + ":" + semesterNumber;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getSemesterNumber() { return semesterNumber; }
    public void setSemesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; }
}

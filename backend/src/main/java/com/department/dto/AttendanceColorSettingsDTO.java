package com.department.dto;

public class AttendanceColorSettingsDTO {
    private Long id;
    private String role;
    private Integer lowThreshold;
    private Integer mediumThreshold;
    private String lowColor;
    private String mediumColor;
    private String highColor;

    // Constructors
    public AttendanceColorSettingsDTO() {}

    public AttendanceColorSettingsDTO(Long id, String role, Integer lowThreshold, Integer mediumThreshold, 
                                      String lowColor, String mediumColor, String highColor) {
        this.id = id;
        this.role = role;
        this.lowThreshold = lowThreshold;
        this.mediumThreshold = mediumThreshold;
        this.lowColor = lowColor;
        this.mediumColor = mediumColor;
        this.highColor = highColor;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getLowThreshold() { return lowThreshold; }
    public void setLowThreshold(Integer lowThreshold) { this.lowThreshold = lowThreshold; }

    public Integer getMediumThreshold() { return mediumThreshold; }
    public void setMediumThreshold(Integer mediumThreshold) { this.mediumThreshold = mediumThreshold; }

    public String getLowColor() { return lowColor; }
    public void setLowColor(String lowColor) { this.lowColor = lowColor; }

    public String getMediumColor() { return mediumColor; }
    public void setMediumColor(String mediumColor) { this.mediumColor = mediumColor; }

    public String getHighColor() { return highColor; }
    public void setHighColor(String highColor) { this.highColor = highColor; }
}

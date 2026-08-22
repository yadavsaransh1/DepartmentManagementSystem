package com.department.model;

import jakarta.persistence.*;

@Entity
@Table(name = "home_page_content")
public class HomePageContent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Logo Section (Top Left Corner)
    @Column(columnDefinition = "LONGTEXT")
    private String departmentLogo; // Base64 encoded image or URL
    
    @Column(length = 100)
    private String logoAltText;
    
    // Department Section
    @Column(columnDefinition = "LONGTEXT")
    private String departmentImage; // Base64 encoded image or URL
    
    @Column(length = 200)
    private String departmentTitle;
    
    @Column(columnDefinition = "TEXT")
    private String departmentDescription;
    
    // Dean Section
    @Column(columnDefinition = "LONGTEXT")
    private String deanImage; // Base64 encoded image or URL
    
    @Column(length = 100)
    private String deanName;
    
    @Column(length = 100)
    private String deanDesignation;
    
    @Column(columnDefinition = "TEXT")
    private String deanDescription;
    
    // HoD Section
    @Column(columnDefinition = "LONGTEXT")
    private String hodImage; // Base64 encoded image or URL
    
    @Column(length = 100)
    private String hodName;
    
    @Column(length = 100)
    private String hodDesignation;
    
    @Column(columnDefinition = "TEXT")
    private String hodDescription;
    
    @Column(name = "created_at")
    private Long createdAt;
    
    @Column(name = "updated_at")
    private Long updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = System.currentTimeMillis();
        this.updatedAt = System.currentTimeMillis();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = System.currentTimeMillis();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDepartmentLogo() {
        return departmentLogo;
    }
    
    public void setDepartmentLogo(String departmentLogo) {
        this.departmentLogo = departmentLogo;
    }
    
    public String getLogoAltText() {
        return logoAltText;
    }
    
    public void setLogoAltText(String logoAltText) {
        this.logoAltText = logoAltText;
    }
    
    public String getDepartmentImage() {
        return departmentImage;
    }
    
    public void setDepartmentImage(String departmentImage) {
        this.departmentImage = departmentImage;
    }
    
    public String getDepartmentTitle() {
        return departmentTitle;
    }
    
    public void setDepartmentTitle(String departmentTitle) {
        this.departmentTitle = departmentTitle;
    }
    
    public String getDepartmentDescription() {
        return departmentDescription;
    }
    
    public void setDepartmentDescription(String departmentDescription) {
        this.departmentDescription = departmentDescription;
    }
    
    public String getDeanImage() {
        return deanImage;
    }
    
    public void setDeanImage(String deanImage) {
        this.deanImage = deanImage;
    }
    
    public String getDeanName() {
        return deanName;
    }
    
    public void setDeanName(String deanName) {
        this.deanName = deanName;
    }
    
    public String getDeanDesignation() {
        return deanDesignation;
    }
    
    public void setDeanDesignation(String deanDesignation) {
        this.deanDesignation = deanDesignation;
    }
    
    public String getDeanDescription() {
        return deanDescription;
    }
    
    public void setDeanDescription(String deanDescription) {
        this.deanDescription = deanDescription;
    }
    
    public String getHodImage() {
        return hodImage;
    }
    
    public void setHodImage(String hodImage) {
        this.hodImage = hodImage;
    }
    
    public String getHodName() {
        return hodName;
    }
    
    public void setHodName(String hodName) {
        this.hodName = hodName;
    }
    
    public String getHodDesignation() {
        return hodDesignation;
    }
    
    public void setHodDesignation(String hodDesignation) {
        this.hodDesignation = hodDesignation;
    }
    
    public String getHodDescription() {
        return hodDescription;
    }
    
    public void setHodDescription(String hodDescription) {
        this.hodDescription = hodDescription;
    }
    
    public Long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }
}

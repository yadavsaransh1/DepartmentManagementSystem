package com.department.model;

import jakarta.persistence.*;

@Entity
@Table(name = "committee_powers")
public class CommitteePower {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String powerName;

    @Column
    private String description;

    public CommitteePower() {}

    public CommitteePower(String powerName, String description) {
        this.powerName = powerName;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPowerName() { return powerName; }
    public void setPowerName(String powerName) { this.powerName = powerName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

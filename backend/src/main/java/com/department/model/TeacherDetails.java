package com.department.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;

@Entity
@Table(name = "teacher_details")
public class TeacherDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "teacher_id", nullable = false, unique = true)
    @JsonManagedReference
    private Teacher teacher;

    @Column(columnDefinition = "TEXT")
    private String dateOfBirth;

    @Column(columnDefinition = "LONGBLOB")
    private byte[] profilePicture;

    @Column
    private String profilePictureType;

    @Column(columnDefinition = "LONGBLOB")
    private byte[] resume;

    @Column
    private String resumeType;

    @Column(columnDefinition = "LONGTEXT")
    private String educationJson;

    @Column(columnDefinition = "LONGTEXT")
    private String certificationsJson;

    @Column(columnDefinition = "TEXT")
    private String skillsAbilities;

    @Column(columnDefinition = "LONGTEXT")
    private String workExperiencesJson;

    @Column(columnDefinition = "LONGTEXT")
    private String journalPublicationsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String bookChaptersJson;

    @Column(columnDefinition = "LONGTEXT")
    private String conferencePresentationJson;

    @Column(columnDefinition = "LONGTEXT")
    private String booksAuthoredJson;

    @Column(columnDefinition = "LONGTEXT")
    private String patentsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String projectsJson;

    @Column(columnDefinition = "LONGTEXT")
    private String invitedTalkJson;

    @Column(columnDefinition = "TEXT")
    private String administrativeResponsibilities;

    @Column(columnDefinition = "TEXT")
    private String academicContribution;

    @Column(columnDefinition = "LONGTEXT")
    private String customFieldsJson;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TeacherDetails() {}

    public TeacherDetails(Teacher teacher) {
        this.teacher = teacher;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public byte[] getProfilePicture() { return profilePicture; }
    public void setProfilePicture(byte[] profilePicture) { this.profilePicture = profilePicture; }

    public String getProfilePictureType() { return profilePictureType; }
    public void setProfilePictureType(String profilePictureType) { this.profilePictureType = profilePictureType; }

    public byte[] getResume() { return resume; }
    public void setResume(byte[] resume) { this.resume = resume; }

    public String getResumeType() { return resumeType; }
    public void setResumeType(String resumeType) { this.resumeType = resumeType; }

    public String getEducationJson() { return educationJson; }
    public void setEducationJson(String educationJson) { this.educationJson = educationJson; }

    public String getCertificationsJson() { return certificationsJson; }
    public void setCertificationsJson(String certificationsJson) { this.certificationsJson = certificationsJson; }

    public String getSkillsAbilities() { return skillsAbilities; }
    public void setSkillsAbilities(String skillsAbilities) { this.skillsAbilities = skillsAbilities; }

    public String getWorkExperiencesJson() { return workExperiencesJson; }
    public void setWorkExperiencesJson(String workExperiencesJson) { this.workExperiencesJson = workExperiencesJson; }

    public String getJournalPublicationsJson() { return journalPublicationsJson; }
    public void setJournalPublicationsJson(String journalPublicationsJson) { this.journalPublicationsJson = journalPublicationsJson; }

    public String getBookChaptersJson() { return bookChaptersJson; }
    public void setBookChaptersJson(String bookChaptersJson) { this.bookChaptersJson = bookChaptersJson; }

    public String getConferencePresentationJson() { return conferencePresentationJson; }
    public void setConferencePresentationJson(String conferencePresentationJson) { this.conferencePresentationJson = conferencePresentationJson; }

    public String getBooksAuthoredJson() { return booksAuthoredJson; }
    public void setBooksAuthoredJson(String booksAuthoredJson) { this.booksAuthoredJson = booksAuthoredJson; }

    public String getPatentsJson() { return patentsJson; }
    public void setPatentsJson(String patentsJson) { this.patentsJson = patentsJson; }

    public String getProjectsJson() { return projectsJson; }
    public void setProjectsJson(String projectsJson) { this.projectsJson = projectsJson; }

    public String getInvitedTalkJson() { return invitedTalkJson; }
    public void setInvitedTalkJson(String invitedTalkJson) { this.invitedTalkJson = invitedTalkJson; }

    public String getAdministrativeResponsibilities() { return administrativeResponsibilities; }
    public void setAdministrativeResponsibilities(String administrativeResponsibilities) { this.administrativeResponsibilities = administrativeResponsibilities; }

    public String getAcademicContribution() { return academicContribution; }
    public void setAcademicContribution(String academicContribution) { this.academicContribution = academicContribution; }

    public String getCustomFieldsJson() { return customFieldsJson; }
    public void setCustomFieldsJson(String customFieldsJson) { this.customFieldsJson = customFieldsJson; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

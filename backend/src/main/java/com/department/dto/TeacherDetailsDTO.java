package com.department.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

public class TeacherDetailsDTO {
    private Long teacherId;
    private String teacherEmail;
    private String dateOfBirth;
    private String profilePictureBase64;
    private String profilePictureType;
    private String resumeBase64;
    private String resumeType;
    private java.util.List<Map<String, Object>> education;
    private java.util.List<Map<String, Object>> certifications;
    private String skillsAbilities;
    private java.util.List<Map<String, Object>> workExperiences;
    private java.util.List<Map<String, Object>> journalPublications;
    private java.util.List<Map<String, Object>> bookChapters;
    private java.util.List<Map<String, Object>> conferencePresentation;
    private java.util.List<Map<String, Object>> booksAuthored;
    private java.util.List<Map<String, Object>> patents;
    private java.util.List<Map<String, Object>> projects;
    private java.util.List<Map<String, Object>> invitedTalk;
    private String administrativeResponsibilities;
    private String academicContribution;
    @JsonProperty("customFields")
    private java.util.Map<String, Object> customFields;

    // Getters and Setters
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getProfilePictureBase64() { return profilePictureBase64; }
    public void setProfilePictureBase64(String profilePictureBase64) { this.profilePictureBase64 = profilePictureBase64; }

    public String getProfilePictureType() { return profilePictureType; }
    public void setProfilePictureType(String profilePictureType) { this.profilePictureType = profilePictureType; }

    public String getResumeBase64() { return resumeBase64; }
    public void setResumeBase64(String resumeBase64) { this.resumeBase64 = resumeBase64; }

    public String getResumeType() { return resumeType; }
    public void setResumeType(String resumeType) { this.resumeType = resumeType; }

    public java.util.List<Map<String, Object>> getEducation() { return education; }
    public void setEducation(java.util.List<Map<String, Object>> education) { this.education = education; }

    public java.util.List<Map<String, Object>> getCertifications() { return certifications; }
    public void setCertifications(java.util.List<Map<String, Object>> certifications) { this.certifications = certifications; }

    public String getSkillsAbilities() { return skillsAbilities; }
    public void setSkillsAbilities(String skillsAbilities) { this.skillsAbilities = skillsAbilities; }

    public java.util.List<Map<String, Object>> getWorkExperiences() { return workExperiences; }
    public void setWorkExperiences(java.util.List<Map<String, Object>> workExperiences) { this.workExperiences = workExperiences; }

    public java.util.List<Map<String, Object>> getJournalPublications() { return journalPublications; }
    public void setJournalPublications(java.util.List<Map<String, Object>> journalPublications) { this.journalPublications = journalPublications; }

    public java.util.List<Map<String, Object>> getBookChapters() { return bookChapters; }
    public void setBookChapters(java.util.List<Map<String, Object>> bookChapters) { this.bookChapters = bookChapters; }

    public java.util.List<Map<String, Object>> getConferencePresentation() { return conferencePresentation; }
    public void setConferencePresentation(java.util.List<Map<String, Object>> conferencePresentation) { this.conferencePresentation = conferencePresentation; }

    public java.util.List<Map<String, Object>> getBooksAuthored() { return booksAuthored; }
    public void setBooksAuthored(java.util.List<Map<String, Object>> booksAuthored) { this.booksAuthored = booksAuthored; }

    public java.util.List<Map<String, Object>> getPatents() { return patents; }
    public void setPatents(java.util.List<Map<String, Object>> patents) { this.patents = patents; }

    public java.util.List<Map<String, Object>> getProjects() { return projects; }
    public void setProjects(java.util.List<Map<String, Object>> projects) { this.projects = projects; }

    public java.util.List<Map<String, Object>> getInvitedTalk() { return invitedTalk; }
    public void setInvitedTalk(java.util.List<Map<String, Object>> invitedTalk) { this.invitedTalk = invitedTalk; }

    public String getAdministrativeResponsibilities() { return administrativeResponsibilities; }
    public void setAdministrativeResponsibilities(String administrativeResponsibilities) { this.administrativeResponsibilities = administrativeResponsibilities; }

    public String getAcademicContribution() { return academicContribution; }
    public void setAcademicContribution(String academicContribution) { this.academicContribution = academicContribution; }

    public java.util.Map<String, Object> getCustomFields() { return customFields; }
    public void setCustomFields(java.util.Map<String, Object> customFields) { this.customFields = customFields; }
}

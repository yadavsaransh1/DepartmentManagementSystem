package com.department.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import java.util.List;

public class TeacherDetailsResponseDTO {
    private Long id;
    private Long teacherId;
    private String dateOfBirth;
    private String profilePictureBase64;
    private String profilePictureType;
    private String resumeBase64;
    private String resumeType;
    private List<Map<String, Object>> education;
    private List<Map<String, Object>> certifications;
    private String skillsAbilities;
    private List<Map<String, Object>> workExperiences;
    private List<Map<String, Object>> journalPublications;
    private List<Map<String, Object>> bookChapters;
    private List<Map<String, Object>> conferencePresentation;
    private List<Map<String, Object>> booksAuthored;
    private List<Map<String, Object>> patents;
    private List<Map<String, Object>> projects;
    private List<Map<String, Object>> invitedTalk;
    private String administrativeResponsibilities;
    private String academicContribution;
    @JsonProperty("customFields")
    private Map<String, Object> customFields;

    public TeacherDetailsResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

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

    public List<Map<String, Object>> getEducation() { return education; }
    public void setEducation(List<Map<String, Object>> education) { this.education = education; }

    public List<Map<String, Object>> getCertifications() { return certifications; }
    public void setCertifications(List<Map<String, Object>> certifications) { this.certifications = certifications; }

    public String getSkillsAbilities() { return skillsAbilities; }
    public void setSkillsAbilities(String skillsAbilities) { this.skillsAbilities = skillsAbilities; }

    public List<Map<String, Object>> getWorkExperiences() { return workExperiences; }
    public void setWorkExperiences(List<Map<String, Object>> workExperiences) { this.workExperiences = workExperiences; }

    public List<Map<String, Object>> getJournalPublications() { return journalPublications; }
    public void setJournalPublications(List<Map<String, Object>> journalPublications) { this.journalPublications = journalPublications; }

    public List<Map<String, Object>> getBookChapters() { return bookChapters; }
    public void setBookChapters(List<Map<String, Object>> bookChapters) { this.bookChapters = bookChapters; }

    public List<Map<String, Object>> getConferencePresentation() { return conferencePresentation; }
    public void setConferencePresentation(List<Map<String, Object>> conferencePresentation) { this.conferencePresentation = conferencePresentation; }

    public List<Map<String, Object>> getBooksAuthored() { return booksAuthored; }
    public void setBooksAuthored(List<Map<String, Object>> booksAuthored) { this.booksAuthored = booksAuthored; }

    public List<Map<String, Object>> getPatents() { return patents; }
    public void setPatents(List<Map<String, Object>> patents) { this.patents = patents; }

    public List<Map<String, Object>> getProjects() { return projects; }
    public void setProjects(List<Map<String, Object>> projects) { this.projects = projects; }

    public List<Map<String, Object>> getInvitedTalk() { return invitedTalk; }
    public void setInvitedTalk(List<Map<String, Object>> invitedTalk) { this.invitedTalk = invitedTalk; }

    public String getAdministrativeResponsibilities() { return administrativeResponsibilities; }
    public void setAdministrativeResponsibilities(String administrativeResponsibilities) { this.administrativeResponsibilities = administrativeResponsibilities; }

    public String getAcademicContribution() { return academicContribution; }
    public void setAcademicContribution(String academicContribution) { this.academicContribution = academicContribution; }

    public Map<String, Object> getCustomFields() { return customFields; }
    public void setCustomFields(Map<String, Object> customFields) { this.customFields = customFields; }
}

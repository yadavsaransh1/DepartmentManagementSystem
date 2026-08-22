package com.department.service;

import com.department.model.TeacherDetails;
import com.department.model.Teacher;
import com.department.repository.TeacherDetailsRepository;
import com.department.repository.TeacherRepository;
import com.department.dto.TeacherDetailsDTO;
import com.department.dto.TeacherDetailsResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;
import java.util.Map;
import java.util.List;

@Service
@Transactional
public class TeacherDetailsService {
    @Autowired
    private TeacherDetailsRepository detailsRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    public TeacherDetails saveTeacherDetails(TeacherDetailsDTO dto) throws Exception {
        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        TeacherDetails details = detailsRepository.findByTeacher(teacher)
                .orElse(new TeacherDetails(teacher));

        details.setDateOfBirth(dto.getDateOfBirth());
        details.setSkillsAbilities(dto.getSkillsAbilities());
        details.setAdministrativeResponsibilities(dto.getAdministrativeResponsibilities());
        details.setAcademicContribution(dto.getAcademicContribution());

        // Handle profile picture
        if (dto.getProfilePictureBase64() != null && !dto.getProfilePictureBase64().isEmpty()) {
            String base64Data = dto.getProfilePictureBase64();
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            details.setProfilePicture(Base64.getDecoder().decode(base64Data));
            details.setProfilePictureType(dto.getProfilePictureType());
        }

        // Handle resume
        if (dto.getResumeBase64() != null && !dto.getResumeBase64().isEmpty()) {
            String base64Data = dto.getResumeBase64();
            if (base64Data.contains(",")) {
                base64Data = base64Data.split(",")[1];
            }
            details.setResume(Base64.getDecoder().decode(base64Data));
            details.setResumeType(dto.getResumeType());
        }

        // Handle JSON arrays and objects
        if (dto.getEducation() != null) {
            details.setEducationJson(objectMapper.writeValueAsString(dto.getEducation()));
        }
        if (dto.getCertifications() != null) {
            details.setCertificationsJson(objectMapper.writeValueAsString(dto.getCertifications()));
        }
        if (dto.getWorkExperiences() != null) {
            details.setWorkExperiencesJson(objectMapper.writeValueAsString(dto.getWorkExperiences()));
        }
        if (dto.getJournalPublications() != null) {
            details.setJournalPublicationsJson(objectMapper.writeValueAsString(dto.getJournalPublications()));
        }
        if (dto.getBookChapters() != null) {
            details.setBookChaptersJson(objectMapper.writeValueAsString(dto.getBookChapters()));
        }
        if (dto.getConferencePresentation() != null) {
            details.setConferencePresentationJson(objectMapper.writeValueAsString(dto.getConferencePresentation()));
        }
        if (dto.getBooksAuthored() != null) {
            details.setBooksAuthoredJson(objectMapper.writeValueAsString(dto.getBooksAuthored()));
        }
        if (dto.getPatents() != null) {
            details.setPatentsJson(objectMapper.writeValueAsString(dto.getPatents()));
        }
        if (dto.getProjects() != null) {
            details.setProjectsJson(objectMapper.writeValueAsString(dto.getProjects()));
        }
        if (dto.getInvitedTalk() != null) {
            details.setInvitedTalkJson(objectMapper.writeValueAsString(dto.getInvitedTalk()));
        }
        if (dto.getCustomFields() != null) {
            details.setCustomFieldsJson(objectMapper.writeValueAsString(dto.getCustomFields()));
        }

        details.setUpdatedAt(LocalDateTime.now());
        return detailsRepository.save(details);
    }

    public TeacherDetails getTeacherDetails(Long teacherId) throws Exception {
        Optional<TeacherDetails> details = detailsRepository.findByTeacher_Id(teacherId);
        if (details.isPresent()) {
            return details.get();
        }
        
        // If no details exist yet, create a default empty one for first-time users
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        TeacherDetails newDetails = new TeacherDetails(teacher);
        return newDetails;  // Return unsaved empty details for first-time users
    }

    public Optional<TeacherDetails> getTeacherDetailsOptional(Long teacherId) {
        return detailsRepository.findByTeacher_Id(teacherId);
    }

    public boolean hasTeacherDetails(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId).orElse(null);
        if (teacher == null) return false;
        return detailsRepository.existsByTeacher(teacher);
    }

    public TeacherDetails deleteTeacherDetails(Long teacherId) {
        Optional<TeacherDetails> details = detailsRepository.findByTeacher_Id(teacherId);
        if (details.isPresent()) {
            detailsRepository.delete(details.get());
        }
        return details.orElse(null);
    }

    public TeacherDetailsResponseDTO convertToResponseDTO(TeacherDetails details) throws Exception {
        if (details == null) {
            return null;
        }

        TeacherDetailsResponseDTO response = new TeacherDetailsResponseDTO();
        response.setId(details.getId());
        response.setTeacherId(details.getTeacher() != null ? details.getTeacher().getId() : null);
        response.setDateOfBirth(details.getDateOfBirth());
        response.setProfilePictureType(details.getProfilePictureType());
        response.setResumeType(details.getResumeType());
        response.setSkillsAbilities(details.getSkillsAbilities());
        response.setAdministrativeResponsibilities(details.getAdministrativeResponsibilities());
        response.setAcademicContribution(details.getAcademicContribution());

        // Convert binary data to Base64
        if (details.getProfilePicture() != null && details.getProfilePicture().length > 0) {
            response.setProfilePictureBase64("data:" + (details.getProfilePictureType() != null ? details.getProfilePictureType() : "image/jpeg") + ";base64," + Base64.getEncoder().encodeToString(details.getProfilePicture()));
        }

        if (details.getResume() != null && details.getResume().length > 0) {
            response.setResumeBase64("data:" + (details.getResumeType() != null ? details.getResumeType() : "application/pdf") + ";base64," + Base64.getEncoder().encodeToString(details.getResume()));
        }

        // Convert JSON strings to objects
        if (details.getEducationJson() != null && !details.getEducationJson().isEmpty()) {
            List<Map<String,Object>> education = objectMapper.readValue(details.getEducationJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setEducation(education);
        }
        if (details.getCertificationsJson() != null && !details.getCertificationsJson().isEmpty()) {
            List<Map<String,Object>> certifications = objectMapper.readValue(details.getCertificationsJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setCertifications(certifications);
        }
        if (details.getWorkExperiencesJson() != null && !details.getWorkExperiencesJson().isEmpty()) {
            List<Map<String,Object>> workExp = objectMapper.readValue(details.getWorkExperiencesJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setWorkExperiences(workExp);
        }
        if (details.getJournalPublicationsJson() != null && !details.getJournalPublicationsJson().isEmpty()) {
            List<Map<String,Object>> journals = objectMapper.readValue(details.getJournalPublicationsJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setJournalPublications(journals);
        }
        if (details.getBookChaptersJson() != null && !details.getBookChaptersJson().isEmpty()) {
            List<Map<String,Object>> chapters = objectMapper.readValue(details.getBookChaptersJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setBookChapters(chapters);
        }
        if (details.getConferencePresentationJson() != null && !details.getConferencePresentationJson().isEmpty()) {
            List<Map<String,Object>> conferences = objectMapper.readValue(details.getConferencePresentationJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setConferencePresentation(conferences);
        }
        if (details.getBooksAuthoredJson() != null && !details.getBooksAuthoredJson().isEmpty()) {
            List<Map<String,Object>> books = objectMapper.readValue(details.getBooksAuthoredJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setBooksAuthored(books);
        }
        if (details.getPatentsJson() != null && !details.getPatentsJson().isEmpty()) {
            List<Map<String,Object>> patents = objectMapper.readValue(details.getPatentsJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setPatents(patents);
        }
        if (details.getProjectsJson() != null && !details.getProjectsJson().isEmpty()) {
            List<Map<String,Object>> projects = objectMapper.readValue(details.getProjectsJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setProjects(projects);
        }
        if (details.getInvitedTalkJson() != null && !details.getInvitedTalkJson().isEmpty()) {
            List<Map<String,Object>> talks = objectMapper.readValue(details.getInvitedTalkJson(), new TypeReference<List<Map<String,Object>>>(){});
            response.setInvitedTalk(talks);
        }
        if (details.getCustomFieldsJson() != null && !details.getCustomFieldsJson().isEmpty()) {
            Map<String,Object> customFields = objectMapper.readValue(details.getCustomFieldsJson(), new TypeReference<Map<String,Object>>(){});
            response.setCustomFields(customFields);
        }

        return response;
    }
}

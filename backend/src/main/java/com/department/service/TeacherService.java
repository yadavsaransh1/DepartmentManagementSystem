package com.department.service;

import com.department.dto.TeacherDTO;
import com.department.model.Teacher;
import com.department.model.User;
import com.department.repository.TeacherRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class TeacherService {
    private static final Logger logger = Logger.getLogger(TeacherService.class.getName());

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    public List<TeacherDTO> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        List<TeacherDTO> dtos = new ArrayList<>();
        for (Teacher teacher : teachers) {
            dtos.add(teacherToDTO(teacher));
        }
        return dtos;
    }

    public TeacherDTO getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return teacherToDTO(teacher);
    }

    public TeacherDTO getTeacherById(Long teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return teacherToDTO(teacher);
    }

    public void deleteTeacher(Long teacherId) {
        try {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
            // Delete in correct order: teacher first, then user
            String userEmail = teacher.getUser() != null ? teacher.getUser().getEmail() : null;
            
            // Delete teacher first
            teacherRepository.deleteById(teacherId);
            
            // Then delete user
            if (userEmail != null) {
                userRepository.deleteById(userEmail);
            }
            
            logger.info("Teacher deleted successfully: " + teacherId);
        } catch (Exception e) {
            logger.severe("Error deleting teacher: " + e.getMessage());
            throw new RuntimeException("Could not delete teacher: " + e.getMessage());
        }
    }

    public TeacherDTO updateTeacher(Long teacherId, TeacherDTO dto) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        // Update User fields (fullName, email)
        User user = teacher.getUser();
        if (user != null) {
            if (dto.getFullName() != null && !dto.getFullName().isEmpty()) {
                user.setFullName(dto.getFullName());
            }
            
            // Handle email update with duplicate checking
            if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
                String newEmail = dto.getEmail().trim();
                String currentEmail = user.getEmail();
                
                // Only check for duplicates if email is being changed
                if (!newEmail.equals(currentEmail)) {
                    // Check if new email already exists
                    if (userRepository.findByEmail(newEmail).isPresent()) {
                        throw new RuntimeException("Email already in use");
                    }
                    user.setEmail(newEmail);
                }
            }
            
            userRepository.save(user);
        }
        
        // Update Teacher fields
        if (dto.getTeacherId() != null && !dto.getTeacherId().isEmpty()) {
            teacher.setTeacherId(dto.getTeacherId());
        }
        if (dto.getSubject() != null) {
            teacher.setSubject(dto.getSubject());
        }
        if (dto.getDepartment() != null) {
            teacher.setDepartment(dto.getDepartment());
        }
        if (dto.getSpecialization() != null) {
            teacher.setSpecialization(dto.getSpecialization());
        }
        if (dto.getDesignation() != null) {
            teacher.setDesignation(dto.getDesignation());
        }
        if (dto.getDateOfBirth() != null) {
            teacher.setDateOfBirth(dto.getDateOfBirth());
        }
        if (dto.getContactNumber() != null) {
            teacher.setContactNumber(dto.getContactNumber());
        }
        if (dto.getQualification() != null) {
            teacher.setQualification(dto.getQualification());
        }
        if (dto.getCertification() != null) {
            teacher.setCertification(dto.getCertification());
        }
        if (dto.getCustomFields() != null) {
            teacher.setCustomFields(dto.getCustomFields());
        }
        if (dto.getIsHoD() != null) {
            teacher.setIsHoD(dto.getIsHoD());
        }
        if (dto.getAdminPowers() != null) {
            teacher.setAdminPowers(dto.getAdminPowers());
        }
        
        Teacher updated = teacherRepository.save(teacher);
        return teacherToDTO(updated);
    }

    public TeacherDTO updateTeacherSubject(Long teacherId, String subject) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        if (subject == null || subject.trim().isEmpty()) {
            throw new RuntimeException("Subject cannot be empty");
        }
        
        teacher.setSubject(subject);
        Teacher updated = teacherRepository.save(teacher);
        return teacherToDTO(updated);
    }

    private TeacherDTO teacherToDTO(Teacher teacher) {
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setEmail(teacher.getUser().getEmail());
        dto.setFullName(teacher.getUser().getFullName());
        dto.setUserEmail(teacher.getUser().getEmail());  // Changed: Use email instead of ID
        dto.setTeacherId(teacher.getTeacherId());
        dto.setDepartment(teacher.getDepartment());
        dto.setSubject(teacher.getSubject());
        dto.setSpecialization(teacher.getSpecialization());
        dto.setDesignation(teacher.getDesignation());
        dto.setDateOfBirth(teacher.getDateOfBirth());
        dto.setContactNumber(teacher.getContactNumber());
        dto.setQualification(teacher.getQualification());
        dto.setCertification(teacher.getCertification());
        dto.setCustomFields(teacher.getCustomFields());
        dto.setIsHoD(teacher.getIsHoD());
        dto.setAdminPowers(teacher.getAdminPowers());
        return dto;
    }
}

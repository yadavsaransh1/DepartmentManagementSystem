package com.department.service;

import com.department.dto.StudyMaterialDTO;
import com.department.model.StudyMaterial;
import com.department.model.User;
import com.department.model.Student;
import com.department.model.Document;
import com.department.repository.StudyMaterialRepository;
import com.department.repository.UserRepository;
import com.department.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
public class StudyMaterialService {
    private static final Logger logger = Logger.getLogger(StudyMaterialService.class.getName());

    @Autowired
    private StudyMaterialRepository studyMaterialRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    public StudyMaterialDTO uploadStudyMaterial(String title, String description, String category, 
                                                 String otherCategoryValue, String fileName, String fileType, 
                                                 byte[] fileContent, String userEmail, String visibility,
                                                 String allowedRoles, String allowedUserEmails, String allowedCourses) {
        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            StudyMaterial material = new StudyMaterial();
            material.setTitle(title);
            material.setDescription(description);
            material.setCategory(StudyMaterial.StudyMaterialCategory.valueOf(category));
            material.setOtherCategoryValue(otherCategoryValue);
            material.setFilePath(fileName);
            material.setFileSize((long) fileContent.length);
            material.setUploadedBy(user);
            
            if (visibility != null) {
                material.setVisibility(Document.DocumentVisibility.valueOf(visibility));
            }
            
            if (allowedRoles != null) {
                material.setAllowedRoles(allowedRoles);
            }
            if (allowedUserEmails != null) {
                material.setAllowedUserEmails(allowedUserEmails);
            }
            if (allowedCourses != null) {
                material.setAllowedCourses(allowedCourses);
            }

            StudyMaterial saved = studyMaterialRepository.save(material);
            logger.info("Study material uploaded: " + saved.getTitle());
            
            return studyMaterialToDTO(saved);
        } catch (Exception e) {
            logger.severe("Error uploading study material: " + e.getMessage());
            throw new RuntimeException("Failed to upload study material: " + e.getMessage());
        }
    }

    public List<StudyMaterialDTO> getAccessibleStudyMaterials(String userEmail) {
        try {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<StudyMaterial> allMaterials = studyMaterialRepository.findAll();
            List<StudyMaterial> accessibleMaterials = new java.util.ArrayList<>();
            
            for (StudyMaterial material : allMaterials) {
                if (hasAccessToStudyMaterial(material, user)) {
                    accessibleMaterials.add(material);
                }
            }
            
            return accessibleMaterials.stream()
                    .map(this::studyMaterialToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching accessible study materials: " + e.getMessage());
            return List.of();
        }
    }
    
    private boolean hasAccessToStudyMaterial(StudyMaterial material, User user) {
        Document.DocumentVisibility visibility = material.getVisibility();
        
        // PUBLIC: everyone can see
        if (visibility == Document.DocumentVisibility.PUBLIC) {
            return true;
        }
        
        // PRIVATE: only if user is in allowedUserEmails
        if (visibility == Document.DocumentVisibility.PRIVATE) {
            String allowedEmails = material.getAllowedUserEmails();
            if (allowedEmails != null && !allowedEmails.isEmpty()) {
                return Arrays.stream(allowedEmails.split(","))
                    .map(String::trim)
                    .anyMatch(email -> email.equalsIgnoreCase(user.getEmail()));
            }
            return false;
        }
        
        // RESTRICTED: only if user has matching role
        if (visibility == Document.DocumentVisibility.RESTRICTED) {
            String allowedRoles = material.getAllowedRoles();
            if (allowedRoles != null && !allowedRoles.isEmpty()) {
                String userRole = user.getRole() != null ? user.getRole().toString() : "";
                return Arrays.stream(allowedRoles.split(","))
                    .map(String::trim)
                    .anyMatch(role -> role.equals(userRole));
            }
            return false;
        }
        
        // COURSE: student must be enrolled in the course
        if (visibility == Document.DocumentVisibility.COURSE) {
            if (user.getRole() != null && user.getRole().equals(User.UserRole.STUDENT)) {
                return canStudentAccessCourseMaterial(material, user);
            } else if (user.getRole() != null && user.getRole().equals(User.UserRole.TEACHER)) {
                // Teachers can see course materials for their courses (if implemented)
                return true;
            }
            return false;
        }
        
        return false;
    }
    
    private boolean canStudentAccessCourseMaterial(StudyMaterial material, User user) {
        if (material.getAllowedCourses() == null || material.getAllowedCourses().isEmpty()) {
            return true; // If no courses specified, all can access
        }
        
        Optional<Student> studentOpt = studentRepository.findByUserEmail(user.getEmail());
        
        if (!studentOpt.isPresent()) {
            return false;
        }
        
        // Check if student's course:semester is in allowedCourses
        // For now, return true (assuming all students can see course materials)
        return true;
    }

    public List<StudyMaterialDTO> getStudyMaterialsByUser(String userEmail) {
        try {
            List<StudyMaterial> materials = studyMaterialRepository.findByUploadedByEmail(userEmail);
            return materials.stream()
                    .map(this::studyMaterialToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching user study materials: " + e.getMessage());
            return List.of();
        }
    }

    public List<StudyMaterialDTO> getAllPublicStudyMaterials() {
        try {
            List<StudyMaterial> materials = studyMaterialRepository.findByVisibility(Document.DocumentVisibility.PUBLIC);
            return materials.stream()
                    .map(this::studyMaterialToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching public study materials: " + e.getMessage());
            return List.of();
        }
    }

    public StudyMaterialDTO getStudyMaterialById(Long id) {
        try {
            Optional<StudyMaterial> material = studyMaterialRepository.findById(id);
            return material.map(this::studyMaterialToDTO).orElse(null);
        } catch (Exception e) {
            logger.warning("Error fetching study material: " + e.getMessage());
            return null;
        }
    }

    public byte[] downloadStudyMaterial(Long id) {
        try {
            StudyMaterial material = studyMaterialRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));
            
            // Increment download count
            material.setDownloadCount((material.getDownloadCount() != null ? material.getDownloadCount() : 0) + 1);
            studyMaterialRepository.save(material);
            
            // Return file content (assuming it's stored as content in filePath or in a file system)
            // For now, return empty - implement file storage logic as needed
            return new byte[0];
        } catch (Exception e) {
            logger.severe("Error downloading study material: " + e.getMessage());
            throw new RuntimeException("Failed to download study material");
        }
    }

    public void deleteStudyMaterial(Long id) {
        try {
            StudyMaterial material = studyMaterialRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Study material not found"));
            studyMaterialRepository.delete(material);
            logger.info("Study material deleted: " + id);
        } catch (Exception e) {
            logger.severe("Error deleting study material: " + e.getMessage());
            throw new RuntimeException("Failed to delete study material");
        }
    }

    private StudyMaterialDTO studyMaterialToDTO(StudyMaterial material) {
        if (material == null) {
            return null;
        }

        StudyMaterialDTO dto = new StudyMaterialDTO();
        dto.setId(material.getId());
        dto.setTitle(material.getTitle());
        dto.setDescription(material.getDescription());
        dto.setCategory(material.getCategory() != null ? material.getCategory().toString() : "");
        dto.setOtherCategoryValue(material.getOtherCategoryValue());
        dto.setFilePath(material.getFilePath());
        dto.setFileSize(material.getFileSize());
        dto.setUploadedByEmail(material.getUploadedBy() != null ? material.getUploadedBy().getEmail() : "");
        dto.setUploadedByName(material.getUploadedBy() != null ? material.getUploadedBy().getFullName() : "");
        dto.setVisibility(material.getVisibility());
        dto.setAllowedRoles(material.getAllowedRoles());
        dto.setAllowedUserEmails(material.getAllowedUserEmails());
        dto.setAllowedCourses(material.getAllowedCourses());
        dto.setCreatedAt(material.getCreatedAt());
        dto.setUpdatedAt(material.getUpdatedAt());
        dto.setDownloadCount(material.getDownloadCount());

        return dto;
    }
}

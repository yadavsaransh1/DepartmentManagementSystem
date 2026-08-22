package com.department.service;

import com.department.dto.ProjectDocumentDTO;
import com.department.dto.SupervisorAllocationDTO;
import com.department.model.ProjectDocument;
import com.department.model.SupervisorAllocation;
import com.department.model.User;
import com.department.repository.ProjectDocumentRepository;
import com.department.repository.SupervisorAllocationRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private static final Logger logger = Logger.getLogger(ProjectService.class.getName());
    private static final String UPLOAD_DIR = "uploads/projects/";

    @Autowired
    private SupervisorAllocationRepository allocationRepository;

    @Autowired
    private ProjectDocumentRepository projectDocumentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupervisorAllocationService supervisorService;

    // Get student's project info
    public SupervisorAllocationDTO getStudentProject(Long studentId) {
        try {
            SupervisorAllocation allocation = allocationRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("No project allocated to this student"));
            return supervisorService.allocationToDTO(allocation);
        } catch (Exception e) {
            logger.warning("Error fetching student project: " + e.getMessage());
            throw new RuntimeException("Failed to fetch project info");
        }
    }

    // Upload project document
    public ProjectDocumentDTO uploadProjectDocument(Long allocationId, MultipartFile file, String uploadedBy, String documentTitle, String visibility, String userEmail) {
        try {
            SupervisorAllocation allocation = allocationRepository.findById(allocationId)
                    .orElseThrow(() -> new RuntimeException("Allocation not found"));

            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create upload directory if not exists
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Save file with UUID to avoid conflicts
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String filePath = UPLOAD_DIR + fileName;
            Files.write(Paths.get(filePath), file.getBytes());

            // Create and save project document record
            String title = (documentTitle != null && !documentTitle.isEmpty()) ? documentTitle : file.getOriginalFilename();
            ProjectDocument doc = new ProjectDocument(allocation, file.getOriginalFilename(), title, uploadedBy, user);
            doc.setDocumentPath(filePath);
            doc.setFileSize(file.getSize());
            doc.setVisibility(visibility != null ? visibility : "EVERYONE");
            ProjectDocument saved = projectDocumentRepository.save(doc);

            logger.info("Project document uploaded by " + userEmail + " for allocation " + allocationId);
            return projectDocumentToDTO(saved);
        } catch (IOException e) {
            logger.warning("Error uploading project document: " + e.getMessage());
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        } catch (Exception e) {
            logger.warning("Error processing project document upload: " + e.getMessage());
            throw new RuntimeException("Failed to process document upload: " + e.getMessage());
        }
    }

    // Get project documents
    public List<ProjectDocumentDTO> getProjectDocuments(Long allocationId) {
        try {
            return projectDocumentRepository.findByAllocationId(allocationId).stream()
                    .map(this::projectDocumentToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching project documents: " + e.getMessage());
            throw new RuntimeException("Failed to fetch project documents");
        }
    }

    public List<ProjectDocumentDTO> getProjectDocumentsWithVisibility(Long allocationId, String userEmail) {
        try {
            // Check if allocation exists, return empty list if not (graceful fallback)
            if (!allocationRepository.existsById(allocationId)) {
                logger.warning("Allocation not found: " + allocationId);
                return List.of();
            }
            
            SupervisorAllocation allocation = allocationRepository.findById(allocationId)
                    .orElse(null);
            
            if (allocation == null) {
                return List.of();
            }
            
            // Safely access nested objects with null checks
            User studentUser = null;
            if (allocation.getStudent() != null && allocation.getStudent().getUser() != null) {
                studentUser = allocation.getStudent().getUser();
            }
            
            User supervisor = null;
            if (allocation.getTeacher() != null && allocation.getTeacher().getUser() != null) {
                supervisor = allocation.getTeacher().getUser();
            }
            
            // Check if the requesting user is the student or the supervisor
            boolean isStudent = studentUser != null && studentUser.getEmail().equals(userEmail);
            boolean isSupervisor = supervisor != null && supervisor.getEmail().equals(userEmail);
            
            // If user is neither student nor supervisor, return empty list
            if (!isStudent && !isSupervisor) {
                logger.warning("User " + userEmail + " not authorized for allocation " + allocationId);
                return List.of();
            }
            
            // Fetch all documents for this allocation
            List<ProjectDocument> allDocuments = projectDocumentRepository.findByAllocationId(allocationId);
            
            // Filter based on visibility and role
            return allDocuments.stream()
                    .filter(doc -> {
                        if (isSupervisor) {
                            // Supervisors can see all their documents
                            return true;
                        } else if (isStudent) {
                            // Students can see EVERYONE visibility or SPECIFIC_STUDENT (which is them)
                            return "EVERYONE".equals(doc.getVisibility()) || 
                                   "SPECIFIC_STUDENT".equals(doc.getVisibility());
                        }
                        return false; // Other users cannot see documents
                    })
                    .map(this::projectDocumentToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching project documents with visibility: " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Return empty list on error instead of throwing
        }
    }

    // Download project document
    public byte[] downloadProjectDocument(Long documentId) {
        try {
            ProjectDocument doc = projectDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            File file = new File(doc.getDocumentPath());
            if (!file.exists()) {
                throw new RuntimeException("File not found on disk");
            }

            return Files.readAllBytes(Paths.get(doc.getDocumentPath()));
        } catch (IOException e) {
            logger.warning("Error downloading project document: " + e.getMessage());
            throw new RuntimeException("Failed to download document: " + e.getMessage());
        }
    }

    public String getProjectDocumentName(Long documentId) {
        try {
            ProjectDocument doc = projectDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));
            return doc.getDocumentName();
        } catch (Exception e) {
            logger.warning("Error getting project document name: " + e.getMessage());
            return "document";
        }
    }

    // Delete project document
    public void deleteProjectDocument(Long documentId, String userEmail) {
        try {
            ProjectDocument doc = projectDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            // Check if user has permission to delete
            boolean isUploader = doc.getUploadedByUser().getEmail().equals(userEmail);
            
            // Also allow teacher/supervisor to delete documents from their students
            boolean isSupervisor = false;
            if (doc.getAllocation() != null && doc.getAllocation().getTeacher() != null) {
                isSupervisor = doc.getAllocation().getTeacher().getUser().getEmail().equals(userEmail);
            }
            
            if (!isUploader && !isSupervisor) {
                throw new RuntimeException("You don't have permission to delete this document");
            }

            // Delete file from disk
            File file = new File(doc.getDocumentPath());
            if (file.exists()) {
                file.delete();
            }

            // Delete record from database
            projectDocumentRepository.deleteById(documentId);
            logger.info("Project document deleted: " + documentId);
        } catch (Exception e) {
            logger.warning("Error deleting project document: " + e.getMessage());
            throw new RuntimeException("Failed to delete document: " + e.getMessage());
        }
    }

    // Helper method to convert to DTO
    private ProjectDocumentDTO projectDocumentToDTO(ProjectDocument doc) {
        ProjectDocumentDTO dto = new ProjectDocumentDTO();
        dto.setId(doc.getId());
        if (doc.getAllocation() != null) {
            dto.setAllocationId(doc.getAllocation().getId());
        }
        dto.setDocumentName(doc.getDocumentName());
        dto.setDocumentTitle(doc.getDocumentTitle());
        dto.setUploadedBy(doc.getUploadedBy());

        if (doc.getUploadedByUser() != null) {
            dto.setUploadedByUserName(doc.getUploadedByUser().getFullName());
            dto.setUploadedByUserEmail(doc.getUploadedByUser().getEmail());
        }

        dto.setUploadDate(doc.getUploadDate());
        dto.setVisibility(doc.getVisibility());
        return dto;
    }

    // Update project information
    public SupervisorAllocationDTO updateProjectInfo(Long allocationId, String projectTitle, String projectDescription) {
        try {
            SupervisorAllocation allocation = allocationRepository.findById(allocationId)
                    .orElseThrow(() -> new RuntimeException("Allocation not found"));

            allocation.setProjectTitle(projectTitle);
            allocation.setProjectDescription(projectDescription);
            SupervisorAllocation updated = allocationRepository.save(allocation);
            
            logger.info("Project info updated for allocation " + allocationId);
            return supervisorService.allocationToDTO(updated);
        } catch (Exception e) {
            logger.warning("Error updating project info: " + e.getMessage());
            throw new RuntimeException("Failed to update project info: " + e.getMessage());
        }
    }
}

package com.department.controller;

import com.department.dto.ProjectDocumentDTO;
import com.department.dto.ProjectMessageDTO;
import com.department.dto.SupervisorAllocationDTO;
import com.department.service.ProjectService;
import com.department.service.ProjectMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectMessageService messageService;

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupervisorAllocationDTO> getStudentProject(@PathVariable Long studentId) {
        try {
            return ResponseEntity.ok(projectService.getStudentProject(studentId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/documents/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDocumentDTO> uploadProjectDocument(
            @RequestParam Long allocationId,
            @RequestParam String uploadedBy,
            @RequestParam(required = false) String documentTitle,
            @RequestParam(required = false) String visibility,
            @RequestParam("file") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            ProjectDocumentDTO response = projectService.uploadProjectDocument(allocationId, file, uploadedBy, documentTitle, visibility, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{allocationId}/documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectDocumentDTO>> getProjectDocuments(
            @PathVariable Long allocationId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<ProjectDocumentDTO> documents = projectService.getProjectDocumentsWithVisibility(allocationId, userEmail);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            // Return empty list on error instead of 500
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadProjectDocument(@PathVariable Long documentId) {
        try {
            byte[] fileContent = projectService.downloadProjectDocument(documentId);
            String documentName = projectService.getProjectDocumentName(documentId);
            
            // Determine MIME type based on file extension
            String fileName = documentName.toLowerCase();
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            
            if (fileName.endsWith(".pdf")) {
                mediaType = MediaType.APPLICATION_PDF;
            } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
                mediaType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) {
                mediaType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (fileName.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            headers.setContentDispositionFormData("attachment", documentName);
            
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteProjectDocument(@PathVariable Long documentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            projectService.deleteProjectDocument(documentId, authentication.getName());
            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/{allocationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectMessageDTO> sendMessage(
            @PathVariable Long allocationId,
            @RequestBody Map<String, String> payload) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            String messageText = payload.get("messageText");
            String senderRole = payload.get("senderRole");

            if (messageText == null || messageText.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            ProjectMessageDTO response = messageService.sendMessage(allocationId, messageText, senderRole, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{allocationId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ProjectMessageDTO>> getMessages(@PathVariable Long allocationId) {
        try {
            return ResponseEntity.ok(messageService.getMessages(allocationId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{allocationId}/info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SupervisorAllocationDTO> updateProjectInfo(
            @PathVariable Long allocationId,
            @RequestBody Map<String, String> payload) {
        try {
            String projectTitle = payload.get("projectTitle");
            String projectDescription = payload.get("projectDescription");
            
            return ResponseEntity.ok(projectService.updateProjectInfo(allocationId, projectTitle, projectDescription));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

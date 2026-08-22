package com.department.controller;

import com.department.dto.DocumentDTO;
import com.department.dto.MessageDTO;
import com.department.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;
    
    private static final Logger logger = Logger.getLogger(DocumentController.class.getName());

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DocumentDTO> uploadDocument(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam(value = "category", required = false, defaultValue = "OTHER") String category,
            @RequestParam(value = "otherCategoryValue", required = false, defaultValue = "") String otherCategoryValue,
            @RequestParam(value = "visibility", required = false, defaultValue = "PUBLIC") String visibility,
            @RequestParam(value = "allowedRoles", required = false, defaultValue = "") String allowedRoles,
            @RequestParam(value = "allowedUserEmails", required = false, defaultValue = "") String allowedUserEmails,
            @RequestParam(value = "allowedCourses", required = false, defaultValue = "") String allowedCourses,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        Logger logger = Logger.getLogger(DocumentController.class.getName());
        
        // Get authentication from SecurityContext instead of parameter injection
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            logger.warning("Unauthorized document upload attempt - authentication is null or not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String userEmail = authentication.getName();
        logger.info("===== DOCUMENT UPLOAD START =====");
        logger.info("Upload initiated by user: " + userEmail);
        logger.info("Title: " + title);
        logger.info("Visibility: " + visibility);
        logger.info("Category: " + category);
        logger.info("allowedUserEmails RAW PARAMETER: [" + allowedUserEmails + "]");
        logger.info("allowedUserEmails is null: " + (allowedUserEmails == null));
        logger.info("allowedUserEmails is empty: " + (allowedUserEmails != null && allowedUserEmails.isEmpty()));
        logger.info("allowedUserEmails length: " + (allowedUserEmails != null ? allowedUserEmails.length() : "null"));
        
        DocumentDTO dto = new DocumentDTO();
        dto.setDocumentName(title);
        dto.setDescription(description);
        dto.setCategory(category);
        dto.setOtherCategoryValue(otherCategoryValue);
        dto.setVisibility(visibility);
        dto.setAllowedRoles(allowedRoles);
        dto.setAllowedUserIds(allowedUserEmails);  // Store in allowedUserIds (maps to allowedUserEmails in DB)
        dto.setAllowedCourses(allowedCourses);

        logger.info("DTO.getAllowedUserIds() = [" + dto.getAllowedUserIds() + "]");
        DocumentDTO response = documentService.uploadDocument(dto, file.getBytes(), userEmail, file.getOriginalFilename());
        logger.info("After upload, response.getAllowedUserIds() = [" + response.getAllowedUserIds() + "]");
        logger.info("===== DOCUMENT UPLOAD END =====");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        try {
            if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
                // Return documents accessible to the authenticated user
                return ResponseEntity.ok(documentService.getAccessibleDocuments(authentication.getName()));
            } else {
                // Anonymous users only see public documents
                return ResponseEntity.ok(documentService.getPublicDocuments());
            }
        } catch (Exception e) {
            System.err.println("Error in getAllDocuments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<DocumentDTO>> getPublicDocuments() {
        return ResponseEntity.ok(documentService.getPublicDocuments());
    }

    @GetMapping("/my-documents")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentDTO>> getUserDocuments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new java.util.ArrayList<>());
        }
        return ResponseEntity.ok(documentService.getUserDocuments(authentication.getName()));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.getDocumentById(documentId));
    }

    @GetMapping("/{documentId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            // Check if user has access to this document
            DocumentDTO docDto = documentService.getDocumentById(documentId);
            byte[] fileContent = documentService.downloadDocument(documentId, authentication.getName());
            
            // Determine MIME type based on file extension from stored filePath
            String filePath = docDto.getFilePath().toLowerCase();
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            
            if (filePath.endsWith(".pdf")) {
                mediaType = MediaType.APPLICATION_PDF;
            } else if (filePath.endsWith(".doc") || filePath.endsWith(".docx")) {
                mediaType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (filePath.endsWith(".xls") || filePath.endsWith(".xlsx")) {
                mediaType = MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
                mediaType = MediaType.IMAGE_JPEG;
            } else if (filePath.endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(mediaType);
            // Extract original filename and preserve extension
            String downloadFileName = docDto.getDocumentName();
            if (filePath.lastIndexOf(".") > 0) {
                String extension = filePath.substring(filePath.lastIndexOf("."));
                downloadFileName = downloadFileName + extension;
            }
            headers.setContentDispositionFormData("attachment", downloadFileName);
            
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageDTO("Unauthorized: No valid authentication token."));
        }
        documentService.deleteDocument(documentId, authentication.getName());
        return ResponseEntity.ok(new MessageDTO("Document deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDocuments(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) String email) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        logger.info("=== DOCUMENT SEARCH ===");
        logger.info("Email param: " + email);
        logger.info("Keyword param: " + keyword);
        logger.info("Authenticated user: " + (authentication != null ? authentication.getName() : "null"));
        
        // If email parameter provided (admin filtering), use that email to get documents
        if (email != null && !email.isEmpty()) {
            logger.info("Fetching documents FOR specific email: " + email);
            List<DocumentDTO> docs = documentService.getAccessibleDocuments(email);
            logger.info("Returned " + docs.size() + " documents for " + email);
            return ResponseEntity.ok(docs);
        }
        
        if (keyword == null || keyword.isEmpty()) {
            // If no keyword provided, return all accessible documents for logged-in user
            if (authentication != null && authentication.isAuthenticated()) {
                logger.info("Fetching documents for logged-in user: " + authentication.getName());
                return ResponseEntity.ok(documentService.getAccessibleDocuments(authentication.getName()));
            } else {
                return ResponseEntity.ok(documentService.getPublicDocuments());
            }
        }
        
        // If keyword provided, search for documents
        DocumentDTO result = documentService.searchDocuments(keyword);
        if (result != null) {
            return ResponseEntity.ok(java.util.Arrays.asList(result));
        }
        return ResponseEntity.ok(new java.util.ArrayList<>());
    }

    @GetMapping("/category/routine")
    public ResponseEntity<List<DocumentDTO>> getRoutineDocuments() {
        return ResponseEntity.ok(documentService.getDocumentsByCategory("ROUTINE"));
    }
}


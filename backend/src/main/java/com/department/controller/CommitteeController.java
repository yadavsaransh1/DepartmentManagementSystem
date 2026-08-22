package com.department.controller;

import com.department.dto.*;
import com.department.model.CommitteeDocument;
import com.department.service.CommitteeService;
import com.department.service.TeacherPowerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/committees")
public class CommitteeController {
    @Autowired
    private CommitteeService committeeService;

    @Autowired
    private TeacherPowerService teacherPowerService;

    @Autowired
    private ObjectMapper objectMapper;
    
    private String getAuthenticatedUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return null;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));
    }

    private boolean hasCommitteeAccess() {
        String userEmail = getAuthenticatedUserEmail();
        if (userEmail == null) {
            return false;
        }
        
        // Check if admin
        if (isAdmin()) {
            return true;
        }
        
        // Check if has canAccessCommittee power
        try {
            TeacherPowerDTO powers = teacherPowerService.getTeacherPowers(userEmail);
            return powers != null && Boolean.TRUE.equals(powers.getCanAccessCommittee());
        } catch (Exception e) {
            logger.warning("Error checking committee access for " + userEmail + ": " + e.getMessage());
            return false;
        }
    }

    private static final Logger logger = Logger.getLogger(CommitteeController.class.getName());
    private static final String UPLOAD_DIR = "uploads/committees/";

    // ======================== COMMITTEE MANAGEMENT (ADMIN) ========================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCommittee(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<String> memberEmails,
            @RequestParam(required = false) Map<String, String> memberRoles,
            @RequestParam(required = false) String memberRolesJson) {
        try {
            String userEmail = getAuthenticatedUserEmail();
            if (userEmail == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }
            
            // Use provided roles or set defaults
            Map<String, String> roles = new HashMap<>();
            Map<String, List<String>> memberPowers = new HashMap<>();
            
            // Parse memberRolesJson if provided, otherwise use memberRoles map
            if (memberRolesJson != null && !memberRolesJson.isEmpty()) {
                try {
                    roles = objectMapper.readValue(memberRolesJson, new com.fasterxml.jackson.core.type.TypeReference<Map<String, String>>() {});
                } catch (Exception e) {
                    logger.warning("Could not parse memberRolesJson: " + e.getMessage());
                }
            } else if (memberRoles != null && !memberRoles.isEmpty()) {
                roles.putAll(memberRoles);
            }
            
            // Ensure all members have a role (default to "Member" if not provided)
            if (memberEmails != null) {
                for (String email : memberEmails) {
                    if (!roles.containsKey(email)) {
                        roles.put(email, "Member");
                    }
                }
            }

            CommitteeDTO committee = committeeService.createCommittee(
                name, description, userEmail, memberEmails, roles, memberPowers);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(committee);
        } catch (Exception e) {
            logger.severe("Error creating committee: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCommittees() {
        try {
            // Check authorization: allow ADMIN or users with canAccessCommittee power
            if (!hasCommitteeAccess()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied. You don't have committee access permission."));
            }
            
            List<CommitteeDTO> committees = committeeService.getAllCommittees();
            // Sort by newest first
            committees.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            return ResponseEntity.ok(committees);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommitteeById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(committeeService.getCommitteeById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCommittee(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        try {
            CommitteeDTO updated = committeeService.updateCommittee(id, name, description);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCommittee(@PathVariable Long id) {
        try {
            committeeService.deleteCommittee(id);
            return ResponseEntity.ok(Map.of("message", "Committee deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== MEMBER MANAGEMENT ========================

    @PostMapping("/{committeeId}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addMember(
            @PathVariable Long committeeId,
            @RequestParam String teacherEmail,
            @RequestParam(required = false, defaultValue = "Member") String role,
            @RequestParam(required = false) List<String> powers) {
        try {
            CommitteeMemberDTO member = committeeService.addMemberToCommittee(committeeId, teacherEmail, role, powers);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{committeeId}/members")
    public ResponseEntity<?> getCommitteeMembers(@PathVariable Long committeeId) {
        try {
            return ResponseEntity.ok(committeeService.getCommitteeMembers(committeeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{committeeId}/members/{teacherEmail}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMemberRole(
            @PathVariable Long committeeId,
            @PathVariable String teacherEmail,
            @RequestParam String newRole) {
        try {
            CommitteeMemberDTO updated = committeeService.updateMemberRole(committeeId, teacherEmail, newRole);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{committeeId}/members/{teacherEmail}/powers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMemberPowers(
            @PathVariable Long committeeId,
            @PathVariable String teacherEmail,
            @RequestBody List<String> powers) {
        try {
            CommitteeMemberDTO updated = committeeService.updateMemberPowers(committeeId, teacherEmail, powers);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{committeeId}/members/{teacherEmail}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeMember(
            @PathVariable Long committeeId,
            @PathVariable String teacherEmail) {
        try {
            committeeService.removeMemberFromCommittee(committeeId, teacherEmail);
            return ResponseEntity.ok(Map.of("message", "Member removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== TEACHER OPERATIONS ========================

    @GetMapping("/my-committees")
    public ResponseEntity<?> getMyCommittees() {
        try {
            String userEmail = getAuthenticatedUserEmail();
            if (userEmail == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }
            return ResponseEntity.ok(committeeService.getCommitteesByTeacher(userEmail));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== MESSAGING ========================

    @PostMapping("/{committeeId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long committeeId,
            @RequestBody Map<String, String> payload) {
        try {
            String userEmail = getAuthenticatedUserEmail();
            if (userEmail == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }
            String messageText = payload.get("messageText");
            CommitteeMessageDTO message = committeeService.sendMessage(committeeId, userEmail, messageText);
            return ResponseEntity.status(HttpStatus.CREATED).body(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{committeeId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long committeeId) {
        try {
            return ResponseEntity.ok(committeeService.getCommitteeMessages(committeeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<?> deleteMessage(
            @PathVariable Long messageId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        try {
            committeeService.deleteMessage(messageId);
            return ResponseEntity.ok(Map.of("message", "Message deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== DOCUMENT MANAGEMENT ========================

    @PostMapping("/{committeeId}/documents/upload")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long committeeId,
            @RequestParam String documentName,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file) {
        try {
            String userEmail = getAuthenticatedUserEmail();
            if (userEmail == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not authenticated"));
            }
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }

            // Create uploads directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR + committeeId);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Save file with unique name
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            String filePath = UPLOAD_DIR + committeeId + "/" + fileName;
            Files.write(Paths.get(filePath), file.getBytes());

            // Store the original filename with extension (not just the user-provided name)
            String originalFileName = file.getOriginalFilename();
            // Add user-provided name as prefix if it's different from original filename
            String storedFileName = documentName;
            if (!documentName.isEmpty() && !documentName.equalsIgnoreCase(originalFileName)) {
                // Combine user name with original extension
                int lastDot = originalFileName.lastIndexOf(".");
                String extension = (lastDot > 0) ? originalFileName.substring(lastDot) : "";
                storedFileName = documentName + extension;
            } else if (documentName.isEmpty()) {
                // Use original filename if no user name provided
                storedFileName = originalFileName;
            }

            CommitteeDocumentDTO document = committeeService.uploadDocument(
                committeeId, storedFileName, filePath, documentType, userEmail, description, file.getSize());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
        } catch (Exception e) {
            logger.severe("Error uploading document: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{committeeId}/documents")
    public ResponseEntity<?> getDocuments(@PathVariable Long committeeId) {
        try {
            return ResponseEntity.ok(committeeService.getCommitteeDocuments(committeeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        try {
            CommitteeDocument document = committeeService.getDocument(documentId);
            if (document == null) {
                return ResponseEntity.notFound().build();
            }

            File file = new File(document.getFilePath());
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(Paths.get(document.getFilePath()));
            String fileName = document.getDocumentName();
            String fileNameLower = fileName.toLowerCase();
            
            // Determine content type based on file extension (case-insensitive)
            String contentType = "application/octet-stream";
            
            if (fileNameLower.endsWith(".pdf")) {
                contentType = "application/pdf";
            } else if (fileNameLower.endsWith(".txt")) {
                contentType = "text/plain";
            } else if (fileNameLower.endsWith(".doc")) {
                contentType = "application/msword";
            } else if (fileNameLower.endsWith(".docx")) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            } else if (fileNameLower.endsWith(".xls")) {
                contentType = "application/vnd.ms-excel";
            } else if (fileNameLower.endsWith(".xlsx")) {
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (fileNameLower.endsWith(".ppt")) {
                contentType = "application/vnd.ms-powerpoint";
            } else if (fileNameLower.endsWith(".pptx")) {
                contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (fileNameLower.endsWith(".png")) {
                contentType = "image/png";
            } else if (fileNameLower.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (fileNameLower.endsWith(".zip")) {
                contentType = "application/zip";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", fileName);
            headers.setContentLength(fileContent.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (Exception e) {
            logger.severe("Error downloading document: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            committeeService.deleteDocument(documentId);
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ======================== POWERS & CONFIGURATION ========================

    @GetMapping("/powers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAvailablePowers() {
        try {
            return ResponseEntity.ok(committeeService.getAvailablePowers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

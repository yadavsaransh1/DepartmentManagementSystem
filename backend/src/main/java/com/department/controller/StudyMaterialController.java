package com.department.controller;

import com.department.dto.StudyMaterialDTO;
import com.department.service.StudyMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/study-materials")

public class StudyMaterialController {

    @Autowired
    private StudyMaterialService studyMaterialService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyMaterialDTO> uploadStudyMaterial(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("category") String category,
            @RequestParam(value = "otherCategoryValue", required = false, defaultValue = "") String otherCategoryValue,
            @RequestParam(value = "visibility", defaultValue = "PUBLIC") String visibility,
            @RequestParam(value = "allowedRoles", required = false) String allowedRoles,
            @RequestParam(value = "allowedUserEmails", required = false) String allowedUserEmails,
            @RequestParam(value = "allowedCourses", required = false) String allowedCourses,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String userEmail = authentication.getName();
        StudyMaterialDTO dto = studyMaterialService.uploadStudyMaterial(
            title,
            description,
            category,
            otherCategoryValue,
            file.getOriginalFilename(),
            file.getContentType(),
            file.getBytes(),
            userEmail,
            visibility,
            allowedRoles,
            allowedUserEmails,
            allowedCourses
        );
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<StudyMaterialDTO>> getStudyMaterials() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            // Return all public study materials
            List<StudyMaterialDTO> materials = studyMaterialService.getAllPublicStudyMaterials();
            return ResponseEntity.ok(materials);
        }
        
        String userEmail = authentication.getName();
        List<StudyMaterialDTO> materials = studyMaterialService.getAccessibleStudyMaterials(userEmail);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/my-materials")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyMaterialDTO>> getMyStudyMaterials() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        List<StudyMaterialDTO> materials = studyMaterialService.getStudyMaterialsByUser(userEmail);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyMaterialDTO> getStudyMaterialById(@PathVariable Long id) {
        StudyMaterialDTO dto = studyMaterialService.getStudyMaterialById(id);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.status(404).build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadStudyMaterial(@PathVariable Long id) {
        try {
            byte[] fileContent = studyMaterialService.downloadStudyMaterial(id);
            StudyMaterialDTO dto = studyMaterialService.getStudyMaterialById(id);
            
            if (dto == null) {
                return ResponseEntity.status(404).build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", dto.getFilePath());
            
            return new ResponseEntity<>(fileContent, headers, 200);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteStudyMaterial(@PathVariable Long id) {
        try {
            studyMaterialService.deleteStudyMaterial(id);
            return ResponseEntity.ok(new com.department.dto.MessageDTO("Study material deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new com.department.dto.MessageDTO("Study material not found"));
        }
    }
}

package com.department.controller;

import com.department.dto.SyllabusDTO;
import com.department.service.SyllabusService;
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
@RequestMapping("/api/syllabus")
public class SyllabusController {

    @Autowired
    private SyllabusService syllabusService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SyllabusDTO> uploadSyllabus(
            @RequestParam("subjectId") Long subjectId,
            @RequestParam("program") String program,
            @RequestParam("semester") String semester,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("file") MultipartFile file) throws IOException {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        
        String userEmail = authentication.getName();
        SyllabusDTO dto = syllabusService.uploadSyllabus(
            subjectId,
            program,
            semester,
            file.getOriginalFilename(),
            file.getContentType(),
            file.getBytes(),
            userEmail,
            description
        );
        
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{syllabusId}")
    public ResponseEntity<SyllabusDTO> getSyllabusById(@PathVariable Long syllabusId) {
        SyllabusDTO dto = syllabusService.getSyllabusById(syllabusId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{syllabusId}/download")
    public ResponseEntity<byte[]> downloadSyllabus(@PathVariable Long syllabusId) {
        try {
            byte[] fileContent = syllabusService.downloadSyllabus(syllabusId);
            SyllabusDTO dto = syllabusService.getSyllabusById(syllabusId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", dto.getFileName());
            
            return new ResponseEntity<>(fileContent, headers, 200);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<SyllabusDTO>> getSyllabusBySubject(@PathVariable Long subjectId) {
        List<SyllabusDTO> dtos = syllabusService.getSyllabusBySubject(subjectId);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/subject/{subjectId}/program/{program}/semester/{semester}")
    public ResponseEntity<SyllabusDTO> getSyllabusBySubjectAndDetails(
            @PathVariable Long subjectId,
            @PathVariable String program,
            @PathVariable String semester) {
        try {
            // Normalize semester - convert to string if needed
            String normalizedSemester = semester.trim();
            SyllabusDTO dto = syllabusService.getSyllabusBySubjectAndDetails(subjectId, program, normalizedSemester);
            if (dto != null) {
                return ResponseEntity.ok(dto);
            }
            // Return empty DTO instead of 404 to avoid frontend errors
            return ResponseEntity.ok(new SyllabusDTO());
        } catch (Exception e) {
            // Return empty DTO with graceful handling
            return ResponseEntity.ok(new SyllabusDTO());
        }
    }

    @GetMapping("/program/{program}")
    public ResponseEntity<List<SyllabusDTO>> getSyllabusByProgram(@PathVariable String program) {
        List<SyllabusDTO> dtos = syllabusService.getSyllabusByProgram(program);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SyllabusDTO>> getAllSyllabi() {
        try {
            List<SyllabusDTO> dtos = syllabusService.getAllSyllabi();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Error in getAllSyllabi: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @DeleteMapping("/{syllabusId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteSyllabus(@PathVariable Long syllabusId) {
        try {
            syllabusService.deleteSyllabus(syllabusId);
            return ResponseEntity.ok(new com.department.dto.MessageDTO("Syllabus deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(new com.department.dto.MessageDTO("Syllabus not found"));
        }
    }
}

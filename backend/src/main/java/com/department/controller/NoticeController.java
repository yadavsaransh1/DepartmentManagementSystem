package com.department.controller;

import com.department.dto.NoticeDTO;
import com.department.model.Notice;
import com.department.service.NoticeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {
    
    @Autowired
    private NoticeService noticeService;
    
    // Public endpoint: Get all active notices
    @GetMapping("/all")
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        try {
            List<NoticeDTO> notices = noticeService.getAllActiveNotices();
            return ResponseEntity.ok(notices);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Public endpoint: Get notices by tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<NoticeDTO>> getNoticesByTag(@PathVariable String tag) {
        try {
            List<NoticeDTO> notices = noticeService.getNoticesByTag(tag);
            return ResponseEntity.ok(notices);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Public endpoint: Download PDF
    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadNoticePdf(@PathVariable Long id) {
        try {
            Notice notice = noticeService.getNoticeById(id);
            
            if (notice.getPdfContent() == null || notice.getPdfContent().length == 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "PDF not found");
                return ResponseEntity.status(404).body(error);
            }
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + notice.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .body(notice.getPdfContent());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error downloading PDF: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Admin endpoint: Upload new notice
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadNotice(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (file == null || file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No file provided");
                return ResponseEntity.status(400).body(error);
            }
            
            if (!file.getContentType().equals("application/pdf")) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Only PDF files are allowed");
                return ResponseEntity.status(400).body(error);
            }
            
            // Extract email from token (basic implementation)
            String uploadedBy = "admin@university.com"; // This should be extracted from JWT token
            byte[] pdfContent = file.getBytes();
            String fileName = file.getOriginalFilename();
            
            NoticeDTO notice = noticeService.createNotice(title, pdfContent, fileName, tag, uploadedBy);
            return ResponseEntity.ok(notice);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error uploading notice: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Admin endpoint: Update notice
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateNotice(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "tag", required = false) String tag) {
        try {
            NoticeDTO notice = noticeService.updateNotice(id, title, tag, "admin@university.com");
            return ResponseEntity.ok(notice);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating notice: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Admin endpoint: Delete notice
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNotice(@PathVariable Long id) {
        try {
            noticeService.deleteNotice(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notice deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting notice: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    // Admin endpoint: Toggle notice status
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleNoticeStatus(@PathVariable Long id) {
        try {
            NoticeDTO notice = noticeService.toggleNoticeStatus(id);
            return ResponseEntity.ok(notice);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error toggling notice status: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}

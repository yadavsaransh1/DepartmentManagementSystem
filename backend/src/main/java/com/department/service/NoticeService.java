package com.department.service;

import com.department.model.Notice;
import com.department.dto.NoticeDTO;
import com.department.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NoticeService {
    
    @Autowired
    private NoticeRepository noticeRepository;
    
    // Create a new notice
    public NoticeDTO createNotice(String title, byte[] pdfContent, String fileName, String tag, String uploadedBy) {
        try {
            Notice notice = new Notice();
            notice.setTitle(title);
            notice.setPdfContent(pdfContent);
            notice.setFileName(fileName);
            notice.setTag(tag != null && !tag.isEmpty() ? tag : null);
            notice.setUploadedBy(uploadedBy);
            notice.setIsActive(true);
            
            Notice saved = noticeRepository.save(notice);
            return convertToDTO(saved);
        } catch (Exception e) {
            throw new RuntimeException("Error creating notice: " + e.getMessage());
        }
    }
    
    // Get all active notices (most recent first)
    public List<NoticeDTO> getAllActiveNotices() {
        try {
            return noticeRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching notices: " + e.getMessage());
        }
    }
    
    // Get notices by tag
    public List<NoticeDTO> getNoticesByTag(String tag) {
        try {
            return noticeRepository.findByIsActiveTrueAndTagOrderByCreatedAtDesc(tag)
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching notices by tag: " + e.getMessage());
        }
    }
    
    // Get notice PDF content for download
    public Notice getNoticeById(Long id) {
        try {
            Optional<Notice> notice = noticeRepository.findById(id);
            if (notice.isPresent()) {
                return notice.get();
            }
            throw new RuntimeException("Notice not found with ID: " + id);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching notice: " + e.getMessage());
        }
    }
    
    // Update notice
    public NoticeDTO updateNotice(Long id, String title, String tag, String uploadedBy) {
        try {
            Optional<Notice> existing = noticeRepository.findById(id);
            if (existing.isPresent()) {
                Notice notice = existing.get();
                if (title != null && !title.isEmpty()) {
                    notice.setTitle(title);
                }
                if (tag != null) {
                    notice.setTag(!tag.isEmpty() ? tag : null);
                }
                notice.setUpdatedAt(LocalDateTime.now());
                
                Notice updated = noticeRepository.save(notice);
                return convertToDTO(updated);
            }
            throw new RuntimeException("Notice not found");
        } catch (Exception e) {
            throw new RuntimeException("Error updating notice: " + e.getMessage());
        }
    }
    
    // Delete notice
    public void deleteNotice(Long id) {
        try {
            noticeRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting notice: " + e.getMessage());
        }
    }
    
    // Toggle notice active status
    public NoticeDTO toggleNoticeStatus(Long id) {
        try {
            Optional<Notice> existing = noticeRepository.findById(id);
            if (existing.isPresent()) {
                Notice notice = existing.get();
                notice.setIsActive(!notice.getIsActive());
                notice.setUpdatedAt(LocalDateTime.now());
                
                Notice updated = noticeRepository.save(notice);
                return convertToDTO(updated);
            }
            throw new RuntimeException("Notice not found");
        } catch (Exception e) {
            throw new RuntimeException("Error toggling notice status: " + e.getMessage());
        }
    }
    
    // Helper method to convert Notice to DTO (without PDF content)
    private NoticeDTO convertToDTO(Notice notice) {
        return new NoticeDTO(
                notice.getId(),
                notice.getTitle(),
                notice.getFileName(),
                notice.getTag(),
                notice.getCreatedAt(),
                notice.getUploadedBy(),
                notice.getIsActive()
        );
    }
}

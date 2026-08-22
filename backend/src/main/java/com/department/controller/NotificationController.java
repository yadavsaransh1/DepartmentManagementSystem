package com.department.controller;

import com.department.dto.NotificationDTO;
import com.department.service.NotificationService;
import com.department.service.NotificationReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationReplyService notificationReplyService;

    @Autowired
    private com.department.repository.TeacherRepository teacherRepository;

    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> createNotification(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("createdByEmail") String createdByEmail,
            @RequestParam("visibility") String visibility,
            @RequestParam(required = false) String allowedRoles,
            @RequestParam(required = false) String allowedUserEmails) {
        try {
            NotificationDTO notificationDTO = notificationService.createNotification(
                    title, content, createdByEmail, visibility, allowedRoles, allowedUserEmails);
            return ResponseEntity.ok(notificationDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/visible/{userIdentifier}")
    public ResponseEntity<List<NotificationDTO>> getVisibleNotifications(@PathVariable String userIdentifier) {
        try {
            String userEmail = userIdentifier;
            if (!userIdentifier.contains("@")) {
                // Try to interpret as numeric teacher id and resolve email
                try {
                    Long teacherId = Long.parseLong(userIdentifier);
                    com.department.model.Teacher teacher = teacherRepository.findById(teacherId)
                            .orElseThrow(() -> new RuntimeException("Teacher not found"));
                    if (teacher.getUser() == null || teacher.getUser().getEmail() == null) {
                        throw new RuntimeException("Teacher has no linked user email");
                    }
                    userEmail = teacher.getUser().getEmail();
                } catch (NumberFormatException ignored) {
                    // leave as identifier (could be username-like)
                }
            }
            List<NotificationDTO> notifications = notificationService.getVisibleNotifications(userEmail);
            return ResponseEntity.ok(notifications);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/all-active")
    public ResponseEntity<List<NotificationDTO>> getAllActiveNotifications() {
        List<NotificationDTO> notifications = notificationService.getAllActiveNotifications();
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/created-by/{createdById}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByCreator(@PathVariable Long createdById) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByCreator(createdById);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationDTO> getNotificationDetails(@PathVariable Long notificationId) {
        try {
            NotificationDTO notificationDTO = notificationService.getNotificationDetails(notificationId);
            return ResponseEntity.ok(notificationDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{notificationId}/reply-count")
    public ResponseEntity<Integer> getReplyCount(@PathVariable Long notificationId) {
        try {
            int count = notificationReplyService.getReplyCount(notificationId);
            return ResponseEntity.ok(count);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{notificationId}")
    public ResponseEntity<NotificationDTO> updateNotification(
            @PathVariable Long notificationId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) String visibility,
            @RequestParam(required = false) String allowedRoles,
            @RequestParam(required = false) String allowedUserEmails) {
        try {
            NotificationDTO updatedNotification = notificationService.updateNotification(
                    notificationId, title, content, visibility, allowedRoles, allowedUserEmails);
            return ResponseEntity.ok(updatedNotification);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/{notificationId}/deactivate")
    public ResponseEntity<NotificationDTO> deactivateNotification(@PathVariable Long notificationId) {
        try {
            NotificationDTO notification = notificationService.deactivateNotification(notificationId);
            return ResponseEntity.ok(notification);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        if (notificationService.deleteNotification(notificationId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}

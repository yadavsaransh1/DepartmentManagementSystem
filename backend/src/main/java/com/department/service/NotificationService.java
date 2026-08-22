package com.department.service;

import com.department.dto.NotificationDTO;
import com.department.model.Notification;
import com.department.model.User;
import com.department.repository.NotificationRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

        public NotificationDTO createNotification(String title, String content, String createdByEmail,
                              String visibility, String allowedRoles, String allowedUserEmails) {
        User creator = userRepository.findById(createdByEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setContent(content);
        notification.setCreatedBy(creator);
        
        // Convert string visibility to enum
        try {
            notification.setVisibility(Notification.VisibilityType.valueOf(visibility.toUpperCase()));
        } catch (IllegalArgumentException e) {
            notification.setVisibility(Notification.VisibilityType.PUBLIC);
        }
        
        notification.setAllowedRoles(allowedRoles);
        notification.setAllowedUserIds(allowedUserEmails);
        notification.setIsActive(true);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setUpdatedAt(LocalDateTime.now());

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    public List<NotificationDTO> getVisibleNotifications(String userEmail) {
        // Get user to determine their role
        User user = userRepository.findById(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userRole = user.getRole().toString();
        List<Notification> allActiveNotifs = notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc();

        List<NotificationDTO> visibleNotifications = new ArrayList<>();

        for (Notification notif : allActiveNotifs) {
            if (isNotificationVisible(notif, userEmail, userRole)) {
                visibleNotifications.add(convertToDTO(notif));
            }
        }

        return visibleNotifications;
    }

    public List<NotificationDTO> getAllActiveNotifications() {
        return notificationRepository.findByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("deprecation")
    public List<NotificationDTO> getNotificationsByCreator(Long createdById) {
        return notificationRepository.findByCreatedByIdOrderByCreatedAtDesc(createdById).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO getNotificationDetails(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return convertToDTO(notification);
    }

    public boolean deleteNotification(Long notificationId) {
        if (notificationRepository.existsById(notificationId)) {
            notificationRepository.deleteById(notificationId);
            return true;
        }
        return false;
    }

    public NotificationDTO deactivateNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setIsActive(false);
        notification.setUpdatedAt(LocalDateTime.now());

        Notification updated = notificationRepository.save(notification);
        return convertToDTO(updated);
    }

    public NotificationDTO updateNotification(Long notificationId, String title, String content,
                                             String visibility, String allowedRoles, String allowedUserEmails) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (title != null) notification.setTitle(title);
        if (content != null) notification.setContent(content);
        if (visibility != null) {
            try {
                notification.setVisibility(Notification.VisibilityType.valueOf(visibility.toUpperCase()));
            } catch (IllegalArgumentException e) {
                notification.setVisibility(Notification.VisibilityType.PUBLIC);
            }
        }
        if (allowedRoles != null) notification.setAllowedRoles(allowedRoles);
        if (allowedUserEmails != null) notification.setAllowedUserIds(allowedUserEmails);
        notification.setUpdatedAt(LocalDateTime.now());

        Notification updated = notificationRepository.save(notification);
        return convertToDTO(updated);
    }

    private boolean isNotificationVisible(Notification notification, String userEmail, String userRole) {
        Notification.VisibilityType visibility = notification.getVisibility();

        if (Notification.VisibilityType.PUBLIC.equals(visibility)) {
            return true;
        } else if (Notification.VisibilityType.RESTRICTED.equals(visibility)) {
            if (notification.getAllowedRoles() == null || notification.getAllowedRoles().isEmpty()) {
                return false;
            }
            String[] roles = notification.getAllowedRoles().split(",");
            return Arrays.stream(roles)
                    .map(String::trim)
                    .anyMatch(role -> role.equalsIgnoreCase(userRole));
        } else if (Notification.VisibilityType.PRIVATE.equals(visibility)) {
            if (notification.getAllowedUserEmails() == null || notification.getAllowedUserEmails().isEmpty()) {
                return false;
            }
            User user = userRepository.findById(userEmail).orElse(null);
            if (user == null) {
                return false;
            }
            String[] allowedEmails = notification.getAllowedUserEmails().split(",");
            return Arrays.stream(allowedEmails)
                    .map(String::trim)
                    .anyMatch(email -> email.equalsIgnoreCase(user.getEmail()));
        }

        return false;
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setCreatedByEmail(notification.getCreatedBy().getEmail());
        dto.setCreatedByName(notification.getCreatedBy().getFullName());
        dto.setVisibility(notification.getVisibility().toString());
        dto.setAllowedRoles(notification.getAllowedRoles());
        dto.setAllowedUserIds(notification.getAllowedUserIds());
        dto.setIsActive(notification.getIsActive());

        // Parse comma-separated strings into lists for convenience
        if (notification.getAllowedRoles() != null && !notification.getAllowedRoles().isEmpty()) {
            dto.setAllowedRolesList(
                    Arrays.stream(notification.getAllowedRoles().split(","))
                            .map(String::trim)
                            .collect(Collectors.toList())
            );
        }

        if (notification.getAllowedUserIds() != null && !notification.getAllowedUserIds().isEmpty()) {
            dto.setAllowedUserIdsList(
                    Arrays.stream(notification.getAllowedUserIds().split(","))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList())
            );
        }

        if (notification.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            dto.setCreatedAt(notification.getCreatedAt().format(formatter));
        }

        return dto;
    }
}

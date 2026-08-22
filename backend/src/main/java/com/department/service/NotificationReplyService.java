package com.department.service;

import com.department.dto.NotificationReplyDTO;
import com.department.model.Notification;
import com.department.model.NotificationReply;
import com.department.model.User;
import com.department.repository.NotificationReplyRepository;
import com.department.repository.NotificationRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationReplyService {

    @Autowired
    private NotificationReplyRepository notificationReplyRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

        public NotificationReplyDTO createReply(Long notificationId, String repliedByEmail, String replyContent) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));

        User replier = userRepository.findById(repliedByEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        NotificationReply reply = new NotificationReply();
        reply.setNotification(notification);
        reply.setRepliedBy(replier);
        reply.setReplyContent(replyContent);
        reply.setCreatedAt(LocalDateTime.now());

        NotificationReply savedReply = notificationReplyRepository.save(reply);
        return convertToDTO(savedReply);
    }

    public List<NotificationReplyDTO> getRepliesByNotification(Long notificationId) {
        // Verify notification exists
        notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        return notificationReplyRepository.findByNotificationIdOrderByCreatedAtDesc(notificationId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("deprecation")
    public List<NotificationReplyDTO> getRepliesByUser(Long userId) {
        return notificationReplyRepository.findByRepliedByIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NotificationReplyDTO getReplyDetails(Long replyId) {
        NotificationReply reply = notificationReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        return convertToDTO(reply);
    }

    public int getReplyCount(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new RuntimeException("Notification not found");
        }

        return notificationReplyRepository.findByNotificationIdOrderByCreatedAtDesc(notificationId).size();
    }

    public boolean deleteReply(Long replyId) {
        if (notificationReplyRepository.existsById(replyId)) {
            notificationReplyRepository.deleteById(replyId);
            return true;
        }
        return false;
    }

    private NotificationReplyDTO convertToDTO(NotificationReply reply) {
        NotificationReplyDTO dto = new NotificationReplyDTO();
        dto.setId(reply.getId());
        dto.setNotificationId(reply.getNotification().getId());
        dto.setRepliedByEmail(reply.getRepliedBy().getEmail());
        dto.setRepliedByName(reply.getRepliedBy().getFullName());
        dto.setRepliedByRole(reply.getRepliedBy().getRole().toString());
        dto.setReplyContent(reply.getReplyContent());

        if (reply.getCreatedAt() != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            dto.setCreatedAt(reply.getCreatedAt().format(formatter));
        }

        return dto;
    }
}

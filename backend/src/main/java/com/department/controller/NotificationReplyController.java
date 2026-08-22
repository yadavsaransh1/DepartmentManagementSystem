package com.department.controller;

import com.department.dto.NotificationReplyDTO;
import com.department.service.NotificationReplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification-replies")
public class NotificationReplyController {

    @Autowired
    private NotificationReplyService notificationReplyService;

    @PostMapping("/create")
    public ResponseEntity<NotificationReplyDTO> createReply(
            @RequestParam("notificationId") Long notificationId,
            @RequestParam("repliedByEmail") String repliedByEmail,
            @RequestParam("replyContent") String replyContent) {
        try {
            NotificationReplyDTO replyDTO = notificationReplyService.createReply(notificationId, repliedByEmail, replyContent);
            return ResponseEntity.ok(replyDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/notification/{notificationId}")
    public ResponseEntity<List<NotificationReplyDTO>> getRepliesByNotification(@PathVariable Long notificationId) {
        try {
            List<NotificationReplyDTO> replies = notificationReplyService.getRepliesByNotification(notificationId);
            return ResponseEntity.ok(replies);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationReplyDTO>> getRepliesByUser(@PathVariable Long userId) {
        List<NotificationReplyDTO> replies = notificationReplyService.getRepliesByUser(userId);
        return ResponseEntity.ok(replies);
    }

    @GetMapping("/{replyId}")
    public ResponseEntity<NotificationReplyDTO> getReplyDetails(@PathVariable Long replyId) {
        try {
            NotificationReplyDTO replyDTO = notificationReplyService.getReplyDetails(replyId);
            return ResponseEntity.ok(replyDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> deleteReply(@PathVariable Long replyId) {
        if (notificationReplyService.deleteReply(replyId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}

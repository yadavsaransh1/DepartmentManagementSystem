package com.department.repository;

import com.department.model.NotificationReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationReplyRepository extends JpaRepository<NotificationReply, Long> {
    List<NotificationReply> findByNotificationIdOrderByCreatedAtDesc(Long notificationId);
    
    // Deprecated: Use findByReplyByEmailOrderByCreatedAtDesc instead (if needed)
    @Deprecated
    default List<NotificationReply> findByRepliedByIdOrderByCreatedAtDesc(Long userId) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. " +
            "User.email is now the primary key."
        );
    }
}

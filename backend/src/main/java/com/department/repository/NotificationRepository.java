package com.department.repository;

import com.department.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Notification> findByCreatedByEmailOrderByCreatedAtDesc(String createdByEmail);
    
    // Deprecated: Use findByCreatedByEmailOrderByCreatedAtDesc instead
    @Deprecated
    default List<Notification> findByCreatedByIdOrderByCreatedAtDesc(Long userId) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. Please call findByCreatedByEmailOrderByCreatedAtDesc(String email) instead. " +
            "User.email is now the primary key."
        );
    }
}

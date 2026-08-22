package com.department.repository;

import com.department.model.CommitteeMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommitteeMessageRepository extends JpaRepository<CommitteeMessage, Long> {
    List<CommitteeMessage> findByCommitteeIdOrderByCreatedAtDesc(Long committeeId);
}

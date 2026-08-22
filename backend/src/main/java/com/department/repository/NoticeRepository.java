package com.department.repository;

import com.department.model.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByIsActiveTrueOrderByCreatedAtDesc();
    List<Notice> findByTagOrderByCreatedAtDesc(String tag);
    List<Notice> findByIsActiveTrueAndTagOrderByCreatedAtDesc(String tag);
}

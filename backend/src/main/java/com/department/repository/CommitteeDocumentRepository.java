package com.department.repository;

import com.department.model.CommitteeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommitteeDocumentRepository extends JpaRepository<CommitteeDocument, Long> {
    List<CommitteeDocument> findByCommitteeIdOrderByUploadedAtDesc(Long committeeId);
    
    List<CommitteeDocument> findByCommitteeIdAndDocumentType(Long committeeId, String documentType);
}

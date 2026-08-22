package com.department.repository;

import com.department.model.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {
    List<ProjectDocument> findByAllocationId(Long allocationId);
    Optional<ProjectDocument> findById(Long id);
    void deleteById(Long id);
}

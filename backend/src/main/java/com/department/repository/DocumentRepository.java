package com.department.repository;

import com.department.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByDocumentCode(String documentCode);
    
    @Query("SELECT d FROM Document d WHERE d.uploadedBy.email = ?1 AND d.visibility = ?2")
    List<Document> findByUploadedByEmailAndVisibility(String email, Document.DocumentVisibility visibility);
    
    @Query("SELECT d FROM Document d WHERE d.visibility = 'PUBLIC'")
    List<Document> findPublicDocuments();
    
    @Query("SELECT d FROM Document d WHERE d.uploadedBy.email = ?1")
    List<Document> findByUploadedByEmail(String email);
    
    // Deprecated: Use findByUploadedByEmail instead
    @Deprecated
    default List<Document> findByUploadedById(Long uploadedById) {
        throw new UnsupportedOperationException("Use findByUploadedByEmail instead. User.email is now the primary key.");
    }
    
    // Deprecated: Use findByUploadedByEmailAndVisibility instead
    @Deprecated
    default List<Document> findByUploadedByIdAndVisibility(Long uploadedById, Document.DocumentVisibility visibility) {
        throw new UnsupportedOperationException("Use findByUploadedByEmailAndVisibility instead. User.email is now the primary key.");
    }
}

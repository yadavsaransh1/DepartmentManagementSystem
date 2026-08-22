package com.department.repository;

import com.department.model.StudyMaterial;
import com.department.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    @Query("SELECT s FROM StudyMaterial s WHERE s.uploadedBy.email = :userEmail")
    List<StudyMaterial> findByUploadedByEmail(@Param("userEmail") String userEmail);
    
    List<StudyMaterial> findByVisibility(Document.DocumentVisibility visibility);
    List<StudyMaterial> findByCategory(StudyMaterial.StudyMaterialCategory category);
    
    @Query("SELECT s FROM StudyMaterial s WHERE s.visibility = 'PUBLIC' OR s.uploadedBy.email = :userEmail OR s.visibility = 'COURSE' OR s.visibility = 'RESTRICTED'")
    List<StudyMaterial> findAccessibleStudyMaterials(@Param("userEmail") String userEmail);
    
    @Query("SELECT s FROM StudyMaterial s WHERE s.uploadedBy.email = :userEmail AND s.category = :category")
    List<StudyMaterial> findByUploadedByEmailAndCategory(@Param("userEmail") String userEmail, @Param("category") StudyMaterial.StudyMaterialCategory category);
}

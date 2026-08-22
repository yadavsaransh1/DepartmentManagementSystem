package com.department.repository;

import com.department.model.FileLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileLocationRepository extends JpaRepository<FileLocation, Long> {
    
    // Search by file name
    @Query("SELECT f FROM FileLocation f WHERE LOWER(f.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))")
    List<FileLocation> findByFileNameContaining(@Param("fileName") String fileName);
    
    // Search by almirah name
    @Query("SELECT f FROM FileLocation f WHERE LOWER(f.almirahName) LIKE LOWER(CONCAT('%', :almirahName, '%'))")
    List<FileLocation> findByAlmirahNameContaining(@Param("almirahName") String almirahName);
    
    // Search by both file name and almirah name
    @Query("SELECT f FROM FileLocation f WHERE LOWER(f.fileName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(f.almirahName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<FileLocation> search(@Param("searchTerm") String searchTerm);
}

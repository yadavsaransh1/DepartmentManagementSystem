package com.department.repository;

import com.department.model.HomePageImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HomePageImageRepository extends JpaRepository<HomePageImage, Long> {
    
    @Query("SELECT h FROM HomePageImage h WHERE h.isActive = true ORDER BY h.displayOrder ASC")
    List<HomePageImage> findAllActive();
    
    @Query("SELECT h FROM HomePageImage h ORDER BY h.displayOrder ASC, h.createdAt DESC")
    List<HomePageImage> findAllOrdered();
    
    @Query("SELECT h FROM HomePageImage h WHERE h.isActive = true AND h.displayOrder >= 0 ORDER BY h.displayOrder ASC")
    List<HomePageImage> findCarouselImages();
}

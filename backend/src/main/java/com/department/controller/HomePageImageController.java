package com.department.controller;

import com.department.model.HomePageImage;
import com.department.service.HomePageImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/home-page-images")
public class HomePageImageController {
    
    @Autowired
    private HomePageImageService homePageImageService;
    
    /**
     * Get all carousel images (for homepage display - public)
     */
    @GetMapping("/carousel")
    public ResponseEntity<List<HomePageImage>> getCarouselImages() {
        try {
            List<HomePageImage> images = homePageImageService.getCarouselImages();
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all active images (public)
     */
    @GetMapping("/active")
    public ResponseEntity<List<HomePageImage>> getActiveImages() {
        try {
            List<HomePageImage> images = homePageImageService.getActiveImages();
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get all images (admin only - for management)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HomePageImage>> getAllImages() {
        try {
            List<HomePageImage> images = homePageImageService.getAllImages();
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get single image by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<HomePageImage> getImageById(@PathVariable Long id) {
        try {
            Optional<HomePageImage> image = homePageImageService.getImageById(id);
            return image.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Create new carousel image (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageImage> createImage(
            @RequestBody HomePageImage image, 
            Authentication authentication) {
        try {
            if (authentication != null && authentication.getName() != null) {
                image.setUploadedBy(authentication.getName());
            }
            HomePageImage savedImage = homePageImageService.saveImage(image);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Update carousel image (admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageImage> updateImage(
            @PathVariable Long id,
            @RequestBody HomePageImage imageDetails) {
        try {
            HomePageImage updatedImage = homePageImageService.updateImage(id, imageDetails);
            if (updatedImage != null) {
                return ResponseEntity.ok(updatedImage);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Delete carousel image (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        try {
            Optional<HomePageImage> image = homePageImageService.getImageById(id);
            if (image.isPresent()) {
                homePageImageService.deleteImage(id);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Reorder images for carousel display
     */
    @PostMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> reorderImages(@RequestBody List<HomePageImage> images) {
        try {
            homePageImageService.reorderImages(images);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Toggle active status of an image
     */
    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HomePageImage> toggleImageActive(@PathVariable Long id) {
        try {
            Optional<HomePageImage> optionalImage = homePageImageService.getImageById(id);
            if (optionalImage.isPresent()) {
                HomePageImage image = optionalImage.get();
                image.setIsActive(!image.getIsActive());
                HomePageImage updatedImage = homePageImageService.saveImage(image);
                return ResponseEntity.ok(updatedImage);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

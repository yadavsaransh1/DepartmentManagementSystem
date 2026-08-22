package com.department.service;

import com.department.model.HomePageImage;
import com.department.repository.HomePageImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class HomePageImageService {
    
    @Autowired
    private HomePageImageRepository homePageImageRepository;
    
    public HomePageImage saveImage(HomePageImage image) {
        return homePageImageRepository.save(image);
    }
    
    public Optional<HomePageImage> getImageById(Long id) {
        return homePageImageRepository.findById(id);
    }
    
    public List<HomePageImage> getAllImages() {
        return homePageImageRepository.findAllOrdered();
    }
    
    public List<HomePageImage> getActiveImages() {
        return homePageImageRepository.findAllActive();
    }
    
    public List<HomePageImage> getCarouselImages() {
        return homePageImageRepository.findCarouselImages();
    }
    
    public HomePageImage updateImage(Long id, HomePageImage imageDetails) {
        Optional<HomePageImage> optionalImage = homePageImageRepository.findById(id);
        if (optionalImage.isPresent()) {
            HomePageImage image = optionalImage.get();
            if (imageDetails.getImageUrl() != null) {
                image.setImageUrl(imageDetails.getImageUrl());
            }
            if (imageDetails.getCaption() != null) {
                image.setCaption(imageDetails.getCaption());
            }
            if (imageDetails.getDescription() != null) {
                image.setDescription(imageDetails.getDescription());
            }
            if (imageDetails.getAltText() != null) {
                image.setAltText(imageDetails.getAltText());
            }
            if (imageDetails.getDisplayOrder() != null) {
                image.setDisplayOrder(imageDetails.getDisplayOrder());
            }
            if (imageDetails.getIsActive() != null) {
                image.setIsActive(imageDetails.getIsActive());
            }
            return homePageImageRepository.save(image);
        }
        return null;
    }
    
    public void deleteImage(Long id) {
        homePageImageRepository.deleteById(id);
    }
    
    public void reorderImages(List<HomePageImage> images) {
        for (int i = 0; i < images.size(); i++) {
            images.get(i).setDisplayOrder(i + 1);
            homePageImageRepository.save(images.get(i));
        }
    }
}

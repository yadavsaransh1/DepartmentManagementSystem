package com.department.service;

import com.department.dto.FileLocationDTO;
import com.department.model.FileLocation;
import com.department.repository.FileLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class FileLocationService {
    private static final Logger logger = Logger.getLogger(FileLocationService.class.getName());

    @Autowired
    private FileLocationRepository fileLocationRepository;

    // Get all file locations
    public List<FileLocationDTO> getAllFileLocations() {
        try {
            return fileLocationRepository.findAll().stream()
                    .map(this::fileLocationToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching all file locations: " + e.getMessage());
            throw new RuntimeException("Failed to fetch file locations");
        }
    }

    // Create new file location
    public FileLocationDTO createFileLocation(String fileName, String almirahName, String additionalInformation) {
        try {
            FileLocation fileLocation = new FileLocation(fileName, almirahName);
            fileLocation.setAdditionalInformation(additionalInformation);
            fileLocation.setCreatedAt(LocalDateTime.now());
            fileLocation.setUpdatedAt(LocalDateTime.now());

            FileLocation saved = fileLocationRepository.save(fileLocation);
            logger.info("File location created: " + fileName);
            return fileLocationToDTO(saved);
        } catch (Exception e) {
            logger.warning("Error creating file location: " + e.getMessage());
            throw new RuntimeException("Failed to create file location");
        }
    }

    // Get file location by ID
    public FileLocationDTO getFileLocationById(Long id) {
        try {
            FileLocation fileLocation = fileLocationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("File location not found"));
            return fileLocationToDTO(fileLocation);
        } catch (Exception e) {
            logger.warning("Error fetching file location: " + e.getMessage());
            throw new RuntimeException("File location not found");
        }
    }

    // Update file location
    public FileLocationDTO updateFileLocation(Long id, String fileName, String almirahName, String additionalInformation) {
        try {
            FileLocation fileLocation = fileLocationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("File location not found"));

            if (fileName != null && !fileName.isEmpty()) fileLocation.setFileName(fileName);
            if (almirahName != null && !almirahName.isEmpty()) fileLocation.setAlmirahName(almirahName);
            if (additionalInformation != null) fileLocation.setAdditionalInformation(additionalInformation);
            fileLocation.setUpdatedAt(LocalDateTime.now());

            FileLocation updated = fileLocationRepository.save(fileLocation);
            logger.info("File location updated: " + id);
            return fileLocationToDTO(updated);
        } catch (Exception e) {
            logger.warning("Error updating file location: " + e.getMessage());
            throw new RuntimeException("Failed to update file location");
        }
    }

    // Delete file location
    public void deleteFileLocation(Long id) {
        try {
            fileLocationRepository.deleteById(id);
            logger.info("File location deleted: " + id);
        } catch (Exception e) {
            logger.warning("Error deleting file location: " + e.getMessage());
            throw new RuntimeException("Failed to delete file location");
        }
    }

    // Search file locations by file name or almirah name
    public List<FileLocationDTO> searchFileLocations(String searchTerm) {
        try {
            if (searchTerm == null || searchTerm.isEmpty()) {
                return getAllFileLocations();
            }
            return fileLocationRepository.search(searchTerm).stream()
                    .map(this::fileLocationToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error searching file locations: " + e.getMessage());
            throw new RuntimeException("Failed to search file locations");
        }
    }

    // Helper method to convert FileLocation to DTO
    private FileLocationDTO fileLocationToDTO(FileLocation fileLocation) {
        FileLocationDTO dto = new FileLocationDTO();
        dto.setId(fileLocation.getId());
        dto.setFileName(fileLocation.getFileName());
        dto.setAlmirahName(fileLocation.getAlmirahName());
        dto.setAdditionalInformation(fileLocation.getAdditionalInformation());
        dto.setCreatedAt(fileLocation.getCreatedAt());
        dto.setUpdatedAt(fileLocation.getUpdatedAt());
        return dto;
    }
}

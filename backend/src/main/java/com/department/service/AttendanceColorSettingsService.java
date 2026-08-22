package com.department.service;

import com.department.dto.AttendanceColorSettingsDTO;
import com.department.model.AttendanceColorSettings;
import com.department.repository.AttendanceColorSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class AttendanceColorSettingsService {
    private static final Logger logger = Logger.getLogger(AttendanceColorSettingsService.class.getName());
    
    @Autowired
    private AttendanceColorSettingsRepository repository;

    public AttendanceColorSettingsDTO initializeSettings() {
        try {
            // Initialize settings for all roles if they don't exist
            for (String role : new String[]{"ADMIN", "TEACHER", "STUDENT"}) {
                if (!repository.findByRole(role).isPresent()) {
                    AttendanceColorSettings settings = new AttendanceColorSettings(role);
                    repository.save(settings);
                }
            }
            // Return ADMIN settings
            return getSettingsByRole("ADMIN");
        } catch (Exception e) {
            logger.severe("Error initializing color settings: " + e.getMessage());
            return new AttendanceColorSettingsDTO();
        }
    }

    public AttendanceColorSettingsDTO getSettingsByRole(String role) {
        try {
            Optional<AttendanceColorSettings> settings = repository.findByRole(role);
            if (settings.isPresent()) {
                return convertToDTO(settings.get());
            }
            // Create default settings if they don't exist
            AttendanceColorSettings newSettings = new AttendanceColorSettings(role);
            repository.save(newSettings);
            return convertToDTO(newSettings);
        } catch (Exception e) {
            logger.severe("Error fetching color settings for role " + role + ": " + e.getMessage());
            return new AttendanceColorSettingsDTO();
        }
    }

    public AttendanceColorSettingsDTO updateSettings(String role, AttendanceColorSettingsDTO dto) {
        try {
            Optional<AttendanceColorSettings> existing = repository.findByRole(role);
            AttendanceColorSettings settings;

            if (existing.isPresent()) {
                settings = existing.get();
            } else {
                settings = new AttendanceColorSettings(role);
            }

            if (dto.getLowThreshold() != null) settings.setLowThreshold(dto.getLowThreshold());
            if (dto.getMediumThreshold() != null) settings.setMediumThreshold(dto.getMediumThreshold());
            if (dto.getLowColor() != null) settings.setLowColor(dto.getLowColor());
            if (dto.getMediumColor() != null) settings.setMediumColor(dto.getMediumColor());
            if (dto.getHighColor() != null) settings.setHighColor(dto.getHighColor());

            settings.setUpdatedAt(LocalDateTime.now());
            repository.save(settings);

            return convertToDTO(settings);
        } catch (Exception e) {
            logger.severe("Error updating color settings for role " + role + ": " + e.getMessage());
            return new AttendanceColorSettingsDTO();
        }
    }

    private AttendanceColorSettingsDTO convertToDTO(AttendanceColorSettings settings) {
        return new AttendanceColorSettingsDTO(
                settings.getId(),
                settings.getRole(),
                settings.getLowThreshold(),
                settings.getMediumThreshold(),
                settings.getLowColor(),
                settings.getMediumColor(),
                settings.getHighColor()
        );
    }
}

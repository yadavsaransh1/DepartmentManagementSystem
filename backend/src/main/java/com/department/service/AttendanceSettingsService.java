package com.department.service;

import com.department.model.AttendanceSettings;
import com.department.repository.AttendanceSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AttendanceSettingsService {

    @Autowired
    private AttendanceSettingsRepository attendanceSettingsRepository;

    /**
     * Get current NQ criteria (or default 75% if not set)
     */
    public Float getNqCriteria() {
        List<AttendanceSettings> settings = attendanceSettingsRepository.findAll();
        if (settings.isEmpty()) {
            // Create default setting if none exists
            AttendanceSettings defaultSettings = new AttendanceSettings(75.0f);
            attendanceSettingsRepository.save(defaultSettings);
            return 75.0f;
        }
        return settings.get(0).getNqCriteria();
    }

    /**
     * Update NQ criteria
     */
    public AttendanceSettings updateNqCriteria(Float newCriteria) {
        List<AttendanceSettings> settings = attendanceSettingsRepository.findAll();
        AttendanceSettings setting;
        
        if (settings.isEmpty()) {
            setting = new AttendanceSettings(newCriteria);
        } else {
            setting = settings.get(0);
            setting.setNqCriteria(newCriteria);
        }
        
        return attendanceSettingsRepository.save(setting);
    }

    /**
     * Get all settings
     */
    public AttendanceSettings getSettings() {
        List<AttendanceSettings> settings = attendanceSettingsRepository.findAll();
        if (settings.isEmpty()) {
            AttendanceSettings defaultSettings = new AttendanceSettings(75.0f);
            return attendanceSettingsRepository.save(defaultSettings);
        }
        return settings.get(0);
    }
}

package com.department.service;

import com.department.model.Teacher;
import com.department.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class TeacherAuthorizationService {
    private static final Logger logger = Logger.getLogger(TeacherAuthorizationService.class.getName());

    @Autowired
    private TeacherRepository teacherRepository;

    /**
     * Check if current user has the specified power
     */
    public boolean hasTeacherPower(String powerName) {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (!teacherOpt.isPresent()) return false;

        Teacher teacher = teacherOpt.get();
        // If user is HoD, they have all powers
        if (Boolean.TRUE.equals(teacher.getIsHoD())) {
            return true;
        }

        // Check if they have the specific power
        return hasPower(teacher, powerName);
    }

    /**
     * Check if user is HoD
     */
    public boolean isHoD() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (!teacherOpt.isPresent()) return false;
        
        Teacher teacher = teacherOpt.get();
        return Boolean.TRUE.equals(teacher.getIsHoD());
    }

    /**
     * Check specific power for a teacher
     */
    public boolean hasPower(Teacher teacher, String powerName) {
        if (teacher == null || teacher.getAdminPowers() == null) {
            return false;
        }

        try {
            Map<String, Object> powers = parseAdminPowers(teacher.getAdminPowers());
            Object powerValue = powers.get(powerName);
            return powerValue instanceof Boolean && (Boolean) powerValue;
        } catch (Exception e) {
            logger.warning("Error parsing admin powers for teacher " + teacher.getUser().getEmail() + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Parse admin powers from JSON string
     */
    private Map<String, Object> parseAdminPowers(String adminPowersJson) {
        Map<String, Object> powers = new HashMap<>();
        if (adminPowersJson == null || adminPowersJson.isEmpty()) {
            return powers;
        }

        try {
            // Simple JSON parsing for boolean values
            adminPowersJson = adminPowersJson.trim();
            if (adminPowersJson.startsWith("{") && adminPowersJson.endsWith("}")) {
                adminPowersJson = adminPowersJson.substring(1, adminPowersJson.length() - 1);
            }

            String[] entries = adminPowersJson.split(",");
            for (String entry : entries) {
                String[] parts = entry.split(":");
                if (parts.length == 2) {
                    String key = parts[0].trim().replaceAll("\"", "");
                    String value = parts[1].trim().toLowerCase();
                    powers.put(key, value.contains("true"));
                }
            }
        } catch (Exception e) {
            logger.warning("Error parsing admin powers JSON: " + e.getMessage());
        }

        return powers;
    }

    /**
     * Get current authenticated user's email
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * Check if user can view marks
     * TEACHER: Can view their own marks
     * HOD: Can view if they have canViewResults power
     * ADMIN: Always can view
     */
    public boolean canViewMarks() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // Try to get teacher record
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (teacherOpt.isPresent()) {
            // Regular teachers can always view marks
            return true;
        }
        
        // If not a teacher, check powers
        return hasTeacherPower("canViewResults") || hasTeacherPower("canEditMarks") || hasTeacherPower("canAddMarks");
    }

    /**
     * Check if user can edit marks
     * TEACHER: Can edit their own marks
     * HOD: Can edit if they have canEditMarks power
     * ADMIN: Always can edit
     */
    public boolean canEditMarks() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // Try to get teacher record
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (teacherOpt.isPresent()) {
            // Regular teachers can always edit marks
            return true;
        }
        
        return hasTeacherPower("canEditMarks");
    }

    /**
     * Check if user can add marks
     * TEACHER: Can add their own marks (basic ability)
     * HOD: Can add if they have canAddMarks power
     * ADMIN: Always can add
     */
    public boolean canAddMarks() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // Try to get teacher record
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (teacherOpt.isPresent()) {
            // Regular teachers can always add marks
            return true;
        }
        
        return hasTeacherPower("canAddMarks");
    }

    /**
     * Check if user can delete marks
     */
    public boolean canDeleteMarks() {
        return hasTeacherPower("canDeleteMarks");
    }

    /**
     * Check if user can view attendance
     * TEACHER: Can view their own students' attendance
     * HOD: Can view if they have canViewAttendance power
     * ADMIN: Always can view
     */
    public boolean canViewAttendance() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // Try to get teacher record
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (teacherOpt.isPresent()) {
            // Regular teachers can always view attendance
            return true;
        }
        
        // If not a teacher, check powers
        return hasTeacherPower("canViewAttendance") || hasTeacherPower("canEditAttendance");
    }

    /**
     * Check if user can edit attendance
     * TEACHER: Can edit their own students' attendance
     * HOD: Can edit if they have canEditAttendance power
     * ADMIN: Always can edit
     */
    public boolean canEditAttendance() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // Try to get teacher record
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        if (teacherOpt.isPresent()) {
            // Regular teachers can always edit attendance
            return true;
        }
        
        return hasTeacherPower("canEditAttendance");
    }

    /**
     * Check if user can manage assignments
     */
    /**
     * Check if user can manage assignments
     * TEACHER: Can manage assignments they're assigned to
     * ADMIN: Always can manage
     */
    public boolean canManageAssignment() {
        String email = getCurrentUserEmail();
        if (email == null) return false;
        
        // If user is a teacher, they can manage assignments
        Optional<Teacher> teacherOpt = teacherRepository.findByUserEmail(email);
        return teacherOpt.isPresent();
    }

    /**
     * Check if user can manage feedback
     */
    public boolean canManageFeedback() {
        return hasTeacherPower("canManageFeedback");
    }
}

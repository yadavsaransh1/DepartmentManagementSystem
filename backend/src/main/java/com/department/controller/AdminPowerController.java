package com.department.controller;

import com.department.dto.TeacherPowerDTO;
import com.department.dto.AttendanceColorSettingsDTO;
import com.department.service.TeacherPowerService;
import com.department.service.AttendanceColorSettingsService;
import com.department.service.DatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/admin-power")
@PreAuthorize("hasRole('ADMIN')")
public class AdminPowerController {
    private static final Logger logger = Logger.getLogger(AdminPowerController.class.getName());

    @Autowired
    private TeacherPowerService teacherPowerService;

    @Autowired
    private AttendanceColorSettingsService colorSettingsService;

    @Autowired
    private DatabaseService databaseService;

    // ============= HOD Management =============
    
    @PostMapping("/appoint-hod")
    public ResponseEntity<TeacherPowerDTO> appointAsHoD(@RequestParam String email) {
        try {
            logger.info("Appoint HoD request for: " + email);
            TeacherPowerDTO result = teacherPowerService.appointAsHoD(email);
            logger.info("Successfully appointed HoD: " + email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error appointing HoD " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw e;  // Re-throw exception to be handled by GlobalExceptionHandler
        }
    }

    @PostMapping("/remove-hod")
    public ResponseEntity<TeacherPowerDTO> removeHoDStatus(@RequestParam String email) {
        try {
            logger.info("Remove HoD request for: " + email);
            TeacherPowerDTO result = teacherPowerService.removeHoDStatus(email);
            logger.info("Successfully removed HoD status: " + email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error removing HoD " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw e;  // Re-throw exception to be handled by GlobalExceptionHandler
        }
    }

    @GetMapping("/hods")
    public ResponseEntity<List<TeacherPowerDTO>> getAllHoDs() {
        try {
            logger.info("Fetching all HoDs");
            List<TeacherPowerDTO> hods = teacherPowerService.getAllHoDs();
            logger.info("Successfully fetched " + hods.size() + " HoDs");
            return ResponseEntity.ok(hods);
        } catch (Exception e) {
            logger.severe("Error fetching HoDs: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch HoDs: " + e.getMessage(), e);
        }
    }

    // ============= Teacher Power Management =============
    
    @PostMapping("/update-teacher-powers")
    public ResponseEntity<TeacherPowerDTO> updateTeacherPowers(
            @RequestParam String email,
            @RequestBody TeacherPowerDTO dto) {
        try {
            logger.info("Updating teacher powers for: " + email);
            TeacherPowerDTO result = teacherPowerService.updateTeacherPowers(email, dto);
            logger.info("Successfully updated teacher powers: " + email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error updating teacher powers " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/teacher-powers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeacherPowerDTO> getTeacherPowers(@RequestParam String email) {
        try {
            logger.info("Fetching teacher powers for: " + email);
            TeacherPowerDTO result = teacherPowerService.getTeacherPowers(email);
            logger.info("Successfully fetched teacher powers: " + email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error fetching teacher powers " + email + ": " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/all-teacher-powers")
    public ResponseEntity<List<TeacherPowerDTO>> getAllTeacherPowers() {
        try {
            List<TeacherPowerDTO> result = teacherPowerService.getAllTeacherPowers();
            logger.info("Successfully fetched all teacher powers: " + result.size() + " records");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error fetching all teacher powers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    // ============= Public Endpoints (accessible to all authenticated users) =============
    
    @GetMapping("/public/my-powers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeacherPowerDTO> getMyPowers() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth != null ? auth.getName() : null;
            
            if (email == null) {
                return ResponseEntity.badRequest().body(new TeacherPowerDTO());
            }
            
            logger.info("Fetching current user's powers for: " + email);
            TeacherPowerDTO result = teacherPowerService.getTeacherPowers(email);
            logger.info("Successfully fetched current user's powers: " + email);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error fetching current user's powers: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new TeacherPowerDTO());
        }
    }

    // ============= Color Settings Management =============
    
    @PostMapping("/initialize-color-settings")
    public ResponseEntity<AttendanceColorSettingsDTO> initializeColorSettings() {
        try {
            logger.info("Initializing color settings");
            AttendanceColorSettingsDTO result = colorSettingsService.initializeSettings();
            logger.info("Successfully initialized color settings");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error initializing color settings: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new AttendanceColorSettingsDTO());
        }
    }

    @GetMapping("/color-settings")
    public ResponseEntity<AttendanceColorSettingsDTO> getColorSettings(@RequestParam String role) {
        try {
            logger.info("Fetching color settings for role: " + role);
            AttendanceColorSettingsDTO result = colorSettingsService.getSettingsByRole(role);
            logger.info("Successfully fetched color settings for role: " + role);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error fetching color settings for role " + role + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new AttendanceColorSettingsDTO());
        }
    }

    @PutMapping("/color-settings")
    public ResponseEntity<AttendanceColorSettingsDTO> updateColorSettings(
            @RequestParam String role,
            @RequestBody AttendanceColorSettingsDTO dto) {
        try {
            logger.info("Updating color settings for role: " + role);
            AttendanceColorSettingsDTO result = colorSettingsService.updateSettings(role, dto);
            logger.info("Successfully updated color settings for role: " + role);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.severe("Error updating color settings for role " + role + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new AttendanceColorSettingsDTO());
        }
    }

    // ============= Database Management =============
    
    @GetMapping("/database-tables")
    public ResponseEntity<List<String>> getDatabaseTables() {
        try {
            logger.info("Fetching database tables list");
            List<String> tables = getDatabaseTablesList();
            logger.info("Successfully fetched " + tables.size() + " tables");
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.severe("Error fetching database tables: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of());
        }
    }

    @PostMapping("/clear-table-data")
    public ResponseEntity<Map<String, Object>> clearTableData(@RequestBody Map<String, Object> payload) {
        try {
            Object tablesObj = payload.get("tables");
            if (!(tablesObj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid tables parameter"
                ));
            }
            @SuppressWarnings("unchecked")
            List<String> tablesToClear = (List<String>) tablesObj;
            
            if (tablesToClear == null || tablesToClear.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "No tables specified for clearing"
                ));
            }

            // Call database service to clear the data
            databaseService.clearMultipleTables(tablesToClear);
            
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Selected tables cleared successfully",
                    "clearedTables", tablesToClear
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    private List<String> getDatabaseTablesList() {
        // Dynamically query the database for available tables
        return databaseService.getAllDatabaseTables();
    }
}

package com.department.controller;

import com.department.model.TeacherDetails;
import com.department.service.TeacherDetailsService;
import com.department.dto.TeacherDetailsDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher-details")
public class TeacherDetailsController {

    @Autowired
    private TeacherDetailsService detailsService;

    @Autowired
    private com.department.repository.TeacherRepository teacherRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveTeacherDetails(@RequestBody TeacherDetailsDTO dto) {
        try {
            if (dto == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Request body is required", null));
            }
            
            // If teacherEmail is provided but not teacherId, look up the teacherId
            if (dto.getTeacherId() == null && dto.getTeacherEmail() != null) {
                com.department.model.Teacher teacher = teacherRepository.findByUserEmail(dto.getTeacherEmail())
                        .orElseThrow(() -> new RuntimeException("Teacher not found for email: " + dto.getTeacherEmail()));
                dto.setTeacherId(teacher.getId());
            }
            
            if (dto.getTeacherId() == null) {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Teacher ID or Email is required", null));
            }
            
            System.out.println("DEBUG: Saving teacher details for ID: " + dto.getTeacherId());
            
            TeacherDetails details = detailsService.saveTeacherDetails(dto);
            com.department.dto.TeacherDetailsResponseDTO responseDTO = detailsService.convertToResponseDTO(details);
            return ResponseEntity.ok(new ApiResponse(true, "Teacher details saved successfully", responseDTO));
        } catch (RuntimeException e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage(), null));
        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error saving teacher details: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{teacherIdentifier}")
    public ResponseEntity<?> getTeacherDetails(@PathVariable String teacherIdentifier) {
        try {
            TeacherDetails details;
            if (teacherIdentifier.contains("@")) {
                com.department.model.Teacher teacher = teacherRepository.findByUserEmail(teacherIdentifier)
                        .orElseThrow(() -> new RuntimeException("Teacher not found for email " + teacherIdentifier));
                details = detailsService.getTeacherDetails(teacher.getId());
            } else {
                Long teacherId = Long.parseLong(teacherIdentifier);
                details = detailsService.getTeacherDetails(teacherId);
            }
            com.department.dto.TeacherDetailsResponseDTO responseDTO = detailsService.convertToResponseDTO(details);
            return ResponseEntity.ok(new ApiResponse(true, "Teacher details retrieved successfully", responseDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error retrieving teacher details: " + e.getMessage(), null));
        }
    }

    @GetMapping("/{teacherIdentifier}/exists")
    public ResponseEntity<?> hasTeacherDetails(@PathVariable String teacherIdentifier) {
        try {
            boolean exists;
            if (teacherIdentifier.contains("@")) {
                com.department.model.Teacher teacher = teacherRepository.findByUserEmail(teacherIdentifier)
                        .orElse(null);
                if (teacher == null) {
                    exists = false;
                } else {
                    exists = detailsService.hasTeacherDetails(teacher.getId());
                }
            } else {
                Long teacherId = Long.parseLong(teacherIdentifier);
                exists = detailsService.hasTeacherDetails(teacherId);
            }
            return ResponseEntity.ok(new ApiResponse(true, "Check completed", exists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error checking teacher details: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/{teacherId}")
    public ResponseEntity<?> deleteTeacherDetails(@PathVariable Long teacherId) {
        try {
            TeacherDetails details = detailsService.deleteTeacherDetails(teacherId);
            if (details != null) {
                return ResponseEntity.ok(new ApiResponse(true, "Teacher details deleted successfully", null));
            } else {
                return ResponseEntity.badRequest().body(new ApiResponse(false, "Teacher details not found", null));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Error deleting teacher details: " + e.getMessage(), null));
        }
    }

    // Inner class for API response
    public static class ApiResponse {
        private boolean success;
        private String message;
        private Object data;

        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
    }
}

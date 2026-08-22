package com.department.controller;

import com.department.dto.DocumentDTO;
import com.department.dto.RoutineDTO;
import com.department.model.Routine;
import com.department.service.RoutineService;
import com.department.service.RoutineDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/routines")
public class RoutineController {

    @Autowired
    private RoutineService routineService;

    @Autowired
    private RoutineDocumentService routineDocumentService;

    @Value("${document.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadRoutine(
            @RequestParam("file") MultipartFile file,
            @RequestParam("semester") String semester,
            @RequestParam("academicYear") String academicYear,
            @RequestParam("description") String description,
            @RequestParam("uploadedByEmail") String uploadedByEmail) {
        try {
            DocumentDTO documentDTO = routineDocumentService.uploadRoutineAsDocument(file, semester, academicYear, description, uploadedByEmail);
            return ResponseEntity.ok(documentDTO);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new com.department.dto.MessageDTO(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new com.department.dto.MessageDTO("Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<RoutineDTO>> getAllRoutines() {
        try {
            List<RoutineDTO> routines = routineService.getAllRoutines();
            return ResponseEntity.ok(routines);
        } catch (Exception e) {
            // Avoid 400 on routine list errors; return empty list with log
            System.err.println("Error in getAllRoutines: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/semester/{semester}")
    public ResponseEntity<List<RoutineDTO>> getRoutinesBySemester(@PathVariable String semester) {
        try {
            List<RoutineDTO> routines = routineService.getRoutinesBySemester(semester);
            return ResponseEntity.ok(routines);
        } catch (Exception e) {
            System.err.println("Error in getRoutinesBySemester: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/uploaded-by/{uploaderIdentifier}")
    public ResponseEntity<List<RoutineDTO>> getRoutinesByUploader(@PathVariable String uploaderIdentifier) {
        try {
            List<RoutineDTO> routines = routineService.getRoutinesByUploaderIdentifier(uploaderIdentifier);
            return ResponseEntity.ok(routines);
        } catch (Exception e) {
            System.err.println("Error in getRoutinesByUploader: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/teacher/{teacherIdentifier}")
    public ResponseEntity<List<RoutineDTO>> getRoutinesByTeacher(@PathVariable String teacherIdentifier) {
        try {
            List<RoutineDTO> routines = routineService.getRoutinesByTeacherIdentifier(teacherIdentifier);
            return ResponseEntity.ok(routines);
        } catch (Exception e) {
            System.err.println("Error in getRoutinesByTeacher: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    @GetMapping("/{routineId}/details")
    public ResponseEntity<RoutineDTO> getRoutineDetails(@PathVariable Long routineId) {
        try {
            RoutineDTO routineDTO = routineService.getRoutineDetails(routineId);
            return ResponseEntity.ok(routineDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{routineId}/download")
    public ResponseEntity<?> downloadRoutine(@PathVariable Long routineId) {
        try {
            Optional<Routine> routine = routineService.getRoutineFile(routineId);
            if (routine.isPresent()) {
                Routine ur = routine.get();
                byte[] fileContent = Files.readAllBytes(Paths.get(ur.getFilePath()));
                
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + ur.getFileName() + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, ur.getFileType())
                        .body(fileContent);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new com.department.dto.MessageDTO("Routine not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new com.department.dto.MessageDTO("Download failed: " + e.getMessage()));
        }
    }

    @PutMapping("/{routineId}")
    public ResponseEntity<RoutineDTO> updateRoutine(
            @PathVariable Long routineId,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long teacherId) {
        try {
            RoutineDTO updatedRoutine = routineService.updateRoutine(routineId, course, semester, academicYear, description, teacherId);
            return ResponseEntity.ok(updatedRoutine);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{routineId}")
    public ResponseEntity<Void> deleteRoutine(@PathVariable Long routineId) {
        if (routineService.deleteRoutine(routineId)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @PostMapping("/upload-excel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadRoutineFromExcel(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new com.department.dto.MessageDTO("Unauthorized: No valid authentication token."));
            }
            String message = routineService.uploadRoutineFromExcel(file, authentication.getName());
            return ResponseEntity.ok(new com.department.dto.MessageDTO(message));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new com.department.dto.MessageDTO(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new com.department.dto.MessageDTO("Excel upload failed: " + e.getMessage()));
        }
    }
}


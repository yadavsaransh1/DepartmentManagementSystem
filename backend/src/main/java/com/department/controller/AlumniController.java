package com.department.controller;

import com.department.dto.AlumniDTO;
import com.department.service.AlumniService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/alumni")
public class AlumniController {

    @Autowired
    private AlumniService alumniService;

    @PostMapping
    public ResponseEntity<AlumniDTO> createAlumniRecord(
            @RequestParam Long studentId,
            @RequestParam String program,
            @RequestParam Integer semester,
            @RequestParam(required = false) Float marks,
            @RequestParam(required = false) String passFail,
            @RequestParam(required = false) String customFields) {
        return ResponseEntity.ok(alumniService.createAlumniRecord(studentId, program, semester, marks, passFail, customFields));
    }

    @GetMapping
    public ResponseEntity<List<AlumniDTO>> getAllAlumni() {
        return ResponseEntity.ok(alumniService.getAllAlumni());
    }

    @GetMapping("/program/{program}")
    public ResponseEntity<List<AlumniDTO>> getAlumniByProgram(@PathVariable String program) {
        return ResponseEntity.ok(alumniService.getAlumniByProgram(program));
    }

    @GetMapping("/program/{program}/semester/{semester}")
    public ResponseEntity<List<AlumniDTO>> getAlumniByProgramAndSemester(
            @PathVariable String program,
            @PathVariable Integer semester) {
        return ResponseEntity.ok(alumniService.getAlumniByProgramAndSemester(program, semester));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<AlumniDTO> getAlumniByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(alumniService.getAlumniByStudentId(studentId));
    }

    @PutMapping("/{alumniId}")
    public ResponseEntity<AlumniDTO> updateAlumniRecord(
            @PathVariable Long alumniId,
            @RequestParam(required = false) Float marks,
            @RequestParam(required = false) String passFail,
            @RequestParam(required = false) String currentOccupation,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String customFields) {
        return ResponseEntity.ok(alumniService.updateAlumniRecord(alumniId, marks, passFail, currentOccupation, company, customFields));
    }

    @DeleteMapping("/{alumniId}")
    public ResponseEntity<String> deleteAlumniRecord(@PathVariable Long alumniId) {
        alumniService.deleteAlumniRecord(alumniId);
        return ResponseEntity.ok("Alumni record deleted successfully");
    }
}

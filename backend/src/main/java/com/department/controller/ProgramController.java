package com.department.controller;

import com.department.dto.ProgramDTO;
import com.department.dto.MessageDTO;
import com.department.service.ProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    @Autowired
    private ProgramService programService;

    // Get all programs
    @GetMapping
    public ResponseEntity<List<ProgramDTO>> getAllPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }

    // Get all active programs
    @GetMapping("/active")
    public ResponseEntity<List<ProgramDTO>> getActivePrograms() {
        return ResponseEntity.ok(programService.getActivePrograms());
    }

    // Get program by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProgramDTO> getProgramById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getProgramById(id));
    }

    // Get program by name
    @GetMapping("/name/{name}")
    public ResponseEntity<ProgramDTO> getProgramByName(@PathVariable String name) {
        return ResponseEntity.ok(programService.getProgramByName(name));
    }

    // Get semesters for a program (by ID or name)
    @GetMapping("/{programIdOrName}/semesters")
    public ResponseEntity<List<Integer>> getSemestersForProgram(@PathVariable String programIdOrName) {
        return ResponseEntity.ok(programService.getSemestersForProgram(programIdOrName));
    }

    // Create new program
    @PostMapping
    public ResponseEntity<ProgramDTO> createProgram(@Valid @RequestBody ProgramDTO programDTO) {
        return ResponseEntity.ok(programService.createProgram(programDTO));
    }

    // Update program
    @PutMapping("/{id}")
    public ResponseEntity<ProgramDTO> updateProgram(@PathVariable Long id, @Valid @RequestBody ProgramDTO programDTO) {
        return ResponseEntity.ok(programService.updateProgram(id, programDTO));
    }

    // Delete program
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(new MessageDTO("Program deleted successfully"));
    }
}

package com.department.service;

import com.department.dto.ProgramDTO;
import com.department.dto.SemesterDTO;
import com.department.model.Program;
import com.department.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

@Service
public class ProgramService {
    private static final Logger logger = Logger.getLogger(ProgramService.class.getName());

    @Autowired
    private ProgramRepository programRepository;

    // Get all programs
    public List<ProgramDTO> getAllPrograms() {
        List<Program> programs = programRepository.findAll();
        logger.info("Fetching all programs. Total count: " + programs.size());
        List<ProgramDTO> dtos = new ArrayList<>();
        for (Program program : programs) {
            dtos.add(programToDTO(program));
        }
        return dtos;
    }

    // Get all active programs
    public List<ProgramDTO> getActivePrograms() {
        List<Program> programs = programRepository.findByIsActive(true);
        List<ProgramDTO> dtos = new ArrayList<>();
        for (Program program : programs) {
            dtos.add(programToDTO(program));
        }
        return dtos;
    }

    // Get program by ID
    public ProgramDTO getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
        return programToDTO(program);
    }

    // Get program by name
    public ProgramDTO getProgramByName(String name) {
        Program program = programRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Program not found with name: " + name));
        return programToDTO(program);
    }

    // Get semesters for a program (by ID or name)
    public List<Integer> getSemestersForProgram(String programIdOrName) {
        Program program = null;
        
        // Try to parse as Long (program ID)
        try {
            Long programId = Long.parseLong(programIdOrName);
            program = programRepository.findById(programId).orElse(null);
        } catch (NumberFormatException e) {
            // Not a number, try as name
            program = programRepository.findByName(programIdOrName).orElse(null);
        }
        
        if (program == null) {
            logger.warning("Program not found: " + programIdOrName);
            // Return default 1-8
            List<Integer> defaultSemesters = new ArrayList<>();
            for (int i = 1; i <= 8; i++) {
                defaultSemesters.add(i);
            }
            return defaultSemesters;
        }
        
        // Generate semesters based on semesterCount
        List<Integer> semesters = new ArrayList<>();
        Integer semesterCount = program.getSemesterCount();
        if (semesterCount != null && semesterCount > 0) {
            for (int i = 1; i <= semesterCount; i++) {
                semesters.add(i);
            }
        }
        
        logger.info("Program '" + program.getName() + "' (ID: " + program.getId() + ") has " + semesters.size() + " semesters");
        return semesters;
    }

    // Create program
    public ProgramDTO createProgram(ProgramDTO dto) {
        // Check if program with same name already exists
        if (programRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Program with name '" + dto.getName() + "' already exists");
        }

        Program program = new Program();
        program.setName(dto.getName());
        program.setSemesterCount(dto.getSemesterCount());
        program.setDescription(dto.getDescription());
        program.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);

        Program savedProgram = programRepository.save(program);
        logger.info("Program created successfully: " + savedProgram.getName());
        return programToDTO(savedProgram);
    }

    // Update program
    public ProgramDTO updateProgram(Long id, ProgramDTO dto) {
        logger.info("Update program ID: " + id + ", Data: name=" + dto.getName() + ", semesterCount=" + dto.getSemesterCount() + ", description=" + dto.getDescription() + ", isActive=" + dto.getIsActive());
        
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));

        // Check if new name is unique (excluding current program)
        if (!program.getName().equals(dto.getName()) && 
            programRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Program with name '" + dto.getName() + "' already exists");
        }

        program.setName(dto.getName());
        program.setSemesterCount(dto.getSemesterCount());
        program.setDescription(dto.getDescription());
        program.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : program.getIsActive());
        program.setUpdatedAt(LocalDateTime.now());

        Program updatedProgram = programRepository.save(program);
        logger.info("Program updated successfully: " + updatedProgram.getName());
        return programToDTO(updatedProgram);
    }

    // Delete program
    public void deleteProgram(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));

        programRepository.deleteById(id);
        logger.info("Program deleted successfully: " + program.getName());
    }

    // Helper method to convert Program to ProgramDTO with semesters generated dynamically
    private ProgramDTO programToDTO(Program program) {
        List<SemesterDTO> semesters = new ArrayList<>();
        
        // Generate semesters based on semesterCount (no database lookup needed)
        Integer semesterCount = program.getSemesterCount();
        if (semesterCount != null && semesterCount > 0) {
            for (int i = 1; i <= semesterCount; i++) {
                SemesterDTO semesterDTO = new SemesterDTO(
                    program.getId(),
                    i,
                    "Semester " + i
                );
                semesters.add(semesterDTO);
            }
            logger.info("Program '" + program.getName() + "' (ID: " + program.getId() + ") generated " + semesters.size() + " semesters dynamically");
        }
        
        return new ProgramDTO(
                program.getId(),
                program.getName(),
                program.getSemesterCount(),
                program.getDescription(),
                program.getIsActive(),
                semesters
        );
    }
}

package com.department.controller;

import com.department.dto.SubjectDTO;
import com.department.dto.StudentDTO;
import com.department.service.SubjectService;
import com.department.repository.StudentRepository;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Arrays;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    @Autowired
    private SubjectService subjectService;


    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping("/user/courses-semesters")
    public ResponseEntity<Map<String, Object>> getUserCoursesAndSemesters(Authentication authentication) {
        try {
            System.out.println("DEBUG: getUserCoursesAndSemesters called with authentication: " + (authentication != null ? "not null" : "NULL"));
            
            // If no authentication, return default courses and semesters
            if (authentication == null || authentication.getName() == null) {
                System.out.println("DEBUG: No authentication, returning defaults");
                Map<String, Object> defaults = new HashMap<>();
                defaults.put("courses", Arrays.asList("B.Tech", "B.Sc", "M.Tech", "M.Sc", "BBA"));
                defaults.put("semesters", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8));
                defaults.put("subjects", new ArrayList<>());
                return ResponseEntity.ok(defaults);
            }
            
            System.out.println("DEBUG: Auth name = " + authentication.getName());
            return ResponseEntity.ok(subjectService.getUserCoursesAndSemesters(authentication));
        } catch (Exception e) {
            System.out.println("ERROR in getUserCoursesAndSemesters: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("courses", Arrays.asList("B.Tech", "B.Sc", "M.Tech", "M.Sc", "BBA"));
            error.put("semesters", Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8));
            error.put("subjects", new ArrayList<>());
            error.put("error", "Failed to fetch personalized courses and semesters: " + e.getMessage());
            return ResponseEntity.ok(error);
        }
    }

    @GetMapping("/unique-programs")
    public ResponseEntity<List<String>> getUniquePrograms() {
        try {
            return ResponseEntity.ok(subjectService.getUniquePrograms());
        } catch (Exception e) {
            System.out.println("ERROR in getUniquePrograms: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Arrays.asList("B.Tech", "B.Sc", "M.Tech", "M.Sc", "BBA"));
        }
    }

    @GetMapping("/semesters-by-program/{program}")
    public ResponseEntity<List<String>> getSemestersByProgram(@PathVariable String program) {
        try {
            return ResponseEntity.ok(subjectService.getSemestersByProgram(program));
        } catch (Exception e) {
            System.out.println("ERROR in getSemestersByProgram: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Arrays.asList("1", "2", "3", "4", "5", "6", "7", "8"));
        }
    }

    @GetMapping("/teacher/{teacherIdentifier}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByTeacher(@PathVariable String teacherIdentifier) {
        return ResponseEntity.ok(subjectService.getSubjectsByTeacher(teacherIdentifier));
    }

    @GetMapping("/student/{studentEmail}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByStudent(@PathVariable String studentEmail) {
        return ResponseEntity.ok(subjectService.getSubjectsByStudent(studentEmail));
    }

    @GetMapping
    public ResponseEntity<List<SubjectDTO>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/{subjectId}")
    public ResponseEntity<SubjectDTO> getSubjectById(@PathVariable Long subjectId) {
        return ResponseEntity.ok(subjectService.getSubjectById(subjectId));
    }

    @GetMapping("/program/{programName}/semester/{semester}")
    public ResponseEntity<List<SubjectDTO>> getSubjectsByProgramAndSemester(
            @PathVariable String programName,
            @PathVariable Integer semester) {
        return ResponseEntity.ok(subjectService.getSubjectsByProgramAndSemester(programName, semester));
    }

    @GetMapping("/{subjectId}/students")
    public ResponseEntity<?> getStudentsBySubject(@PathVariable Long subjectId) {
        try {
            // Get the actual Subject entity
            com.department.model.Subject subjectEntity = subjectRepository.findById(subjectId)
                    .orElse(null);
            if (subjectEntity == null) {
                return ResponseEntity.status(404).body(new com.department.dto.MessageDTO("Subject not found"));
            }
            
            // Get ALL students enrolled in this program/semester
            // They automatically have access to all subjects in their program/semester
            String programName = subjectEntity.getProgramName() != null ? subjectEntity.getProgramName() : 
                                (subjectEntity.getProgram() != null ? subjectEntity.getProgram().getName() : "");
            Integer semester = subjectEntity.getSemester();
            
            List<com.department.model.Student> students = studentRepository.findByProgramAndSemester(programName, semester);
            
            // Convert to StudentDTO
            List<StudentDTO> studentDTOs = new ArrayList<>();
            for (com.department.model.Student student : students) {
                StudentDTO dto = new StudentDTO(
                    student.getId(),
                    student.getUser() != null ? student.getUser().getEmail() : "",
                    student.getUser() != null ? student.getUser().getFullName() : "",
                    student.getStudentId(),
                    student.getEnrollmentNumber()
                );
                studentDTOs.add(dto);
            }
            
            return ResponseEntity.ok(studentDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new com.department.dto.MessageDTO("Error: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<SubjectDTO> createSubject(@RequestBody SubjectDTO subjectDTO) {
        return ResponseEntity.ok(subjectService.createSubject(subjectDTO));
    }

    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectDTO> updateSubject(@PathVariable Long subjectId, @RequestBody SubjectDTO subjectDTO) {
        return ResponseEntity.ok(subjectService.updateSubject(subjectId, subjectDTO));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long subjectId) {
        subjectService.deleteSubject(subjectId);
        return ResponseEntity.ok(new com.department.dto.MessageDTO("Subject deleted successfully"));
    }
}


package com.department.service;

import com.department.dto.AlumniDTO;
import com.department.model.Alumni;
import com.department.model.Student;
import com.department.repository.AlumniRepository;
import com.department.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class AlumniService {
    private static final Logger logger = Logger.getLogger(AlumniService.class.getName());

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private StudentRepository studentRepository;

    // Create alumni record when student completes course
    public AlumniDTO createAlumniRecord(Long studentId, String program, Integer semester, Float marks, String passFail, String customFields) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Alumni alumni = new Alumni(student, program, semester);
            alumni.setMarks(marks);
            alumni.setPassFail(passFail);
            alumni.setCustomFields(customFields);
            alumni.setPassingDate(LocalDate.now());

            Alumni saved = alumniRepository.save(alumni);
            logger.info("Alumni record created for student: " + student.getStudentId());
            return alumniToDTO(saved);
        } catch (Exception e) {
            logger.warning("Error creating alumni record: " + e.getMessage());
            throw new RuntimeException("Failed to create alumni record: " + e.getMessage());
        }
    }

    // Get all alumni
    public List<AlumniDTO> getAllAlumni() {
        try {
            return alumniRepository.findAll().stream()
                    .map(this::alumniToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching alumni: " + e.getMessage());
            throw new RuntimeException("Failed to fetch alumni data");
        }
    }

    // Get alumni by program
    public List<AlumniDTO> getAlumniByProgram(String program) {
        try {
            return alumniRepository.findByProgram(program).stream()
                    .map(this::alumniToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching alumni by program: " + e.getMessage());
            throw new RuntimeException("Failed to fetch alumni by program");
        }
    }

    // Get alumni by program and semester
    public List<AlumniDTO> getAlumniByProgramAndSemester(String program, Integer semester) {
        try {
            return alumniRepository.findByProgramAndSemester(program, semester).stream()
                    .map(this::alumniToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching alumni by program and semester: " + e.getMessage());
            throw new RuntimeException("Failed to fetch alumni by program and semester");
        }
    }

    // Get single alumni record
    public AlumniDTO getAlumniByStudentId(Long studentId) {
        try {
            Alumni alumni = alumniRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("Alumni record not found for student"));
            return alumniToDTO(alumni);
        } catch (Exception e) {
            logger.warning("Error fetching alumni record: " + e.getMessage());
            throw new RuntimeException("Alumni record not found");
        }
    }

    // Update alumni record
    public AlumniDTO updateAlumniRecord(Long alumniId, Float marks, String passFail, String currentOccupation, String company, String customFields) {
        try {
            Alumni alumni = alumniRepository.findById(alumniId)
                    .orElseThrow(() -> new RuntimeException("Alumni record not found"));

            if (marks != null) alumni.setMarks(marks);
            if (passFail != null) alumni.setPassFail(passFail);
            if (currentOccupation != null) alumni.setCurrentOccupation(currentOccupation);
            if (company != null) alumni.setCompany(company);
            if (customFields != null) alumni.setCustomFields(customFields);
            
            Alumni updated = alumniRepository.save(alumni);
            logger.info("Alumni record updated for ID: " + alumniId);
            return alumniToDTO(updated);
        } catch (Exception e) {
            logger.warning("Error updating alumni record: " + e.getMessage());
            throw new RuntimeException("Failed to update alumni record");
        }
    }

    // Delete alumni record
    public void deleteAlumniRecord(Long alumniId) {
        try {
            alumniRepository.deleteById(alumniId);
            logger.info("Alumni record deleted with ID: " + alumniId);
        } catch (Exception e) {
            logger.warning("Error deleting alumni record: " + e.getMessage());
            throw new RuntimeException("Failed to delete alumni record");
        }
    }

    // Helper method to convert Alumni to DTO
    private AlumniDTO alumniToDTO(Alumni alumni) {
        AlumniDTO dto = new AlumniDTO();
        dto.setId(alumni.getId());
        dto.setStudentId(alumni.getStudent().getId());
        dto.setStudentName(alumni.getStudent().getUser().getFullName());
        dto.setStudentEmail(alumni.getStudent().getUser().getEmail());
        dto.setProgram(alumni.getProgram());
        dto.setSemester(alumni.getSemester());
        dto.setMarks(alumni.getMarks());
        dto.setPassFail(alumni.getPassFail());
        dto.setJoinDate(alumni.getJoinDate());
        dto.setPassingDate(alumni.getPassingDate());
        dto.setCurrentOccupation(alumni.getCurrentOccupation());
        dto.setCompany(alumni.getCompany());
        dto.setCustomFields(alumni.getCustomFields());
        
        // Fetch ALL Student details from the Student record (database)
        Student student = alumni.getStudent();
        dto.setContactNo(student.getContactNo());
        dto.setDepartment(student.getDepartment());
        dto.setEnrollmentNumber(student.getEnrollmentNumber());
        dto.setAttendancePercentage(student.getAttendancePercentage());
        
        // Get gender and address from customFields if available
        try {
            if (student.getCustomFields() != null) {
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(student.getCustomFields());
                if (root.has("gender")) {
                    dto.setGender(root.get("gender").asText());
                }
                if (root.has("address")) {
                    dto.setAddress(root.get("address").asText());
                }
            }
        } catch (Exception e) {
            logger.warning("Error parsing student customFields: " + e.getMessage());
        }
        
        return dto;
    }
}

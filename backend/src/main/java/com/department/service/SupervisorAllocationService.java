package com.department.service;

import com.department.dto.SupervisorAllocationDTO;
import com.department.model.SupervisorAllocation;
import com.department.model.Student;
import com.department.model.Teacher;
import com.department.repository.SupervisorAllocationRepository;
import com.department.repository.StudentRepository;
import com.department.repository.TeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class SupervisorAllocationService {
    private static final Logger logger = Logger.getLogger(SupervisorAllocationService.class.getName());

    @Autowired
    private SupervisorAllocationRepository allocationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    // Allocate supervisor to student
    public SupervisorAllocationDTO allocateSupervisor(Long studentId, Long teacherId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Check if student already has a supervisor
            allocationRepository.findByStudentId(studentId).ifPresent(existing -> {
                throw new RuntimeException("Student already has a supervisor allocated");
            });

            SupervisorAllocation allocation = new SupervisorAllocation(student, teacher);
            SupervisorAllocation saved = allocationRepository.save(allocation);
            logger.info("Supervisor allocated to student: " + student.getStudentId());
            return allocationToDTO(saved);
        } catch (Exception e) {
            logger.warning("Error allocating supervisor: " + e.getMessage());
            throw new RuntimeException("Failed to allocate supervisor: " + e.getMessage());
        }
    }

    // Get all allocations
    public List<SupervisorAllocationDTO> getAllAllocations() {
        try {
            return allocationRepository.findAll().stream()
                    .map(this::allocationToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching allocations: " + e.getMessage());
            throw new RuntimeException("Failed to fetch allocations");
        }
    }

    // Get supervisor for a student
    public SupervisorAllocationDTO getSupervisorForStudent(Long studentId) {
        try {
            SupervisorAllocation allocation = allocationRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("No supervisor allocated to this student"));
            return allocationToDTO(allocation);
        } catch (Exception e) {
            logger.warning("Error fetching supervisor for student: " + e.getMessage());
            throw new RuntimeException("Supervisor not found for this student");
        }
    }

    // Get students under a supervisor (both regular students and PhD guides)
    public List<SupervisorAllocationDTO> getStudentsUnderSupervisor(Long teacherId) {
        try {
            logger.info("=== Fetching students for teacher: " + teacherId + " ===");
            List<SupervisorAllocation> allocations = new ArrayList<>();
            Set<Long> addedIds = new HashSet<>();  // Track added IDs to prevent duplicates
            
            // Get regular supervisor allocations (SUPERVISOR type where teacher_id matches)
            List<SupervisorAllocation> supervisorAllocations = allocationRepository.findByTeacherId(teacherId);
            logger.info("Found " + supervisorAllocations.size() + " SUPERVISOR allocations for teacher " + teacherId);
            for (SupervisorAllocation a : supervisorAllocations) {
                if (!addedIds.contains(a.getId())) {
                    allocations.add(a);
                    addedIds.add(a.getId());
                    logger.info("  - Student: " + a.getStudent().getStudentId() + ", Type: " + a.getAllocationType());
                }
            }
            
            // Get PhD guide allocations where this teacher is the guide
            List<SupervisorAllocation> phdAllocations = allocationRepository.findPhdGuidesByTeacherId(teacherId);
            logger.info("Found " + phdAllocations.size() + " GUIDE allocations for teacher " + teacherId);
            for (SupervisorAllocation a : phdAllocations) {
                if (!addedIds.contains(a.getId())) {
                    allocations.add(a);
                    addedIds.add(a.getId());
                    logger.info("  - PhD Student: " + a.getStudent().getStudentId() + ", Type: " + a.getAllocationType() + ", TeacherId: " + (a.getTeacher() != null ? a.getTeacher().getId() : "NULL"));
                }
            }
            
            logger.info("Total unique allocations returned for teacher: " + allocations.size());
            
            return allocations.stream()
                    .map(this::allocationToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching students for supervisor: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch students for supervisor");
        }
    }

    // Update allocation (change supervisor)
    public SupervisorAllocationDTO updateAllocation(Long allocationId, Long newTeacherId) {
        try {
            SupervisorAllocation allocation = allocationRepository.findById(allocationId)
                    .orElseThrow(() -> new RuntimeException("Allocation not found"));

            Teacher teacher = teacherRepository.findById(newTeacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            allocation.setTeacher(teacher);
            SupervisorAllocation updated = allocationRepository.save(allocation);
            logger.info("Allocation updated with ID: " + allocationId);
            return allocationToDTO(updated);
        } catch (Exception e) {
            logger.warning("Error updating allocation: " + e.getMessage());
            throw new RuntimeException("Failed to update allocation");
        }
    }

    // Allocate PhD guide to student
    public SupervisorAllocationDTO allocatePhdGuide(Long studentId, Long teacherId, String guideName, String guideDepartment, String specialization) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // Check if student already has a guide allocated
            allocationRepository.findByStudentId(studentId).ifPresent(existing -> {
                throw new RuntimeException("Student already has an allocation");
            });

            SupervisorAllocation allocation = new SupervisorAllocation(student, guideName, guideDepartment, specialization);
            
            // If a teacherId is provided, link the PhD student to that teacher
            if (teacherId != null) {
                Teacher teacher = teacherRepository.findById(teacherId)
                        .orElseThrow(() -> new RuntimeException("Teacher not found"));
                allocation.setTeacher(teacher);
            }
            
            SupervisorAllocation saved = allocationRepository.save(allocation);
            logger.info("PhD guide allocated to student: " + student.getStudentId());
            return allocationToDTO(saved);
        } catch (Exception e) {
            logger.warning("Error allocating PhD guide: " + e.getMessage());
            throw new RuntimeException("Failed to allocate PhD guide: " + e.getMessage());
        }
    }

    // Delete allocation
    public void deleteAllocation(Long allocationId) {
        try {
            allocationRepository.deleteById(allocationId);
            logger.info("Allocation deleted with ID: " + allocationId);
        } catch (Exception e) {
            logger.warning("Error deleting allocation: " + e.getMessage());
            throw new RuntimeException("Failed to delete allocation");
        }
    }

    // Email-based methods for getting students under supervisor
    public List<SupervisorAllocationDTO> getStudentsUnderSupervisorByEmail(String teacherEmail) {
        try {
            logger.info("=== Fetching students for teacher email: " + teacherEmail + " ===");
            Teacher teacher = teacherRepository.findByUserEmail(teacherEmail)
                    .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));
            
            return getStudentsUnderSupervisor(teacher.getId());
        } catch (Exception e) {
            logger.warning("Error fetching students for supervisor with email: " + e.getMessage());
            throw new RuntimeException("Failed to fetch students for supervisor: " + e.getMessage());
        }
    }

    // Helper method to convert allocation to DTO
    public SupervisorAllocationDTO allocationToDTO(SupervisorAllocation allocation) {
        SupervisorAllocationDTO dto = new SupervisorAllocationDTO();
        dto.setId(allocation.getId());
        dto.setStudentDbId(allocation.getStudent().getId());
        dto.setStudentId(allocation.getStudent().getStudentId());  // Use formatted student ID
        dto.setStudentName(allocation.getStudent().getUser().getFullName());
        dto.setStudentEmail(allocation.getStudent().getUser().getEmail());
        dto.setStudentProgram(allocation.getStudent().getProgram());
        dto.setStudentSemester(allocation.getStudent().getSemester() != null ? allocation.getStudent().getSemester().toString() : null);
        dto.setProjectTitle(allocation.getProjectTitle());
        dto.setProjectDescription(allocation.getProjectDescription());
        dto.setAllocationType(allocation.getAllocationType());
        
        if ("SUPERVISOR".equals(allocation.getAllocationType()) && allocation.getTeacher() != null) {
            dto.setTeacherId(allocation.getTeacher().getId());
            dto.setSupervisorName(allocation.getTeacher().getUser().getFullName());
            dto.setSupervisorEmail(allocation.getTeacher().getUser().getEmail());
        } else if ("GUIDE".equals(allocation.getAllocationType())) {
            dto.setSupervisorName(allocation.getGuideName());
            dto.setSupervisorEmail("N/A");
            dto.setGuideDepartment(allocation.getGuideDepartment());
            dto.setSpecialization(allocation.getSpecialization());
        }
        
        dto.setAllocationDate(allocation.getAllocationDate());
        return dto;
    }
}

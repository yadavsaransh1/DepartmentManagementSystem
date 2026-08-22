package com.department.service;

import com.department.dto.TeacherPowerDTO;
import com.department.model.Teacher;
import com.department.model.TeacherPower;
import com.department.model.User;
import com.department.repository.CommitteeMemberRepository;
import com.department.repository.TeacherPowerRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class TeacherPowerService {
    private static final Logger logger = Logger.getLogger(TeacherPowerService.class.getName());
    
    @Autowired
    private TeacherPowerRepository teacherPowerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;

    @Autowired
    private EntityManager entityManager;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public TeacherPowerDTO appointAsHoD(String teacherEmail) {
        logger.info("Attempting to appoint HoD: " + teacherEmail);
        User teacher = userRepository.findById(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));

        // Update user role to HOD
        teacher.setRole(User.UserRole.HOD);
        userRepository.save(teacher);
        entityManager.flush();  // Ensure User changes are persisted
        logger.info("Updated User role to HOD for: " + teacherEmail);

        // Update Teacher.isHoD flag (legacy field for frontend compatibility)
        Optional<Teacher> teacherEntity = teacherRepository.findByUserEmail(teacherEmail);
        if (teacherEntity.isPresent()) {
            Teacher t = teacherEntity.get();
            t.setIsHoD(true);
            teacherRepository.save(t);
            logger.info("Updated Teacher.isHoD=true for: " + teacherEmail);
        }

        // Create or update TeacherPower record
        Optional<TeacherPower> existing = teacherPowerRepository.findByTeacher(teacher);
        TeacherPower power;
        if (existing.isPresent()) {
            power = existing.get();
            power.setIsHoD(true);
            // HOD gets all default powers (all 8 tabs)
            power.setCanAccessHomePage(true);
            power.setCanAccessStudentDetails(true);
            power.setCanAccessTeacherDetails(true);
            power.setCanAccessResults(true);
            power.setCanAccessStudentStatistics(true);
            power.setCanAccessProject(true);
            power.setCanAccessFeedback(true);
            power.setCanAccessAssignment(true);
        } else {
            power = new TeacherPower(teacher, true);
            power.setCanAccessHomePage(true);
            power.setCanAccessStudentDetails(true);
            power.setCanAccessTeacherDetails(true);
            power.setCanAccessResults(true);
            power.setCanAccessStudentStatistics(true);
            power.setCanAccessProject(true);
            power.setCanAccessFeedback(true);
            power.setCanAccessAssignment(true);
        }
        power.setUpdatedAt(LocalDateTime.now());
        teacherPowerRepository.save(power);
        logger.info("Successfully appointed HoD: " + teacherEmail);

        return convertToDTO(power);
    }

    @Transactional
    public TeacherPowerDTO removeHoDStatus(String teacherEmail) {
        logger.info("Attempting to remove HoD status: " + teacherEmail);
        User teacher = userRepository.findById(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));

        // Update user role back to TEACHER
        teacher.setRole(User.UserRole.TEACHER);
        userRepository.save(teacher);
        entityManager.flush();  // Ensure User changes are persisted
        logger.info("Updated User role to TEACHER for: " + teacherEmail);

        // Update Teacher.isHoD flag (legacy field for frontend compatibility)
        Optional<Teacher> teacherEntity = teacherRepository.findByUserEmail(teacherEmail);
        if (teacherEntity.isPresent()) {
            Teacher t = teacherEntity.get();
            t.setIsHoD(false);
            teacherRepository.save(t);
            logger.info("Updated Teacher.isHoD=false for: " + teacherEmail);
        }

        // Update TeacherPower record
        Optional<TeacherPower> existing = teacherPowerRepository.findByTeacher(teacher);
        TeacherPower power;
        if (existing.isPresent()) {
            power = existing.get();
            power.setIsHoD(false);
        } else {
            power = new TeacherPower(teacher, false);
        }
        power.setUpdatedAt(LocalDateTime.now());
        teacherPowerRepository.save(power);
        logger.info("Successfully removed HoD status: " + teacherEmail);

        return convertToDTO(power);
    }

    @Transactional
    public TeacherPowerDTO updateTeacherPowers(String teacherEmail, TeacherPowerDTO dto) {
        logger.info("Updating teacher powers for: " + teacherEmail);
        User teacher = userRepository.findById(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));

        Optional<TeacherPower> existing = teacherPowerRepository.findByTeacher(teacher);
        TeacherPower power;
        if (existing.isPresent()) {
            power = existing.get();
        } else {
            power = new TeacherPower(teacher, false);
        }

        // Update all powers from DTO
        if (dto.getCanAccessHomePage() != null) power.setCanAccessHomePage(dto.getCanAccessHomePage());
        if (dto.getCanAccessStudentDetails() != null) power.setCanAccessStudentDetails(dto.getCanAccessStudentDetails());
        if (dto.getCanAccessTeacherDetails() != null) power.setCanAccessTeacherDetails(dto.getCanAccessTeacherDetails());
        if (dto.getCanAccessResults() != null) power.setCanAccessResults(dto.getCanAccessResults());
        if (dto.getCanAccessStudentStatistics() != null) power.setCanAccessStudentStatistics(dto.getCanAccessStudentStatistics());
        if (dto.getCanAccessProject() != null) power.setCanAccessProject(dto.getCanAccessProject());
        if (dto.getCanAccessFeedback() != null) power.setCanAccessFeedback(dto.getCanAccessFeedback());
        if (dto.getCanAccessAssignment() != null) power.setCanAccessAssignment(dto.getCanAccessAssignment());
        if (dto.getCanAccessCommittee() != null) power.setCanAccessCommittee(dto.getCanAccessCommittee());

        power.setUpdatedAt(LocalDateTime.now());
        teacherPowerRepository.save(power);
        entityManager.flush();  // Ensure changes are immediately persisted to database
        logger.info("Successfully updated teacher powers: " + teacherEmail);

        return convertToDTO(power);
    }

    @Transactional
    public TeacherPowerDTO getTeacherPowers(String teacherEmail) {
        logger.info("Fetching teacher powers for: " + teacherEmail);
        User teacher = userRepository.findById(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));
        
        Optional<TeacherPower> power = teacherPowerRepository.findByTeacher(teacher);
        TeacherPowerDTO dto;
        
        if (power.isPresent()) {
            dto = convertToDTO(power.get());
        } else {
            // Return default powers (all false) if not created yet
            TeacherPower defaultPower = new TeacherPower(teacher, false);
            dto = convertToDTO(defaultPower);
        }
        
        // AGGREGATE: Also fetch and merge all committee member powers for this teacher
        try {
            Set<String> allCommitteePowers = getAllCommitteePowersForTeacher(teacherEmail);
            if (!allCommitteePowers.isEmpty()) {
                logger.info("Found " + allCommitteePowers.size() + " committee powers for " + teacherEmail);
                // Merge committee powers into the DTO (OR logic: set to true if either direct power OR committee power)
                for (String powerName : allCommitteePowers) {
                    switch (powerName) {
                        case "canAccessHomePage":
                            if (!dto.getCanAccessHomePage()) dto.setCanAccessHomePage(true);
                            break;
                        case "canAccessStudentDetails":
                            if (!dto.getCanAccessStudentDetails()) dto.setCanAccessStudentDetails(true);
                            break;
                        case "canAccessTeacherDetails":
                            if (!dto.getCanAccessTeacherDetails()) dto.setCanAccessTeacherDetails(true);
                            break;
                        case "canAccessResults":
                            if (!dto.getCanAccessResults()) dto.setCanAccessResults(true);
                            break;
                        case "canAccessStudentStatistics":
                            if (!dto.getCanAccessStudentStatistics()) dto.setCanAccessStudentStatistics(true);
                            break;
                        case "canAccessProject":
                            if (!dto.getCanAccessProject()) dto.setCanAccessProject(true);
                            break;
                        case "canAccessFeedback":
                            if (!dto.getCanAccessFeedback()) dto.setCanAccessFeedback(true);
                            break;
                        case "canAccessAssignment":
                            if (!dto.getCanAccessAssignment()) dto.setCanAccessAssignment(true);
                            break;
                        case "canAccessCommittee":
                            if (!dto.getCanAccessCommittee()) dto.setCanAccessCommittee(true);
                            break;
                    }
                }
                logger.info("Merged committee powers into dto for: " + teacherEmail);
            }
        } catch (Exception e) {
            logger.warning("Error aggregating committee powers for " + teacherEmail + ": " + e.getMessage());
            // Continue with just the direct powers if committee aggregation fails
        }
        
        return dto;
    }

    /**
     * Fetches all unique powers assigned to a teacher via committee memberships
     */
    private Set<String> getAllCommitteePowersForTeacher(String teacherEmail) {
        Set<String> allPowers = new HashSet<>();
        try {
            // Get all committee memberships for this teacher
            var members = committeeMemberRepository.findAll().stream()
                    .filter(m -> m.getTeacher().getEmail().equals(teacherEmail) && m.getPowers() != null)
                    .toList();
            
            for (var member : members) {
                try {
                    // Parse JSON powers array from committee member record
                    List<String> memberPowers = objectMapper.readValue(member.getPowers(), 
                            objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
                    if (memberPowers != null) {
                        allPowers.addAll(memberPowers);
                    }
                } catch (Exception e) {
                    logger.warning("Error parsing powers for committee member " + member.getId() + ": " + e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.warning("Error fetching committee members for " + teacherEmail + ": " + e.getMessage());
        }
        return allPowers;
    }

    public List<TeacherPowerDTO> getAllTeacherPowers() {
        logger.info("Fetching all teacher powers");
        return teacherPowerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TeacherPowerDTO> getAllHoDs() {
        logger.info("Fetching all HoDs");
        return teacherPowerRepository.findByIsHoDTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TeacherPowerDTO convertToDTO(TeacherPower power) {
        return new TeacherPowerDTO(
                power.getId(),
                0L,  // teacherId (not used, Teacher uses email as ID)
                power.getTeacher().getEmail(),
                power.getTeacher().getFullName(),
                power.getCanAccessHomePage(),
                power.getCanAccessStudentDetails(),
                power.getCanAccessTeacherDetails(),
                power.getCanAccessResults(),
                power.getCanAccessStudentStatistics(),
                power.getCanAccessProject(),
                power.getCanAccessFeedback(),
                power.getCanAccessAssignment(),
                power.getCanAccessCommittee(),
                power.getIsHoD()
        );
    }
}

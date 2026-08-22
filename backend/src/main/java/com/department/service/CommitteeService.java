package com.department.service;

import com.department.dto.*;
import com.department.model.*;
import com.department.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.logging.Logger;

@Service
public class CommitteeService {
    @Autowired
    private CommitteeRepository committeeRepository;
    
    @Autowired
    private CommitteeMemberRepository committeeMemberRepository;
    
    @Autowired
    private CommitteeMessageRepository committeeMessageRepository;
    
    @Autowired
    private CommitteeDocumentRepository committeeDocumentRepository;
    
    @Autowired
    private CommitteePowerRepository committeePowerRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherPowerService teacherPowerService;

    private static final Logger logger = Logger.getLogger(CommitteeService.class.getName());
    private ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public CommitteeDTO createCommittee(String name, String description, String createdByEmail, List<String> memberEmails, Map<String, String> memberRoles, Map<String, List<String>> memberPowers) {
        try {
            User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + createdByEmail));

            Committee committee = new Committee(name, description, createdBy);
            Committee saved = committeeRepository.save(committee);

            // Add members
            if (memberEmails != null && !memberEmails.isEmpty()) {
                for (String memberEmail : memberEmails) {
                    User teacher = userRepository.findByEmail(memberEmail)
                        .orElse(null);
                    if (teacher != null) {
                        String role = memberRoles != null ? memberRoles.get(memberEmail) : "Member";
                        CommitteeMember member = new CommitteeMember(saved, teacher, role);
                        
                        // Add powers if provided
                        if (memberPowers != null && memberPowers.containsKey(memberEmail)) {
                            List<String> powers = memberPowers.get(memberEmail);
                            member.setPowers(objectMapper.writeValueAsString(powers));
                        }
                        
                        committeeMemberRepository.save(member);
                    }
                }
            }

            return getCommitteeDTO(saved);
        } catch (Exception e) {
            logger.severe("Error creating committee: " + e.getMessage());
            throw new RuntimeException("Error creating committee: " + e.getMessage());
        }
    }

    public List<CommitteeDTO> getAllCommittees() {
        return committeeRepository.findAll().stream()
            .map(this::getCommitteeDTO)
            .collect(Collectors.toList());
    }

    public CommitteeDTO getCommitteeById(Long id) {
        return committeeRepository.findById(id)
            .map(this::getCommitteeDTO)
            .orElseThrow(() -> new RuntimeException("Committee not found: " + id));
    }

    public List<CommitteeDTO> getCommitteesByTeacher(String teacherEmail) {
        return committeeRepository.findByMemberTeacherEmail(teacherEmail).stream()
            .map(this::getCommitteeDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public CommitteeDTO updateCommittee(Long id, String name, String description) {
        Committee committee = committeeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Committee not found: " + id));
        
        committee.setName(name);
        committee.setDescription(description);
        committee.setUpdatedAt(LocalDateTime.now());
        
        Committee updated = committeeRepository.save(committee);
        return getCommitteeDTO(updated);
    }

    @Transactional
    public void deleteCommittee(Long id) {
        committeeRepository.deleteById(id);
    }

    @Transactional
    public CommitteeMemberDTO addMemberToCommittee(Long committeeId, String teacherEmail, String role, List<String> powers) {
        Committee committee = committeeRepository.findById(committeeId)
            .orElseThrow(() -> new RuntimeException("Committee not found: " + committeeId));
        
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherEmail));

        // Check if already a member
        if (committeeMemberRepository.findByCommitteeIdAndTeacherEmail(committeeId, teacherEmail).isPresent()) {
            throw new RuntimeException("Teacher is already a member of this committee");
        }

        CommitteeMember member = new CommitteeMember(committee, teacher, role != null ? role : "Member");
        
        if (powers != null && !powers.isEmpty()) {
            try {
                member.setPowers(objectMapper.writeValueAsString(powers));
                
                // SYNCHRONIZE: Update teacher's global powers with committee-assigned powers
                syncPowersToTeacherPower(teacherEmail, powers);
                
            } catch (Exception e) {
                logger.warning("Could not serialize powers: " + e.getMessage());
            }
        }

        CommitteeMember saved = committeeMemberRepository.save(member);
        return getMemberDTO(saved);
    }

    @Transactional
    public CommitteeMemberDTO updateMemberRole(Long committeeId, String teacherEmail, String newRole) {
        CommitteeMember member = committeeMemberRepository.findByCommitteeIdAndTeacherEmail(committeeId, teacherEmail)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setRole(newRole);
        member.setUpdatedAt(LocalDateTime.now());
        
        CommitteeMember updated = committeeMemberRepository.save(member);
        return getMemberDTO(updated);
    }

    @Transactional
    public CommitteeMemberDTO updateMemberPowers(Long committeeId, String teacherEmail, List<String> powers) {
        CommitteeMember member = committeeMemberRepository.findByCommitteeIdAndTeacherEmail(committeeId, teacherEmail)
            .orElseThrow(() -> new RuntimeException("Member not found"));
        
        try {
            member.setPowers(objectMapper.writeValueAsString(powers));
            member.setUpdatedAt(LocalDateTime.now());
            
            // SYNCHRONIZE: Update teacher's global powers with committee-assigned powers
            if (powers != null && !powers.isEmpty()) {
                syncPowersToTeacherPower(teacherEmail, powers);
            }
            
            CommitteeMember updated = committeeMemberRepository.save(member);
            return getMemberDTO(updated);
        } catch (Exception e) {
            throw new RuntimeException("Error updating powers: " + e.getMessage());
        }
    }

    @Transactional
    public void removeMemberFromCommittee(Long committeeId, String teacherEmail) {
        committeeMemberRepository.deleteByCommitteeIdAndTeacherEmail(committeeId, teacherEmail);
    }

    /**
     * Synchronizes committee member powers to the teacher's global TeacherPower record
     * This ensures that powers assigned via committee are reflected in the special powers system
     */
    @Transactional
    private void syncPowersToTeacherPower(String teacherEmail, List<String> committeePowers) {
        try {
            if (committeePowers == null || committeePowers.isEmpty()) {
                return;
            }

            logger.info("Syncing committee powers to TeacherPower for: " + teacherEmail);
            
            // Fetch current teacher powers
            TeacherPowerDTO currentPowers = teacherPowerService.getTeacherPowers(teacherEmail);
            
            // Map of committee power names to TeacherPower field names
            // They should match exactly for this sync to work
            for (String power : committeePowers) {
                switch (power) {
                    case "canAccessHomePage":
                        currentPowers.setCanAccessHomePage(true);
                        break;
                    case "canAccessStudentDetails":
                        currentPowers.setCanAccessStudentDetails(true);
                        break;
                    case "canAccessTeacherDetails":
                        currentPowers.setCanAccessTeacherDetails(true);
                        break;
                    case "canAccessResults":
                        currentPowers.setCanAccessResults(true);
                        break;
                    case "canAccessStudentStatistics":
                        currentPowers.setCanAccessStudentStatistics(true);
                        break;
                    case "canAccessProject":
                        currentPowers.setCanAccessProject(true);
                        break;
                    case "canAccessFeedback":
                        currentPowers.setCanAccessFeedback(true);
                        break;
                    case "canAccessAssignment":
                        currentPowers.setCanAccessAssignment(true);
                        break;
                    case "canAccessCommittee":
                        currentPowers.setCanAccessCommittee(true);
                        break;
                    default:
                        logger.warning("Unknown power: " + power);
                }
            }
            
            // Update teacher powers in the database
            teacherPowerService.updateTeacherPowers(teacherEmail, currentPowers);
            logger.info("Successfully synced " + committeePowers.size() + " powers to TeacherPower for: " + teacherEmail);
            
        } catch (Exception e) {
            logger.severe("Error syncing powers to TeacherPower for " + teacherEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<CommitteeMemberDTO> getCommitteeMembers(Long committeeId) {
        return committeeMemberRepository.findByCommitteeId(committeeId).stream()
            .map(this::getMemberDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public CommitteeMessageDTO sendMessage(Long committeeId, String senderEmail, String messageText) {
        Committee committee = committeeRepository.findById(committeeId)
            .orElseThrow(() -> new RuntimeException("Committee not found"));
        
        User sender = userRepository.findByEmail(senderEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CommitteeMessage message = new CommitteeMessage(committee, sender, messageText);
        CommitteeMessage saved = committeeMessageRepository.save(message);
        
        return getMessageDTO(saved);
    }

    public List<CommitteeMessageDTO> getCommitteeMessages(Long committeeId) {
        return committeeMessageRepository.findByCommitteeIdOrderByCreatedAtDesc(committeeId).stream()
            .map(this::getMessageDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMessage(Long messageId) {
        committeeMessageRepository.deleteById(messageId);
    }

    public CommitteeDocumentDTO uploadDocument(Long committeeId, String documentName, String filePath, String documentType, String uploadedByEmail, String description, Long fileSize) {
        Committee committee = committeeRepository.findById(committeeId)
            .orElseThrow(() -> new RuntimeException("Committee not found"));
        
        User uploader = userRepository.findByEmail(uploadedByEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        CommitteeDocument document = new CommitteeDocument(committee, documentName, filePath, uploader);
        document.setDocumentType(documentType);
        document.setDescription(description);
        document.setFileSize(fileSize);
        
        CommitteeDocument saved = committeeDocumentRepository.save(document);
        return getDocumentDTO(saved);
    }

    public List<CommitteeDocumentDTO> getCommitteeDocuments(Long committeeId) {
        return committeeDocumentRepository.findByCommitteeIdOrderByUploadedAtDesc(committeeId).stream()
            .map(this::getDocumentDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        committeeDocumentRepository.deleteById(documentId);
    }

    public CommitteeDocument getDocument(Long documentId) {
        return committeeDocumentRepository.findById(documentId).orElse(null);
    }

    public List<Map<String, Object>> getAvailablePowers() {
        return committeePowerRepository.findAll().stream()
            .map(power -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", power.getId());
                map.put("powerName", power.getPowerName());
                map.put("description", power.getDescription());
                return map;
            })
            .collect(Collectors.toList());
    }

    // Helper methods
    private CommitteeDTO getCommitteeDTO(Committee committee) {
        CommitteeDTO dto = new CommitteeDTO(
            committee.getId(),
            committee.getName(),
            committee.getDescription(),
            committee.getCreatedBy().getEmail(),
            committee.getCreatedBy().getFullName(),
            committee.getCreatedAt()
        );
        dto.setUpdatedAt(committee.getUpdatedAt());
        
        if (committee.getMembers() != null) {
            List<CommitteeMemberDTO> members = committee.getMembers().stream()
                .map(this::getMemberDTO)
                .collect(Collectors.toList());
            dto.setMembers(members);
            dto.setMemberCount(members.size());
        }
        
        return dto;
    }

    private CommitteeMemberDTO getMemberDTO(CommitteeMember member) {
        CommitteeMemberDTO dto = new CommitteeMemberDTO(
            member.getId(),
            member.getTeacher().getEmail(),
            member.getTeacher().getFullName(),
            member.getRole()
        );
        dto.setCommitteeId(member.getCommittee().getId());
        dto.setJoinedDate(member.getJoinedDate());
        
        if (member.getPowers() != null && !member.getPowers().isEmpty()) {
            try {
                List<String> powers = objectMapper.readValue(member.getPowers(), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
                dto.setPowers(powers);
            } catch (Exception e) {
                logger.warning("Could not parse powers: " + e.getMessage());
                dto.setPowers(new ArrayList<>());
            }
        } else {
            dto.setPowers(new ArrayList<>());
        }
        
        return dto;
    }

    private CommitteeMessageDTO getMessageDTO(CommitteeMessage message) {
        return new CommitteeMessageDTO(
            message.getId(),
            message.getSender().getEmail(),
            message.getSender().getFullName(),
            message.getMessageText(),
            message.getCreatedAt()
        );
    }

    private CommitteeDocumentDTO getDocumentDTO(CommitteeDocument document) {
        CommitteeDocumentDTO dto = new CommitteeDocumentDTO(
            document.getId(),
            document.getDocumentName(),
            document.getFilePath(),
            document.getUploadedBy().getEmail(),
            document.getUploadedBy().getFullName(),
            document.getUploadedAt()
        );
        dto.setCommitteeId(document.getCommittee().getId());
        dto.setDocumentType(document.getDocumentType());
        dto.setDescription(document.getDescription());
        dto.setFileSize(document.getFileSize());
        return dto;
    }
}

package com.department.service;

import com.department.dto.ProjectMessageDTO;
import com.department.model.ProjectMessage;
import com.department.model.SupervisorAllocation;
import com.department.model.User;
import com.department.repository.ProjectMessageRepository;
import com.department.repository.SupervisorAllocationRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class ProjectMessageService {
    private static final Logger logger = Logger.getLogger(ProjectMessageService.class.getName());

    @Autowired
    private ProjectMessageRepository messageRepository;

    @Autowired
    private SupervisorAllocationRepository allocationRepository;

    @Autowired
    private UserRepository userRepository;

    // Send a message
    public ProjectMessageDTO sendMessage(Long allocationId, String messageText, String senderRole, String userEmail) {
        try {
            SupervisorAllocation allocation = allocationRepository.findById(allocationId)
                    .orElseThrow(() -> new RuntimeException("Allocation not found"));

            User sender = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ProjectMessage message = new ProjectMessage(allocation, messageText, senderRole, sender);
            ProjectMessage saved = messageRepository.save(message);

            logger.info("Message sent by " + userEmail + " for allocation " + allocationId);
            return messageToDTO(saved);
        } catch (Exception e) {
            logger.warning("Error sending message: " + e.getMessage());
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }

    // Get messages for an allocation
    public List<ProjectMessageDTO> getMessages(Long allocationId) {
        try {
            return messageRepository.findByAllocationIdOrderByCreatedAtDesc(allocationId).stream()
                    .map(this::messageToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.warning("Error fetching messages: " + e.getMessage());
            throw new RuntimeException("Failed to fetch messages");
        }
    }

    // Helper method to convert to DTO
    private ProjectMessageDTO messageToDTO(ProjectMessage message) {
        ProjectMessageDTO dto = new ProjectMessageDTO();
        dto.setId(message.getId());
        dto.setAllocationId(message.getAllocation().getId());
        dto.setMessageText(message.getMessageText());
        dto.setSenderRole(message.getSenderRole());
        dto.setSenderName(message.getSender().getFullName());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}

package com.department.service;

import com.department.dto.DocumentDTO;
import com.department.model.Document;
import com.department.model.Routine;
import com.department.model.User;
import com.department.repository.DocumentRepository;
import com.department.repository.RoutineRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RoutineDocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private RoutineRepository routineRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${document.upload.dir:uploads}")
    private String uploadDir;

    public DocumentDTO uploadRoutineAsDocument(MultipartFile file, String semester, String academicYear, 
                                               String description, String uploadedByEmail) throws Exception {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        User uploader = userRepository.findById(uploadedByEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create Document record
        Document document = new Document();
        document.setDocumentCode(generateDocumentCode());
        document.setDocumentName(file.getOriginalFilename());
        document.setDescription(description);
        document.setCategory("ROUTINE");  // Marked as Routine
        document.setUploadedBy(uploader);
        document.setVisibility(Document.DocumentVisibility.PUBLIC);

        // Save file
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            byte[] fileContent = file.getBytes();
            Files.write(filePath, fileContent);

            document.setFilePath(filePath.toString());
            document.setFileSize((long) fileContent.length);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }

        Document saved = documentRepository.save(document);

        // Also save to Routine table for compatibility
        try {
            Routine routine = new Routine();
            routine.setFileName(file.getOriginalFilename());
            routine.setFileType(file.getContentType());
            routine.setFileSize(file.getSize());
            routine.setFilePath(document.getFilePath());
            routine.setSemester(semester);
            routine.setAcademicYear(academicYear);
            routine.setDescription(description);
            routine.setUploadedByEmail(uploadedByEmail);
            routine.setDownloadCount(0);
            routine.setCreatedAt(LocalDateTime.now());
            routine.setUpdatedAt(LocalDateTime.now());

            routineRepository.save(routine);
        } catch (Exception e) {
            System.out.println("Warning: Could not save routine entry: " + e.getMessage());
        }

        return convertToDTO(saved);
    }

    private String generateDocumentCode() {
        return "DOC" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private DocumentDTO convertToDTO(Document doc) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(doc.getId());
        dto.setDocumentName(doc.getDocumentName());
        dto.setDescription(doc.getDescription());
        dto.setCategory(doc.getCategory());
        dto.setUploadedByEmail(doc.getUploadedBy() != null ? doc.getUploadedBy().getEmail() : "");
        dto.setUploadedByName(doc.getUploadedBy() != null ? doc.getUploadedBy().getFullName() : "");
        dto.setCreatedAt(doc.getCreatedAt());
        return dto;
    }
}

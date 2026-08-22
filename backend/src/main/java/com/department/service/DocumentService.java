package com.department.service;

import com.department.dto.DocumentDTO;
import com.department.model.Document;
import com.department.model.User;
import com.department.model.Student;
import com.department.model.Teacher;
import com.department.model.Subject;
import com.department.repository.DocumentRepository;
import com.department.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.department.repository.StudentRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class DocumentService {
    private static final Logger logger = Logger.getLogger(DocumentService.class.getName());

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    
    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Value("${document.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public DocumentDTO uploadDocument(DocumentDTO dto, byte[] fileContent, String email, String originalFilename) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Document document = new Document();
        document.setDocumentCode(generateDocumentCode());
        document.setDocumentName(dto.getDocumentName());
        document.setDescription(dto.getDescription());
        document.setCategory(dto.getCategory());
        document.setOtherCategoryValue(dto.getOtherCategoryValue());
        document.setUploadedBy(user);
        document.setVisibility(Document.DocumentVisibility.valueOf(dto.getVisibility().toUpperCase()));
        document.setAllowedRoles(dto.getAllowedRoles());
        
        // ✅ CRITICAL: Set allowedUserEmails BEFORE saving
        String allowedEmails = dto.getAllowedUserIds();
        logger.info("DocumentService.uploadDocument - setting allowedUserEmails");
        logger.info("  Input from DTO.getAllowedUserIds(): [" + allowedEmails + "]");
        logger.info("  Is null: " + (allowedEmails == null));
        logger.info("  Is empty: " + (allowedEmails != null && allowedEmails.isEmpty()));
        logger.info("  Length: " + (allowedEmails != null ? allowedEmails.length() : "null"));
        
        document.setAllowedUserEmails(allowedEmails);  // ✅ Use setAllowedUserEmails for clarity
        logger.info("  After object creation, document.getAllowedUserEmails(): [" + document.getAllowedUserEmails() + "]");
        
        document.setAllowedCourses(dto.getAllowedCourses());
        
        // Save file
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);
            
            // Preserve original file extension
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + "_" + dto.getDocumentName() + fileExtension;
            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, fileContent);
            
            document.setFilePath(filePath.toString());
            document.setFileSize((long) fileContent.length);
        } catch (Exception e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }

        Document saved = documentRepository.save(document);
        logger.info("Document saved to database");
        logger.info("  Document ID: " + saved.getId());
        logger.info("  Document Title: " + saved.getDocumentName());
        logger.info("  Visibility: " + saved.getVisibility());
        logger.info("  allowedUserEmails in DB: [" + saved.getAllowedUserEmails() + "]");
        logger.info("  getAllowedUserIds() returns: [" + saved.getAllowedUserIds() + "]");
        logger.info("  Category: " + saved.getCategory());
        
        return documentToDTO(saved);
    }

    public List<DocumentDTO> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        return documents.stream().map(this::documentToDTO).collect(Collectors.toList());
    }

    public List<DocumentDTO> getAccessibleDocuments(String email) {
        logger.info("===getAccessibleDocuments called with email: " + email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        
        logger.info("  User found: " + user.getFullName() + ", Role: " + user.getRole());
        
        List<Document> allDocuments = documentRepository.findAll();
        logger.info("  Total documents in DB: " + allDocuments.size());
        
        List<Document> accessibleDocs = new java.util.ArrayList<>();
        
        for (Document doc : allDocuments) {
            // Only include academic documents (study materials are now in StudyMaterial table)
            // Skip LECTURE_NOTES, ASSIGNMENT, SYLLABUS, EXAM_PAPER, REFERENCE categories
            if (shouldIncludeAcademicDocument(doc) && hasAccessToDocument(doc, user)) {
                accessibleDocs.add(doc);
            }
        }
        
        logger.info("  Accessible academic documents for " + email + ": " + accessibleDocs.size());
        return accessibleDocs.stream().map(this::documentToDTO).collect(Collectors.toList());
    }
    
    private boolean shouldIncludeAcademicDocument(Document doc) {
        // Study material categories - these should be in StudyMaterial table, not Document table
        java.util.Arrays.asList("LECTURE_NOTES", "ASSIGNMENT", "SYLLABUS", "EXAM_PAPER", "REFERENCE");
        
        if (doc.getCategory() != null) {
            String category = doc.getCategory();
            // Exclude study material categories - keep only academic categories
            if ("LECTURE_NOTES".equals(category) || 
                "ASSIGNMENT".equals(category) || 
                "SYLLABUS".equals(category) || 
                "EXAM_PAPER".equals(category) || 
                "REFERENCE".equals(category)) {
                logger.info("Filtering out study material category: " + category + " from document: " + doc.getId());
                return false;
            }
        }
        return true;
    }

    private boolean hasAccessToDocument(Document document, User user) {
        // ADMIN can access all documents
        if (user.getRole() != null && user.getRole().equals(User.UserRole.ADMIN)) {
            return true;
        }
        
        Document.DocumentVisibility visibility = document.getVisibility();
        
        // PUBLIC documents are visible to all
        if (visibility == Document.DocumentVisibility.PUBLIC) {
            return true;
        }
        
        // PRIVATE documents - only tagged members can access
        if (visibility == Document.DocumentVisibility.PRIVATE) {
            String allowedUserEmails = document.getAllowedUserEmails();
            if (allowedUserEmails != null && !allowedUserEmails.isEmpty()) {
                // Split by comma and trim each email
                String[] allowedEmails = allowedUserEmails.split(",");
                String userEmail = user.getEmail();
                // Trim each email before checking
                boolean hasAccess = Arrays.stream(allowedEmails)
                    .map(String::trim)
                    .anyMatch(email -> email.equalsIgnoreCase(userEmail));
                logger.info("PRIVATE doc access check - DocId: " + document.getId() + 
                    ", DocTitle: " + document.getDocumentName() +
                    ", UserEmail: " + user.getEmail() + 
                    ", AllowedEmails: [" + allowedUserEmails + "]" + 
                    ", HasAccess: " + hasAccess);
                return hasAccess;
            }
            logger.info("PRIVATE doc - no allowedUserEmails - DocId: " + document.getId() + 
                ", User: " + user.getEmail());
            return false;
        }
        
        // RESTRICTED documents - visible to specific roles
        if (visibility == Document.DocumentVisibility.RESTRICTED) {
            if (document.getAllowedRoles() != null && !document.getAllowedRoles().isEmpty()) {
                String[] allowedRoles = document.getAllowedRoles().split(",");
                String userRole = user.getRole() != null ? user.getRole().toString() : "";
                // Trim each role before checking
                return Arrays.stream(allowedRoles)
                    .map(String::trim)
                    .anyMatch(role -> role.equals(userRole));
            }
            return false;
        }
        
        // COURSE visibility - visible only to students enrolled in the course
        if (visibility == Document.DocumentVisibility.COURSE) {
            if (user.getRole() != null && user.getRole().equals(User.UserRole.TEACHER)) {
                // Teachers can see documents for courses they teach
                return canTeacherAccessCourseDocument(document, user);
            } else if (user.getRole() != null && user.getRole().equals(User.UserRole.STUDENT)) {
                // Students can see if they are enrolled in the course
                return canStudentAccessCourseDocument(document, user);
            }
            return false;
        }
        
        return false;
    }

    private boolean canStudentAccessCourseDocument(Document document, User user) {
        Optional<Student> studentOpt = studentRepository.findByUserEmail(user.getEmail());
        if (!studentOpt.isPresent()) {
            return false;
        }
        
        Student student = studentOpt.get();
        
        if (document.getAllowedCourses() == null || document.getAllowedCourses().isEmpty()) {
            return false;
        }
        
        // Parse allowed courses (format: "PROGRAM:SEMESTER,PROGRAM:SEMESTER")
        String[] allowedPrograms = document.getAllowedCourses().split(",");
        Set<String> allowedProgramsSet = new HashSet<>();
        for (String program : allowedPrograms) {
            allowedProgramsSet.add(program.trim().toLowerCase());
        }
        
        // First, check if student's direct program/semester matches
        if (student.getProgram() != null && student.getSemester() != null) {
            String studentProgramKey = (student.getProgram().trim() + ":" + student.getSemester()).toLowerCase();
            if (allowedProgramsSet.contains(studentProgramKey)) {
                logger.info("Student " + user.getEmail() + " has access to document " + document.getId() 
                    + " via direct program/semester match: " + studentProgramKey);
                return true;
            }
        }
        
      
        
        logger.info("Student " + user.getEmail() + " does NOT have access to document " + document.getId() 
            + ". Student program: " + student.getProgram() + ":" + student.getSemester() 
            + ", Allowed programs: " + document.getAllowedCourses());
        
        return false;
    }

    private boolean canTeacherAccessCourseDocument(Document document, User user) {
        // Teachers can access documents for courses they teach
        if (document.getAllowedCourses() == null || document.getAllowedCourses().isEmpty()) {
            return false;
        }
        
        try {
            // Get all subjects taught by this teacher
            Teacher teacher = teacherRepository.findByUserEmail(user.getEmail()).orElse(null);
            if (teacher == null) {
                logger.info("Teacher " + user.getEmail() + " not found");
                return false;
            }
            List<Subject> taughtSubjects = subjectRepository.findByTeacherId(teacher.getId());
            
            if (taughtSubjects == null || taughtSubjects.isEmpty()) {
                logger.info("Teacher " + user.getEmail() + " does not teach any subjects");
                return false;
            }
            
            // Extract unique courses from taught subjects
            Set<String> taughtCourses = new HashSet<>();
            for (Subject subject : taughtSubjects) {
                if (subject.getProgram() != null && subject.getSemester() != null) {
                    String courseKey = (subject.getProgram().getName().trim() + ":" + subject.getSemester()).toLowerCase();
                    taughtCourses.add(courseKey);
                }
            }
            
            // Parse allowed courses
            String[] allowedPrograms = document.getAllowedCourses().split(",");
            Set<String> allowedCoursesSet = new HashSet<>();
            for (String program : allowedPrograms) {
                allowedCoursesSet.add(program.trim().toLowerCase());
            }
            
            // Check if teacher teaches any of the allowed courses
            for (String taughtCourse : taughtCourses) {
                if (allowedCoursesSet.contains(taughtCourse)) {
                    logger.info("Teacher " + user.getEmail() + " has access to document " + document.getId() 
                        + " via taught course: " + taughtCourse);
                    return true;
                }
            }
            
            logger.info("Teacher " + user.getEmail() + " does NOT have access to document " + document.getId() 
                + ". Taught courses: " + taughtCourses + ", Allowed courses: " + document.getAllowedCourses());
            return false;
        } catch (Exception e) {
            logger.warning("Error checking teacher access to course document: " + e.getMessage());
            return false;
        }
    }

    public DocumentDTO getDocumentById(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        return documentToDTO(document);
    }

    public void deleteDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        // Delete the file
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (Exception e) {
            logger.warning("Failed to delete file: " + e.getMessage());
        }
        
        documentRepository.deleteById(documentId);
    }

    public void deleteDocument(Long documentId, String userEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Allow deletion if user is admin or is the document uploader
        boolean isAdmin = user.getRole() != null && user.getRole().equals(com.department.model.User.UserRole.ADMIN);
        boolean isUploader = document.getUploadedBy().getEmail().equals(user.getEmail());
        
        if (!isAdmin && !isUploader) {
            throw new RuntimeException("You do not have permission to delete this document");
        }
        
        // Delete the file
        try {
            Files.deleteIfExists(Paths.get(document.getFilePath()));
        } catch (Exception e) {
            logger.warning("Failed to delete file: " + e.getMessage());
        }
        
        documentRepository.deleteById(documentId);
    }

    public List<DocumentDTO> getPublicDocuments() {
        List<Document> documents = documentRepository.findPublicDocuments();
        // Filter out study material categories - keep only academic documents
        List<Document> academicDocs = documents.stream()
                .filter(this::shouldIncludeAcademicDocument)
                .collect(Collectors.toList());
        return academicDocs.stream().map(this::documentToDTO).collect(Collectors.toList());
    }

    public List<DocumentDTO> getUserDocuments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Document> documents = documentRepository.findByUploadedByEmail(user.getEmail());
        // Filter out study material categories - keep only academic documents
        List<Document> academicDocs = documents.stream()
                .filter(this::shouldIncludeAcademicDocument)
                .collect(Collectors.toList());
        return academicDocs.stream().map(this::documentToDTO).collect(Collectors.toList());
    }

    public List<DocumentDTO> getDocumentsByCategory(String category) {
        List<Document> documents = documentRepository.findAll().stream()
                .filter(doc -> category.equals(doc.getCategory()))
                .collect(Collectors.toList());
        return documents.stream().map(this::documentToDTO).collect(Collectors.toList());
    }

    public DocumentDTO searchDocuments(String keyword) {
        // This would use full-text search in production
        return null;
    }

    public byte[] downloadDocument(Long documentId, String email) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        // Check if user has access to this document
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!hasAccessToDocument(document, user)) {
            throw new SecurityException("You do not have permission to download this document");
        }
        
        try {
            document.setDownloadCount(document.getDownloadCount() + 1);
            documentRepository.save(document);
            
            Path filePath = Paths.get(document.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to download file: " + e.getMessage());
        }
    }

    private String generateDocumentCode() {
        return "DOC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private DocumentDTO documentToDTO(Document document) {
        if (document == null) {
            return null;
        }

        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setDocumentCode(document.getDocumentCode());
        dto.setDocumentName(document.getDocumentName());
        dto.setDescription(document.getDescription());

        if (document.getVisibility() != null) {
            dto.setVisibility(document.getVisibility().toString());
        }

        dto.setAllowedRoles(document.getAllowedRoles());
        
        // ✅ Map allowedUserEmails to both fields for compatibility
        String allowedEmails = document.getAllowedUserEmails();
        logger.info("documentToDTO - Doc: " + document.getDocumentName() + 
            ", getAllowedUserEmails() returns: [" + allowedEmails + "]" +
            ", is null: " + (allowedEmails == null) +
            ", is empty: " + (allowedEmails != null && allowedEmails.isEmpty()));
        
        dto.setAllowedUserIds(allowedEmails);  // Legacy field
        dto.setAllowedUserEmails(allowedEmails);  // Primary field
        dto.setAllowedCourses(document.getAllowedCourses());

        if (document.getUploadedBy() != null) {
            dto.setUploadedByEmail(document.getUploadedBy().getEmail());
            dto.setUploadedByName(document.getUploadedBy().getFullName());
            dto.setUploadedBy(document.getUploadedBy().getEmail());
        }

        dto.setDownloadCount(document.getDownloadCount() != null ? document.getDownloadCount() : 0);
        dto.setCreatedAt(document.getCreatedAt());
        dto.setCategory(document.getCategory());
        dto.setOtherCategoryValue(document.getOtherCategoryValue());
        dto.setUploadmentDate(document.getCreatedAt());
        dto.setFilePath(document.getFilePath());  // Set filePath for download MIME type detection
        return dto;
    }
}

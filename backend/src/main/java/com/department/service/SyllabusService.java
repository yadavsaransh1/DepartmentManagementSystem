package com.department.service;

import com.department.dto.SyllabusDTO;
import com.department.model.Syllabus;
import com.department.model.Subject;
import com.department.model.User;
import com.department.repository.SyllabusRepository;
import com.department.repository.SubjectRepository;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class SyllabusService {
    private static final Logger logger = Logger.getLogger(SyllabusService.class.getName());

    @Autowired
    private SyllabusRepository syllabusRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private UserRepository userRepository;

    public SyllabusDTO uploadSyllabus(Long subjectId, String program, String semester, 
                                       String fileName, String fileType, byte[] fileContent, 
                                       String userEmail, String description) {
        try {
            // Fetch subject and user
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found"));
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Create syllabus entity
            Syllabus syllabus = new Syllabus();
            syllabus.setSubject(subject);
            syllabus.setProgram(program);
            syllabus.setSemester(semester);
            syllabus.setFileName(fileName);
            syllabus.setFileType(fileType);
            syllabus.setFileSize((long) fileContent.length);
            syllabus.setFileContent(fileContent);
            syllabus.setUploadedBy(user);
            syllabus.setDescription(description);

            Syllabus saved = syllabusRepository.save(syllabus);
            logger.info("Syllabus uploaded successfully for subject: " + subject.getSubjectName());
            
            return syllabusToDTO(saved);
        } catch (Exception e) {
            logger.severe("Error uploading syllabus: " + e.getMessage());
            throw new RuntimeException("Failed to upload syllabus: " + e.getMessage());
        }
    }

    public SyllabusDTO getSyllabusById(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
        return syllabusToDTO(syllabus);
    }

    public byte[] downloadSyllabus(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
        return syllabus.getFileContent();
    }

    public SyllabusDTO getSyllabusBySubjectAndDetails(Long subjectId, String program, String semester) {
        try {
            // Try with exact semester match first
            Optional<Syllabus> syllabus = syllabusRepository.findBySubjectIdAndProgramAndSemester(subjectId, program, semester);
            if (syllabus.isPresent()) {
                return syllabusToDTO(syllabus.get());
            }
            
            // Try without semester as fallback
            List<Syllabus> syllabi = syllabusRepository.findBySubjectId(subjectId);
            if (!syllabi.isEmpty()) {
                // Return the first one if exists
                return syllabusToDTO(syllabi.get(0));
            }
            
            return null;
        } catch (Exception e) {
            logger.warning("Error getting syllabus: " + e.getMessage());
            return null;
        }
    }

    public List<SyllabusDTO> getSyllabusBySubject(Long subjectId) {
        return syllabusRepository.findBySubjectId(subjectId)
                .stream()
                .map(this::syllabusToDTO)
                .collect(Collectors.toList());
    }

    public List<SyllabusDTO> getSyllabusByProgram(String program) {
        return syllabusRepository.findByProgramOrSemester(program, program)
                .stream()
                .map(this::syllabusToDTO)
                .collect(Collectors.toList());
    }

    public List<SyllabusDTO> getAllSyllabi() {
        return syllabusRepository.findAll()
                .stream()
                .map(this::syllabusToDTO)
                .collect(Collectors.toList());
    }

    public void deleteSyllabus(Long syllabusId) {
        Syllabus syllabus = syllabusRepository.findById(syllabusId)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
        syllabusRepository.delete(syllabus);
        logger.info("Syllabus deleted: " + syllabusId);
    }

    private SyllabusDTO syllabusToDTO(Syllabus syllabus) {
        if (syllabus == null) {
            return null;
        }

        Long subjectId = null;
        String subjectName = null;
        String subjectCode = null;
        if (syllabus.getSubject() != null) {
            subjectId = syllabus.getSubject().getId();
            subjectName = syllabus.getSubject().getSubjectName();
            subjectCode = syllabus.getSubject().getSubjectCode();
        }

        String uploadedByName = null;
        if (syllabus.getUploadedBy() != null) {
            uploadedByName = syllabus.getUploadedBy().getFullName();
        }

        return new SyllabusDTO(
            syllabus.getId(),
            subjectId,
            subjectName,
            subjectCode,
            syllabus.getProgram(),
            syllabus.getSemester(),
            syllabus.getFileName(),
            syllabus.getFileType(),
            syllabus.getFileSize(),
            syllabus.getUploadedAt(),
            uploadedByName,
            syllabus.getDescription()
        );
    }
}

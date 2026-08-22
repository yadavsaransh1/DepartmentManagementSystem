package com.department.service;

import com.department.dto.SubjectDTO;
import com.department.model.Subject;
import com.department.model.Teacher;
import com.department.model.Student;
import com.department.model.User;
import com.department.model.Program;
import com.department.repository.SubjectRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.StudentRepository;
import com.department.repository.UserRepository;
import com.department.repository.ProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

@Service
public class SubjectService {
    private static final Logger logger = Logger.getLogger(SubjectService.class.getName());

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgramRepository programRepository;

    public List<SubjectDTO> getAllSubjects() {
        List<Subject> subjects = subjectRepository.findAll();
        List<SubjectDTO> dtos = new ArrayList<>();
        for (Subject subject : subjects) {
            dtos.add(subjectToDTO(subject));
        }
        return dtos;
    }

    public SubjectDTO getSubjectById(Long subjectId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
        return subjectToDTO(subject);
    }

    public List<SubjectDTO> getSubjectsByTeacher(String teacherIdentifier) {
        Teacher teacher = null;
        // Try by numeric teacher ID first
        try {
            Long teacherId = Long.parseLong(teacherIdentifier);
            teacher = teacherRepository.findById(teacherId)
                    .orElse(null);
        } catch (NumberFormatException ignored) {
        }

        if (teacher == null) {
            teacher = teacherRepository.findByUserEmail(teacherIdentifier)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
        }

        List<Subject> subjects = subjectRepository.findByTeacherId(teacher.getId());
        List<SubjectDTO> dtos = new ArrayList<>();
        for (Subject subject : subjects) {
            dtos.add(subjectToDTO(subject));
        }
        return dtos;
    }

    public List<SubjectDTO> getSubjectsByStudent(String studentEmail) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        // Students automatically have all subjects for their program/semester
        List<Subject> subjects = subjectRepository.findByProgramAndSemester(student.getProgram(), student.getSemester());
        List<SubjectDTO> dtos = new ArrayList<>();
        for (Subject subject : subjects) {
            dtos.add(subjectToDTO(subject));
        }
        return dtos;
    }

    public List<SubjectDTO> getSubjectsByProgramAndSemester(String programName, Integer semester) {
        List<Subject> subjects = subjectRepository.findByProgramNameAndSemester(programName, semester);
        List<SubjectDTO> dtos = new ArrayList<>();
        for (Subject subject : subjects) {
            dtos.add(subjectToDTO(subject));
        }
        return dtos;
    }

    public Map<String, Object> getUserCoursesAndSemesters(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Object userRole = user.getRole();
        logger.info("getUserCoursesAndSemesters: email=" + email + ", role=" + userRole);
        
        Map<String, Object> result = new HashMap<>();
        List<SubjectDTO> subjects = new ArrayList<>();
        
        try {
            // Check if user is ADMIN
            if (userRole != null && (userRole.toString().equals("ADMIN") || userRole.equals("ADMIN"))) {
                logger.info("User is ADMIN, fetching all subjects");
                subjects = getAllSubjects();
                logger.info("Found " + subjects.size() + " subjects");
            } else if (userRole != null && (userRole.toString().equals("TEACHER") || userRole.equals("TEACHER"))) {
                logger.info("User is TEACHER");
                Teacher teacher = teacherRepository.findByUserEmail(user.getEmail())
                        .orElse(null);
                if (teacher != null) {
                    subjects = getSubjectsByTeacher(user.getEmail());
                    logger.info("Found " + subjects.size() + " subjects for teacher email: " + user.getEmail());
                } else {
                    logger.warning("Teacher record not found for user email: " + user.getEmail());
                }
            } else if (userRole != null && (userRole.toString().equals("STUDENT") || userRole.equals("STUDENT"))) {
                logger.info("User is STUDENT");
                Student student = studentRepository.findByUserEmail(user.getEmail())
                        .orElse(null);
                if (student != null) {
                    subjects = getSubjectsByStudent(user.getEmail());
                    logger.info("Found " + subjects.size() + " subjects for student email: " + user.getEmail());
                } else {
                    logger.warning("Student record not found for user email: " + user.getEmail());
                }
            } else {
                logger.info("User role is: " + userRole);
                subjects = new ArrayList<>();
            }
        } catch (Exception e) {
            logger.severe("Exception in getUserCoursesAndSemesters: " + e.getMessage());
            e.printStackTrace();
            subjects = new ArrayList<>();
        }
        
        // Extract unique courses from subjects
        Set<String> uniqueCourses = new HashSet<>();
        Set<Integer> uniqueSemesters = new HashSet<>();
        
        for (SubjectDTO subject : subjects) {
            if (subject != null) {
                if (subject.getCourse() != null && !subject.getCourse().isEmpty()) {
                    uniqueCourses.add(subject.getCourse());
                }
                if (subject.getSemester() != null) {
                    uniqueSemesters.add(subject.getSemester());
                }
            }
        }
        
        // Sort semesters
        List<Integer> sortedSemesters = new ArrayList<>(uniqueSemesters);
        Collections.sort(sortedSemesters);
        
        logger.info("Returning: courses=" + uniqueCourses.size() + ", semesters=" + sortedSemesters.size() + " , subjects=" + subjects.size());
        
        result.put("courses", new ArrayList<>(uniqueCourses));
        result.put("semesters", sortedSemesters);
        result.put("subjects", subjects);
        
        return result;
    }

    public SubjectDTO createSubject(SubjectDTO subjectDTO) {
        if (subjectDTO.getTeacherId() == null) {
            throw new RuntimeException("Teacher ID is required");
        }

        Teacher teacher = teacherRepository.findById(subjectDTO.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Subject subject = new Subject();
        subject.setSubjectCode(subjectDTO.getSubjectCode());
        subject.setSubjectName(subjectDTO.getSubjectName());
        subject.setTeacher(teacher);
        subject.setSemester(subjectDTO.getSemester());
        subject.setCredits(subjectDTO.getCredits());
        
        // Handle program - prioritize programId, then programName, then course
        if (subjectDTO.getProgramId() != null) {
            Program program = programRepository.findById(subjectDTO.getProgramId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
            subject.setProgram(program);
            subject.setCourse(program.getName());
        } else if (subjectDTO.getCourse() != null && !subjectDTO.getCourse().isEmpty()) {
            subject.setCourse(subjectDTO.getCourse());
        }
        
        subject.setDescription(subjectDTO.getDescription());

        Subject saved = subjectRepository.save(subject);
        return subjectToDTO(saved);
    }

    public void deleteSubject(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new RuntimeException("Subject not found");
        }
        subjectRepository.deleteById(subjectId);
    }

    public SubjectDTO updateSubject(Long subjectId, SubjectDTO subjectDTO) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new RuntimeException("Subject not found"));

        if (subjectDTO.getSubjectCode() != null) {
            subject.setSubjectCode(subjectDTO.getSubjectCode());
        }
        if (subjectDTO.getSubjectName() != null) {
            subject.setSubjectName(subjectDTO.getSubjectName());
        }
        if (subjectDTO.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(subjectDTO.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            subject.setTeacher(teacher);
        }
        if (subjectDTO.getSemester() != null) {
            subject.setSemester(subjectDTO.getSemester());
        }
        if (subjectDTO.getCredits() != null) {
            subject.setCredits(subjectDTO.getCredits());
        }
        if (subjectDTO.getProgramId() != null) {
            Program program = programRepository.findById(subjectDTO.getProgramId())
                    .orElseThrow(() -> new RuntimeException("Program not found"));
            subject.setProgram(program);
            subject.setCourse(program.getName()); // Also store in course field for backward compatibility
        } else if (subjectDTO.getCourse() != null && !subjectDTO.getCourse().isEmpty()) {
            subject.setCourse(subjectDTO.getCourse());
        }
        if (subjectDTO.getDescription() != null) {
            subject.setDescription(subjectDTO.getDescription());
        }

        Subject updated = subjectRepository.save(subject);
        return subjectToDTO(updated);
    }

    private SubjectDTO subjectToDTO(Subject subject) {
        SubjectDTO dto = new SubjectDTO();
        dto.setId(subject.getId());
        dto.setSubjectCode(subject.getSubjectCode());
        dto.setSubjectName(subject.getSubjectName());
        if (subject.getTeacher() != null) {
            dto.setTeacherId(subject.getTeacher().getId());
            dto.setTeacherName(subject.getTeacher().getUser().getFullName());
        }
        dto.setSemester(subject.getSemester());
        dto.setCredits(subject.getCredits());
        
        // Set program information
        if (subject.getProgram() != null) {
            dto.setProgramId(subject.getProgram().getId());
            dto.setProgramName(subject.getProgram().getName());
            dto.setCourse(subject.getProgram().getName()); // Backward compatibility
        } else {
            dto.setCourse(subject.getCourse()); // Fall back to course field if no program
        }
        
        dto.setDescription(subject.getDescription());
        return dto;
    }

    public List<String> getUniquePrograms() {
        Set<String> uniquePrograms = new HashSet<>();
        
        // First, add all programs from Program table
        try {
            List<Program> allPrograms = programRepository.findAll();
            for (Program program : allPrograms) {
                if (program.getName() != null && !program.getName().isEmpty()) {
                    uniquePrograms.add(program.getName());
                }
            }
        } catch (Exception e) {
            logger.warning("Error fetching programs from Program table: " + e.getMessage());
        }
        
        // Also add programs from subjects (for backward compatibility if any)
        List<Subject> allSubjects = subjectRepository.findAll();
        for (Subject subject : allSubjects) {
            if (subject.getProgram() != null && subject.getProgram().getName() != null) {
                uniquePrograms.add(subject.getProgram().getName());
            } else if (subject.getCourse() != null && !subject.getCourse().isEmpty()) {
                uniquePrograms.add(subject.getCourse());
            }
        }
        
        List<String> programList = new ArrayList<>(uniquePrograms);
        Collections.sort(programList);
        logger.info("getUniquePrograms returning: " + programList);
        return programList;
    }

    public List<String> getSemestersByProgram(String programName) {
        // First try to find the program and get its semester count
        List<Program> programs = programRepository.findAll();
        for (Program program : programs) {
            if (program.getName().equalsIgnoreCase(programName) && program.getSemesterCount() != null) {
                logger.info("Found program: " + programName + " with semester count: " + program.getSemesterCount());
                List<String> semesters = new ArrayList<>();
                for (int i = 1; i <= program.getSemesterCount(); i++) {
                    semesters.add(String.valueOf(i));
                }
                return semesters;
            }
        }
        
        // If program not found, try to get semesters from subjects
        List<Subject> subjects = subjectRepository.findByProgramName(programName);
        Set<Integer> uniqueSemesters = new HashSet<>();
        
        for (Subject subject : subjects) {
            if (subject.getSemester() != null) {
                uniqueSemesters.add(subject.getSemester());
            }
        }
        
        // If we found subjects, return those semesters
        if (!uniqueSemesters.isEmpty()) {
            List<Integer> semesterList = new ArrayList<>(uniqueSemesters);
            Collections.sort(semesterList);
            List<String> result = new ArrayList<>();
            for (Integer sem : semesterList) {
                result.add(String.valueOf(sem));
            }
            logger.info("getSemestersByProgram(" + programName + ") from subjects returning: " + result);
            return result;
        }
        
        // Default: return 1-8 if nothing found
        List<String> defaultSemesters = new ArrayList<>();
        for (int i = 1; i <= 8; i++) {
            defaultSemesters.add(String.valueOf(i));
        }
        logger.info("getSemestersByProgram(" + programName + ") returning default 1-8");
        return defaultSemesters;
    }
}

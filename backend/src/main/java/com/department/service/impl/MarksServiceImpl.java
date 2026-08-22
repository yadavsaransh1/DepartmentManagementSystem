package com.department.service.impl;

import com.department.model.Marks;
import com.department.model.Student;
import com.department.model.Program;
import com.department.model.Subject;
import com.department.repository.MarksRepository;
import com.department.repository.StudentRepository;
import com.department.repository.ProgramRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.SubjectRepository;
import com.department.service.MarksService;
import com.department.dto.AdminMarksRequestDTO;
import com.department.dto.UpdateMarksRequestDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MarksServiceImpl implements MarksService {

    @Autowired
    private MarksRepository marksRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Override
    @Transactional
    public Marks recordMarks(Marks marks) {
        return marksRepository.save(marks);
    }

    @Override
    public Optional<Marks> getMarksById(Long id) {
        return marksRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getStudentMarks(Long studentId) {
        return marksRepository.findByStudentId(studentId);
    }

    @Override
    public List<Marks> getSubjectMarks(Long subjectId) {
        return marksRepository.findBySubjectId(subjectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getStudentSubjectMarks(Long studentId, Long subjectId) {
        return marksRepository.findByStudentIdAndSubjectId(studentId, subjectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getTeacherMarks(Long teacherId) {
        return marksRepository.findByTeacher_Id(teacherId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getTeacherMarksByEmail(String teacherEmail) {
        try {
            System.out.println("[MarksServiceImpl] Getting marks for teacher email: " + teacherEmail);
            // Find teacher by email
            com.department.model.Teacher teacher = teacherRepository.findByUserEmail(teacherEmail)
                    .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + teacherEmail));
            System.out.println("[MarksServiceImpl] Found teacher with ID: " + teacher.getId());
            
            List<Marks> marks = marksRepository.findByTeacher_Id(teacher.getId());
            System.out.println("[MarksServiceImpl] Found " + marks.size() + " marks for teacher ID: " + teacher.getId());
            
            return marks;
        } catch (Exception e) {
            System.out.println("[MarksServiceImpl] Error finding teacher marks by email: " + e.getMessage());
            e.printStackTrace();
            return new java.util.ArrayList<>();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getMarksByExamType(Marks.ExamType examType) {
        return marksRepository.findByExamType(examType);
    }

    @Override
    public Marks updateMarks(Long id, Marks marks) {
        if (marksRepository.existsById(id)) {
            marks.setId(id);
            return marksRepository.save(marks);
        }
        return null;
    }

    @Override
    public void deleteMarks(Long id) {
        marksRepository.deleteById(id);
    }

    @Override
    public double calculateStudentGPA(Long studentId) {
        List<Marks> studentMarks = getStudentMarks(studentId);
        if (studentMarks.isEmpty()) {
            return 0.0;
        }

        BigDecimal totalGPA = BigDecimal.ZERO;
        for (Marks mark : studentMarks) {
            if (mark.getPercentage() != null) {
                totalGPA = totalGPA.add(mark.getPercentage());
            }
        }
        return totalGPA.divide(BigDecimal.valueOf(studentMarks.size()), 2, RoundingMode.HALF_UP).doubleValue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getStudentMarksOrderByDate(Long studentId) {
        return marksRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Override
    public Marks updateSemesterMarks(Long marksId, BigDecimal obtainedMarks) {
        Optional<Marks> marks = marksRepository.findById(marksId);
        if (marks.isPresent()) {
            Marks mark = marks.get();
            mark.setObtainedSemesterMarks(obtainedMarks);
            // Recalculate total if all components are available
            if (mark.getObtainedSemesterMarks() != null && mark.getObtainedSessionalMarks() != null && mark.getObtainedAssignmentMarks() != null) {
                BigDecimal total = mark.getObtainedSemesterMarks().add(mark.getObtainedSessionalMarks()).add(mark.getObtainedAssignmentMarks());
                mark.setMarks(total);
            }
            return marksRepository.save(mark);
        }
        return null;
    }

    @Override
    public Marks updateSessionalMarks(Long marksId, BigDecimal obtainedMarks) {
        Optional<Marks> marks = marksRepository.findById(marksId);
        if (marks.isPresent()) {
            Marks mark = marks.get();
            mark.setObtainedSessionalMarks(obtainedMarks);
            // Recalculate total if all components are available
            if (mark.getObtainedSemesterMarks() != null && mark.getObtainedSessionalMarks() != null && mark.getObtainedAssignmentMarks() != null) {
                BigDecimal total = mark.getObtainedSemesterMarks().add(mark.getObtainedSessionalMarks()).add(mark.getObtainedAssignmentMarks());
                mark.setMarks(total);
            }
            return marksRepository.save(mark);
        }
        return null;
    }

    @Override
    public Marks updateAssignmentMarks(Long marksId, BigDecimal obtainedMarks) {
        Optional<Marks> marks = marksRepository.findById(marksId);
        if (marks.isPresent()) {
            Marks mark = marks.get();
            mark.setObtainedAssignmentMarks(obtainedMarks);
            // Recalculate total if all components are available
            if (mark.getObtainedSemesterMarks() != null && mark.getObtainedSessionalMarks() != null && mark.getObtainedAssignmentMarks() != null) {
                BigDecimal total = mark.getObtainedSemesterMarks().add(mark.getObtainedSessionalMarks()).add(mark.getObtainedAssignmentMarks());
                mark.setMarks(total);
            }
            return marksRepository.save(mark);
        }
        return null;
    }

    @Override
    public Marks getStudentSubjectMarksBreakdown(Long studentId, Long subjectId) {
        List<Marks> marks = marksRepository.findByStudentIdAndSubjectId(studentId, subjectId);
        if (!marks.isEmpty()) {
            return marks.get(0); // Return first marks record with breakdown
        }
        return null;
    }

    @Override
    public Marks recordMarksWithBreakdown(Marks marks) {
        // Set max marks based on breakdown
        if (marks.getSemesterMarks() != null && marks.getSessionalMarks() != null && marks.getAssignmentMarks() != null) {
            BigDecimal totalMax = marks.getSemesterMarks().add(marks.getSessionalMarks()).add(marks.getAssignmentMarks());
            marks.setTotalMarks(totalMax.intValue());
        }
        
        // Calculate total obtained marks
        if (marks.getObtainedSemesterMarks() != null && marks.getObtainedSessionalMarks() != null && marks.getObtainedAssignmentMarks() != null) {
            BigDecimal totalObtained = marks.getObtainedSemesterMarks().add(marks.getObtainedSessionalMarks()).add(marks.getObtainedAssignmentMarks());
            marks.setMarks(totalObtained);
        }
        
        return marksRepository.save(marks);
    }

    @Override
    public List<Marks> getTeacherMarksByMarkType(Long teacherId, Marks.MarkType markType) {
        return marksRepository.findByTeacherIdAndMarkType(teacherId, markType);
    }

    @Override
    public List<Marks> getTeacherSubjectMarks(Long teacherId, Long subjectId, Marks.MarkType markType) {
        return marksRepository.findByTeacherIdAndSubjectIdAndMarkType(teacherId, subjectId, markType);
    }

    @Override
    public List<Marks> getAdminMarksForSemester(Long programId, String semesterName) {
        System.out.println("=== GET ADMIN MARKS ===");
        System.out.println("Query: programId=" + programId + ", semester=" + semesterName);
        List<Marks> marks = marksRepository.findByProgramIdAndSemesterNameAndMarkType(programId, semesterName, Marks.MarkType.ADMIN);
        System.out.println("Found " + marks.size() + " marks");
        for (Marks m : marks) {
            System.out.println("  - ID: " + m.getId() + ", Student: " + m.getStudent().getId() + ", Semester: " + m.getSemesterName());
        }
        return marks;
    }

    @Override
    public List<Marks> getAllAdminMarks() {
        System.out.println("=== GET ALL ADMIN MARKS ===");
        List<Marks> marks = marksRepository.findByMarkType(Marks.MarkType.ADMIN);
        System.out.println("Found " + marks.size() + " total admin marks");
        return marks;
    }

    public List<Marks> getAllTeacherMarks() {
        System.out.println("=== GET ALL TEACHER MARKS ===");
        List<Marks> marks = marksRepository.findByMarkType(Marks.MarkType.TEACHER);
        System.out.println("Found " + marks.size() + " total teacher marks");
        return marks;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getStudentMarksWithType(Long studentId, Marks.MarkType markType) {
        return marksRepository.findByStudentIdAndMarkType(studentId, markType);
    }

    @Override
    public Marks recordAdminMarks(Marks marks) {
        marks.setMarkType(Marks.MarkType.ADMIN);
        return marksRepository.save(marks);
    }

    @Override
    public Marks recordAdminMarksFromDTO(AdminMarksRequestDTO request) {
        System.out.println("AdminMarksRequestDTO received: studentId=" + request.getStudentId() + 
            ", programId=" + request.getProgramId() + 
            ", courseId=" + request.getCourseId() +
            ", semester=" + request.getSemesterName() + 
            ", obtainedMarks=" + request.getObtainedSemesterMarks() +
            ", totalMarks=" + request.getTotalMarks() +
            ", grade=" + request.getGrade() +
            ", examType=" + request.getExamType());
        
        if (request.getStudentId() == null || request.getStudentId() <= 0) {
            throw new RuntimeException("Valid Student ID is required");
        }
        if (request.getProgramId() == null || request.getProgramId() <= 0) {
            throw new RuntimeException("Valid Program ID is required");
        }
        
        Marks marks = new Marks();
        
        // Fetch related entities with better error messages
        Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + request.getStudentId()));
        System.out.println("Student found: " + student.getStudentId());
        
        Program program = programRepository.findById(request.getProgramId())
            .orElseThrow(() -> new RuntimeException("Program not found with id: " + request.getProgramId() + ". Check if program exists in database."));
        System.out.println("Program found: " + program.getName());
        
        // Fetch course/subject if courseId is provided
        Subject course = null;
        if (request.getCourseId() != null && request.getCourseId() > 0) {
            course = subjectRepository.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course/Subject not found with id: " + request.getCourseId()));
            System.out.println("Course found: " + course.getCourseName());
        }
        
        // Get current user (admin) - can be null for admin marks
        // Don't set admin_id to non-existent user ID 1
        // marks.setAdmin(currentUser);  // REMOVED - let it be NULL
        
        marks.setStudent(student);
        marks.setProgram(program);  // SET THE PROGRAM!
        marks.setCourse(course);  // SET THE COURSE if provided
        marks.setSemesterName(request.getSemesterName() != null ? request.getSemesterName() : "");
        
        // Use BigDecimal values directly
        marks.setObtainedSemesterMarks(request.getObtainedSemesterMarks() != null ? 
            request.getObtainedSemesterMarks() : BigDecimal.ZERO);
        marks.setSemesterMarks(request.getSemesterMarks() != null ? 
            request.getSemesterMarks() : BigDecimal.ZERO);
        
        // Set total marks if provided, otherwise use default 100
        if (request.getTotalMarks() != null && request.getTotalMarks() > 0) {
            marks.setTotalMarks(request.getTotalMarks());
            System.out.println("Total marks set to: " + request.getTotalMarks());
        } else {
            marks.setTotalMarks(100);  // Default
        }
        
        // Set exam type description if provided
        if (request.getExamType() != null && !request.getExamType().isEmpty()) {
            marks.setExamTypeDescription(request.getExamType());
            System.out.println("Exam type set to: " + request.getExamType());
        }
        
        // Set grade if provided by admin
        if (request.getGrade() != null && !request.getGrade().isEmpty()) {
            marks.setGrade(request.getGrade());
            System.out.println("Grade set to: " + request.getGrade());
        }
        
        if (request.getPassingStatus() != null && !request.getPassingStatus().isEmpty()) {
            try {
                marks.setPassingStatus(Marks.PassingStatus.valueOf(request.getPassingStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                marks.setPassingStatus(Marks.PassingStatus.PASS);
            }
        } else {
            marks.setPassingStatus(Marks.PassingStatus.PASS);
        }
        
        marks.setComments(request.getComments() != null ? request.getComments() : "");
        marks.setMarkType(Marks.MarkType.ADMIN);
        
        // Set the marks field (required column) to the obtained semester marks
        marks.setMarks(request.getObtainedSemesterMarks() != null ? 
            request.getObtainedSemesterMarks() : BigDecimal.ZERO);
        
        marks.setCreatedAt(LocalDateTime.now());
        marks.setUpdatedAt(LocalDateTime.now());
        
        System.out.println("Saving marks for student: " + student.getId() + ", marks: " + marks.getMarks() + ", total: " + marks.getTotalMarks());
        Marks saved = marksRepository.save(marks);
        System.out.println("Marks saved successfully with ID: " + saved.getId());
        
        return saved;
    }

    @Override
    public Marks updateMarksFromDTO(Long id, UpdateMarksRequestDTO request) {
        Marks marks = marksRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Marks not found with id: " + id));
        
        // Update simple teacher marks fields
        if (request.getObtainedMarks() != null) {
            marks.setMarks(request.getObtainedMarks());
        }
        if (request.getTotalMarks() != null) {
            marks.setTotalMarks(request.getTotalMarks());
        }
        if (request.getGrade() != null && !request.getGrade().isEmpty()) {
            marks.setGrade(request.getGrade());
        }
        if (request.getExamType() != null && !request.getExamType().isEmpty()) {
            // Store original exam type text in description field
            marks.setExamTypeDescription(request.getExamType());
        }
        if (request.getComments() != null) {
            marks.setComments(request.getComments());
        }
        
        // Update teacher marks breakdown fields
        if (request.getObtainedSemesterMarks() != null) {
            marks.setObtainedSemesterMarks(request.getObtainedSemesterMarks());
        }
        if (request.getObtainedSessionalMarks() != null) {
            marks.setObtainedSessionalMarks(request.getObtainedSessionalMarks());
        }
        if (request.getObtainedAssignmentMarks() != null) {
            marks.setObtainedAssignmentMarks(request.getObtainedAssignmentMarks());
        }
        if (request.getSemesterMarks() != null) {
            marks.setSemesterMarks(request.getSemesterMarks());
        }
        if (request.getSessionalMarks() != null) {
            marks.setSessionalMarks(request.getSessionalMarks());
        }
        if (request.getAssignmentMarks() != null) {
            marks.setAssignmentMarks(request.getAssignmentMarks());
        }
        
        // Update admin marks fields
        if (request.getPassingStatus() != null) {
            marks.setPassingStatus(Marks.PassingStatus.valueOf(request.getPassingStatus().toUpperCase()));
        }
        if (request.getSemesterName() != null) {
            marks.setSemesterName(request.getSemesterName());
        }
        
        marks.setUpdatedAt(LocalDateTime.now());
        return marksRepository.save(marks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getUserMarks(Long userId) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. Please call getUserMarksByEmail(String email) instead. " +
            "User.email is now the primary key."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Marks> getUserMarksWithType(Long userId, Marks.MarkType markType) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. Please call getUserMarksWithTypeByEmail(String email, Marks.MarkType markType) instead. " +
            "User.email is now the primary key."
        );
    }

    public List<Marks> getUserMarksByEmail(String userEmail) {
        return marksRepository.findByUserEmail(userEmail);
    }

    public List<Marks> getUserMarksWithTypeByEmail(String userEmail, Marks.MarkType markType) {
        return marksRepository.findByUserEmailAndMarkType(userEmail, markType);
    }
}

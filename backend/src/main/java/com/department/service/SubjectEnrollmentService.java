package com.department.service;

import com.department.model.Student;
import com.department.model.Subject;
import com.department.repository.SubjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SubjectEnrollmentService {
    
    @Autowired
    private SubjectRepository subjectRepository;

    /**
     * Get subjects for a student based on their program and semester
     * (Students automatically have all subjects for their program/semester)
     */
    @Transactional
    public void enrollStudentInSubjects(Student student) {
        // Removed: SubjectEnrollment tracking is no longer needed
        // Students automatically have access to all subjects in their program/semester
    }

    /**
     * Get all subjects for a student (based on program/semester)
     */
    public List<Subject> getStudentSubjects(Long studentId, String program, Integer semester) {
        return subjectRepository.findByProgramAndSemester(program, semester);
    }

    /**
     * Get all subjects for a given program and semester
     */
    public List<Subject> getSubjectsByProgramAndSemester(String program, Integer semester) {
        return subjectRepository.findByProgramAndSemester(program, semester);
    }

    /**
     * Get all subjects for a given semester
     */
    public List<Subject> getSubjectsBySemester(Integer semester) {
        return subjectRepository.findBySemester(semester);
    }

    /**
     * Get all subjects from database
     */
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    /**
     * Get subjects by program and semester with fallback to string column search
     */
    public List<Subject> getSubjectsByProgramAndSemesterFlexible(String program, Integer semester) {
        try {
            // Try relationship-based query first
            List<Subject> subjects = getSubjectsByProgramAndSemester(program, semester);
            if (!subjects.isEmpty()) {
                return subjects;
            }
        } catch (Exception e) {
            System.out.println("DEBUG: Relationship-based query failed, trying string-based query");
        }
        
        try {
            // Fallback to string column query
            return subjectRepository.findByProgramNameStringAndSemester(program, semester);
        } catch (Exception e) {
            System.out.println("DEBUG: String-based query also failed: " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }
}

package com.department.repository;

import com.department.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByEnrollmentNumber(String enrollmentNumber);
    Optional<Student> findByUserEmail(String userEmail);
    
    
    List<Student> findByProgramAndSemester(String program, Integer semester);
    List<Student> findByProgram(String program);
}

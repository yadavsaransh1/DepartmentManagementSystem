package com.department.repository;

import com.department.model.Alumni;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    Optional<Alumni> findByStudentId(Long studentId);
    List<Alumni> findByProgram(String program);
    List<Alumni> findByProgramAndSemester(String program, Integer semester);
    List<Alumni> findAll();
    void deleteByStudentId(Long studentId);
}

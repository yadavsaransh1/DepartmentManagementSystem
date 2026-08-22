package com.department.repository;

import com.department.model.Syllabus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    Optional<Syllabus> findByCourseIdAndProgramAndSemester(Long courseId, String program, String semester);
    List<Syllabus> findByCourseId(Long courseId);
    List<Syllabus> findByProgramAndSemester(String program, String semester);
    List<Syllabus> findByProgramOrSemester(String program, String semester);
    List<Syllabus> findAll();
    
    // Backward compatibility methods for old subjectId references
    default Optional<Syllabus> findBySubjectIdAndProgramAndSemester(Long subjectId, String program, String semester) {
        return findByCourseIdAndProgramAndSemester(subjectId, program, semester);
    }
    
    default List<Syllabus> findBySubjectId(Long subjectId) {
        return findByCourseId(subjectId);
    }
}

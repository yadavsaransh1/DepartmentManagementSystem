package com.department.repository;

import com.department.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    // Course-based method names (terminology refactored)
    Optional<Subject> findByCourseCode(String courseCode);
    List<Subject> findByTeacherId(Long teacherId);
    List<Subject> findBySemester(Integer semester);
    
    // New methods using Program ID
    List<Subject> findByProgramIdAndSemester(Long programId, Integer semester);
    List<Subject> findByProgramId(Long programId);
    
    // Backward compatibility: Search by Program name
    @Query("SELECT s FROM Subject s JOIN s.program p WHERE LOWER(p.name) = LOWER(:programName) AND s.semester = :semester")
    List<Subject> findByProgramNameAndSemester(@Param("programName") String programName, @Param("semester") Integer semester);
    
    @Query("SELECT s FROM Subject s JOIN s.program p WHERE LOWER(p.name) = LOWER(:programName)")
    List<Subject> findByProgramName(@Param("programName") String programName);
    
    // Alternative query using programName string column directly (for cases where program relationship doesn't exist)
    @Query("SELECT s FROM Subject s WHERE LOWER(s.programName) = LOWER(:programName) AND s.semester = :semester")
    List<Subject> findByProgramNameStringAndSemester(@Param("programName") String programName, @Param("semester") Integer semester);
    
    @Query("SELECT s FROM Subject s WHERE LOWER(s.programName) = LOWER(:programName)")
    List<Subject> findByProgramNameString(@Param("programName") String programName);
    
    // Legacy method names - kept for backward compatibility
    default Optional<Subject> findBySubjectCode(String subjectCode) {
        return findByCourseCode(subjectCode);
    }
    
    // Backward compatibility wrappers - delegates to name-based search
    default List<Subject> findByProgramAndSemester(String program, Integer semester) {
        return findByProgramNameAndSemester(program, semester);
    }
    
    default List<Subject> findByProgram(String program) {
        return findByProgramName(program);
    }
}

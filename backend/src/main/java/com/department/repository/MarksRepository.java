package com.department.repository;

import com.department.model.Marks;
import com.department.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Marks, Long> {
    // Get student marks with proper eager loading - includes both TEACHER and ADMIN marks
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH s.user " +
           "LEFT JOIN FETCH m.course c " +
           "LEFT JOIN FETCH m.teacher t " +
           "WHERE m.student.id = :studentId " +
           "ORDER BY m.createdAt DESC")
    List<Marks> findByStudentId(Long studentId);
    
    // Find marks by user email (NEW - replaces findByUserId)
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "WHERE s.user.email = :userEmail " +
           "ORDER BY m.createdAt DESC")
    List<Marks> findByUserEmail(String userEmail);
    
    // Deprecated: Use findByUserEmail instead
    @Deprecated
    default List<Marks> findByUserId(Long userId) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. Please call findByUserEmail(String email) instead. " +
            "User.email is now the primary key."
        );
    }
    
    // Deprecated: Use findByUserEmailAndMarkType instead
    @Deprecated
    default List<Marks> findByUserIdAndMarkType(Long userId, Marks.MarkType markType) {
        throw new UnsupportedOperationException(
            "User IDs are deprecated. Please call findByUserEmailAndMarkType(String email, Marks.MarkType markType) instead. " +
            "User.email is now the primary key."
        );
    }
    
    // Find marks by user email and mark type (NEW - replaces findByUserIdAndMarkType)
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "WHERE s.user.email = :userEmail AND m.markType = :markType " +
           "ORDER BY m.createdAt DESC")
    List<Marks> findByUserEmailAndMarkType(String userEmail, Marks.MarkType markType);
    
    List<Marks> findByCourseId(Long courseId);
    List<Marks> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Marks> findByTeacher_Id(Long teacherId);
    List<Marks> findByExamType(Marks.ExamType examType);
    
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH s.user " +
           "LEFT JOIN FETCH m.course c " +
           "LEFT JOIN FETCH m.teacher t " +
           "WHERE m.student.id = :studentId " +
           "ORDER BY m.createdAt DESC")
    List<Marks> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    // Backward compatibility: subjectId -> courseId
    default List<Marks> findBySubjectId(Long subjectId) {
        return findByCourseId(subjectId);
    }
    
    default List<Marks> findByStudentIdAndSubjectId(Long studentId, Long subjectId) {
        return findByStudentIdAndCourseId(studentId, subjectId);
    }
    
    // New filtering methods for marks redesign
    List<Marks> findByTeacherIdAndMarkType(Long teacherId, Marks.MarkType markType);
    List<Marks> findByTeacherIdAndCourseIdAndMarkType(Long teacherId, Long courseId, Marks.MarkType markType);
    List<Marks> findByProgramIdAndSemesterNameAndMarkType(Long programId, String semesterName, Marks.MarkType markType);
    Optional<Marks> findByStudentIdAndCourseIdAndTeacherId(Long studentId, Long courseId, Long teacherId);
    
    // Find marks by admin email and mark type
    List<Marks> findByAdminEmailAndMarkType(String adminEmail, Marks.MarkType markType);
    
    // Find all marks by mark type (admin marks, teacher marks, etc.)
    List<Marks> findByMarkType(Marks.MarkType markType);
    
    // Backward compatibility
    default List<Marks> findByTeacherIdAndSubjectIdAndMarkType(Long teacherId, Long subjectId, Marks.MarkType markType) {
        return findByTeacherIdAndCourseIdAndMarkType(teacherId, subjectId, markType);
    }
    
    default Optional<Marks> findByStudentIdAndSubjectIdAndTeacherId(Long studentId, Long subjectId, Long teacherId) {
        return findByStudentIdAndCourseIdAndTeacherId(studentId, subjectId, teacherId);
    }
    
    // Get student marks with proper eager loading of student and user
    @Query("SELECT m FROM Marks m " +
           "JOIN FETCH m.student s " +
           "JOIN FETCH s.user " +
           "LEFT JOIN FETCH m.course c " +
           "LEFT JOIN FETCH m.teacher t " +
           "WHERE m.student.id = :studentId AND m.markType = :markType " +
           "ORDER BY m.createdAt DESC")
    List<Marks> findByStudentIdAndMarkType(Long studentId, Marks.MarkType markType);
    
    // Get distinct subjects by teacher and mark type
    @Query("SELECT DISTINCT m.course FROM Marks m WHERE m.teacher.id = ?1 AND m.markType = ?2")
    List<Subject> findDistinctSubjectsByTeacherAndMarkType(Long teacherId, Marks.MarkType markType);
}

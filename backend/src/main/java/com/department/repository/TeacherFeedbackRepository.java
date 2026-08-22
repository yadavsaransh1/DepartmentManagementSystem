package com.department.repository;

import com.department.model.TeacherFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherFeedbackRepository extends JpaRepository<TeacherFeedback, Long> {
    List<TeacherFeedback> findByTeacherIdAndIsDeletedFalse(Long teacherId);
    List<TeacherFeedback> findByStudentIdAndIsDeletedFalse(Long studentId);
    List<TeacherFeedback> findByIsDeletedFalse();
    List<TeacherFeedback> findByProgramAndSemesterAndIsDeletedFalse(String program, Integer semester);
    
    // Backward compatibility for subjectId -> courseId (course_id in database)
    @Query("SELECT f FROM TeacherFeedback f WHERE f.teacher.id = :teacherId AND f.course.id = :courseId AND f.isDeleted = false")
    List<TeacherFeedback> findByTeacherIdAndSubjectIdAndIsDeletedFalse(@Param("teacherId") Long teacherId, @Param("courseId") Long courseId);
    
    @Query("SELECT f FROM TeacherFeedback f WHERE f.teacher.id = :teacherId AND f.isDeleted = false")
    List<TeacherFeedback> findActiveFeedbackForTeacher(@Param("teacherId") Long teacherId);
    
    @Query("SELECT f FROM TeacherFeedback f WHERE f.student.id = :studentId AND f.isDeleted = false")
    List<TeacherFeedback> findActiveFeedbackByStudent(@Param("studentId") Long studentId);
}

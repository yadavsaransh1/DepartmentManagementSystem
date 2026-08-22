package com.department.repository;

import com.department.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Attendance> findByTeacherIdAndCourseIdAndAttendanceDateBetween(
            Long teacherId, Long courseId, LocalDate startDate, LocalDate endDate);
    Optional<Attendance> findByStudentIdAndCourseIdAndAttendanceDate(
            Long studentId, Long courseId, LocalDate attendanceDate);
    Optional<Attendance> findByStudentIdAndCourseIdAndAttendanceDateAndAttendanceTime(
            Long studentId, Long courseId, LocalDate attendanceDate, LocalTime attendanceTime);
    List<Attendance> findByCourseId(Long courseId);
    
    // Backward compatibility: subjectId parameters map to courseId
    default List<Attendance> findByStudentIdAndSubjectId(Long studentId, Long subjectId) {
        return findByStudentIdAndCourseId(studentId, subjectId);
    }
    
    default List<Attendance> findByTeacherIdAndSubjectIdAndAttendanceDateBetween(
            Long teacherId, Long subjectId, LocalDate startDate, LocalDate endDate) {
        return findByTeacherIdAndCourseIdAndAttendanceDateBetween(teacherId, subjectId, startDate, endDate);
    }
    
    default Optional<Attendance> findByStudentIdAndSubjectIdAndAttendanceDate(
            Long studentId, Long subjectId, LocalDate attendanceDate) {
        return findByStudentIdAndCourseIdAndAttendanceDate(studentId, subjectId, attendanceDate);
    }
    
    default List<Attendance> findBySubjectId(Long subjectId) {
        return findByCourseId(subjectId);
    }
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.course.id = ?2 AND a.status = 'PRESENT'")
    long countPresentDays(Long studentId, Long courseId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.course.id = ?2")
    long countTotalDays(Long studentId, Long courseId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.course.id = ?2 AND a.status = 'PRESENT' AND a.attendanceDate BETWEEN ?3 AND ?4")
    long countPresentDaysBetween(Long studentId, Long courseId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.course.id = ?2 AND a.attendanceDate BETWEEN ?3 AND ?4")
    long countTotalDaysBetween(Long studentId, Long courseId, LocalDate startDate, LocalDate endDate);

    // Additional date-range filtering methods
    List<Attendance> findByStudentIdAndAttendanceDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    
    List<Attendance> findByCourseIdAndAttendanceDateBetween(Long courseId, LocalDate startDate, LocalDate endDate);
    
    // Student and Course attendance within date range
    List<Attendance> findByStudentIdAndCourseIdAndAttendanceDateBetween(
            Long studentId, Long courseId, LocalDate startDate, LocalDate endDate);
    
    // Backward compatibility
    default List<Attendance> findBySubjectIdAndAttendanceDateBetween(Long subjectId, LocalDate startDate, LocalDate endDate) {
        return findByCourseIdAndAttendanceDateBetween(subjectId, startDate, endDate);
    }
    
    default List<Attendance> findByStudentIdAndSubjectIdAndAttendanceDateBetween(
            Long studentId, Long subjectId, LocalDate startDate, LocalDate endDate) {
        return findByStudentIdAndCourseIdAndAttendanceDateBetween(studentId, subjectId, startDate, endDate);
    }
}

package com.department.service;

import com.department.model.Marks;
import com.department.dto.AdminMarksRequestDTO;
import com.department.dto.UpdateMarksRequestDTO;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

public interface MarksService {
    Marks recordMarks(Marks marks);
    Optional<Marks> getMarksById(Long id);
    List<Marks> getStudentMarks(Long studentId);
    List<Marks> getSubjectMarks(Long subjectId);
    List<Marks> getStudentSubjectMarks(Long studentId, Long subjectId);
    List<Marks> getTeacherMarks(Long teacherId);
    List<Marks> getTeacherMarksByEmail(String teacherEmail);
    List<Marks> getMarksByExamType(Marks.ExamType examType);
    Marks updateMarks(Long id, Marks marks);
    Marks updateMarksFromDTO(Long id, UpdateMarksRequestDTO request);
    void deleteMarks(Long id);
    double calculateStudentGPA(Long studentId);
    List<Marks> getStudentMarksOrderByDate(Long studentId);
    
    // New methods for marks breakdown
    Marks updateSemesterMarks(Long marksId, BigDecimal obtainedMarks);
    Marks updateSessionalMarks(Long marksId, BigDecimal obtainedMarks);
    Marks updateAssignmentMarks(Long marksId, BigDecimal obtainedMarks);
    Marks getStudentSubjectMarksBreakdown(Long studentId, Long subjectId);
    Marks recordMarksWithBreakdown(Marks marks);
    
    // New methods for teacher and admin marks separation
    List<Marks> getTeacherMarksByMarkType(Long teacherId, Marks.MarkType markType);
    List<Marks> getTeacherSubjectMarks(Long teacherId, Long subjectId, Marks.MarkType markType);
    List<Marks> getAdminMarksForSemester(Long programId, String semesterName);
    List<Marks> getAllAdminMarks();  // Fetch all admin marks without filters
    List<Marks> getAllTeacherMarks();  // Fetch all teacher marks without filters
    List<Marks> getStudentMarksWithType(Long studentId, Marks.MarkType markType);
    Marks recordAdminMarks(Marks marks);
    Marks recordAdminMarksFromDTO(AdminMarksRequestDTO request);
    
    // Methods for user-based marks retrieval
    List<Marks> getUserMarks(Long userId);
    List<Marks> getUserMarksWithType(Long userId, Marks.MarkType markType);
    List<Marks> getUserMarksWithTypeByEmail(String userEmail, Marks.MarkType markType);
}

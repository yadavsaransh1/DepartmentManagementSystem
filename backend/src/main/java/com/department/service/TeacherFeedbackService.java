package com.department.service;

import com.department.model.TeacherFeedback;
import java.util.List;
import java.util.Optional;

public interface TeacherFeedbackService {
    TeacherFeedback submitFeedback(TeacherFeedback feedback);
    Optional<TeacherFeedback> getFeedbackById(Long id);
    List<TeacherFeedback> getFeedbackForTeacher(Long teacherId);
    List<TeacherFeedback> getFeedbackByStudent(Long studentId);
    List<TeacherFeedback> getAllFeedback();
    void deleteFeedback(Long id);
    void softDeleteFeedback(Long id);
    List<TeacherFeedback> getFeedbackByProgramAndSemester(String program, Integer semester);
}

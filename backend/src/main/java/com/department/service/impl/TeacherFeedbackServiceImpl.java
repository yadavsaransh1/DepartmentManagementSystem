package com.department.service.impl;

import com.department.model.TeacherFeedback;
import com.department.repository.TeacherFeedbackRepository;
import com.department.service.TeacherFeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class TeacherFeedbackServiceImpl implements TeacherFeedbackService {

    @Autowired
    private TeacherFeedbackRepository feedbackRepository;

    @Override
    public TeacherFeedback submitFeedback(TeacherFeedback feedback) {
        return feedbackRepository.save(feedback);
    }

    @Override
    public Optional<TeacherFeedback> getFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    @Override
    public List<TeacherFeedback> getFeedbackForTeacher(Long teacherId) {
        return feedbackRepository.findActiveFeedbackForTeacher(teacherId);
    }

    @Override
    public List<TeacherFeedback> getFeedbackByStudent(Long studentId) {
        return feedbackRepository.findActiveFeedbackByStudent(studentId);
    }

    @Override
    public List<TeacherFeedback> getAllFeedback() {
        return feedbackRepository.findByIsDeletedFalse();
    }

    @Override
    public void deleteFeedback(Long id) {
        feedbackRepository.deleteById(id);
    }

    @Override
    public void softDeleteFeedback(Long id) {
        Optional<TeacherFeedback> feedback = feedbackRepository.findById(id);
        if (feedback.isPresent()) {
            TeacherFeedback f = feedback.get();
            f.setIsDeleted(true);
            feedbackRepository.save(f);
        }
    }

    @Override
    public List<TeacherFeedback> getFeedbackByProgramAndSemester(String program, Integer semester) {
        return feedbackRepository.findByProgramAndSemesterAndIsDeletedFalse(program, semester);
    }
}

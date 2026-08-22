package com.department.service;

import com.department.model.FeedbackActivation;
import java.util.List;
import java.util.Optional;

public interface FeedbackActivationService {
    FeedbackActivation activateFeedback(String program, Integer semester);
    FeedbackActivation deactivateFeedback(String program, Integer semester);
    Optional<FeedbackActivation> getActivationStatus(String program, Integer semester);
    List<FeedbackActivation> getAllActivations();
    List<FeedbackActivation> getActiveActivations();
    FeedbackActivation updateActivation(Long id, FeedbackActivation activation);
    void deleteActivation(Long id);
}

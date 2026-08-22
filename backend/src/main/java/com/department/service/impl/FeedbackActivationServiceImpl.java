package com.department.service.impl;

import com.department.model.FeedbackActivation;
import com.department.repository.FeedbackActivationRepository;
import com.department.service.FeedbackActivationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FeedbackActivationServiceImpl implements FeedbackActivationService {

    @Autowired
    private FeedbackActivationRepository activationRepository;

    @Override
    public FeedbackActivation activateFeedback(String program, Integer semester) {
        Optional<FeedbackActivation> existing = activationRepository.findByProgramAndSemester(program, semester);
        
        FeedbackActivation activation;
        if (existing.isPresent()) {
            activation = existing.get();
            activation.setIsActivated(true);
        } else {
            activation = new FeedbackActivation();
            activation.setProgram(program);
            activation.setSemester(semester);
            activation.setIsActivated(true);
        }
        
        return activationRepository.save(activation);
    }

    @Override
    public FeedbackActivation deactivateFeedback(String program, Integer semester) {
        Optional<FeedbackActivation> existing = activationRepository.findByProgramAndSemester(program, semester);
        
        if (existing.isPresent()) {
            FeedbackActivation activation = existing.get();
            activation.setIsActivated(false);
            return activationRepository.save(activation);
        }
        
        return null;
    }

    @Override
    public Optional<FeedbackActivation> getActivationStatus(String program, Integer semester) {
        return activationRepository.findByProgramAndSemester(program, semester);
    }

    @Override
    public List<FeedbackActivation> getAllActivations() {
        return activationRepository.findAll();
    }

    @Override
    public List<FeedbackActivation> getActiveActivations() {
        return activationRepository.findAllByIsActivatedTrue();
    }

    @Override
    public FeedbackActivation updateActivation(Long id, FeedbackActivation activation) {
        Optional<FeedbackActivation> existing = activationRepository.findById(id);
        
        if (existing.isPresent()) {
            FeedbackActivation toUpdate = existing.get();
            if (activation.getIsActivated() != null) {
                toUpdate.setIsActivated(activation.getIsActivated());
            }
            return activationRepository.save(toUpdate);
        }
        
        return null;
    }

    @Override
    public void deleteActivation(Long id) {
        activationRepository.deleteById(id);
    }
}

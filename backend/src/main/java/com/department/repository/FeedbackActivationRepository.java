package com.department.repository;

import com.department.model.FeedbackActivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackActivationRepository extends JpaRepository<FeedbackActivation, Long> {
    Optional<FeedbackActivation> findByProgramAndSemester(String program, Integer semester);
    List<FeedbackActivation> findAllByIsActivatedTrue();
    List<FeedbackActivation> findAll();
}

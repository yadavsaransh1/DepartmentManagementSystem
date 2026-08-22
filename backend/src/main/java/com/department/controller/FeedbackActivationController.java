package com.department.controller;

import com.department.model.FeedbackActivation;
import com.department.service.FeedbackActivationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/feedback-activation")
public class FeedbackActivationController {

    @Autowired
    private FeedbackActivationService activationService;

    @PostMapping
    public ResponseEntity<FeedbackActivation> activateFeedback(@RequestBody FeedbackActivation activation) {
        try {
            FeedbackActivation savedActivation = activationService.activateFeedback(
                    activation.getProgram(),
                    activation.getSemester()
            );
            return new ResponseEntity<>(savedActivation, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<FeedbackActivation>> getAllActivations() {
        List<FeedbackActivation> activations = activationService.getAllActivations();
        return ResponseEntity.ok(activations);
    }

    @GetMapping("/status")
    public ResponseEntity<FeedbackActivation> getActivationStatus(
            @RequestParam String program,
            @RequestParam Integer semester) {
        return activationService.getActivationStatus(program, semester)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new FeedbackActivation()));
    }


    @PutMapping("/{id}")
    public ResponseEntity<FeedbackActivation> updateActivation(
            @PathVariable Long id,
            @RequestBody FeedbackActivation activation) {
        try {
            FeedbackActivation updated = activationService.updateActivation(id, activation);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivation(@PathVariable Long id) {
        try {
            activationService.deleteActivation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

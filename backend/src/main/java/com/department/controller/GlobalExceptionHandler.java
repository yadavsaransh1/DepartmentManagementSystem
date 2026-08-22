package com.department.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.validation.FieldError;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("timestamp", System.currentTimeMillis() + "");
        
        System.err.println("=== Validation Exception ===");
        for (String field : errors.keySet()) {
            System.err.println(field + ": " + errors.get(field));
        }
        System.err.println("=== End Validation ===\n");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Access Denied: You don't have permission to perform this action");
        error.put("timestamp", System.currentTimeMillis() + "");
        
        System.err.println("Access Denied: " + ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("timestamp", System.currentTimeMillis() + "");
        
        // Log the full exception hierarchy
        System.err.println("=== RuntimeException in GlobalExceptionHandler ===");
        System.err.println("Message: " + ex.getMessage());
        System.err.println("Class: " + ex.getClass().getName());
        ex.printStackTrace(System.err);
        
        // Print root cause
        Throwable cause = ex.getCause();
        while (cause != null) {
            System.err.println(" --- CAUSED BY --- ");
            System.err.println("Class: " + cause.getClass().getName());
            System.err.println("Message: " + cause.getMessage());
            cause.printStackTrace(System.err);
            cause = cause.getCause();
        }
        System.err.println("=== End RuntimeException ===\n");
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        error.put("type", ex.getClass().getSimpleName());
        
        System.err.println("Exception: " + ex.getMessage());
        System.err.println("Exception class: " + ex.getClass().getName());
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

package com.department.controller;

import com.department.dto.AuthDTO;
import com.department.dto.RegisterDTO;
import com.department.model.User;
import com.department.repository.UserRepository;
import com.department.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO authDTO) {
        try {
            return ResponseEntity.ok(authService.login(authDTO));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(401).body(Map.of(
                "error", "Login failed: " + e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        try {
            return ResponseEntity.ok(authService.register(registerDTO));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Registration failed: " + e.getMessage(),
                "type", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null || 
                currentPassword.isEmpty() || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Current and new passwords are required"));
            }
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            
            authService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error changing password: " + e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }
            
            authService.sendPasswordResetLink(email);
            return ResponseEntity.ok(Map.of("message", "If email exists, reset link has been sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error processing request: " + e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");
            
            if (token == null || newPassword == null || confirmPassword == null ||
                token.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
            }
            
            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Passwords do not match"));
            }
            
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error resetting password: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API is working!");
    }

    @PostMapping("/admin/reset-user-password")
    public ResponseEntity<?> adminResetUserPassword(@RequestBody Map<String, Object> request) {
        try {
            String userEmail = (String) request.get("userEmail");
            String newPassword = (String) request.get("newPassword");
            
            if (userEmail == null || userEmail.isEmpty() || newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User email and password are required"));
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));
            }
            
            // Verify that the current user is an admin
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User adminUser = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));
            
            if (!"ADMIN".equalsIgnoreCase(adminUser.getRole().toString())) {
                return ResponseEntity.status(403).body(Map.of("message", "Only admins can reset user passwords"));
            }
            
            authService.adminResetUserPassword(userEmail, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error resetting password: " + e.getMessage()));
        }
    }
}

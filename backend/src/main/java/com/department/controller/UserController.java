package com.department.controller;

import com.department.model.User;
import com.department.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> searchUsers(@RequestParam(value = "query", defaultValue = "") String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            // Search by name or email
            List<Map<String, Object>> users = userRepository.findAll().stream()
                    .filter(user -> 
                        (user.getFullName() != null && user.getFullName().toLowerCase().contains(query.toLowerCase())) ||
                        (user.getEmail() != null && user.getEmail().toLowerCase().contains(query.toLowerCase()))
                    )
                    .map(user -> Map.of(
                        "id", (Object) user.getEmail(),
                        "fullName", user.getFullName(),
                        "email", user.getEmail(),
                        "role", user.getRole().toString(),
                        "isActive", user.getIsActive()
                    ))
                    .limit(20)  // Limit to 20 results
                    .collect(Collectors.toList());

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error searching users: " + e.getMessage()));
        }
    }

    @PutMapping("/update-profile/{userId}")
    public ResponseEntity<?> updateProfile(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            String fullName = (String) request.get("fullName");
            String email = (String) request.get("email");

            if (fullName == null || fullName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Full name is required"));
            }

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
            }

            // Add basic email validation
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid email format"));
            }

                User user = userRepository.findById(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if email is already taken by another user
            if (!user.getEmail().equals(email) && userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
            }

            user.setFullName(fullName);
            user.setEmail(email);
            userRepository.save(user);

            Map<String, Object> response = Map.of(
                "message", "Profile updated successfully",
                "id", user.getEmail(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "role", user.getRole().toString()
            );

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error updating profile: " + e.getMessage()));
        }
    }
}

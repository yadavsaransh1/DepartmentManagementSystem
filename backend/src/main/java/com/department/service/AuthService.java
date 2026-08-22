package com.department.service;

import com.department.dto.AuthDTO;
import com.department.dto.JwtResponseDTO;
import com.department.dto.RegisterDTO;
import com.department.model.User;
import com.department.model.Student;
import com.department.model.Teacher;
import com.department.model.PasswordResetToken;
import com.department.repository.UserRepository;
import com.department.repository.StudentRepository;
import com.department.repository.TeacherRepository;
import com.department.repository.PasswordResetTokenRepository;
import com.department.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class AuthService {
    private static final Logger logger = Logger.getLogger(AuthService.class.getName());

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private SubjectEnrollmentService subjectEnrollmentService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5174}")
    private String frontendUrl;

    public JwtResponseDTO login(AuthDTO authDTO) {
        logger.info("Attempting login for email: " + authDTO.getEmail());
        
        User user = userRepository.findByEmail(authDTO.getEmail())
                .orElseThrow(() -> {
                    logger.severe("User not found with email: " + authDTO.getEmail());
                    return new RuntimeException("User not found with email: " + authDTO.getEmail());
                });

        logger.info("User found: " + user.getEmail() + ", Role: " + user.getRole() + ", IsActive: " + user.getIsActive());
        
        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            logger.severe("Password mismatch for user: " + authDTO.getEmail());
            throw new RuntimeException("Invalid password");
        }

        logger.info("Password verified successfully for: " + authDTO.getEmail());

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().toString());

        Long studentId = null;
        String teacherId = null;
        Long userId = null;

        // Fetch student or teacher ID based on role
        if ("STUDENT".equalsIgnoreCase(user.getRole().toString())) {
            Student student = studentRepository.findByUserEmail(user.getEmail())
                    .orElse(null);
            if (student != null) {
                studentId = student.getId();
                userId = student.getId();
                logger.info("Student ID found: " + studentId);
            } else {
                logger.warning("No student record found for user: " + user.getEmail());
            }
        } else if ("TEACHER".equalsIgnoreCase(user.getRole().toString()) || "HOD".equalsIgnoreCase(user.getRole().toString())) {
            Teacher teacher = teacherRepository.findByUserEmail(user.getEmail())
                    .orElse(null);
            if (teacher != null) {
                teacherId = teacher.getTeacherId();
                userId = teacher.getId();
                logger.info("Teacher record found: id=" + userId + " teacherId=" + teacherId + ", isHoD=" + teacher.getIsHoD());
            } else {
                logger.warning("No teacher record found for user: " + user.getEmail());
            }
        } else if ("ADMIN".equalsIgnoreCase(user.getRole().toString())) {
            logger.info("Admin user login: " + user.getEmail() + ". studentId and teacherId remain null.");
        }

        JwtResponseDTO response = new JwtResponseDTO(
                token,
                "Bearer",
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString(),
                studentId,
                teacherId
        );
        response.setId(userId);
        return response;
    }

    @Transactional
    public JwtResponseDTO register(RegisterDTO registerDTO) {
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setFullName(registerDTO.getFullName());
        user.setRole(User.UserRole.valueOf(registerDTO.getRole().toUpperCase()));
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        // Create Student or Teacher record based on role
        if ("STUDENT".equalsIgnoreCase(registerDTO.getRole())) {
            Student student = new Student();
            student.setUser(savedUser);
            // Auto-generate studentId if not provided
            String studentId = registerDTO.getStudentId();
            if (studentId == null || studentId.isEmpty()) {
                studentId = "STU" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
            student.setStudentId(studentId);
            student.setEnrollmentNumber(registerDTO.getEnrollmentNumber());
            student.setDepartment(registerDTO.getDepartment());
            student.setProgram(registerDTO.getCourse());
            student.setSemester(registerDTO.getSemester());
            student.setAttendancePercentage(0.0f);
            Student savedStudent = studentRepository.save(student);
            
            // Automatically enroll student in subjects based on course and semester
            subjectEnrollmentService.enrollStudentInSubjects(savedStudent);
        } else if ("TEACHER".equalsIgnoreCase(registerDTO.getRole())) {
            Teacher teacher = new Teacher();
            teacher.setUser(savedUser);
            
            // Handle employeeId - auto-generate if not provided
            String employeeId = registerDTO.getEmployeeId();
            if (employeeId == null || employeeId.isEmpty()) {
                employeeId = "EMP" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            }
            teacher.setEmployeeId(employeeId);
            
            // Handle teacherId (new field)
            if (registerDTO.getTeacherId() != null && !registerDTO.getTeacherId().isEmpty()) {
                teacher.setTeacherId(registerDTO.getTeacherId());
            }
            teacher.setDepartment(registerDTO.getDepartment());
            teacher.setSubject(registerDTO.getSubject());
            teacher.setSpecialization(registerDTO.getSpecialization());
            if (registerDTO.getDesignation() != null && !registerDTO.getDesignation().isEmpty()) {
                teacher.setDesignation(registerDTO.getDesignation());
            }
            if (registerDTO.getContactNumber() != null && !registerDTO.getContactNumber().isEmpty()) {
                teacher.setContactNumber(registerDTO.getContactNumber());
            }
            teacherRepository.save(teacher);
        }

        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().toString());

        return new JwtResponseDTO(
                token,
                "Bearer",
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().toString()
        );
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }

        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        logger.info("Password changed successfully for user: " + email);
    }

    @Transactional
    public void sendPasswordResetLink(String email) {
        // Email exists or not, we return generic message for security
        java.util.Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            
            // Delete any existing tokens for this user
            passwordResetTokenRepository.deleteByUser(user);
            
            // Create new token
            String token = UUID.randomUUID().toString();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(15);
            
            PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryTime);
            passwordResetTokenRepository.save(resetToken);
            
            // Send email
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendPasswordResetEmail(email, user.getFullName(), resetLink);
            
            logger.info("Password reset link sent to: " + email);
        } else {
            logger.info("Password reset requested for non-existent email: " + email);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        
        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("Reset link has expired. Please request a new one.");
        }
        
        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }
        
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        
        logger.info("Password reset successfully for user: " + user.getEmail());
    }

    @Transactional
    public void adminResetUserPassword(String userEmail, String newPassword) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + userEmail));
        
        if (newPassword == null || newPassword.isEmpty()) {
            throw new IllegalArgumentException("New password cannot be empty");
        }
        
        if (newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        logger.info("Admin reset password for user: " + user.getEmail());
    }
}

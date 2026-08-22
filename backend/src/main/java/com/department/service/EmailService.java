package com.department.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.util.logging.Logger;

@Service
public class EmailService {
    private static final Logger logger = Logger.getLogger(EmailService.class.getName());
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    private final String NO_EMAIL_SERVICE = "Email service not configured";
    
    public void sendPasswordResetEmail(String toEmail, String fullName, String resetLink) {
        if (mailSender == null) {
            logger.info(NO_EMAIL_SERVICE + " - Would send reset link to: " + toEmail);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@universitymanagement.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset Request - Department Management System");
            
            String emailBody = String.format(
                "Dear %s,\n\n" +
                "You have requested to reset your password. Click the link below to proceed:\n\n" +
                "%s\n\n" +
                "This link will expire in 24 hours.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "Department Management System",
                fullName, resetLink
            );
            
            message.setText(emailBody);
            mailSender.send(message);
            logger.info("Password reset email sent to: " + toEmail);
        } catch (Exception e) {
            logger.severe("Failed to send password reset email to " + toEmail + ": " + e.getMessage());
        }
    }
}

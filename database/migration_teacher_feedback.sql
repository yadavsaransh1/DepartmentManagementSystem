-- Migration: Add Teacher Feedback System
-- Purpose: Create tables for managing student feedback about teachers

-- Create feedback activation table
CREATE TABLE IF NOT EXISTS feedback_activation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program VARCHAR(255) NOT NULL,
    semester INT NOT NULL,
    is_activated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_program_semester (program, semester),
    INDEX idx_program (program),
    INDEX idx_semester (semester),
    INDEX idx_activated (is_activated)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create teacher feedback table  
CREATE TABLE IF NOT EXISTS teacher_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT,
    program VARCHAR(255),
    semester INT,
    
    -- Feedback ratings (1-5 scale)
    teaching_quality INT,          -- How effective is the teaching
    communication INT,             -- How clear is communication
    availability INT,              -- How available for doubt clearing
    course_content INT,            -- Quality of course content
    overall_rating INT,            -- Overall rating
    
    -- Feedback text
    comments TEXT,
    positive_aspects TEXT,
    areas_for_improvement TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_anonymous BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    INDEX idx_teacher (teacher_id),
    INDEX idx_student (student_id),
    INDEX idx_subject (subject_id),
    INDEX idx_program_semester (program, semester),
    INDEX idx_created (created_at),
    INDEX idx_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

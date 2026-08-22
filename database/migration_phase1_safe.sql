-- SAFE Migration Script: Phase 1 - Terminology Refactoring
-- Simplified version without conditional logic

USE university_db;

SET FOREIGN_KEY_CHECKS=0;

-- Create Programs table if it doesn't exist
CREATE TABLE IF NOT EXISTS programs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    semester_count INT DEFAULT 6,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Insert programs from existing student courses
INSERT IGNORE INTO programs (name, semester_count, description) 
SELECT DISTINCT course, 6, CONCAT('Program: ', course) FROM students WHERE course IS NOT NULL;

-- Add program column to students table if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS program VARCHAR(100) AFTER department;

-- Copy course data to program (safe - only if program is null)
UPDATE students SET program = course WHERE program IS NULL AND course IS NOT NULL;

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_code VARCHAR(50) UNIQUE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    teacher_id BIGINT NOT NULL,
    semester INT,
    credits INT,
    program VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_course_code (course_code),
    KEY idx_teacher (teacher_id),
    KEY idx_program (program),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (program) REFERENCES programs(name) ON DELETE SET NULL
);

-- Migrate from subjects to courses (only if courses is empty)
INSERT INTO courses (id, course_code, course_name, teacher_id, semester, credits, program, description, created_at)
SELECT id, subject_code, subject_name, teacher_id, semester, credits, course, description, created_at
FROM subjects
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE courses.id = subjects.id);

-- Create course_enrollment table  
CREATE TABLE IF NOT EXISTS course_enrollment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Migrate from subject_enrollment to course_enrollment
INSERT INTO course_enrollment (id, student_id, course_id, enrollment_date)
SELECT id, student_id, subject_id, enrollment_date
FROM subject_enrollment
WHERE NOT EXISTS (SELECT 1 FROM course_enrollment WHERE course_enrollment.id = subject_enrollment.id);

-- Update attendance table: Add course_id column if it doesn't exist
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS course_id BIGINT AFTER subject_id;

-- Copy subject_id to course_id 
UPDATE attendance SET course_id = subject_id WHERE course_id IS NULL;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

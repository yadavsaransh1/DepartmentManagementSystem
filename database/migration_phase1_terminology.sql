-- Migration Script: Phase 1 - Terminology Refactoring
-- Date: March 12, 2026
-- Changes: Course → Program, Subject → Course

-- Step 1: Create Programs table
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

-- Step 2: Populate programs table with existing data
-- This will extract unique programs from students table
INSERT INTO programs (name, semester_count, description) 
VALUES 
    ('BCA', 6, 'Bachelor of Computer Applications'),
    ('B.Tech', 8, 'Bachelor of Technology'),
    ('MBA', 4, 'Master of Business Administration'),
    ('MCA', 6, 'Master of Computer Applications')
ON DUPLICATE KEY UPDATE semester_count = VALUES(semester_count);

-- Step 3: Rename students.course to students.program
-- First add new column
ALTER TABLE students ADD COLUMN program VARCHAR(100) AFTER department;

-- Step 4: Migrate data from course to program
UPDATE students SET program = course WHERE course IS NOT NULL;

-- Step 5: Add foreign key to programs table
ALTER TABLE students ADD CONSTRAINT fk_students_program 
FOREIGN KEY (program) REFERENCES programs(name) ON DELETE SET NULL;

-- Step 6: Rename subjects table to courses
-- Create new courses table with updated structure
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
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (program) REFERENCES programs(name) ON DELETE SET NULL,
    INDEX idx_course_code (course_code),
    INDEX idx_teacher (teacher_id),
    INDEX idx_program (program)
);

-- Step 7: Migrate data from subjects to courses
INSERT INTO courses (id, course_code, course_name, teacher_id, semester, credits, program, description, created_at)
SELECT id, subject_code, subject_name, teacher_id, semester, credits, course, description, created_at
FROM subjects;

-- Step 8: Rename subject_enrollment to course_enrollment
-- Create new course_enrollment table
CREATE TABLE IF NOT EXISTS course_enrollment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Step 9: Migrate data from subject_enrollment to course_enrollment
INSERT INTO course_enrollment (id, student_id, course_id, enrollment_date)
SELECT id, student_id, subject_id, enrollment_date
FROM subject_enrollment;

-- Step 10: Update attendance table - rename subject_id to course_id
-- Create new attendance table
CREATE TABLE IF NOT EXISTS attendance_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_time TIME,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'LEAVE') DEFAULT 'ABSENT',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_attendance (student_id, course_id, attendance_date, attendance_time),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_date (attendance_date),
    INDEX idx_student_course (student_id, course_id),
    INDEX idx_created_at (created_at),
    INDEX idx_course_id (course_id)
);

-- Step 11: Migrate data from attendance to attendance_new
INSERT INTO attendance_new (id, student_id, course_id, teacher_id, attendance_date, attendance_time, status, remarks, created_at)
SELECT id, student_id, subject_id, teacher_id, attendance_date, attendance_time, status, remarks, created_at
FROM attendance;

-- Step 12: Drop old tables (AFTER BACKUP)
-- DROP TABLE IF EXISTS subject_enrollment;
-- DROP TABLE IF EXISTS attendance;
-- DROP TABLE IF EXISTS subjects;
-- Uncomment above after confirming migration worked

-- Step 13: Rename tables
-- RENAME TABLE attendance TO attendance_old, attendance_new TO attendance;

-- Step 14: Update documents table if it has subject-related restrictions
-- Rename allowed_courses to allowed_programs (if needed) - this can stay as is since it refers to student programs

-- Step 15: Drop course column from students after verification
-- ALTER TABLE students DROP COLUMN course;

-- Step 16: Create indexes for performance
CREATE INDEX idx_program_semester ON students(program, semester);
CREATE INDEX idx_course_program_semester ON courses(program, semester);

-- Verification queries (run these to verify migration)
-- SELECT * FROM programs;
-- SELECT count(*) FROM courses;
-- SELECT count(*) FROM course_enrollment;
-- SELECT count(*) FROM attendance_new;
-- SELECT DISTINCT program FROM students;

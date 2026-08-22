-- Department Management System - Feature Migration Script
-- Creates tables for new features

USE university_db;

-- 1. Assignment Table
CREATE TABLE IF NOT EXISTS assignment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    due_date DATETIME NOT NULL,
    total_marks INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

-- 2. Assignment Submission Table
CREATE TABLE IF NOT EXISTS assignment_submission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    submission_file_path VARCHAR(255),
    submission_file_name VARCHAR(255),
    submission_text LONGTEXT,
    score INT,
    feedback TEXT,
    status ENUM('NOT_SUBMITTED', 'SUBMITTED', 'LATE_SUBMITTED', 'GRADED') DEFAULT 'NOT_SUBMITTED',
    submitted_at DATETIME,
    graded_at DATETIME,
    is_late BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignment(id),
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 3. Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    marks DECIMAL(10, 2),
    total_marks INT DEFAULT 100,
    percentage DECIMAL(10, 2),
    exam_type ENUM('MIDTERM', 'FINAL', 'QUIZ', 'PRACTICAL', 'ASSIGNMENT') DEFAULT 'ASSIGNMENT',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (subject_id) REFERENCES subject(id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(id)
);

-- 4. Student Performance Table
CREATE TABLE IF NOT EXISTS student_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT,
    overall_gpa DECIMAL(10, 2),
    performance_level ENUM('EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT') DEFAULT 'SATISFACTORY',
    strengths TEXT,
    weaknesses TEXT,
    recommendations TEXT,
    last_evaluation_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- 8. Teacher Performance Table
CREATE TABLE IF NOT EXISTS teacher_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_classes INT DEFAULT 0,
    total_attendance_marked INT DEFAULT 0,
    total_assignments_given INT DEFAULT 0,
    total_submissions_graded INT DEFAULT 0,
    avg_grading_time INT DEFAULT 0,
    students_engaged INT DEFAULT 0,
    performance_rating DECIMAL(10, 2),
    last_evaluation_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Create Indexes for performance optimization
CREATE INDEX idx_assignment_subject ON assignment(subject_id);
CREATE INDEX idx_assignment_teacher ON assignment(teacher_id);
CREATE INDEX idx_assignment_due_date ON assignment(due_date);
CREATE INDEX idx_submission_assignment ON assignment_submission(assignment_id);
CREATE INDEX idx_submission_student ON assignment_submission(student_id);
CREATE INDEX idx_submission_status ON assignment_submission(status);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_subject ON marks(subject_id);
CREATE INDEX idx_marks_teacher ON marks(teacher_id);
CREATE INDEX idx_email_recipient ON email_notification(recipient_email);
CREATE INDEX idx_email_status ON email_notification(status);
CREATE INDEX idx_workflow_type ON scheduled_workflow(workflow_type);
CREATE INDEX idx_workflow_active ON scheduled_workflow(is_active);
CREATE INDEX idx_student_perf_student ON student_performance(student_id);
CREATE INDEX idx_teacher_perf_teacher ON teacher_performance(teacher_id);

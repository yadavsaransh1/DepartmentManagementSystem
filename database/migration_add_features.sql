-- ============================================
-- MIGRATION: Add Features Support Tables
-- Date: 2026-02-21
-- Features: Assignments, Grades, Analytics
-- ============================================

-- 1. ASSIGNMENT TABLE
CREATE TABLE IF NOT EXISTS assignment (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    instructions TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    due_date DATETIME NOT NULL,
    max_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    INDEX idx_subject_id (subject_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_due_date (due_date)
);

-- 5. ASSIGNMENT SUBMISSION TABLE
CREATE TABLE IF NOT EXISTS assignment_submission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    submission_file_path VARCHAR(500),
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
    FOREIGN KEY (assignment_id) REFERENCES assignment(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY unique_assignment_student (assignment_id, student_id),
    INDEX idx_assignment_id (assignment_id),
    INDEX idx_student_id (student_id),
    INDEX idx_status (status)
);

-- 6. MARKS/GRADES TABLE
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    exam_type ENUM('MIDTERM', 'FINAL', 'QUIZ', 'INTERNAL', 'ASSIGNMENT') NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    total_marks INT DEFAULT 100,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    comments TEXT,
    entered_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(id) ON DELETE CASCADE,
    FOREIGN KEY (entered_by) REFERENCES teacher(id),
    INDEX idx_student_id (student_id),
    INDEX idx_subject_id (subject_id),
    INDEX idx_exam_type (exam_type),
    INDEX idx_created_at (created_at)
);

-- 7. STUDENT PERFORMANCE METRICS TABLE
CREATE TABLE IF NOT EXISTS student_performance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    overall_gpa DECIMAL(5,2),
    total_assignments INT DEFAULT 0,
    assignments_completed INT DEFAULT 0,
    assignments_pending INT DEFAULT 0,
    total_marks DECIMAL(10,2),
    average_score DECIMAL(5,2),
    attendance_percentage DECIMAL(5,2),
    performance_level ENUM('EXCELLENT', 'GOOD', 'SATISFACTORY', 'NEEDS_IMPROVEMENT') DEFAULT 'SATISFACTORY',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_performance_level (performance_level)
);

-- 8. ANALYTICS SNAPSHOT TABLE (For Dashboard Performance)
CREATE TABLE IF NOT EXISTS analytics_snapshot (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    snapshot_date DATE NOT NULL,
    snapshot_type ENUM('DAILY', 'WEEKLY', 'MONTHLY') NOT NULL,
    total_students INT,
    total_teachers INT,
    avg_attendance_percentage DECIMAL(5,2),
    total_assignments INT,
    total_submissions INT,
    avg_student_performance DECIMAL(5,2),
    courses_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_snapshot (snapshot_date, snapshot_type),
    INDEX idx_snapshot_date (snapshot_date)
);

-- 11. TEACHER PERFORMANCE METRICS TABLE
CREATE TABLE IF NOT EXISTS teacher_performance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    teacher_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_classes INT DEFAULT 0,
    total_attendance_marked INT DEFAULT 0,
    total_assignments_given INT DEFAULT 0,
    total_submissions_graded INT DEFAULT 0,
    avg_grading_time INT DEFAULT 0,
    students_engaged INT DEFAULT 0,
    performance_rating DECIMAL(3,2),
    last_evaluation_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- ============================================
-- ADD INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX idx_assignment_due_date ON assignment(due_date);
CREATE INDEX idx_submission_submitted_at ON assignment_submission(submitted_at);
CREATE INDEX idx_marks_exam_type ON marks(exam_type);

-- ============================================
-- ALTER STUDENT TABLE TO ADD NEW COLUMNS
-- ============================================
ALTER TABLE student ADD COLUMN IF NOT EXISTS total_assignments_completed INT DEFAULT 0;
ALTER TABLE student ADD COLUMN IF NOT EXISTS current_gpa DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE student ADD COLUMN IF NOT EXISTS performance_notes TEXT;
ALTER TABLE student ADD COLUMN IF NOT EXISTS last_performance_update TIMESTAMP NULL;

COMMIT;

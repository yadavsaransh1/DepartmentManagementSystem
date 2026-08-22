-- ============================================================================
-- EMAIL AS PRIMARY KEY MIGRATION - SQL SCRIPTS
-- ============================================================================
-- Database Restructuring: Change users table PK from id (bigint) to email (varchar)
-- ============================================================================

-- STEP 1: BACKUP (Run this first)
-- ============================================================================
-- mysqldump university_db > backup_email_pk_$(date).sql.gz

-- STEP 2: CREATE NEW USERS TABLE WITH EMAIL AS PRIMARY KEY
-- ============================================================================
-- This is safer than ALTER - we create new table, migrate data, then swap

CREATE TABLE users_new (
    email VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
);

-- STEP 3: MIGRATE DATA FROM OLD TABLE TO NEW TABLE
-- ============================================================================
INSERT INTO users_new (email, password, full_name, role, is_active, created_at, updated_at)
SELECT email, password, full_name, role, is_active, created_at, updated_at
FROM users;

-- STEP 4: VERIFY MIGRATION
-- ============================================================================
-- SELECT COUNT(*) FROM users;       -- Should show X rows
-- SELECT COUNT(*) FROM users_new;   -- Should match X rows
-- SELECT * FROM users LIMIT 5;
-- SELECT * FROM users_new LIMIT 5;

-- STEP 5: UPDATE DEPENDENT TABLES - CREATE NEW VERSIONS
-- ============================================================================

-- Students Table
CREATE TABLE students_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    enrollment_number VARCHAR(50) UNIQUE NOT NULL,
    contact_no VARCHAR(20),
    department VARCHAR(100),
    course VARCHAR(100),
    semester INT,
    attendance_percentage FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_enrollment (enrollment_number)
);

-- Teachers Table
CREATE TABLE teachers_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    specialization VARCHAR(100),
    subjects_handled TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_employee_id (employee_id)
);

-- Documents Table
CREATE TABLE documents_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_code VARCHAR(50) UNIQUE NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    uploaded_by_email VARCHAR(255) NOT NULL,
    visibility ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED', 'COURSE') DEFAULT 'PRIVATE',
    allowed_roles VARCHAR(255),
    allowed_user_emails TEXT,
    allowed_courses TEXT,
    category VARCHAR(100),
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_visibility (visibility),
    INDEX idx_uploaded_by (uploaded_by_email),
    FULLTEXT INDEX ft_search (document_name, description)
);

-- Reports Table
CREATE TABLE reports_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    report_code VARCHAR(50) UNIQUE NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('ATTENDANCE', 'ACADEMIC', 'DOCUMENT', 'STUDENT', 'TEACHER') NOT NULL,
    generated_by_email VARCHAR(255) NOT NULL,
    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_data LONGTEXT,
    is_automated BOOLEAN DEFAULT FALSE,
    schedule_cron VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by_email) REFERENCES users_new(email),
    INDEX idx_type (report_type),
    INDEX idx_generated_date (generated_date)
);

-- Notifications Table
CREATE TABLE notifications_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_by_email VARCHAR(255) NOT NULL,
    visibility ENUM('PUBLIC', 'RESTRICTED', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    allowed_roles VARCHAR(255),
    allowed_user_emails TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_visibility (visibility),
    INDEX idx_is_active (is_active)
);

-- PasswordResetTokens Table
CREATE TABLE password_reset_tokens_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    expiry_time DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_email (user_email)
);

-- AssignmentSubmission Table
CREATE TABLE assignment_submission_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    submission_file_path VARCHAR(500),
    submission_file_name VARCHAR(255),
    submission_text LONGTEXT,
    score INT,
    feedback TEXT,
    status ENUM('NOT_SUBMITTED', 'SUBMITTED', 'GRADED', 'LATE') DEFAULT 'NOT_SUBMITTED',
    submitted_at DATETIME,
    graded_at DATETIME,
    is_late BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_email) REFERENCES users_new(email) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students_new(id) ON DELETE CASCADE,
    INDEX idx_assignment (assignment_id),
    INDEX idx_student (student_id),
    INDEX idx_user_email (user_email)
);

-- ProjectMessages Table
CREATE TABLE project_messages_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    allocation_id BIGINT NOT NULL,
    message_text TEXT NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_email) REFERENCES users_new(email) ON DELETE CASCADE,
    INDEX idx_allocation (allocation_id),
    INDEX idx_sender_email (sender_email)
);

-- Marks Table
CREATE TABLE marks_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    user_email VARCHAR(255),
    course_id BIGINT,
    teacher_id BIGINT,
    exam_type VARCHAR(50),
    marks DECIMAL(5,2) NOT NULL,
    total_marks INT DEFAULT 100,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    semester_marks DECIMAL(5,2) DEFAULT 0,
    sessional_marks DECIMAL(5,2) DEFAULT 0,
    assignment_marks DECIMAL(5,2) DEFAULT 0,
    obtained_semester_marks DECIMAL(5,2) DEFAULT 0,
    obtained_sessional_marks DECIMAL(5,2) DEFAULT 0,
    obtained_assignment_marks DECIMAL(5,2) DEFAULT 0,
    comments TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students_new(id) ON DELETE CASCADE,
    FOREIGN KEY (user_email) REFERENCES users_new(email) ON DELETE SET NULL,
    INDEX idx_student (student_id),
    INDEX idx_user_email (user_email),
    INDEX idx_course (course_id)
);

-- ============================================================================
-- STEP 6: MIGRATE DATA FROM OLD TABLES TO NEW TABLES
-- ============================================================================

-- Disable foreign key checks during migration
SET FOREIGN_KEY_CHECKS=0;

-- Students migration
INSERT INTO students_new (id, user_email, student_id, enrollment_number, contact_no, department, course, semester, attendance_percentage, created_at, updated_at)
SELECT s.id, u.email, s.student_id, s.enrollment_number, s.contact_no, s.department, s.course, s.semester, s.attendance_percentage, s.created_at, s.updated_at
FROM students s
JOIN users u ON s.user_id = u.id;

-- Teachers migration
INSERT INTO teachers_new (id, user_email, employee_id, department, specialization, subjects_handled, created_at, updated_at)
SELECT t.id, u.email, t.employee_id, t.department, t.specialization, t.subjects_handled, t.created_at, t.updated_at
FROM teachers t
JOIN users u ON t.user_id = u.id;

-- Documents migration
INSERT INTO documents_new (id, document_code, document_name, description, file_path, file_size, uploaded_by_email, visibility, allowed_roles, allowed_user_emails, allowed_courses, category, download_count, created_at, updated_at)
SELECT d.id, d.document_code, d.document_name, d.description, d.file_path, d.file_size, u.email, d.visibility, d.allowed_roles, d.allowed_user_ids, d.allowed_courses, d.category, d.download_count, d.created_at, d.updated_at
FROM documents d
JOIN users u ON d.uploaded_by = u.id;

-- Reports migration
INSERT INTO reports_new (id, report_code, report_name, report_type, generated_by_email, generated_date, report_data, is_automated, schedule_cron, description, created_at)
SELECT r.id, r.report_code, r.report_name, r.report_type, u.email, r.generated_date, r.report_data, r.is_automated, r.schedule_cron, r.description, r.created_at
FROM reports r
JOIN users u ON r.generated_by = u.id;

-- Notifications migration
INSERT INTO notifications_new (id, title, content, created_by_email, visibility, allowed_roles, allowed_user_emails, is_active, created_at, updated_at)
SELECT n.id, n.title, n.content, u.email, n.visibility, n.allowed_roles, n.allowed_user_ids, n.is_active, n.created_at, n.updated_at
FROM notifications n
JOIN users u ON n.created_by = u.id;

-- PasswordResetTokens migration
INSERT INTO password_reset_tokens_new (id, token, user_email, expiry_time, used)
SELECT p.id, p.token, u.email, p.expiry_time, p.used
FROM password_reset_tokens p
JOIN users u ON p.user_id = u.id;

-- AssignmentSubmission migration (if table has data)
INSERT INTO assignment_submission_new (id, assignment_id, student_id, user_email, submission_file_path, submission_file_name, submission_text, score, feedback, status, submitted_at, graded_at, is_late, created_at, updated_at)
SELECT a.id, a.assignment_id, a.student_id, u.email, a.submission_file_path, a.submission_file_name, a.submission_text, a.score, a.feedback, a.status, a.submitted_at, a.graded_at, a.is_late, a.created_at, a.updated_at
FROM assignment_submission a
JOIN users u ON a.user_id = u.id;

-- ProjectMessages migration (if table has data)
INSERT INTO project_messages_new (id, allocation_id, message_text, sender_role, sender_email, created_at)
SELECT p.id, p.allocation_id, p.message_text, p.sender_role, u.email, p.created_at
FROM project_messages p
JOIN users u ON p.sender_user_id = u.id;

-- Marks migration (user_email is nullable)
INSERT INTO marks_new (id, student_id, user_email, course_id, teacher_id, exam_type, marks, total_marks, percentage, grade, 
    semester_marks, sessional_marks, assignment_marks, obtained_semester_marks, obtained_sessional_marks, obtained_assignment_marks, 
    comments, created_at, updated_at)
SELECT m.id, m.student_id, u.email, m.course_id, m.teacher_id, m.exam_type, m.marks, m.total_marks, m.percentage, m.grade,
    m.semester_marks, m.sessional_marks, m.assignment_marks, m.obtained_semester_marks, m.obtained_sessional_marks, m.obtained_assignment_marks,
    m.comments, m.created_at, m.updated_at
FROM marks m
LEFT JOIN users u ON m.user_id = u.id;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- ============================================================================
-- STEP 7: VERIFY MIGRATIONS
-- ============================================================================
-- Run these to verify data integrity:
-- SELECT COUNT(*) FROM students;
-- SELECT COUNT(*) FROM students_new;
-- 
-- SELECT COUNT(*) FROM teachers;
-- SELECT COUNT(*) FROM teachers_new;
-- 
-- SELECT COUNT(*) FROM documents;
-- SELECT COUNT(*) FROM documents_new;
-- 
-- Select sample data:
-- SELECT * FROM students_new LIMIT 3;
-- SELECT * FROM teachers_new LIMIT 3;

-- ============================================================================
-- STEP 8: BACKUP OLD TABLES (RENAME INSTEAD OF DROP)
-- ============================================================================
-- This creates a safety net - if something breaks, old tables still exist

RENAME TABLE users TO users_old;
RENAME TABLE students TO students_old;
RENAME TABLE teachers TO teachers_old;
RENAME TABLE documents TO documents_old;
RENAME TABLE reports TO reports_old;
RENAME TABLE notifications TO notifications_old;
RENAME TABLE password_reset_tokens TO password_reset_tokens_old;
RENAME TABLE assignment_submission TO assignment_submission_old;
RENAME TABLE project_messages TO project_messages_old;
RENAME TABLE marks TO marks_old;

-- RENAME THE NEW TABLES TO Original names
RENAME TABLE users_new TO users;
RENAME TABLE students_new TO students;
RENAME TABLE teachers_new TO teachers;
RENAME TABLE documents_new TO documents;
RENAME TABLE reports_new TO reports;
RENAME TABLE notifications_new TO notifications;
RENAME TABLE password_reset_tokens_new TO password_reset_tokens;
RENAME TABLE assignment_submission_new TO assignment_submission;
RENAME TABLE project_messages_new TO project_messages;
RENAME TABLE marks_new TO marks;

-- ============================================================================
-- STEP 9: VERIFY NEW TABLES ARE IN PLACE
-- ============================================================================
-- SHOW TABLES;
-- DESCRIBE users;
-- SELECT COUNT(*) FROM users;

-- ============================================================================
-- STEP 10: AFTER 1-2 WEEKS OF TESTING IN PRODUCTION, DROP OLD TABLES
-- ============================================================================
-- DROP TABLE users_old;
-- DROP TABLE students_old;
-- DROP TABLE teachers_old;
-- DROP TABLE documents_old;
-- DROP TABLE reports_old;
-- DROP TABLE notifications_old;
-- DROP TABLE password_reset_tokens_old;
-- DROP TABLE assignment_submission_old;
-- DROP TABLE project_messages_old;
-- DROP TABLE marks_old;

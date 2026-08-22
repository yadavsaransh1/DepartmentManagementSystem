SET FOREIGN_KEY_CHECKS=0;

-- Clear existing data
DELETE FROM scheduled_workflow;
DELETE FROM email_notification;
DELETE FROM email_template;
DELETE FROM teacher_performance;
DELETE FROM student_performance;
DELETE FROM marks;
DELETE FROM assignment_submission;
DELETE FROM assignment;
DELETE FROM subjects;
DELETE FROM students;
DELETE FROM teachers;

SET FOREIGN_KEY_CHECKS=1;

-- ===========================
-- 1. Insert Teachers (using valid user IDs 2, 3, 4)
-- ===========================
INSERT INTO teachers (user_id, teacher_id, department, subject, qualification) VALUES
(2, 'T001', 'Computer Science', 'Database Systems', 'M.Tech'),
(3, 'T002', 'Computer Science', 'Web Development', 'B.Tech'),
(4, 'T003', 'Information Technology', 'Data Structures', 'M.Tech');

-- Get the auto-generated teacher IDs (1, 2, 3)
-- ===========================
-- 2. Insert Subjects
-- ===========================
INSERT INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course) VALUES
(101, 'Database Systems', 1, 3, 4, 'B.Tech CSE'),
(102, 'Web Development', 2, 4, 3, 'B.Tech CSE'),
(103, 'Data Structures', 3, 2, 4, 'B.Tech IT'),
(104, 'Algorithms', 1, 3, 3, 'B.Tech CSE'),
(105, 'Software Engineering', 2, 4, 4, 'B.Tech IT');

-- ===========================
-- 3. Insert Students (using valid user IDs 17, 18, 19, 20, 21)
-- ===========================
INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester) VALUES
(17, 'S001', 'CSE2021001', 'Computer Science', 'B.Tech CSE', 3),
(18, 'S002', 'CSE2021002', 'Computer Science', 'B.Tech CSE', 3),
(19, 'S003', 'CSE2021003', 'Computer Science', 'B.Tech CSE', 4),
(20, 'S004', 'IT2021001', 'Information Technology', 'B.Tech IT', 2),
(21, 'S005', 'IT2021002', 'Information Technology', 'B.Tech IT', 2);

-- ===========================
-- 4. Insert Assignments
-- ===========================
INSERT INTO assignment (subject_id, teacher_id, title, description, due_date, max_score) VALUES
(1, 1, 'Normalization Exercise', 'Normalize a sample database schema to 3NF', '2024-02-15 23:59:59', 100),
(1, 1, 'SQL Queries', 'Write 10 SQL queries involving joins and aggregations', '2024-03-01 23:59:59', 100),
(2, 2, 'HTML/CSS Project', 'Create a responsive website with 5 pages', '2024-03-10 23:59:59', 100),
(3, 3, 'Tree Implementations', 'Implement BST and AVL tree with operations', '2024-01-20 23:59:59', 100);

-- ===========================
-- 5. Insert Assignment Submissions
-- ===========================
INSERT INTO assignment_submission (assignment_id, student_id, user_id, submission_text, status, submitted_at) VALUES
(1, 1, 17, 'Database schema normalized to 3NF with proper documentation', 'GRADED', '2024-02-14 22:30:00'),
(2, 1, 17, 'SQL queries with proper indexing and execution plans', 'SUBMITTED', '2024-02-28 20:15:00'),
(3, 3, 19, 'Responsive website with Bootstrap framework and custom CSS', 'GRADED', '2024-03-09 19:45:00'),
(4, 4, 20, 'BST and AVL implementations with insertion, deletion, and search', 'SUBMITTED', '2024-01-19 18:20:00');

-- ===========================
-- 6. Insert Marks
-- ===========================
INSERT INTO marks (student_id, subject_id, teacher_id, marks, total_marks, percentage, exam_type, comments) VALUES
(1, 1, 1, 85, 100, 85.00, 'ASSIGNMENT', 'Excellent normalization understanding'),
(1, 2, 2, 78, 100, 78.00, 'ASSIGNMENT', 'Good coverage, needs more complex joins'),
(2, 1, 1, 92, 100, 92.00, 'MIDTERM', 'Outstanding performance'),
(3, 2, 2, 88, 100, 88.00, 'ASSIGNMENT', 'Clean code structure'),
(4, 3, 3, 75, 100, 75.00, 'ASSIGNMENT', 'Correct implementation, improve documentation'),
(1, 4, 1, 90, 100, 90.00, 'MIDTERM', 'Excellent complexity analysis'),
(3, 5, 2, 82, 100, 82.00, 'ASSIGNMENT', 'Good pattern understanding'),
(5, 3, 3, 88, 100, 88.00, 'QUIZ', 'Strong fundamentals demonstrated');

-- ===========================
-- 7. Insert Student Performance
-- ===========================
INSERT INTO student_performance (student_id, user_id, assignments_completed, assignments_pending, attendance_percentage, average_score, overall_gpa, total_assignments, total_marks, performance_level, last_updated) VALUES
(1, 17, 4, 2, 92.50, 86.25, 8.50, 6, 523.00, 'EXCELLENT', NOW()),
(2, 18, 3, 3, 88.00, 84.00, 8.20, 6, 504.00, 'EXCELLENT', NOW()),
(3, 19, 3, 3, 85.50, 85.00, 8.40, 6, 510.00, 'EXCELLENT', NOW()),
(4, 20, 2, 4, 82.00, 80.50, 7.80, 6, 483.00, 'GOOD', NOW()),
(5, 21, 2, 4, 79.50, 78.50, 7.50, 6, 471.00, 'GOOD', NOW());

-- ===========================
-- 8. Insert Teacher Performance
-- ===========================
INSERT INTO teacher_performance (teacher_id, user_id, total_classes, total_assignments_given, total_submissions_graded, avg_grading_time, performance_rating, students_engaged, total_attendance_marked, last_evaluation_date, created_at, updated_at) VALUES
(1, 2, 24, 4, 3, 240, 4.5, 3, 120, NOW(), NOW(), NOW()),
(2, 3, 22, 2, 2, 180, 4.3, 2, 110, NOW(), NOW(), NOW()),
(3, 4, 20, 2, 1, 200, 4.4, 2, 100, NOW(), NOW(), NOW());

-- ===========================
-- 9. Insert Email Templates
-- ===========================
INSERT INTO email_template (template_name, subject, body, template_type, is_active) VALUES
('ASSIGNMENT_REMINDER', 'Assignment Due Reminder', 'Dear Student, Your assignment is due soon. Please submit before the deadline.', 'REMINDER', 1),
('GRADE_NOTIFICATION', 'Your Grades Have Been Posted', 'Dear Student, Your grades have been posted. Please check the portal for details.', 'NOTIFICATION', 1),
('ATTENDANCE_ALERT', 'Low Attendance Alert', 'Dear Student, Your attendance is below 75%. Please improve attendance.', 'ALERT', 1);

-- ===========================
-- 10. Insert Email Notifications
-- ===========================
INSERT INTO email_notification (recipient_email, recipient_id, recipient_type, subject, body, template_id, status, sent_at, created_at) VALUES
('student1@university.edu', 17, 'STUDENT', 'Assignment Due Reminder', 'Dear Student, Your assignment Database Systems is due on 2024-02-15. Please submit before the deadline.', 1, 'SENT', NOW(), NOW()),
('student3@university.edu', 19, 'STUDENT', 'Your Grades Have Been Posted', 'Dear Student, Your grades for Web Development have been posted. Your score: 88/100. Visit portal for details.', 2, 'SENT', NOW(), NOW()),
('student4@university.edu', 20, 'STUDENT', 'Low Attendance Alert', 'Dear Student, Your attendance is below 75%. Current: 82%. Please improve attendance.', 3, 'PENDING', NULL, NOW());

-- ===========================
-- 11. Insert Scheduled Workflows
-- ===========================
INSERT INTO scheduled_workflow (workflow_name, workflow_type, cron_expression, description, is_active, execution_status, created_at, updated_at) VALUES
('Daily Grade Update', 'GRADE_UPDATE', '0 0 * * *', 'Updates student grades daily at midnight', 1, 'COMPLETED', NOW(), NOW()),
('Weekly Attendance Summary', 'ATTENDANCE_REPORT', '0 9 * * 1', 'Generates attendance report every Monday at 9 AM', 1, 'COMPLETED', NOW(), NOW()),
('Fee Reminder', 'FEE_REMINDER', '0 8 1 * *', 'Sends fee reminder on 1st of every month', 1, 'PENDING', NOW(), NOW()),
('Performance Alert', 'PERFORMANCE_ALERT', '0 14 * * *', 'Alerts students with low performance at 2 PM daily', 1, 'COMPLETED', NOW(), NOW()),
('Auto Enrollment', 'AUTO_ENROLL', '0 0 1 */3 *', 'Auto enrolls students in courses quarterly', 1, 'PENDING', NOW(), NOW());

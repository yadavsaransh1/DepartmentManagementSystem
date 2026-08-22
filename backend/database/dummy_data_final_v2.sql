-- ===========================
-- FINAL WORKING Dummy Data
-- ===========================
-- This script clears all tables and inserts fresh data
-- using dynamically generated IDs

SET FOREIGN_KEY_CHECKS=0;

-- Clear existing data
TRUNCATE TABLE scheduled_workflow;
TRUNCATE TABLE email_notification;
TRUNCATE TABLE email_template;
TRUNCATE TABLE teacher_performance;
TRUNCATE TABLE student_performance;
TRUNCATE TABLE marks;
TRUNCATE TABLE assignment_submission;
TRUNCATE TABLE assignment;
TRUNCATE TABLE subjects;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;

SET FOREIGN_KEY_CHECKS=1;

-- ===========================
-- 1. Insert Teachers
-- ===========================
INSERT INTO teachers (user_id, teacher_id, department, subject, qualification, created_at, updated_at) 
VALUES
(2, 'T001', 'Computer Science', 'Database Systems', 'M.Tech', NOW(), NOW()),
(3, 'T002', 'Computer Science', 'Web Development', 'B.Tech', NOW(), NOW()),
(4, 'T003', 'Information Technology', 'Data Structures', 'M.Tech', NOW(), NOW());

-- Save teacher IDs for use in subjects
SET @teacher1_id = LAST_INSERT_ID();
SET @teacher2_id = @teacher1_id + 1;
SET @teacher3_id = @teacher1_id + 2;

-- ===========================
-- 2. Insert Subjects
-- ===========================
INSERT INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course, created_at) 
VALUES
(101, 'Database Systems', @teacher1_id, 3, 4, 'B.Tech CSE', NOW()),
(102, 'Web Development', @teacher2_id, 4, 3, 'B.Tech CSE', NOW()),
(103, 'Data Structures', @teacher3_id, 2, 4, 'B.Tech IT', NOW()),
(104, 'Algorithms', @teacher1_id, 3, 3, 'B.Tech CSE', NOW()),
(105, 'Software Engineering', @teacher2_id, 4, 4, 'B.Tech IT', NOW());

-- Save subject IDs
SET @subject1_id = LAST_INSERT_ID();
SET @subject2_id = @subject1_id + 1;
SET @subject3_id = @subject1_id + 2;
SET @subject4_id = @subject1_id + 3;
SET @subject5_id = @subject1_id + 4;

-- ===========================
-- 3. Insert Students
-- ===========================
INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage, created_at, updated_at) 
VALUES
(17, 'S001', 'CSE2021001', 'Computer Science', 'B.Tech CSE', 3, 92.50, NOW(), NOW()),
(18, 'S002', 'CSE2021002', 'Computer Science', 'B.Tech CSE', 3, 88.00, NOW(), NOW()),
(19, 'S003', 'CSE2021003', 'Computer Science', 'B.Tech CSE', 4, 85.50, NOW(), NOW()),
(20, 'S004', 'IT2021001', 'Information Technology', 'B.Tech IT', 2, 82.00, NOW(), NOW()),
(21, 'S005', 'IT2021002', 'Information Technology', 'B.Tech IT', 2, 79.50, NOW(), NOW());

-- Save student IDs
SET @student1_id = LAST_INSERT_ID();
SET @student2_id = @student1_id + 1;
SET @student3_id = @student1_id + 2;
SET @student4_id = @student1_id + 3;
SET @student5_id = @student1_id + 4;

-- ===========================
-- 4. Insert Assignments
-- ===========================
INSERT INTO assignment (subject_id, teacher_id, title, description, due_date, max_score) 
VALUES
(@subject1_id, @teacher1_id, 'Normalization Exercise', 'Normalize a sample database schema to 3NF', '2024-02-15 23:59:59', 100),
(@subject1_id, @teacher1_id, 'SQL Queries', 'Write 10 SQL queries involving joins and aggregations', '2024-03-01 23:59:59', 100),
(@subject2_id, @teacher2_id, 'HTML/CSS Project', 'Create a responsive website with 5 pages', '2024-03-10 23:59:59', 100),
(@subject3_id, @teacher3_id, 'Tree Implementations', 'Implement BST and AVL tree with operations', '2024-01-20 23:59:59', 100);

-- Save assignment IDs
SET @assign1_id = LAST_INSERT_ID();
SET @assign2_id = @assign1_id + 1;
SET @assign3_id = @assign1_id + 2;
SET @assign4_id = @assign1_id + 3;

-- ===========================
-- 5. Insert Assignment Submissions
-- ===========================
INSERT INTO assignment_submission (assignment_id, student_id, user_id, submission_text, status, submitted_at, score) 
VALUES
(@assign1_id, @student1_id, 17, 'Database schema normalized to 3NF with proper documentation', 'GRADED', '2024-02-14 22:30:00', 85),
(@assign2_id, @student1_id, 17, 'SQL queries with proper indexing and execution plans', 'SUBMITTED', '2024-02-28 20:15:00', NULL),
(@assign3_id, @student3_id, 19, 'Responsive website with Bootstrap framework and custom CSS', 'GRADED', '2024-03-09 19:45:00', 88),
(@assign4_id, @student4_id, 20, 'BST and AVL implementations with insertion, deletion, and search', 'SUBMITTED', '2024-01-19 18:20:00', NULL);

-- ===========================
-- 6. Insert Marks
-- ===========================
INSERT INTO marks (student_id, subject_id, teacher_id, user_id, marks, total_marks, percentage, exam_type, comments) 
VALUES
(@student1_id, @subject1_id, @teacher1_id, 2, 85, 100, 85.00, 'ASSIGNMENT', 'Excellent normalization understanding'),
(@student1_id, @subject2_id, @teacher2_id, 3, 78, 100, 78.00, 'ASSIGNMENT', 'Good coverage, needs more complex joins'),
(@student2_id, @subject1_id, @teacher1_id, 2, 92, 100, 92.00, 'MIDTERM', 'Outstanding performance'),
(@student3_id, @subject2_id, @teacher2_id, 3, 88, 100, 88.00, 'ASSIGNMENT', 'Clean code structure'),
(@student4_id, @subject3_id, @teacher3_id, 4, 75, 100, 75.00, 'ASSIGNMENT', 'Correct implementation, improve documentation'),
(@student1_id, @subject4_id, @teacher1_id, 2, 90, 100, 90.00, 'MIDTERM', 'Excellent complexity analysis');

-- ===========================
-- 7. Insert Student Performance
-- ===========================
INSERT INTO student_performance (student_id, user_id, assignments_completed, assignments_pending, attendance_percentage, average_score, overall_gpa, total_assignments, total_marks, performance_level, last_updated) 
VALUES
(@student1_id, 17, 4, 2, 92.50, 86.25, 8.50, 6, 523.00, 'EXCELLENT', NOW()),
(@student2_id, 18, 3, 3, 88.00, 84.00, 8.20, 6, 504.00, 'EXCELLENT', NOW()),
(@student3_id, 19, 3, 3, 85.50, 85.00, 8.40, 6, 510.00, 'EXCELLENT', NOW()),
(@student4_id, 20, 2, 4, 82.00, 80.50, 7.80, 6, 483.00, 'GOOD', NOW()),
(@student5_id, 21, 2, 4, 79.50, 78.50, 7.50, 6, 471.00, 'GOOD', NOW());

-- ===========================
-- 8. Insert Teacher Performance
-- ===========================
INSERT INTO teacher_performance (teacher_id, user_id, total_classes, total_assignments_given, total_submissions_graded, avg_grading_time, performance_rating, students_engaged, total_attendance_marked, last_evaluation_date, created_at, updated_at) 
VALUES
(@teacher1_id, 2, 24, 4, 3, 240, 4.5, 3, 120, NOW(), NOW(), NOW()),
(@teacher2_id, 3, 22, 2, 2, 180, 4.3, 2, 110, NOW(), NOW(), NOW()),
(@teacher3_id, 4, 20, 2, 1, 200, 4.4, 2, 100, NOW(), NOW(), NOW());

-- ===========================
-- 9. Insert Email Templates
-- ===========================
INSERT INTO email_template (template_name, subject, body, template_type, is_active) 
VALUES
('ASSIGNMENT_REMINDER', 'Assignment Due Reminder', 'Dear Student, Your assignment is due soon. Please submit before the deadline.', 'ASSIGNMENT_REMINDER', 1),
('GRADE_NOTIFICATION', 'Your Grades Have Been Posted', 'Dear Student, Your grades have been posted. Please check the portal for details.', 'GENERAL', 1),
('ATTENDANCE_ALERT', 'Low Attendance Alert', 'Dear Student, Your attendance is below 75%. Please improve attendance.', 'ATTENDANCE_ALERT', 1);

-- Save template IDs
SET @template1_id = LAST_INSERT_ID();
SET @template2_id = @template1_id + 1;
SET @template3_id = @template1_id + 2;

-- ===========================
-- 10. Insert Email Notifications
-- ===========================
INSERT INTO email_notification (recipient_email, recipient_id, recipient_type, subject, body, template_id, status) 
VALUES
('student1@university.edu', 17, 'STUDENT', 'Assignment Due Reminder', 'Dear Student, Your assignment Database Systems is due on 2024-02-15. Please submit before the deadline.', @template1_id, 'SENT'),
('student3@university.edu', 19, 'STUDENT', 'Your Grades Have Been Posted', 'Dear Student, Your grades for Web Development have been posted. Your score: 88/100. Visit portal for details.', @template2_id, 'SENT'),
('student4@university.edu', 20, 'STUDENT', 'Low Attendance Alert', 'Dear Student, Your attendance is below 75%. Current: 82%. Please improve attendance.', @template3_id, 'PENDING');

-- ===========================
-- 11. Insert Scheduled Workflows
-- ===========================
INSERT INTO scheduled_workflow (workflow_name, workflow_type, cron_expression, description, is_active, execution_status, created_at, updated_at) 
VALUES
('Daily Grade Update', 'GRADE_UPDATE', '0 0 * * *', 'Updates student grades daily at midnight', 1, 'COMPLETED', NOW(), NOW()),
('Weekly Attendance Summary', 'ATTENDANCE_REPORT', '0 9 * * 1', 'Generates attendance report every Monday at 9 AM', 1, 'COMPLETED', NOW(), NOW()),
('Fee Reminder', 'FEE_REMINDER', '0 8 1 * *', 'Sends fee reminder on 1st of every month', 1, 'PENDING', NOW(), NOW()),
('Performance Alert', 'PERFORMANCE_ALERT', '0 14 * * *', 'Alerts students with low performance at 2 PM daily', 1, 'COMPLETED', NOW(), NOW());

-- ===========================
-- VERIFICATION - Show counts
-- ===========================
SELECT CONCAT('✓ Teachers: ', COUNT(*)) FROM teachers
UNION ALL
SELECT CONCAT('✓ Subjects: ', COUNT(*)) FROM subjects
UNION ALL
SELECT CONCAT('✓ Students: ', COUNT(*)) FROM students
UNION ALL
SELECT CONCAT('✓ Assignments: ', COUNT(*)) FROM assignment
UNION ALL
SELECT CONCAT('✓ Submissions: ', COUNT(*)) FROM assignment_submission
UNION ALL
SELECT CONCAT('✓ Marks: ', COUNT(*)) FROM marks
UNION ALL
SELECT CONCAT('✓ Student Performance: ', COUNT(*)) FROM student_performance
UNION ALL
SELECT CONCAT('✓ Teacher Performance: ', COUNT(*)) FROM teacher_performance
UNION ALL
SELECT CONCAT('✓ Email Templates: ', COUNT(*)) FROM email_template
UNION ALL
SELECT CONCAT('✓ Email Notifications: ', COUNT(*)) FROM email_notification
UNION ALL
SELECT CONCAT('✓ Scheduled Workflows: ', COUNT(*)) FROM scheduled_workflow;

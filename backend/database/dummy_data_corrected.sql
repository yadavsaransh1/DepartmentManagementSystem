-- ===========================
-- Corrected Dummy Data Script
-- ===========================

-- Clear existing data (optional - comment out if you want to preserve existing data)
DELETE FROM teacher_performance;
DELETE FROM student_performance;
DELETE FROM marks;
DELETE FROM assignment_submission;
DELETE FROM assignment;
DELETE FROM subjects;
DELETE FROM students;
DELETE FROM teachers;

-- ===========================
-- 1. Insert Teachers
-- ===========================
INSERT INTO teachers (user_id, teacher_id, department, subject, qualification) VALUES
(2, 'T001', 'Computer Science', 'Database Systems', 'M.Tech'),
(3, 'T002', 'Computer Science', 'Web Development', 'B.Tech'),
(4, 'T003', 'Information Technology', 'Data Structures', 'M.Tech');

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
-- 3. Insert Students
-- ===========================
INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester) VALUES
(5, 'S001', 'CSE2021001', 'Computer Science', 'B.Tech CSE', 3),
(6, 'S002', 'CSE2021002', 'Computer Science', 'B.Tech CSE', 3),
(7, 'S003', 'CSE2021003', 'Computer Science', 'B.Tech CSE', 4),
(8, 'S004', 'IT2021001', 'Information Technology', 'B.Tech IT', 2),
(9, 'S005', 'IT2021002', 'Information Technology', 'B.Tech IT', 2);

-- ===========================
-- 4. Insert Assignments
-- ===========================
INSERT INTO assignment (subject_id, teacher_id, title, description, due_date, max_score) VALUES
(1, 1, 'Normalization Exercise', 'Normalize a sample database schema to 3NF', '2024-02-15 23:59:59', 100),
(1, 1, 'SQL Queries', 'Write 10 SQL queries involving joins and aggregations', '2024-03-01 23:59:59', 100),
(2, 2, 'HTML/CSS Project', 'Create a responsive website with 5 pages', '2024-03-10 23:59:59', 100),
(3, 3, 'Tree Implementations', 'Implement BST and AVL tree with operations', '2024-01-20 23:59:59', 100),
(4, 1, 'Algorithm Analysis', 'Analyze time complexity of sorting algorithms', '2024-02-28 23:59:59', 100),
(5, 2, 'Design Patterns', 'Document 3 design patterns with code examples', '2024-03-20 23:59:59', 100);

-- ===========================
-- 5. Insert Assignment Submissions
-- ===========================
INSERT INTO assignment_submission (assignment_id, student_id, user_id, submission_text, status, submitted_at) VALUES
(1, 1, 5, 'Database schema normalized to 3NF with proper documentation', 'GRADED', '2024-02-14 22:30:00'),
(2, 1, 5, 'SQL queries with proper indexing and execution plans', 'SUBMITTED', '2024-02-28 20:15:00'),
(3, 3, 7, 'Responsive website with Bootstrap framework and custom CSS', 'GRADED', '2024-03-09 19:45:00'),
(4, 4, 8, 'BST and AVL implementations with insertion, deletion, and search', 'SUBMITTED', '2024-01-19 18:20:00'),
(5, 1, 5, 'Complexity analysis comparing O(n log n) and O(n²) algorithms', 'GRADED', '2024-02-27 21:00:00'),
(6, 3, 7, 'Singleton, Factory, and Observer patterns with examples', 'SUBMITTED', '2024-03-19 17:30:00');

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
(1, 5, 4, 2, 92.50, 86.25, 8.50, 6, 523.00, 'EXCELLENT', NOW()),
(2, 6, 3, 3, 88.00, 84.00, 8.20, 6, 504.00, 'EXCELLENT', NOW()),
(3, 7, 3, 3, 85.50, 85.00, 8.40, 6, 510.00, 'EXCELLENT', NOW()),
(4, 8, 2, 4, 82.00, 80.50, 7.80, 6, 483.00, 'GOOD', NOW()),
(5, 9, 2, 4, 79.50, 78.50, 7.50, 6, 471.00, 'GOOD', NOW());

-- ===========================
-- 8. Insert Teacher Performance
-- ===========================
INSERT INTO teacher_performance (teacher_id, user_id, total_classes, total_assignments_given, total_submissions_graded, avg_grading_time, performance_rating, students_engaged, total_attendance_marked, last_evaluation_date, created_at, updated_at) VALUES
(1, 2, 24, 4, 3, 240, 4.5, 3, 120, NOW(), NOW(), NOW()),
(2, 3, 22, 2, 2, 180, 4.3, 2, 110, NOW(), NOW(), NOW()),
(3, 4, 20, 2, 1, 200, 4.4, 2, 100, NOW(), NOW(), NOW());

-- ===========================
-- Verification Queries
-- ===========================
SELECT COUNT(*) as teachers_count FROM teachers;
SELECT COUNT(*) as subjects_count FROM subjects;
SELECT COUNT(*) as students_count FROM students;
SELECT COUNT(*) as assignments_count FROM assignment;
SELECT COUNT(*) as submissions_count FROM assignment_submission;
SELECT COUNT(*) as marks_count FROM marks;
SELECT COUNT(*) as student_perf_count FROM student_performance;
SELECT COUNT(*) as teacher_perf_count FROM teacher_performance;
SELECT COUNT(*) as templates_count FROM email_template;
SELECT COUNT(*) as notifications_count FROM email_notification;
SELECT COUNT(*) as workflows_count FROM scheduled_workflow;

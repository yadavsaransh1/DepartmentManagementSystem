-- ============================================================================
-- DUMMY DATA FOR FEATURE TESTING - Department Management System
-- ============================================================================
-- This script adds sample data for:
-- 1. Teachers with subjects
-- 2. Students enrolled in courses/semesters
-- 3. Assignments with subject and teacher associations
-- 4. Assignment submissions
-- 5. Marks with student/subject/teacher relationships
-- 6. Email templates and notifications
-- ============================================================================

USE university_db;

-- ============================================================================
-- STEP 1: CREATE SAMPLE TEACHERS (if not already present)
-- ============================================================================
-- Note: User accounts must already exist. Using existing user IDs.

-- Assuming users already exist. Let's use IDs 2, 3, 4 for teachers
-- Verify and update if needed based on your user table data:
-- SELECT id, full_name, email, role FROM users WHERE role = 'TEACHER';

-- Create sample teachers (if not exist)
INSERT IGNORE INTO teachers (user_id, teacher_id, department, subject, qualification)
VALUES 
  (2, 'TCHID001', 'Computer Science', 'Data Structures', 'M.Tech'),
  (3, 'TCHID002', 'Computer Science', 'Web Development', 'M.Tech'),
  (4, 'TCHID003', 'Computer Science', 'Database Systems', 'M.Tech');

-- ============================================================================
-- STEP 2: CREATE SAMPLE SUBJECTS (linked to teachers)
-- ============================================================================
INSERT IGNORE INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course)
VALUES 
  ('CS101', 'Data Structures', (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 2, 4, 'B.Tech CS'),
  ('CS102', 'Web Development', (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 3, 3, 'B.Tech CS'),
  ('CS103', 'Database Systems', (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 3, 4, 'B.Tech CS'),
  ('CS104', 'Operating Systems', (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 4, 4, 'B.Tech CS'),
  ('CS105', 'Software Engineering', (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 4, 3, 'B.Tech CS');

-- ============================================================================
-- STEP 3: CREATE SAMPLE STUDENTS (if not already present)
-- ============================================================================
-- These will have course='B.Tech CS' and semester in range 2-4
INSERT IGNORE INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage, created_at, updated_at)
VALUES 
  (5, 'STU001', 'ENR001', 'Computer Science', 'B.Tech CS', 2, 85.5, NOW(), NOW()),
  (6, 'STU002', 'ENR002', 'Computer Science', 'B.Tech CS', 2, 78.0, NOW(), NOW()),
  (7, 'STU003', 'ENR003', 'Computer Science', 'B.Tech CS', 3, 92.0, NOW(), NOW()),
  (8, 'STU004', 'ENR004', 'Computer Science', 'B.Tech CS', 3, 88.5, NOW(), NOW()),
  (9, 'STU005', 'ENR005', 'Computer Science', 'B.Tech CS', 4, 95.0, NOW(), NOW());

-- ============================================================================
-- STEP 4: CREATE SAMPLE ASSIGNMENTS (with subject and teacher)
-- ============================================================================
INSERT IGNORE INTO assignment (subject_id, teacher_id, title, description, due_date, max_score, created_at, updated_at)
VALUES 
  -- Data Structures assignments (CS101)
  ((SELECT id FROM subjects WHERE subject_code = 'CS101'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'),
   'Array Implementation', 'Implement basic array operations including insert, delete, and search. Handle edge cases properly.', 
   DATE_ADD(NOW(), INTERVAL 7 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS101'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'),
   'Linked List Operations', 'Create a complete linked list implementation with insertion, deletion, and traversal methods.',
   DATE_ADD(NOW(), INTERVAL 14 DAY), 100, NOW(), NOW()),
  
  -- Web Development assignments (CS102)
  ((SELECT id FROM subjects WHERE subject_code = 'CS102'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'),
   'Responsive Website Design', 'Build a fully responsive website using HTML, CSS, and Bootstrap. Must work on mobile and desktop.',
   DATE_ADD(NOW(), INTERVAL 10 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS102'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'),
   'JavaScript Form Validation', 'Create a form with comprehensive validation rules. Handle all input types and show appropriate error messages.',
   DATE_ADD(NOW(), INTERVAL 5 DAY), 50, NOW(), NOW()),
  
  -- Database Systems assignments (CS103)
  ((SELECT id FROM subjects WHERE subject_code = 'CS103'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'),
   'Database Schema Design', 'Design a normalized database schema for a student management system. Create ER diagram.',
   DATE_ADD(NOW(), INTERVAL 8 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS103'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'),
   'SQL Query Optimization', 'Write optimized SQL queries with proper indexing for a retail database. Document execution plans.',
   DATE_ADD(NOW(), INTERVAL 12 DAY), 100, NOW(), NOW());

-- ============================================================================
-- STEP 5: CREATE SAMPLE ASSIGNMENT SUBMISSIONS
-- ============================================================================
-- Students from semester 2 submit to CS101 assignments
INSERT IGNORE INTO assignment_submission 
(assignment_id, student_id, user_id, submission_text, status, submitted_at, created_at, updated_at) 
VALUES 
  -- STU001 submissions
  ((SELECT id FROM assignment WHERE title = 'Array Implementation'), (SELECT id FROM students WHERE student_id = 'STU001'), 
   (SELECT id FROM users WHERE email LIKE '%STU001%'), 'Implemented all array operations with error handling and unit tests.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'Linked List Operations'), (SELECT id FROM students WHERE student_id = 'STU001'),
   (SELECT id FROM users WHERE email LIKE '%STU001%'), 'Created doubly-linked list with comprehensive methods. Added memory management.', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW()),
  
  -- STU002 submissions
  ((SELECT id FROM assignment WHERE title = 'Array Implementation'), (SELECT id FROM students WHERE student_id = 'STU002'),
   (SELECT id FROM users WHERE email LIKE '%STU002%'), 'Basic array implementation completed. Could improve edge case handling.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'Linked List Operations'), (SELECT id FROM students WHERE student_id = 'STU002'),
   (SELECT id FROM users WHERE email LIKE '%STU002%'), 'Work in progress. Need to complete delete operations.', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
  
  -- STU003, STU004 submissions for CS102 (Web Development)
  ((SELECT id FROM assignment WHERE title = 'Responsive Website Design'), (SELECT id FROM students WHERE student_id = 'STU003'),
   (SELECT id FROM users WHERE email LIKE '%STU003%'), 'Created beautiful responsive website using Flexbox and media queries.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'JavaScript Form Validation'), (SELECT id FROM students WHERE student_id = 'STU003'),
   (SELECT id FROM users WHERE email LIKE '%STU003%'), 'Implemented comprehensive form validation with regex patterns.', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()),
  
  ((SELECT id FROM assignment WHERE title = 'Responsive Website Design'), (SELECT id FROM students WHERE student_id = 'STU004'),
   (SELECT id FROM users WHERE email LIKE '%STU004%'), 'Good responsive design. Some CSS optimization needed.', 'GRADED', NOW(), NOW(), NOW()),
  
  -- STU005 submissions for CS103 (Database Systems)
  ((SELECT id FROM assignment WHERE title = 'Database Schema Design'), (SELECT id FROM students WHERE student_id = 'STU005'),
   (SELECT id FROM users WHERE email LIKE '%STU005%'), 'Well-normalized schema with proper relationships defined.', 'GRADED', NOW(), NOW(), NOW());

-- ============================================================================
-- STEP 6: ADD FEEDBACK TO GRADED SUBMISSIONS
-- ============================================================================
UPDATE assignment_submission 
SET score = 90, feedback = 'Excellent implementation! Code is clean and handles edge cases well.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Array Implementation') 
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU001');

UPDATE assignment_submission
SET score = 85, feedback = 'Good work. Consider adding more comments to complex operations.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Array Implementation')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU002');

UPDATE assignment_submission
SET score = 95, feedback = 'Outstanding website! Perfectly responsive and great UI design.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Responsive Website Design')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU003');

UPDATE assignment_submission
SET score = 88, feedback = 'Good design but needs minor CSS refinements for better performance.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Responsive Website Design')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU004');

UPDATE assignment_submission
SET score = 92, feedback = 'Excellent database design with proper normalization!'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Database Schema Design')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU005');

-- ============================================================================
-- STEP 7: CREATE SAMPLE MARKS
-- ============================================================================
INSERT IGNORE INTO marks 
(student_id, subject_id, teacher_id, marks, total_marks, percentage, exam_type, comments, created_at, updated_at)
VALUES 
  -- STU001 marks (Semester 2 student, taking CS101)
  ((SELECT id FROM students WHERE student_id = 'STU001'), (SELECT id FROM subjects WHERE subject_code = 'CS101'), 
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 78, 100, 78.0, 'MIDTERM', 'Good understanding of concepts', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU001'), (SELECT id FROM subjects WHERE subject_code = 'CS101'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 82, 100, 82.0, 'FINAL', 'Improved performance', NOW(), NOW()),
  
  -- STU002 marks
  ((SELECT id FROM students WHERE student_id = 'STU002'), (SELECT id FROM subjects WHERE subject_code = 'CS101'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 68, 100, 68.0, 'MIDTERM', 'Needs more practice', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU002'), (SELECT id FROM subjects WHERE subject_code = 'CS101'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 75, 100, 75.0, 'FINAL', 'Acceptable performance', NOW(), NOW()),
  
  -- STU003 marks (Semester 3 student, taking CS102, CS103)
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 92, 100, 92.0, 'MIDTERM', 'Excellent performance', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 95, 100, 95.0, 'FINAL', 'Outstanding work', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS103'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 88, 100, 88.0, 'MIDTERM', 'Very good understanding', NOW(), NOW()),
  
  -- STU004 marks
  ((SELECT id FROM students WHERE student_id = 'STU004'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 85, 100, 85.0, 'MIDTERM', 'Good progress', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU004'), (SELECT id FROM subjects WHERE subject_code = 'CS103'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 82, 100, 82.0, 'MIDTERM', 'Solid understanding', NOW(), NOW()),
  
  -- STU005 marks (Semester 4 student)
  ((SELECT id FROM students WHERE student_id = 'STU005'), (SELECT id FROM subjects WHERE subject_code = 'CS103'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 96, 100, 96.0, 'MIDTERM', 'Excellent grasp of concepts', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU005'), (SELECT id FROM subjects WHERE subject_code = 'CS104'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 94, 100, 94.0, 'MIDTERM', 'Outstanding performance', NOW(), NOW());

-- ============================================================================
-- STEP 8: CREATE SAMPLE STUDENT PERFORMANCE RECORDS
-- ============================================================================
INSERT IGNORE INTO student_performance 
(student_id, user_id, overall_gpa, performance_level, strengths, weaknesses, recommendations, last_evaluation_date, created_at, updated_at)
VALUES 
  ((SELECT id FROM students WHERE student_id = 'STU001'), (SELECT id FROM users WHERE email LIKE '%STU001%'),
   3.2, 'GOOD',
   'Strong problem-solving skills, good attendance',
   'Needs improvement in advanced data structures, weak in time complexity analysis',
   'Focus on algorithmic optimization, work with mentors on complex problems',
   NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU002'), (SELECT id FROM students WHERE student_id = 'STU002'),
   2.8, 'SATISFACTORY',
   'Regular in classes, decent lab work',
   'Struggling with theoretical concepts, performance in exams below average',
   'Increase study time, seek tutoring in core concepts, practice more questions',
   NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM users WHERE email LIKE '%STU003%'),
   3.8, 'EXCELLENT',
   'Exceptional academic performance, excellent in both theory and practical, strong leadership',
   'None significant',
   'Consider advanced courses, mentoring other students, consider research opportunities',
   NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU004'), (SELECT id FROM users WHERE email LIKE '%STU004%'),
   3.5, 'GOOD',
   'Consistent performance, good web development skills',
   'Can improve database design skills, needs more practice in SQL optimization',
   'Take additional database courses, focus on query optimization',
   NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU005'), (SELECT id FROM users WHERE email LIKE '%STU005%'),
   3.9, 'EXCELLENT',
   'Outstanding academic record, exceptional technical skills, consistently top performer',
   'None',
   'Pursue advanced specialization, consider graduate programs, mentor junior students',
   NOW(), NOW(), NOW());

-- ============================================================================
-- STEP 9: CREATE SAMPLE TEACHER PERFORMANCE RECORDS
-- ============================================================================
INSERT IGNORE INTO teacher_performance 
(teacher_id, user_id, total_classes, total_attendance_marked, total_assignments_given, total_submissions_graded, avg_grading_time, students_engaged, performance_rating, last_evaluation_date, created_at, updated_at)
VALUES 
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), (SELECT id FROM users WHERE email LIKE '%2%'),
   45, 450, 6, 4, 2, 50, 4.5, NOW(), NOW(), NOW()),
   
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), (SELECT id FROM users WHERE email LIKE '%3%'),
   42, 420, 5, 2, 1.5, 45, 4.7, NOW(), NOW(), NOW()),
   
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), (SELECT id FROM users WHERE email LIKE '%4%'),
   40, 400, 4, 1, 1.8, 40, 4.6, NOW(), NOW(), NOW());

-- ============================================================================
-- VERIFICATION QUERIES - Run these to verify data was inserted
-- ============================================================================
-- SELECT 'Teachers' AS Section, COUNT(*) as Count FROM teacher;
-- SELECT 'Subjects' AS Section, COUNT(*) as Count FROM subject;
-- SELECT 'Students' AS Section, COUNT(*) as Count FROM students;
-- SELECT 'Assignments' AS Section, COUNT(*) as Count FROM assignment;
-- SELECT 'Submissions' AS Section, COUNT(*) as Count FROM assignment_submission;
-- SELECT 'Marks' AS Section, COUNT(*) as Count FROM marks;
-- SELECT 'Email Templates' AS Section, COUNT(*) as Count FROM email_template;
-- SELECT 'Email Notifications' AS Section, COUNT(*) as Count FROM email_notification;
-- SELECT 'Student Performance' AS Section, COUNT(*) as Count FROM student_performance;
-- SELECT 'Teacher Performance' AS Section, COUNT(*) as Count FROM teacher_performance;
-- SELECT 'Workflows' AS Section, COUNT(*) as Count FROM scheduled_workflow;




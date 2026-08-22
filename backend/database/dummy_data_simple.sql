-- ============================================================================
-- SIMPLIFIED DUMMY DATA FOR FEATURE TESTING
-- Department Management System
-- ============================================================================

USE university_db;

-- ============================================================================
-- STEP 1: CREATE SAMPLE TEACHERS (if not already present)
-- ============================================================================
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
  ('CS104', 'Operating Systems', (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 4, 4, 'B.Tech CS');

-- ============================================================================
-- STEP 3: CREATE SAMPLE STUDENTS
-- ============================================================================
INSERT IGNORE INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage, created_at, updated_at)
VALUES 
  (5, 'STU001', 'ENR001', 'Computer Science', 'B.Tech CS', 2, 85.5, NOW(), NOW()),
  (6, 'STU002', 'ENR002', 'Computer Science', 'B.Tech CS', 2, 78.0, NOW(), NOW()),
  (7, 'STU003', 'ENR003', 'Computer Science', 'B.Tech CS', 3, 92.0, NOW(), NOW()),
  (8, 'STU004', 'ENR004', 'Computer Science', 'B.Tech CS', 3, 88.5, NOW(), NOW()),
  (9, 'STU005', 'ENR005', 'Computer Science', 'B.Tech CS', 4, 95.0, NOW(), NOW());

-- ============================================================================
-- STEP 4: CREATE SAMPLE ASSIGNMENTS
-- ============================================================================
INSERT IGNORE INTO assignment (subject_id, teacher_id, title, description, due_date, max_score, created_at, updated_at)
VALUES 
  ((SELECT id FROM subjects WHERE subject_code = 'CS101'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'),
   'Array Implementation', 'Implement basic array operations including insert, delete, and search.', 
   DATE_ADD(NOW(), INTERVAL 7 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS101'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'),
   'Linked List Operations', 'Create a complete linked list implementation with insertion, deletion.',
   DATE_ADD(NOW(), INTERVAL 14 DAY), 100, NOW(), NOW()),
  
  ((SELECT id FROM subjects WHERE subject_code = 'CS102'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'),
   'Responsive Website Design', 'Build a fully responsive website using HTML, CSS, and Bootstrap.',
   DATE_ADD(NOW(), INTERVAL 10 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS102'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'),
   'JavaScript Form Validation', 'Create a form with comprehensive validation rules.',
   DATE_ADD(NOW(), INTERVAL 5 DAY), 50, NOW(), NOW()),
  
  ((SELECT id FROM subjects WHERE subject_code = 'CS103'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'),
   'Database Schema Design', 'Design a normalized database schema for student management.',
   DATE_ADD(NOW(), INTERVAL 8 DAY), 100, NOW(), NOW()),
   
  ((SELECT id FROM subjects WHERE subject_code = 'CS103'), (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'),
   'SQL Query Optimization', 'Write optimized SQL queries with proper indexing.',
   DATE_ADD(NOW(), INTERVAL 12 DAY), 100, NOW(), NOW());

-- ============================================================================
-- STEP 5: CREATE SAMPLE ASSIGNMENT SUBMISSIONS
-- ============================================================================
INSERT IGNORE INTO assignment_submission 
(assignment_id, student_id, user_id, submission_text, status, submitted_at, created_at, updated_at) 
VALUES 
  ((SELECT id FROM assignment WHERE title = 'Array Implementation'), (SELECT id FROM students WHERE student_id = 'STU001'), 
   5, 'Implemented all array operations with error handling and unit tests.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'Linked List Operations'), (SELECT id FROM students WHERE student_id = 'STU001'),
   5, 'Created doubly-linked list with comprehensive methods.', 'SUBMITTED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NOW()),
  
  ((SELECT id FROM assignment WHERE title = 'Array Implementation'), (SELECT id FROM students WHERE student_id = 'STU002'),
   6, 'Basic array implementation completed.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'Responsive Website Design'), (SELECT id FROM students WHERE student_id = 'STU003'),
   7, 'Created beautiful responsive website using Flexbox.', 'GRADED', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM assignment WHERE title = 'Database Schema Design'), (SELECT id FROM students WHERE student_id = 'STU005'),
   9, 'Well-normalized schema with proper relationships.', 'GRADED', NOW(), NOW(), NOW());

-- ============================================================================
-- STEP 6: ADD FEEDBACK TO GRADED SUBMISSIONS
-- ============================================================================
UPDATE assignment_submission 
SET score = 90, feedback = 'Excellent implementation! Code is clean.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Array Implementation') 
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU001');

UPDATE assignment_submission
SET score = 85, feedback = 'Good work. Add more comments.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Array Implementation')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU002');

UPDATE assignment_submission
SET score = 95, feedback = 'Outstanding website! Great design.'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Responsive Website Design')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU003');

UPDATE assignment_submission
SET score = 92, feedback = 'Excellent database design!'
WHERE assignment_id = (SELECT id FROM assignment WHERE title = 'Database Schema Design')
  AND student_id = (SELECT id FROM students WHERE student_id = 'STU005');

-- ============================================================================
-- STEP 7: CREATE SAMPLE MARKS
-- ============================================================================
INSERT IGNORE INTO marks 
(student_id, subject_id, teacher_id, marks, total_marks, percentage, exam_type, comments, created_at, updated_at)
VALUES 
  ((SELECT id FROM students WHERE student_id = 'STU001'), (SELECT id FROM subjects WHERE subject_code = 'CS101'), 
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 78, 100, 78.0, 'MIDTERM', 'Good understanding of concepts', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU001'), (SELECT id FROM subjects WHERE subject_code = 'CS101'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 82, 100, 82.0, 'FINAL', 'Improved performance', NOW(), NOW()),
  
  ((SELECT id FROM students WHERE student_id = 'STU002'), (SELECT id FROM subjects WHERE subject_code = 'CS101'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 68, 100, 68.0, 'MIDTERM', 'Needs more practice', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 92, 100, 92.0, 'MIDTERM', 'Excellent performance', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 95, 100, 95.0, 'FINAL', 'Outstanding work', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), (SELECT id FROM subjects WHERE subject_code = 'CS103'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 88, 100, 88.0, 'MIDTERM', 'Very good understanding', NOW(), NOW()),
  
  ((SELECT id FROM students WHERE student_id = 'STU004'), (SELECT id FROM subjects WHERE subject_code = 'CS102'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 85, 100, 85.0, 'MIDTERM', 'Good progress', NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU005'), (SELECT id FROM subjects WHERE subject_code = 'CS103'),
   (SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 96, 100, 96.0, 'MIDTERM', 'Excellent grasp of concepts', NOW(), NOW());

-- ============================================================================
-- STEP 8: CREATE EMAIL TEMPLATES (SKIP - schema too different)
-- ============================================================================
-- Email templates are optional for testing

-- ============================================================================
-- STEP 9: CREATE SAMPLE EMAIL NOTIFICATIONS (SKIP)

-- ============================================================================
-- STEP 9: CREATE SAMPLE STUDENT PERFORMANCE RECORDS
-- ============================================================================
INSERT IGNORE INTO student_performance 
(student_id, user_id, overall_gpa, performance_level, strengths, weaknesses, recommendations, last_evaluation_date, created_at, updated_at)
VALUES 
  ((SELECT id FROM students WHERE student_id = 'STU001'), 5, 3.2, 'GOOD',
   'Strong problem-solving skills', 'Weak in time complexity analysis',
   'Focus on algorithmic optimization', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU003'), 7, 3.8, 'EXCELLENT',
   'Exceptional academic performance', 'None significant',
   'Consider advanced courses', NOW(), NOW(), NOW()),
   
  ((SELECT id FROM students WHERE student_id = 'STU005'), 9, 3.9, 'EXCELLENT',
   'Outstanding academic record', 'None',
   'Pursue advanced specialization', NOW(), NOW(), NOW());

-- ============================================================================
-- STEP 10: CREATE SAMPLE TEACHER PERFORMANCE RECORDS
-- ============================================================================
INSERT IGNORE INTO teacher_performance 
(teacher_id, user_id, total_classes, total_assignments_given, total_submissions_graded, performance_rating, created_at, updated_at)
VALUES 
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID001'), 2, 45, 6, 4, 4.5, NOW(), NOW()),
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID002'), 3, 42, 5, 2, 4.7, NOW(), NOW()),
  ((SELECT id FROM teachers WHERE teacher_id = 'TCHID003'), 4, 40, 4, 1, 4.6, NOW(), NOW());

-- ============================================================================
-- STEP 11: CREATE SAMPLE SCHEDULED WORKFLOWS
-- ============================================================================
INSERT IGNORE INTO scheduled_workflow 
(workflow_name, workflow_type, cron_expression, description, is_active, execution_status, created_at, updated_at)
VALUES 
  ('Weekly Assignment Reminder', 'FEE_REMINDER', '0 9 * * MON', 'Send reminders for upcoming assignments', TRUE, 'COMPLETED', NOW(), NOW()),
  ('Monthly Attendance Report', 'ATTENDANCE_REPORT', '0 8 1 * *', 'Generate monthly attendance reports', TRUE, 'COMPLETED', NOW(), NOW()),
  ('Automatic Grade Update', 'GRADE_UPDATE', '30 17 * * *', 'Update student grades daily', TRUE, 'PENDING', NOW(), NOW());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify data was inserted:
-- SELECT COUNT(*) as assignments FROM assignment;
-- SELECT COUNT(*) as submissions FROM assignment_submission;
-- SELECT COUNT(*) as marks FROM marks;
-- SELECT COUNT(*) as notifications FROM email_notification;
-- SELECT COUNT(*) as student_perf FROM student_performance;
-- SELECT COUNT(*) as teacher_perf FROM teacher_performance;

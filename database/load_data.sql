USE university_db;

-- Add more teachers
INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES 
('teacher2@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Rajesh Kumar', 'TEACHER', TRUE, NOW(), NOW()),
('teacher3@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Divya Sharma', 'TEACHER', TRUE, NOW(), NOW());

-- Add students (Semester 6, B.Tech CSE)
INSERT INTO users (email, password, full_name, role, is_active, created_at, updated_at) VALUES 
('student1@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Arjun Singh', 'STUDENT', TRUE, NOW(), NOW()),
('student2@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Bhavna Gupta', 'STUDENT', TRUE, NOW(), NOW()),
('student3@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Chetan Verma', 'STUDENT', TRUE, NOW(), NOW()),
('student4@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Deepak Singh', 'STUDENT', TRUE, NOW(), NOW()),
('student5@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Esha Patel', 'STUDENT', TRUE, NOW(), NOW()),
('student6@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Faisal Khan', 'STUDENT', TRUE, NOW(), NOW()),
('student7@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Gauri Desai', 'STUDENT', TRUE, NOW(), NOW()),
('student8@university.com', '$2a$10$N9qo8uLOickxskOERNl4keHSj5.YXA01F77BgXN8rI5F3YhwLv1UG', 'Harsh Pandey', 'STUDENT', TRUE, NOW(), NOW());

-- Create Teacher records
INSERT INTO teachers (user_id, employee_id, department, specialization, created_at, updated_at) VALUES 
(2, 'EMP001', 'Computer Science', 'Networks', NOW(), NOW()),
(3, 'EMP002', 'Computer Science', 'Databases', NOW(), NOW()),
(4, 'EMP003', 'Computer Science', 'Web Development', NOW(), NOW());

-- Create Student records (6 Semester 6, 2 Semester 4)
INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage, created_at, updated_at) VALUES 
(5, 'STU001', '2024001', 'Computer Science', 'B.Tech CSE', 6, 92.5, NOW(), NOW()),
(6, 'STU002', '2024002', 'Computer Science', 'B.Tech CSE', 6, 88.3, NOW(), NOW()),
(7, 'STU003', '2024003', 'Computer Science', 'B.Tech CSE', 6, 85.0, NOW(), NOW()),
(8, 'STU004', '2024004', 'Computer Science', 'B.Tech CSE', 6, 91.2, NOW(), NOW()),
(9, 'STU005', '2024005', 'Computer Science', 'B.Tech CSE', 6, 87.8, NOW(), NOW()),
(10, 'STU006', '2024006', 'Computer Science', 'B.Tech CSE', 6, 89.5, NOW(), NOW()),
(11, 'STU007', '2024007', 'Computer Science', 'B.Tech CSE', 4, 84.3, NOW(), NOW()),
(12, 'STU008', '2024008', 'Computer Science', 'B.Tech CSE', 4, 86.7, NOW(), NOW());

-- Create Subjects (Semester 6, B.Tech CSE)
INSERT INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course, description, created_at) VALUES 
('CSC601', 'System and Network Administration', 2, 6, 3, 'B.Tech CSE', 'Course on network and system administration', NOW()),
('CSC602', 'Database Management Systems', 3, 6, 4, 'B.Tech CSE', 'Course on database design and management', NOW()),
('CSC603', 'Web Technologies', 4, 6, 3, 'B.Tech CSE', 'Course on modern web development', NOW());

SELECT 'Database populated successfully!' as status;

-- Sample Data Initialization for University Management System
USE university_db;

-- Insert Teachers
INSERT INTO users (email, password, full_name, role) VALUES 
('priyanka.yadav@teacher.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Priyanka Yadav', 'TEACHER'),
('rajesh.kumar@teacher.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Rajesh Kumar', 'TEACHER'),
('divya.sharma@teacher.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Divya Sharma', 'TEACHER'),
('amit.patel@teacher.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Amit Patel', 'TEACHER');

-- Insert Teachers Info
INSERT INTO teachers (user_id, employee_id, department, specialization) VALUES 
(2, 'EMP001', 'Computer Science', 'Networks'),
(3, 'EMP002', 'Computer Science', 'Databases'),
(4, 'EMP003', 'Computer Science', 'Web Development'),
(5, 'EMP004', 'Computer Science', 'Algorithms');

-- Insert Subjects (Semester 6, Course: B.Tech CSE)
INSERT INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course) VALUES 
('CSC601', 'System and Network Administration', 1, 6, 3, 'B.Tech CSE'),
('CSC602', 'Database Management Systems', 2, 6, 4, 'B.Tech CSE'),
('CSC603', 'Web Technologies', 3, 6, 3, 'B.Tech CSE'),
('CSC604', 'Data Structures and Algorithms', 4, 6, 4, 'B.Tech CSE');

-- Insert Semester 6, Course: B.Tech CSE Students
INSERT INTO users (email, password, full_name, role) VALUES 
('student1@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Arjun Singh', 'STUDENT'),
('student2@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Bhavna Gupta', 'STUDENT'),
('student3@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Chetan Verma', 'STUDENT'),
('student4@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Deepa Reddy', 'STUDENT'),
('student5@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Eshaan Kumar', 'STUDENT'),
('student6@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Fatima Khan', 'STUDENT');

-- Insert Semester 6 CSE Students
INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage) VALUES 
(6, 'STU001', '2024001', 'Computer Science', 'B.Tech CSE', 6, 92.5),
(7, 'STU002', '2024002', 'Computer Science', 'B.Tech CSE', 6, 88.3),
(8, 'STU003', '2024003', 'Computer Science', 'B.Tech CSE', 6, 85.0),
(9, 'STU004', '2024004', 'Computer Science', 'B.Tech CSE', 6, 90.5),
(10, 'STU005', '2024005', 'Computer Science', 'B.Tech CSE', 6, 87.2),
(11, 'STU006', '2024006', 'Computer Science', 'B.Tech CSE', 6, 91.8);

-- Insert Semester 4, Course: B.Tech CSE Students (should NOT appear when selecting Semester 6 subjects)
INSERT INTO users (email, password, full_name, role) VALUES 
('student7@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Ganesh Nayak', 'STUDENT'),
('student8@university.com', '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai', 'Hira Patel', 'STUDENT');

INSERT INTO students (user_id, student_id, enrollment_number, department, course, semester, attendance_percentage) VALUES 
(12, 'STU007', '2024007', 'Computer Science', 'B.Tech CSE', 4, 89.0),
(13, 'STU008', '2024008', 'Computer Science', 'B.Tech CSE', 4, 86.5);

-- Insert Subject Enrollments (Enroll Semester 6 students in all Semester 6 subjects)
INSERT INTO subject_enrollment (student_id, subject_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4),
(4, 1), (4, 2), (4, 3), (4, 4),
(5, 1), (5, 2), (5, 3), (5, 4),
(6, 1), (6, 2), (6, 3), (6, 4);

-- Insert some sample attendance records
INSERT INTO attendance (student_id, subject_id, teacher_id, attendance_date, status) VALUES 
(1, 1, 2, '2026-01-15', 'PRESENT'),
(1, 1, 2, '2026-01-16', 'PRESENT'),
(1, 1, 2, '2026-01-17', 'ABSENT'),
(2, 1, 2, '2026-01-15', 'PRESENT'),
(2, 1, 2, '2026-01-16', 'LATE'),
(3, 2, 3, '2026-01-15', 'PRESENT'),
(3, 2, 3, '2026-01-16', 'PRESENT'),
(4, 3, 4, '2026-01-15', 'ABSENT'),
(4, 3, 4, '2026-01-16', 'PRESENT');

-- Insert sample documents
INSERT INTO documents (document_code, document_name, description, file_path, uploaded_by, visibility, allowed_roles, download_count) VALUES 
('DOC001', 'Database Fundamentals', 'Introduction to databases and SQL', '/docs/database_intro.pdf', 2, 'PUBLIC', 'STUDENT,TEACHER,ADMIN', 45),
('DOC002', 'Network Configuration Guide', 'Configuring network devices', '/docs/network_guide.pdf', 2, 'PUBLIC', 'STUDENT,TEACHER,ADMIN', 32),
('DOC003', 'Web Development Best Practices', 'Modern web development approaches', '/docs/web_dev_practices.pdf', 4, 'PUBLIC', 'STUDENT,TEACHER,ADMIN', 28),
('DOC004', 'Assignment 1 - Networks', 'Complete the network topology assignment', '/docs/assignment1.pdf', 2, 'PUBLIC', 'STUDENT,TEACHER,ADMIN', 15);

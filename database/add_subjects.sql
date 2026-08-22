USE university_db;

-- Create Subjects (Semester 6, B.Tech CSE)
INSERT INTO subjects (subject_code, subject_name, teacher_id, semester, credits, course, description, created_at) VALUES 
('CSC601', 'System and Network Administration', 1, 6, 3, 'B.Tech CSE', 'Course on network and system administration', NOW()),
('CSC602', 'Database Management Systems', 2, 6, 4, 'B.Tech CSE', 'Course on database design and management', NOW()),
('CSC603', 'Web Technologies', 3, 6, 3, 'B.Tech CSE', 'Course on modern web development', NOW());

SELECT 'Subjects added successfully!' as status;

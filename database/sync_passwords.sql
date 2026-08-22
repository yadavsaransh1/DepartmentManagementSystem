USE university_db;

-- Get the admin password hash and apply it to all students and teachers
UPDATE users 
SET password = '$2a$10$ijWHJ091gGTo7tnrP3OiIeGgUqrkC3oQXzRzOZtoWsjpQJbqmxE2.' 
WHERE role IN ('STUDENT', 'TEACHER');

SELECT 'All students and teachers now have admin password' as status;
SELECT COUNT(*) as count FROM users WHERE role IN ('STUDENT', 'TEACHER') AND role IS NOT NULL;

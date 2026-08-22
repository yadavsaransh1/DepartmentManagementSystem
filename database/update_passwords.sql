USE university_db;
-- Update all student and teacher passwords to the working admin hash (password: admin123456)
UPDATE users SET password = '$2a$10$gLvecWvJ9xpXf0xlCMzHRO1DqGM5aXkuVVLPJHxKzKoqqbDQgQ7Ai' WHERE role IN ('STUDENT', 'TEACHER');
SELECT 'Passwords updated successfully!' as status;

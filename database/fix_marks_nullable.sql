-- Fix marks table schema to support both admin and teacher marks
-- Admin marks: program_id + semester_name (no user_id, subject_id, exam_type)
-- Teacher marks: user_id + subject_id + exam_type (no program_id, semester_name)

ALTER TABLE marks MODIFY COLUMN user_id BIGINT NULL;
ALTER TABLE marks MODIFY COLUMN subject_id BIGINT NULL;
ALTER TABLE marks MODIFY COLUMN exam_type ENUM('MIDTERM', 'FINAL', 'QUIZ', 'INTERNAL', 'ASSIGNMENT') NULL;

-- Ensure marks value is always set (required)
ALTER TABLE marks MODIFY COLUMN marks DECIMAL(5,2) NOT NULL;

-- student_id must always be set
ALTER TABLE marks MODIFY COLUMN student_id BIGINT NOT NULL;

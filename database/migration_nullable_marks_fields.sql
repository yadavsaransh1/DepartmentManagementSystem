-- Migration: Make marks fields nullable for admin marks
-- Date: 2026-03-22
-- Description: Allow user, course, teacher, and exam_type to be NULL for ADMIN type marks

-- Modify user_id to allow NULL
ALTER TABLE marks MODIFY COLUMN user_id BIGINT NULL;

-- Modify course_id to allow NULL
ALTER TABLE marks MODIFY COLUMN course_id BIGINT NULL;

-- Modify teacher_id to allow NULL
ALTER TABLE marks MODIFY COLUMN teacher_id BIGINT NULL;

-- Modify exam_type to allow NULL
ALTER TABLE marks MODIFY COLUMN exam_type VARCHAR(50) NULL;

-- Optional: Add a check constraint to ensure that if mark_type='TEACHER', then user_id and teacher_id must be NOT NULL
-- This can be added in the application layer instead through validation

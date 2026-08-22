-- Migration: Redesign Marks Management for Separate Teacher/Admin Marks
-- Date: 2026-03-22
-- Description: Add fields for admin semester marks while improving teacher marks filtering

-- Add new columns to marks table for admin semester marks
ALTER TABLE marks ADD COLUMN IF NOT EXISTS program_id BIGINT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS semester_name VARCHAR(100);
ALTER TABLE marks ADD COLUMN IF NOT EXISTS passing_status ENUM('PASS', 'FAIL', 'BACKPAPER') DEFAULT 'PASS';
ALTER TABLE marks ADD COLUMN IF NOT EXISTS admin_id BIGINT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS mark_type ENUM('TEACHER', 'ADMIN') DEFAULT 'TEACHER';

-- Add foreign keys
ALTER TABLE marks ADD CONSTRAINT IF NOT EXISTS fk_marks_program 
  FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE marks ADD CONSTRAINT IF NOT EXISTS fk_marks_admin 
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Add indexes for better query performance
ALTER TABLE marks ADD INDEX IF NOT EXISTS idx_program_semester (program_id, semester_name);
ALTER TABLE marks ADD INDEX IF NOT EXISTS idx_student_semester (student_id, semester_name);
ALTER TABLE marks ADD INDEX IF NOT EXISTS idx_marks_type (mark_type);
ALTER TABLE marks ADD INDEX IF NOT EXISTS idx_teacher_mark_type (teacher_id, mark_type);

-- Create view for teacher marks (sessional + assignment)
CREATE OR REPLACE VIEW teacher_marks_view AS
SELECT * FROM marks WHERE mark_type = 'TEACHER' OR mark_type IS NULL;

-- Create view for admin semester marks
CREATE OR REPLACE VIEW admin_marks_view AS
SELECT * FROM marks WHERE mark_type = 'ADMIN' AND semester_name IS NOT NULL;

-- Sample data migration for existing marks (set them as teacher marks)
UPDATE marks SET mark_type = 'TEACHER' WHERE mark_type IS NULL;

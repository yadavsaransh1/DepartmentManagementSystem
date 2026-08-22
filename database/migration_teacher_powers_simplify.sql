-- Migration: Update teacher_powers table with new tab-based permissions
-- Drop old columns and add new ones

ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_view_results;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_edit_marks;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_add_marks;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_delete_marks;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_view_attendance;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_edit_attendance;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_manage_assignment;
ALTER TABLE teacher_powers DROP COLUMN IF EXISTS can_manage_feedback;

-- Add new tab-based permission columns (if they don't exist)
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_home_page BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_student_details BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_teacher_details BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_results BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_student_statistics BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_project BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_feedback BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_assignment BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teacher_powers ADD COLUMN IF NOT EXISTS can_access_committee BOOLEAN DEFAULT FALSE NOT NULL;

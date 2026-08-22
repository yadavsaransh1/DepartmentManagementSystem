-- Migration: Fix supervisor_allocations table to support PhD guides
-- PhD guides don't always have a teacher record, so teacher_id should be nullable

USE university_db;

-- Drop foreign key constraints if they exist (ignore errors if they don't)
ALTER TABLE supervisor_allocations DROP FOREIGN KEY supervisor_allocations_ibfk_1;

-- Modify the column to be nullable
ALTER TABLE supervisor_allocations 
MODIFY COLUMN teacher_id BIGINT NULL;

-- Re-add the foreign key constraint with proper delete behavior
ALTER TABLE supervisor_allocations 
ADD CONSTRAINT supervisor_allocations_fk_teacher 
FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;




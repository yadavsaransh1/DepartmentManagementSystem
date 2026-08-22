-- Add teacher_id column to routines table if it doesn't exist
USE university_db;

-- Check if the column already exists and add it if not
ALTER TABLE routines ADD COLUMN teacher_id BIGINT NULL;

-- Add foreign key constraint if needed
ALTER TABLE routines ADD CONSTRAINT fk_routine_teacher 
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_routine_teacher ON routines(teacher_id);

SELECT 'Teacher ID column added to routines table' as status;

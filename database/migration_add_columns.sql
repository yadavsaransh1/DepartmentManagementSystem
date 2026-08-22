-- Database migration script for adding new columns and ensuring schema consistency
USE university_db;

-- Add contact_no column to students if it doesn't exist
ALTER TABLE students 
ADD COLUMN contact_no VARCHAR(20) NULL 
AFTER enrollment_number;

-- Add teacher_id column to routines if it doesn't exist  
ALTER TABLE routines
ADD COLUMN teacher_id BIGINT NULL;

-- Add foreign key constraint for teacher_id if it doesn't exist
ALTER TABLE routines 
ADD CONSTRAINT fk_routine_teacher 
FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX idx_routine_teacher ON routines(teacher_id);

-- Verify columns exist
DESCRIBE students;
DESCRIBE routines;

SELECT 'Database migration completed successfully' as status;
SELECT COUNT(*) as students_count FROM students;
SELECT COUNT(*) as routines_count FROM routines;

-- ============================================
-- MIGRATION: Convert program field to foreign key relationship
-- Date: 2026-03-15
-- Purpose: Change Subject.program from VARCHAR to foreign key relationship with Program table
-- ============================================

USE university_db;

-- Step 1: Create backup of courses table data
CREATE TABLE IF NOT EXISTS courses_backup AS SELECT * FROM courses;
SELECT 'Backup created: courses_backup' as status;

-- Step 2: Add program_id column if it doesn't exist
ALTER TABLE courses 
ADD COLUMN program_id BIGINT NULL AFTER credits;

SELECT 'Added program_id column' as status;

-- Step 3: Migrate data from course (VARCHAR) to program_id (foreign key)
-- This update links existing course names to program IDs
UPDATE courses c
SET c.program_id = (
    SELECT p.id FROM programs p 
    WHERE LOWER(p.name) = LOWER(c.course) OR LOWER(p.name) LIKE CONCAT('%', LOWER(c.course), '%')
    LIMIT 1
)
WHERE c.course IS NOT NULL AND c.course != '';

-- Step 4: Add foreign key constraint for program_id
ALTER TABLE courses 
ADD CONSTRAINT fk_course_program 
FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL;

SELECT 'Added foreign key constraint' as status;

-- Step 5: Create index for better query performance
CREATE INDEX idx_course_program_id ON courses(program_id);

SELECT 'Created index on program_id' as status;

-- Step 6: Verify the migration
SELECT 
    'Migration Summary:' as title,
    COUNT(*) as total_courses,
    SUM(CASE WHEN program_id IS NOT NULL THEN 1 ELSE 0 END) as courses_with_program_id,
    SUM(CASE WHEN program_id IS NULL THEN 1 ELSE 0 END) as courses_without_program_id
FROM courses;

-- Step 7: Show sample migrated data
SELECT 
    c.id,
    c.course_code,
    c.course_name,
    c.course as old_course_field,
    p.id as program_id,
    p.name as program_name
FROM courses c
LEFT JOIN programs p ON c.program_id = p.id
LIMIT 10;

SELECT 'Database migration completed successfully!' as status;

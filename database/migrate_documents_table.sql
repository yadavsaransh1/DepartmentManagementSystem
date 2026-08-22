-- Migration script to update documents table for COURSE visibility and allowed_courses
USE university_db;

-- Step 1: Check if allowed_courses column exists, if not add it
ALTER TABLE documents ADD COLUMN IF NOT EXISTS allowed_courses TEXT AFTER allowed_user_ids;

-- Step 2: Check if category column exists, if not add it
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category VARCHAR(100) AFTER allowed_courses;

-- Step 3: Modify the visibility enum to include COURSE
ALTER TABLE documents MODIFY COLUMN visibility ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED', 'COURSE') DEFAULT 'PRIVATE';

SELECT 'Documents table migration completed successfully!' as status;

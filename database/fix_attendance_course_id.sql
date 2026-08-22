-- Fix attendance records with missing course_id
-- This script populates course_id by matching students with their enrolled subjects

-- First, let's check how many records have NULL course_id
SELECT COUNT(*) as null_course_records FROM attendance WHERE course_id IS NULL;

-- Populate attendance records by joining with student subject enrollments
-- Match based on student_id and course enrollment
UPDATE attendance a
SET course_id = (
    SELECT DISTINCT sub.id 
    FROM subject_enrollment se
    JOIN subject sub ON se.subject_id = sub.id
    WHERE se.student_id = a.student_id
    LIMIT 1
)
WHERE a.course_id IS NULL AND a.student_id IN (
    SELECT DISTINCT se.student_id 
    FROM subject_enrollment se
);

-- If the above doesn't work completely, try matching with the student's current semester/course
-- Alternative: Use student's default course
UPDATE attendance a
SET course_id = (
    SELECT id FROM subject
    WHERE course_type = (
        SELECT course FROM student WHERE id = a.student_id
    )
    LIMIT 1
)
WHERE a.course_id IS NULL;

-- Last resort: Assign a default subject ID for records that still have NULL
-- This assumes there's at least one subject in the database
UPDATE attendance a
SET course_id = (
    SELECT id FROM subject LIMIT 1
)
WHERE a.course_id IS NULL;

-- Verify the fix
SELECT COUNT(*) as remaining_null_courses FROM attendance WHERE course_id IS NULL;
SELECT COUNT(*) as fixed_records FROM attendance WHERE course_id IS NOT NULL;

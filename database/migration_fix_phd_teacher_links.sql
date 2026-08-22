-- Migration: Fix PhD student allocations 
-- Link existing GUIDE allocations to teacher ID 11 (Dr. Rahul Chandra Kushwaha)

UPDATE supervisor_allocations 
SET teacher_id = 11
WHERE allocation_type = 'GUIDE' 
  AND teacher_id IS NULL
  AND EXISTS (
    SELECT 1 FROM students s 
    WHERE s.id = supervisor_allocations.student_id 
    AND s.program = 'PHD'
  );

-- Verify the changes
SELECT 
    sa.id,
    sa.allocation_type,
    sa.teacher_id,
    s.student_id,
    u.full_name as student_name
FROM supervisor_allocations sa
LEFT JOIN students s ON sa.student_id = s.id
LEFT JOIN user u ON s.user_id = u.id
WHERE sa.allocation_type = 'GUIDE';

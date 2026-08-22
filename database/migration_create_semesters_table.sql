-- Migration: Create and populate semesters table
-- Description: Establishes proper semester database structure linked to programs

-- Create semesters table if it doesn't exist
CREATE TABLE IF NOT EXISTS semesters (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id BIGINT NOT NULL,
    semester_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_semester_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    CONSTRAINT uk_program_semester_number UNIQUE KEY (program_id, semester_number)
);

-- Create index for efficient querying
CREATE INDEX idx_program_semesters ON semesters(program_id, semester_number);

-- Populate semesters for existing programs (based on semesterCount)
-- Only create if semesters don't already exist
INSERT INTO semesters (program_id, semester_number, name, is_active)
SELECT p.id, numbers.n, CONCAT('Semester ', numbers.n), TRUE
FROM programs p
CROSS JOIN (
    SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 
    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8
) AS numbers
WHERE p.semester_count IS NOT NULL 
  AND numbers.n <= p.semester_count
  AND NOT EXISTS (
    SELECT 1 FROM semesters s 
    WHERE s.program_id = p.id AND s.semester_number = numbers.n
  )
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Verify the migration
SELECT p.name, COUNT(s.id) as semester_count
FROM programs p
LEFT JOIN semesters s ON p.id = s.program_id
GROUP BY p.id, p.name
ORDER BY p.name;

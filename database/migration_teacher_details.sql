-- Migration: Add teacher_details table for storing teacher profile information
-- Purpose: Store detailed teacher information including education, certifications, work experience, publications, etc.

CREATE TABLE IF NOT EXISTS teacher_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL UNIQUE,
    date_of_birth VARCHAR(50),
    profile_picture LONGBLOB,
    profile_picture_type VARCHAR(50),
    resume LONGBLOB,
    resume_type VARCHAR(50),
    education_json LONGTEXT,
    certifications_json LONGTEXT,
    skills_abilities TEXT,
    work_experiences_json LONGTEXT,
    journal_publications_json LONGTEXT,
    book_chapters_json LONGTEXT,
    conference_presentation_json LONGTEXT,
    books_authored_json LONGTEXT,
    patents_json LONGTEXT,
    projects_json LONGTEXT,
    invited_talk_json LONGTEXT,
    administrative_responsibilities TEXT,
    academic_contribution LONGTEXT,
    custom_fields_json LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_teacher_details_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX idx_updated_at ON teacher_details(updated_at);

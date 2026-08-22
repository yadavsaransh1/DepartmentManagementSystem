-- Add visibility field to track which students can access the assignment
ALTER TABLE `assignment` ADD COLUMN `visible_to_all_students` BIT(1) DEFAULT 1 AFTER `max_score`;
ALTER TABLE `assignment` ADD COLUMN `visible_student_ids` LONGTEXT AFTER `visible_to_all_students`;

-- Create a new table for assignment visibility mapping
CREATE TABLE IF NOT EXISTS `assignment_visibility` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `assignment_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `created_at` DATETIME(6) NOT NULL,
    UNIQUE KEY `unique_assignment_student` (`assignment_id`, `student_id`),
    FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`) ON DELETE CASCADE
);

CREATE INDEX `idx_assignment_visibility_assignment` ON `assignment_visibility`(`assignment_id`);
CREATE INDEX `idx_assignment_visibility_student` ON `assignment_visibility`(`student_id`);

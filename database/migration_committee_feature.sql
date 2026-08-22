-- Committee Feature Migration
-- Created: May 4, 2026

-- Create committees table
CREATE TABLE IF NOT EXISTS `committees` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL UNIQUE,
  `description` longtext,
  `created_by_email` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_committees_created_by` (`created_by_email`),
  CONSTRAINT `FK_committees_created_by` FOREIGN KEY (`created_by_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create committee_members table (junction table with roles and powers)
CREATE TABLE IF NOT EXISTS `committee_members` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `committee_id` bigint NOT NULL,
  `teacher_email` varchar(255) NOT NULL,
  `role` varchar(100) NOT NULL DEFAULT 'Member',
  `powers` longtext COMMENT 'JSON array of powers allocated',
  `joined_date` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_committee_teacher` (`committee_id`, `teacher_email`),
  KEY `FK_committee_members_teacher` (`teacher_email`),
  CONSTRAINT `FK_committee_members_committee` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_committee_members_teacher` FOREIGN KEY (`teacher_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create committee_messages table
CREATE TABLE IF NOT EXISTS `committee_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `committee_id` bigint NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `message_text` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_committee_messages_committee` (`committee_id`),
  KEY `FK_committee_messages_sender` (`sender_email`),
  CONSTRAINT `FK_committee_messages_committee` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_committee_messages_sender` FOREIGN KEY (`sender_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create committee_documents table
CREATE TABLE IF NOT EXISTS `committee_documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `committee_id` bigint NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(255),
  `document_type` varchar(100),
  `uploaded_by_email` varchar(255) NOT NULL,
  `description` longtext,
  `uploaded_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6),
  `file_size` bigint,
  PRIMARY KEY (`id`),
  KEY `FK_committee_documents_committee` (`committee_id`),
  KEY `FK_committee_documents_uploader` (`uploaded_by_email`),
  CONSTRAINT `FK_committee_documents_committee` FOREIGN KEY (`committee_id`) REFERENCES `committees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_committee_documents_uploader` FOREIGN KEY (`uploaded_by_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create committee_powers table (pre-defined available powers)
CREATE TABLE IF NOT EXISTS `committee_powers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `power_name` varchar(100) NOT NULL UNIQUE,
  `description` varchar(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default powers
INSERT INTO `committee_powers` (`power_name`, `description`) VALUES
  ('MANAGE_MEMBERS', 'Can add/remove members'),
  ('MANAGE_DOCUMENTS', 'Can upload/delete documents'),
  ('MANAGE_MESSAGES', 'Can delete messages'),
  ('MANAGE_ROLES', 'Can assign roles to members'),
  ('DELETE_COMMITTEE', 'Can delete the committee'),
  ('VIEW_ANALYTICS', 'Can view committee analytics'),
  ('APPROVE_DOCUMENTS', 'Can approve uploaded documents');

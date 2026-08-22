-- ========================================================================
-- HIBERNATE AUTO-GENERATED SCHEMA (Exported: 2026-03-29 17:03:48.597436)
-- ========================================================================

CREATE DATABASE IF NOT EXISTS university_db;
USE university_db;

-- alumni
CREATE TABLE `alumni` (
  `join_date` date DEFAULT NULL,
  `marks` float DEFAULT NULL,
  `passing_date` date DEFAULT NULL,
  `semester` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `current_occupation` varchar(255) DEFAULT NULL,
  `custom_fields` longtext,
  `pass_fail` varchar(255) DEFAULT NULL,
  `program` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiy6rn5rcpdfdo3q4b21turd7l` (`student_id`),
  CONSTRAINT `FKiy6rn5rcpdfdo3q4b21turd7l` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- assignment
CREATE TABLE `assignment` (
  `max_score` int DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `due_date` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `description` longtext,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `instructions` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjdb8i3vawy0s72p9py8xvgufu` (`course_id`),
  KEY `FKrokqabrhe81ihxbnapmjdy2o0` (`teacher_id`),
  CONSTRAINT `FKjdb8i3vawy0s72p9py8xvgufu` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `FKrokqabrhe81ihxbnapmjdy2o0` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- assignment_submission
CREATE TABLE `assignment_submission` (
  `is_late` bit(1) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `assignment_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `graded_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `submitted_at` datetime(6) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `feedback` text,
  `status` enum('GRADED','LATE_SUBMITTED','NOT_SUBMITTED','SUBMITTED') NOT NULL,
  `submission_file_name` varchar(255) DEFAULT NULL,
  `submission_file_path` varchar(255) DEFAULT NULL,
  `submission_text` longtext,
  `user_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKi9tdkyaqlb4j7qm7y2k74jd7o` (`assignment_id`),
  KEY `FKh4ce68nlo1qgp6ipju56ks1by` (`student_id`),
  KEY `FKsa62v4um8b5s5anpmg1wxrmet` (`user_email`),
  CONSTRAINT `FKh4ce68nlo1qgp6ipju56ks1by` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKi9tdkyaqlb4j7qm7y2k74jd7o` FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`),
  CONSTRAINT `FKsa62v4um8b5s5anpmg1wxrmet` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- attendance
CREATE TABLE `attendance` (
  `attendance_date` date NOT NULL,
  `attendance_time` time(6) DEFAULT NULL,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` enum('ABSENT','LATE','LEAVE','PRESENT') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKn38ldxe7u4udeu15ikqfsplnm` (`course_id`),
  KEY `FK7121lveuhtmu9wa6m90ayd5yg` (`student_id`),
  KEY `FKgjm8wg1wx3eny9wvw0jholvsy` (`teacher_id`),
  CONSTRAINT `FK7121lveuhtmu9wa6m90ayd5yg` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKgjm8wg1wx3eny9wvw0jholvsy` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKn38ldxe7u4udeu15ikqfsplnm` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- attendance_color_settings
CREATE TABLE `attendance_color_settings` (
  `low_threshold` int NOT NULL,
  `medium_threshold` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `high_color` varchar(255) NOT NULL,
  `low_color` varchar(255) NOT NULL,
  `medium_color` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_5js8cc35ymdwgekuyrhcu5wt0` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- attendance_settings
CREATE TABLE `attendance_settings` (
  `nq_criteria` float NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- certificates
CREATE TABLE `certificates` (
  `download_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `file_size` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `certificate_name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `expiry_date` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `issued_date` varchar(255) DEFAULT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3cp1w2kg9nkmr09mdwghourxn` (`teacher_id`),
  CONSTRAINT `FK3cp1w2kg9nkmr09mdwghourxn` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- course_enrollment
CREATE TABLE `course_enrollment` (
  `is_active` bit(1) NOT NULL,
  `course_id` bigint NOT NULL,
  `enrollment_date` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKg8t9wnqrk664jyys47xqgl6ym` (`course_id`),
  KEY `FK8ri3uw0nufgd90ui516wkh77d` (`student_id`),
  CONSTRAINT `FK8ri3uw0nufgd90ui516wkh77d` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKg8t9wnqrk664jyys47xqgl6ym` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- courses
CREATE TABLE `courses` (
  `credits` int DEFAULT NULL,
  `is_legacy` tinyint(1) DEFAULT '0',
  `semester` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `program_id` bigint DEFAULT NULL,
  `teacher_id` bigint NOT NULL,
  `source_table` varchar(50) DEFAULT 'COURSES',
  `course` varchar(255) DEFAULT NULL,
  `course_code` varchar(255) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `description` text,
  `program` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_p02ts69sh53ptd62m3c67v0` (`course_code`),
  KEY `FKh9mmrmahf9iy4yoqdv41vbxjm` (`program_id`),
  KEY `FK468oyt88pgk2a0cxrvxygadqg` (`teacher_id`),
  CONSTRAINT `FK468oyt88pgk2a0cxrvxygadqg` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`),
  CONSTRAINT `FKh9mmrmahf9iy4yoqdv41vbxjm` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- documents
CREATE TABLE `documents` (
  `download_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `allowed_courses` text,
  `allowed_roles` varchar(255) DEFAULT NULL,
  `allowed_user_emails` text,
  `category` varchar(255) DEFAULT NULL,
  `description` text,
  `document_code` varchar(255) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `uploaded_by_email` varchar(255) NOT NULL,
  `visibility` enum('COURSE','PRIVATE','PUBLIC','RESTRICTED') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_bwsl1fcjhvn0xmx9ypem1efwq` (`document_code`),
  KEY `FK55vmirjs1xggc5vf27qmg97h6` (`uploaded_by_email`),
  CONSTRAINT `FK55vmirjs1xggc5vf27qmg97h6` FOREIGN KEY (`uploaded_by_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- feedback_activation
CREATE TABLE `feedback_activation` (
  `is_activated` bit(1) NOT NULL,
  `semester` int NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `program` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmi294470ctt7kq7l5ucsngf3k` (`program`,`semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- file_locations
CREATE TABLE `file_locations` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `additional_information` text,
  `almirah_name` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- marks
CREATE TABLE `marks` (
  `assignment_marks` decimal(38,2) DEFAULT NULL,
  `marks` decimal(38,2) NOT NULL,
  `obtained_assignment_marks` decimal(38,2) DEFAULT NULL,
  `obtained_semester_marks` decimal(38,2) DEFAULT NULL,
  `obtained_sessional_marks` decimal(38,2) DEFAULT NULL,
  `percentage` decimal(38,2) DEFAULT NULL,
  `semester_marks` decimal(38,2) DEFAULT NULL,
  `sessional_marks` decimal(38,2) DEFAULT NULL,
  `total_marks` int DEFAULT NULL,
  `course_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `entered_by` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `program_id` bigint DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `semester_name` varchar(100) DEFAULT NULL,
  `admin_email` varchar(255) DEFAULT NULL,
  `comments` text,
  `exam_type` enum('ASSIGNMENT','FINAL','INTERNAL','MIDTERM','QUIZ') DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `mark_type` enum('ADMIN','TEACHER') DEFAULT NULL,
  `passing_status` enum('BACKPAPER','FAIL','PASS') DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKb9orgw3sd9l3f3tacc3tqul8k` (`admin_email`),
  KEY `FKqmibkydr77dcr0r32lo91regw` (`course_id`),
  KEY `FKn0oyxcvxyrnbb64fex7pdjjeg` (`program_id`),
  KEY `FK6o5buy4g7i65v20hjy9inwn05` (`student_id`),
  KEY `FKtqog40jvebe200gdlv28qe1ap` (`teacher_id`),
  KEY `FK9o2t0geqa6cm5xvxfp4oe2ech` (`user_email`),
  CONSTRAINT `FK6o5buy4g7i65v20hjy9inwn05` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FK9o2t0geqa6cm5xvxfp4oe2ech` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`),
  CONSTRAINT `FKb9orgw3sd9l3f3tacc3tqul8k` FOREIGN KEY (`admin_email`) REFERENCES `users` (`email`),
  CONSTRAINT `FKn0oyxcvxyrnbb64fex7pdjjeg` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`),
  CONSTRAINT `FKqmibkydr77dcr0r32lo91regw` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `FKtqog40jvebe200gdlv28qe1ap` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- notification_replies
CREATE TABLE `notification_replies` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `notification_id` bigint NOT NULL,
  `reply_by` varchar(255) NOT NULL,
  `reply_content` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKal9nnrxjwecfiodpo8wlbuts5` (`notification_id`),
  KEY `FKjx2rrjsdiu6fewcr5gt11f91k` (`reply_by`),
  CONSTRAINT `FKal9nnrxjwecfiodpo8wlbuts5` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`),
  CONSTRAINT `FKjx2rrjsdiu6fewcr5gt11f91k` FOREIGN KEY (`reply_by`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- notifications
CREATE TABLE `notifications` (
  `is_active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `allowed_roles` varchar(255) DEFAULT NULL,
  `allowed_user_emails` varchar(255) DEFAULT NULL,
  `content` text,
  `created_by_email` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `visibility` enum('PRIVATE','PUBLIC','RESTRICTED') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKo0254xc5h0b91mvnxpxpsw7gf` (`created_by_email`),
  CONSTRAINT `FKo0254xc5h0b91mvnxpxpsw7gf` FOREIGN KEY (`created_by_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- password_reset_tokens
CREATE TABLE `password_reset_tokens` (
  `used` bit(1) NOT NULL,
  `expiry_time` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_71lqwbwtklmljk3qlsugr1mig` (`token`),
  KEY `FKgoku1r4mwy6bjf83eu70nhkhf` (`user_email`),
  CONSTRAINT `FKgoku1r4mwy6bjf83eu70nhkhf` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- programs
CREATE TABLE `programs` (
  `is_active` bit(1) NOT NULL,
  `semester_count` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_4uh20rvftatfys82a9nkvpl0o` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- project_documents
CREATE TABLE `project_documents` (
  `allocation_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `file_size` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `upload_date` datetime(6) NOT NULL,
  `document_name` varchar(255) NOT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `document_title` varchar(255) DEFAULT NULL,
  `uploaded_by` varchar(255) NOT NULL,
  `uploaded_by_user` varchar(255) NOT NULL,
  `visibility` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKemnynt7o6lsq5fchq9qw1ilsl` (`allocation_id`),
  KEY `FKaksdxbp5otwd9rt2gcgck2g75` (`uploaded_by_user`),
  CONSTRAINT `FKaksdxbp5otwd9rt2gcgck2g75` FOREIGN KEY (`uploaded_by_user`) REFERENCES `users` (`email`),
  CONSTRAINT `FKemnynt7o6lsq5fchq9qw1ilsl` FOREIGN KEY (`allocation_id`) REFERENCES `supervisor_allocations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- project_messages
CREATE TABLE `project_messages` (
  `allocation_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message_text` text NOT NULL,
  `sender_email` varchar(255) NOT NULL,
  `sender_role` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa1nn5hwqwxyqdsh64w4xc4595` (`allocation_id`),
  KEY `FKdijgoi4vly20ot1enf9jjjr82` (`sender_email`),
  CONSTRAINT `FKa1nn5hwqwxyqdsh64w4xc4595` FOREIGN KEY (`allocation_id`) REFERENCES `supervisor_allocations` (`id`),
  CONSTRAINT `FKdijgoi4vly20ot1enf9jjjr82` FOREIGN KEY (`sender_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- reports
CREATE TABLE `reports` (
  `is_automated` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `generated_date` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `generated_by_email` varchar(255) DEFAULT NULL,
  `report_code` varchar(255) NOT NULL,
  `report_data` longtext,
  `report_name` varchar(255) NOT NULL,
  `report_type` enum('ACADEMIC','ATTENDANCE','DOCUMENT','STUDENT','TEACHER') NOT NULL,
  `schedule_cron` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_h5awoe0jsvk1hgyg3lurbohta` (`report_code`),
  KEY `FK22wxeouhacfvdlx2nq6r0rqve` (`generated_by_email`),
  CONSTRAINT `FK22wxeouhacfvdlx2nq6r0rqve` FOREIGN KEY (`generated_by_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- routines
CREATE TABLE `routines` (
  `download_count` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `file_size` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `academic_year` varchar(255) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `semester` varchar(255) NOT NULL,
  `uploaded_by` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKl8cx3ygrdkw7wstbrds6egbvg` (`teacher_id`),
  CONSTRAINT `FKl8cx3ygrdkw7wstbrds6egbvg` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- student_performance
CREATE TABLE `student_performance` (
  `assignments_completed` int DEFAULT NULL,
  `assignments_pending` int DEFAULT NULL,
  `attendance_percentage` decimal(38,2) DEFAULT NULL,
  `average_score` decimal(38,2) DEFAULT NULL,
  `overall_gpa` decimal(38,2) DEFAULT NULL,
  `total_assignments` int DEFAULT NULL,
  `total_marks` decimal(38,2) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_updated` datetime(6) DEFAULT NULL,
  `student_id` bigint NOT NULL,
  `performance_level` enum('EXCELLENT','GOOD','NEEDS_IMPROVEMENT','SATISFACTORY') DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_rrv4i14debrdv63hjq1sllpeu` (`student_id`),
  KEY `FKkcmqs8650ewqq2wuoycrxbgu9` (`user_id`),
  CONSTRAINT `FK79d30dtmne7n7v0v712di7c09` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKkcmqs8650ewqq2wuoycrxbgu9` FOREIGN KEY (`user_id`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- students
CREATE TABLE `students` (
  `attendance_percentage` float NOT NULL,
  `semester` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `contact_no` varchar(255) DEFAULT NULL,
  `custom_fields` longtext,
  `department` varchar(255) DEFAULT NULL,
  `enrollment_number` varchar(255) DEFAULT NULL,
  `program` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_5mbus2m1tm2acucrp6t627jmx` (`student_id`),
  UNIQUE KEY `UK_a5v9e5qdffqn1w244ly2p382q` (`user_email`),
  UNIQUE KEY `UK_bvli2c86kppxltwfx6qjd8klw` (`enrollment_number`),
  CONSTRAINT `FKsr1hdp3xudb1snw2woqjuiaxm` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- supervisor_allocations
CREATE TABLE `supervisor_allocations` (
  `allocation_date` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `teacher_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `allocation_type` varchar(255) NOT NULL,
  `guide_department` varchar(255) DEFAULT NULL,
  `guide_name` varchar(255) DEFAULT NULL,
  `project_description` text,
  `project_title` text,
  `specialization` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK75f1wxgbn81uqse6kyfofw2pj` (`student_id`),
  KEY `FKk8v97wlgocpskylnauu4utgga` (`teacher_id`),
  CONSTRAINT `FK75f1wxgbn81uqse6kyfofw2pj` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKk8v97wlgocpskylnauu4utgga` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- syllabus
CREATE TABLE `syllabus` (
  `course_id` bigint NOT NULL,
  `file_size` bigint NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uploaded_at` datetime(6) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `program` varchar(255) NOT NULL,
  `semester` varchar(255) NOT NULL,
  `uploaded_by` varchar(255) NOT NULL,
  `file_content` longblob NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg6t8xd5tk61ym13snuqdyhuck` (`course_id`,`program`,`semester`),
  KEY `FKgmbnh0mig04amsh1f7e0w1ri4` (`uploaded_by`),
  CONSTRAINT `FKgmbnh0mig04amsh1f7e0w1ri4` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`email`),
  CONSTRAINT `FKjvcn63hkhub569g084rgb9hme` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- teacher_details
CREATE TABLE `teacher_details` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `teacher_id` bigint NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `academic_contribution` text,
  `administrative_responsibilities` text,
  `book_chapters_json` longtext,
  `books_authored_json` longtext,
  `certifications_json` longtext,
  `conference_presentation_json` longtext,
  `custom_fields_json` longtext,
  `date_of_birth` text,
  `education_json` longtext,
  `invited_talk_json` longtext,
  `journal_publications_json` longtext,
  `patents_json` longtext,
  `profile_picture_type` varchar(255) DEFAULT NULL,
  `projects_json` longtext,
  `resume_type` varchar(255) DEFAULT NULL,
  `skills_abilities` text,
  `work_experiences_json` longtext,
  `profile_picture` longblob,
  `resume` longblob,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_sp8rgqfxd5svdvtxwmqdqbqdd` (`teacher_id`),
  CONSTRAINT `FK6agxxcg3cv53gc08b36l20vl4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- teacher_feedback
CREATE TABLE `teacher_feedback` (
  `availability` int NOT NULL,
  `communication` int NOT NULL,
  `course_content` int NOT NULL,
  `is_anonymous` bit(1) NOT NULL,
  `is_deleted` bit(1) NOT NULL,
  `overall_rating` decimal(38,2) NOT NULL,
  `semester` int NOT NULL,
  `teaching_quality` int NOT NULL,
  `course_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `teacher_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `areas_for_improvement` longtext,
  `comments` longtext,
  `positive_aspects` longtext,
  `program` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbi3dtooutpp3poxryfeijah8c` (`course_id`),
  KEY `FKbg3c62dg6tu7jxuh0amcvn7n3` (`student_id`),
  KEY `FKqnaj94ncbtbivncwx46u1to5j` (`teacher_id`),
  CONSTRAINT `FKbg3c62dg6tu7jxuh0amcvn7n3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `FKbi3dtooutpp3poxryfeijah8c` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `FKqnaj94ncbtbivncwx46u1to5j` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- teacher_performance
CREATE TABLE `teacher_performance` (
  `avg_grading_time` int DEFAULT NULL,
  `performance_rating` decimal(38,2) DEFAULT NULL,
  `students_engaged` int DEFAULT NULL,
  `total_assignments_given` int DEFAULT NULL,
  `total_attendance_marked` int DEFAULT NULL,
  `total_classes` int DEFAULT NULL,
  `total_submissions_graded` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `last_evaluation_date` datetime(6) DEFAULT NULL,
  `teacher_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_j1sgu4hf7j51pt6n11wnji4oi` (`teacher_id`),
  KEY `FKgjso1urbaq5d0paqbg8tnyb26` (`user_id`),
  CONSTRAINT `FKgjso1urbaq5d0paqbg8tnyb26` FOREIGN KEY (`user_id`) REFERENCES `users` (`email`),
  CONSTRAINT `FKm7adf62sc1v4lym44qpmn0s2f` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- teacher_powers
CREATE TABLE `teacher_powers` (
  `can_add_marks` bit(1) NOT NULL,
  `can_delete_marks` bit(1) NOT NULL,
  `can_edit_attendance` bit(1) NOT NULL,
  `can_edit_marks` bit(1) NOT NULL,
  `can_manage_assignment` bit(1) NOT NULL,
  `can_manage_feedback` bit(1) NOT NULL,
  `can_view_attendance` bit(1) NOT NULL,
  `can_view_results` bit(1) NOT NULL,
  `can_access_committee` bit(1) NOT NULL,
  `is_hod` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `teacher_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKei0m7yc4tupprpmevrdud0ind` (`teacher_email`),
  CONSTRAINT `FKei0m7yc4tupprpmevrdud0ind` FOREIGN KEY (`teacher_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- teachers
CREATE TABLE `teachers` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) NOT NULL,
  `certification` varchar(255) DEFAULT NULL,
  `contact_number` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `subjects_handled` text,
  `teacher_id` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_pcu7o1u90blsqly3p120typmu` (`user_email`),
  UNIQUE KEY `UK_8xdh0jsitskwq83arwxvyihhc` (`employee_id`),
  UNIQUE KEY `UK_7knr046ecq8hwte27psac5dxe` (`teacher_id`),
  CONSTRAINT `FKlyxmybuygxltu60v4x4m0i3u8` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- users
CREATE TABLE `users` (
  `is_active` bit(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','HOD','STUDENT','TEACHER') NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


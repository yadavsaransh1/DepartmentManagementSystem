# Database Schema Diagram - Department Management System

## Overview
```
┌──────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY MANAGEMENT DATABASE                │
│                      Created: 2026-03-23                         │
│                    Total Tables: 31                              │
└──────────────────────────────────────────────────────────────────┘
```

## Core Entity Relationship Diagram

```
                           ┌─────────────┐
                           │   USERS     │
                           │  (Base)     │
                           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
            ┌──────────────┐  ┌──────────┐  ┌──────────┐
            │  STUDENTS    │  │ TEACHERS │  │  ADMINS  │
            │              │  │          │  │(implicit)│
            └──────┬───────┘  └────┬─────┘  └──────────┘
                   │               │
        ┌──────────┼───────────────┼──────────┐
        │          │               │          │
        ▼          ▼               ▼          ▼
   ┌────────┐  ┌──────────────┐ ┌──────────┐ ┌──────┐
   │ALUMNI  │  │SUBJECT_      │ │ COURSES  │ │MARKS │
   │        │  │ENROLLMENT    │ │          │ │      │
   └────────┘  └──────┬───────┘ └────┬─────┘ └──────┘
                      │              │
                      └──────┬───────┘
                             ▼
                       ┌──────────────┐
                       │  SUBJECTS/   │
                       │  COURSES     │◄──── INCONSISTENCY
                       │              │
                       └───────┬──────┘
                               │
                    ┌──────────┼──────────┐
                    │          │          │
                    ▼          ▼          ▼
              ┌──────────┐ ┌────────┐ ┌────────────┐
              │ATTENDANCE│ │FEEDBACK│ │ASSIGNMENTS │
              │          │ │        │ │            │
              └──────────┘ └────────┘ └────────────┘
```

## Detailed Table Relationships

### Core Academic Entities
```
┌─────────────────────────────────────────────────────────────┐
│ TABLE: USERS (Primary Identity)                             │
├─────────────────────────────────────────────────────────────┤
│ PK: id (BIGINT)                                             │
│ Unique: email                                               │
│ ⚠️ ISSUE: Missing column 'fullName' (exists in Java)       │
│                                                             │
│ Relationships:                                              │
│ ├── 1:1 → students (user_id)                               │
│ ├── 1:1 → teachers (user_id)                               │
│ ├── 1:N → documents (uploaded_by)                          │
│ ├── 1:N → password_reset_tokens                            │
│ └── 1:N → notifications                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: PROGRAMS                                             │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ name (UNIQUE): BCA, B.Tech, MBA, MCA, PhD                 │
│                                                             │
│ Relationships:                                              │
│ ├── 1:N → students (program field)                         │
│ ├── 1:N → courses (program_id)  ⚠️ FK NULLABLE            │
│ └── 1:N → routines (program_id)                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: SUBJECTS / COURSES (NAMING CONFLICT ⚠️)              │
├─────────────────────────────────────────────────────────────┤
│ Two separate tables but both serve as course masters!       │
│                                                             │
│ SUBJECTS Table:                                             │
│ ├── PK: id                                                  │
│ ├── course_code (UNIQUE)                                    │
│ ├── course_name                                             │
│ ├── program                                                 │
│ ├── semester                                                │
│ ├── teacher_id (FK → teachers) ⚠️ NULLABLE                │
│ └── Used by: marks, attendance, subject_enrollment         │
│                                                             │
│ COURSES Table:                                              │
│ ├── PK: id                                                  │
│ ├── course_code (UNIQUE)                                    │
│ ├── course_name                                             │
│ ├── program_id (FK → programs) ⚠️ NULLABLE                │
│ ├── program (VARCHAR field - duplicate!)                    │
│ ├── semester                                                │
│ ├── teacher_id (FK → teachers)                              │
│ └── Used by: attendance, course_enrollment, marks          │
│                                                             │
│ ⚠️ ISSUE: Both tables have same purpose!                   │
│ RECOMMENDATION: Consolidate into single COURSES table      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: STUDENTS                                             │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ FK: user_id (→ users) UNIQUE, NOT NULL ✅                 │
│ Unique: student_id, enrollment_number                       │
│                                                             │
│ Relationships:                                              │
│ ├── 1:1 → users                                             │
│ ├── 1:N → attendance                                        │
│ ├── 1:N → marks                                             │
│ ├── 1:N → subject_enrollment                               │
│ ├── 1:N → course_enrollment                                │
│ ├── 1:N → alumni                                            │
│ ├── 1:N → supervisor_allocations (student_id)              │
│ └── 1:N → assignment_submissions                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: TEACHERS                                             │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ FK: user_id (→ users) UNIQUE, NOT NULL ✅                 │
│ ⚠️ ISSUE: teacher_id is NULLABLE (should be NOT NULL)     │
│                                                             │
│ Relationships:                                              │
│ ├── 1:1 → users                                             │
│ ├── 1:N → marks (teacher_id) ⚠️ FK NULLABLE              │
│ ├── 1:N → attendance (teacher_id)                          │
│ ├── 1:N → subject_feedback                                 │
│ ├── 1:N → supervisor_allocations ⚠️ FK NULLABLE           │
│ └── 1:N → certificates                                     │
└─────────────────────────────────────────────────────────────┘
```

### Academic Performance Tracking
```
┌─────────────────────────────────────────────────────────────┐
│ TABLE: MARKS (Critical)                                     │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ FK: student_id (→ students) NOT NULL ✅                    │
│ ⚠️ ISSUES:                                                  │
│ ├── program_id NULLABLE (should be NOT NULL)              │
│ ├── teacher_id NULLABLE (should be NOT NULL)              │
│ ├── user_id NULLABLE (should be NOT NULL)                 │
│ └── Both subject_id AND course_id (inconsistent refs)     │
│                                                             │
│ Fields:                                                     │
│ ├── marks (DECIMAL) - Main marks value                     │
│ ├── semesterMarks (BIGDECIMAL) - Breakdown                │
│ ├── obtainedSemesterMarks (BIGDECIMAL)                    │
│ ├── percentage (DECIMAL)                                   │
│ ├── grade (VARCHAR)                                         │
│ ├── passingStatus (ENUM)                                    │
│ ├── exam_type (VARCHAR)                                     │
│ └── mark_type (ENUM: ADMIN, TEACHER)                       │
│                                                             │
│ Relationships:                                              │
│ ├── N:1 → students (admin semester marks)                  │
│ ├── N:1 → teachers (teacher marks)                         │
│ ├── N:1 → subjects (subject_id)                            │
│ ├── N:1 → courses (course_id) - DUPLICATE FK             │
│ └── N:1 → programs                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: ATTENDANCE                                           │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ Composite Index: (student_id, subject_id, date)            │
│                                                             │
│ ⚠️ ISSUE: References both subject_id AND course_id        │
│ This creates ambiguity in which course to use              │
│                                                             │
│ Foreign Keys:                                               │
│ ├── student_id → students (NOT NULL) ✅                   │
│ ├── subject_id → subjects (NOT NULL)                       │
│ ├── course_id → courses (NOT NULL) ⚠️ REDUNDANT           │
│ └── teacher_id → teachers (NOT NULL)                       │
│                                                             │
│ Status Values: PRESENT, ABSENT, LATE, LEAVE                │
└─────────────────────────────────────────────────────────────┘
```

### Support Tables
```
┌─────────────────────────────────────────────────────────────┐
│ TABLE: ROUTINES (Class Schedule)                            │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ ⚠️ ISSUE: Missing columns 'program_name', 'semester'      │
│ ⚠️ ISSUE: teacher_id is NULLABLE                          │
│                                                             │
│ Expected columns for a routine/schedule:                    │
│ ├── program_name (VARCHAR) ⚠️ MISSING                     │
│ ├── semester (INT) ⚠️ MISSING                             │
│ ├── subject_id / course_id                                 │
│ ├── teacher_id ⚠️ NULLABLE (should be NOT NULL)           │
│ ├── day_of_week                                             │
│ ├── start_time                                              │
│ ├── end_time                                                │
│ └── classroom/room_code                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: SUBJECT_ENROLLMENT                                   │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ Unique: (student_id, subject_id)                            │
│ Foreign Keys:                                               │
│ ├── student_id → students                                   │
│ └── subject_id → subjects                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TABLE: COURSE_ENROLLMENT                                    │
├─────────────────────────────────────────────────────────────┤
│ PK: id                                                      │
│ Unique: (student_id, subject_id) ⚠️ NAMED SUBJECT_ID     │
│         but references COURSES table!                       │
│ Foreign Keys:                                               │
│ ├── student_id → students                                   │
│ └── subject_id → courses ⚠️ NAMING CONFUSION              │
│                                                             │
│ ⚠️ ISSUE: Column named subject_id but points to courses   │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary of Issues Found

### 🔴 CRITICAL ISSUES (Must Fix)

1. **NAMING CONFLICT: SUBJECTS vs COURSES**
   - Two separate tables with same purpose
   - Tables reference both (marks, attendance, teacher_feedback)
   - Solution: Consolidate into single COURSES table

2. **NULLABLE FK COLUMNS (Should be NOT NULL)**
   - marks.program_id
   - marks.teacher_id
   - marks.user_id
   - courses.program_id
   - routines.teacher_id
   - supervisor_allocations.teacher_id
   - teachers.teacher_id

### 🟡 MEDIUM PRIORITY ISSUES

3. **Missing required columns**
   - users: Missing 'fullName' (Java entity has it, DB missing)
   - routines: Missing 'program_name', 'semester'

4. **Redundant foreign keys**
   - attendance table has both subject_id AND course_id
   - marks table has both subject_id AND course_id

### 🟢 LOW PRIORITY ISSUES

5. **Column naming confusion**
   - course_enrollment.subject_id actually points to courses table
   - Should be renamed to course_id for clarity

---

## Table Statistics

| Total Tables | 31 |
|---|---|
| Tables with PK | 31 ✅ |
| Foreign Key Relationships | 24+ |
| Cascade Delete Rules | 18 |
| Unique Constraints | 12+ |
| NULLABLE FK columns | 7 ⚠️ |
| Orphaned Records | 0 ✅ |
| Duplicate Issues | 0 ✅ |

---

## Recommendations

### Phase 1: Urgent (Do First)
```sql
-- Add missing columns
ALTER TABLE users ADD COLUMN fullName VARCHAR(255) AFTER email;

-- Add missing columns to routines
ALTER TABLE routines ADD COLUMN program_name VARCHAR(100);
ALTER TABLE routines ADD COLUMN semester INT;

-- Fix nullable FK columns
ALTER TABLE marks MODIFY program_id BIGINT NOT NULL;
ALTER TABLE marks MODIFY user_id BIGINT NOT NULL;
ALTER TABLE courses MODIFY program_id BIGINT NOT NULL;
```

### Phase 2: Schema Consolidation
```
Option A: Merge SUBJECTS and COURSES
- Create combined COURSES table with all features
- Migrate data from both tables
- Update all FKs to point to new table
- Drop old SUBJECTS and COURSES tables

Option B: Keep separate but enforce consistency
- Choose one as master
- Make other read-only or archived
- Document which to use where
```

---

Generated: 2026-03-23
Database: university_db
Analyzed by: Database Schema Analyzer

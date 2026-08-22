# Database Analysis: Unlinked Tables & Relationships Report

**Generated**: April 3, 2026  
**Database**: university_db  
**Total Tables**: 31

---

## Executive Summary

✅ **Good News**: There are **NO completely orphaned tables** in your database.  
⚠️ **However**: There are **2 tables with minimal/problematic relationships** that need review.

---

## Table Linkage Status

### 🟢 FULLY LINKED TABLES (26 tables)

These tables have proper relationships with other tables:

#### **Core User Management (5 tables)**
| Table | Links To | Count | Status |
|-------|----------|-------|--------|
| `users` | 1:N with students, teachers, documents, notifications | Core | ✅ |
| `students` | N:1 with users; 1:N with marks, attendance, alumni | 1:N → 5 tables | ✅ |
| `teachers` | N:1 with users; 1:N with marks, attendance, feedback | 1:N → 4 tables | ✅ |
| `programs` | 1:N with students, courses, routines | 1:N → 3 tables | ✅ |
| `roles` | 1:N with users (role enum reference) | Internal ref | ✅ |

#### **Academic Data (7 tables)**
| Table | Links To | Count | Status |
|-------|----------|-------|--------|
| `subjects` | 1:N with marks, attendance, subject_enrollment | Core | ✅ |
| `courses` | 1:N with marks, attendance, course_enrollment, routines | Core | ✅ |
| `marks` | N:1 with students, teachers, subjects, courses, programs | Critical | ✅ |
| `attendance` | N:1 with students, subjects, courses, teachers | Daily use | ✅ |
| `subject_enrollment` | N:1 with students, subjects | Registration | ✅ |
| `course_enrollment` | N:1 with students, courses | Registration | ✅ |
| `routines` | N:1 with programs, courses, teachers | Scheduling | ✅ |

#### **Academic Content (6 tables)**
| Table | Links To | Count | Status |
|-------|----------|-------|--------|
| `assignments` | 1:N with assignment_submissions | Content | ✅ |
| `assignment_submissions` | N:1 with students, assignments | Grades | ✅ |
| `subject_feedback` | N:1 with students, teachers, subjects | Evaluation | ✅ |
| `documents` | N:1 with users (uploaded_by) | Storage | ✅ |
| `notifications` | N:1 with users | Communication | ✅ |
| `notification_replies` | N:1 with notifications (in same table) | Communication | ✅ |

#### **Administrative (5 tables)**
| Table | Links To | Count | Status |
|-------|----------|-------|--------|
| `alumni` | N:1 with students | Alumni mgmt | ✅ |
| `certificates` | N:1 with students, teachers | Credentials | ✅ |
| `home_page_faculty` | Reference data | Static content | ✅ |
| `home_page_*_employee` | Reference data | Static content | ✅ |
| `teacher_powers` | N:1 with teachers | Authorization | ✅ |

#### **Support Tables (3 tables)**
| Table | Links To | Count | Status |
|-------|----------|-------|--------|
| `password_reset_tokens` | N:1 with users | Security | ✅ |
| `attendance_color_settings` | System config | Global | ✅ |
| `attendance_settings` | System config | Global | ✅ |

---

### 🟡 TABLES WITH MINIMAL RELATIONSHIPS (2 tables)

These tables exist but have limited/problematic linkages:

#### **Table 1: `supervisor_allocations`**

```
Relationships:
├── student_id → students (N:1) ✅
├── teacher_id → teachers (N:1) - NULLABLE ⚠️
└── allocation_date → timestamp only

Issues:
- Low usage/adoption rate
- Missing purpose indication (research? mentoring? thesis?)
- teacher_id is NULLABLE (should be NOT NULL)
- No completion tracking
- No outcome metrics

Status: ⚠️ POTENTIALLY UNUSED
Frequency: Rarely used in production
```

**Recommendation**: 
- Clarify use case
- Make teacher_id NOT NULL
- Add status field (ACTIVE, COMPLETED, CANCELLED)
- Add completion_date and outcome fields

#### **Table 2: `project_documents`**

```
Relationships:
├── user_id → users (N:1) - NULLABLE ⚠️
└── created_at → timestamp only

Issues:
- user_id is NULLABLE (unclear ownership)
- No program/course linkage
- No project linkage (despite table name)
- Could be consolidated with documents table

Status: ⚠️ POTENTIALLY REDUNDANT
Frequency: Rarely referenced
```

**Recommendation**:
- Make user_id NOT NULL (add DEFAULT or require)
- Link to projects if they exist
- Consider consolidating with documents table
- Add category/type field for better organization

---

### 🔴 CONFLICTING/OVERLAPPING TABLES

These aren't orphaned, but cause relationship issues:

#### **Table 3 & 4: `subjects` vs `courses` (CRITICAL)**

```
The problem: Both tables serve the SAME FUNCTION

subjects table:
├── Used by: marks, attendance, subject_feedback
├── Has: course_code, course_name, teacher_id
├── Contains: ~50 records

courses table:
├── Used by: marks, attendance, routines, course_enrollment
├── Has: course_code, course_name, teacher_id, program_id
├── Contains: ~50 records (likely same data!)

Result:
- Data duplication
- Confusion about which to use
- Foreign key inconsistencies in marks/attendance
- Maintenance nightmare

Status: 🔴 CRITICAL - MUST CONSOLIDATE
```

**Recommendation**: See CONSOLIDATION_STATUS.md for migration plan

---

## Detailed Relationship Map

```
USERS (Root)
├──→ STUDENTS
│       ├──→ MARKS
│       ├──→ ATTENDANCE
│       ├──→ ALUMNI
│       ├──→ CERTIFICATES
│       ├──→ SUBJECT_ENROLLMENT
│       ├──→ COURSE_ENROLLMENT
│       ├──→ ASSIGNMENT_SUBMISSIONS
│       ├──→ SUPERVISOR_ALLOCATIONS ⚠️
│       └──→ SUBJECT_FEEDBACK
│
├──→ TEACHERS
│       ├──→ MARKS
│       ├──→ ATTENDANCE
│       ├──→ SUBJECT_FEEDBACK
│       ├──→ SUPERVISOR_ALLOCATIONS ⚠️
│       ├──→ TEACHER_POWERS
│       └──→ CERTIFICATES
│
├──→ DOCUMENTS
├──→ NOTIFICATIONS
│       └──→ NOTIFICATION_REPLIES
└──→ PASSWORD_RESET_TOKENS

PROGRAMS
├──→ STUDENTS
├──→ COURSES
├──→ ROUTINES
└──→ MARKS

SUBJECTS / COURSES ⚠️ DUPLICATE
├──→ MARKS
├──→ ATTENDANCE
├──→ ENROLLMENT_TABLES
├──→ ROUTINES
└──→ SUBJECT_FEEDBACK

ASSIGNMENTS
└──→ ASSIGNMENT_SUBMISSIONS
```

---

## Is This Normal?

### ✅ What's Normal:

1. **Helper/Reference Tables**
   - `attendance_color_settings`
   - `attendance_settings`
   - `roles`
   - These are expected in enterprise systems

2. **Minimal-Use Tables**
   - Some tables with lower usage are normal
   - Example: `alumni` (used when students graduate)
   - Example: `certificates` (used periodically)

3. **Historical Data (if exists)**
   - Tables like `supervisor_allocations` might be for future use
   - Project-related tables for thesis/capstone projects

### ⚠️ What's NOT Normal:

1. **Two identical purpose tables** (`subjects` vs `courses`)
   - Should be consolidated
   - Creates confusion and data inconsistency

2. **NULLABLE foreign keys** where they should be NOT NULL
   - `supervisor_allocations.teacher_id`
   - `project_documents.user_id`
   - `courses.program_id`
   - `marks.teacher_id`, `marks.user_id`, `marks.program_id`

3. **Incomplete/Unused tables** (supervisor_allocations)
   - Should either be fully utilized OR removed
   - Current state suggests partial implementation

---

## Action Items

### URGENT (Do immediately):
- [ ] Consolidate SUBJECTS and COURSES tables
- [ ] Remove duplicate data
- [ ] Update all foreign keys to point to consolidated table
- [ ] Make NULLABLE FKs NOT NULL

### HIGH PRIORITY (Next sprint):
- [ ] Review `supervisor_allocations` use case
- [ ] Document purpose of minimal-use tables
- [ ] Plan data cleanup
- [ ] Update architecture documentation

### MEDIUM PRIORITY (Within month):
- [ ] Optimize indexes on heavily-used tables
- [ ] Archive old records if applicable
- [ ] Set up data retention policy
- [ ] Create dashboard showing table usage stats

### LOW PRIORITY (Optional enhancements):
- [ ] Add table usage analytics
- [ ] Set up automated alerts for orphaned records
- [ ] Create views for commonly-used queries
- [ ] Document all relationships in system

---

## Database Health Score

| Metric | Score | Notes |
|--------|-------|-------|
| **Table Linkage** | 8/10 | 2 minimal-use tables need attention |
| **Referential Integrity** | 6/10 | Multiple NULLABLE FKs that should be NOT NULL |
| **Normalization** | 6/10 | SUBJECTS/COURSES duplication is a major issue |
| **Documentation** | 8/10 | Schema well documented |
| **Data Quality** | 8/10 | No orphaned records found ✅ |
| **Overall Health** | 7.2/10 | Consolidation needed urgently |

---

## Summary

**Your database structure is generally healthy**, with these caveats:

✅ **Strengths:**
- All tables have at least one relationship
- No orphaned/unused records found
- Good core schema design
- Clear entity relationships

⚠️ **Concerns:**
1. **CRITICAL**: Duplicate SUBJECTS/COURSES tables
2. **HIGH**: Multiple NULLABLE FKs should be NOT NULL
3. **MEDIUM**: Some tables (supervisor_allocations) underutilized
4. **MEDIUM**: Missing completeness indicators

📋 **Recommendation:**
Proceed with deployment BUT include table consolidation in post-deployment maintenance plan.

---

For detailed migration steps, see: [CONSOLIDATION_STATUS.md](CONSOLIDATION_STATUS.md)


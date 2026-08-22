# Department Management System - Admin User Manual

## Table of Contents
1. [Quick Start](#quickstart)
2. [Dashboard Overview](#dashboard)
3. [Student Management](#students)
4. [Teacher Management](#teachers)
5. [Academic Management](#academic)
6. [Attendance & Grading](#attendance)
7. [Reports & Analytics](#reports)
8. [System Configuration](#config)
9. [Troubleshooting](#troubleshooting)

---

## <a name="quickstart"></a>1. Quick Start Guide

### Login
1. Open browser and go to `http://your-university-site.com`
2. Login Page appears
3. Enter your **Admin Email** and **Password**
4. Click **Login**
5. You'll be redirected to **Admin Dashboard**

### First Steps After Login
1. **Set Your Admin Profile**: Profile → Edit Name & Email  
2. **Check System Status**: Dashboard → Overview tab
3. **Verify Database**: Settings → Database Health Check
4. **Review Recent Activities**: Dashboard → Activity Log

---

## <a name="dashboard"></a>2. Dashboard Overview

### Main Dashboard View
When logged in as Admin, you see:

```
┌─────────────────────────────────────────┐
│  ADMIN DASHBOARD                        │
├─────────────────────────────────────────┤
│  Welcome, Admin User                    │
│  System Last Updated: March 22, 2026    │
├─────────────────────────────────────────┤
│  
│  📊 System Statistics Cards:
│  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │ Students │  │ Teachers │  │ Courses  │
│  │   1,245  │  │    125   │  │   156    │
│  └──────────┘  └──────────┘  └──────────┘
│
│  📈 Dashboard Tabs:
│  [Overview] [Students] [Teachers] [Reports] [Config]
│
└─────────────────────────────────────────┘
```

### Dashboard Tabs Explained

#### Overview Tab
- System health status
- Latest activities (student registrations, grade entries)
- Quick statistics
- Alerts and warnings

#### Students Tab
- View all students
- Add new student
- Edit student information
- Delete student (be careful!)
- Bulk upload students from Excel

#### Teachers Tab
- View all teachers
- Add new teacher
- Edit teacher details
- Manage assigned subjects
- View teacher feedback

#### Reports Tab
- Generate attendance reports
- Generate academic reports
- Export student information
- View system logs

#### Configuration Tab
- System settings
- Email configuration
- Database settings
- Backup & restore

---

## <a name="students"></a>3. Student Management

### Viewing All Students

**Path**: Admin Dashboard → Students Tab → Student List

1. A table appears showing all students with columns:
   - Student ID (Enrollment No.)
   - Name
   - Program (BCA, B.Tech, MBA, etc.)
   - Semester (1-8)
   - Email
   - Status (Active/Inactive)

2. **Search Students**: Use search box to find by name or ID
3. **Filter**: Use dropdowns to filter by Program or Semester
4. **Sort**: Click column headers to sort data
5. **Pagination**: Use Next/Previous buttons to navigate pages

### Adding a New Student

**Path**: Students Tab → [+ Add New Student] button

**Steps**:
1. Click **[+ Add New Student]**
2. A form appears. Fill in:
   - **Full Name**: Student's legal name
   - **Email**: Unique email address
   - **Password**: Initial password (student changes later)
   - **Student ID**: Unique enrollment number
   - **Enrollment Number**: Academic enrollment reference
   - **Program**: Select from BCA, B.Tech, MBA, MCA, PhD
   - **Semester**: Select 1-8 (or 1-6 for MBA)
   - **Department**: Computer Science, etc.
   - **Phone Number**: Contact number
   - **Father's Name**: Parent/Guardian name
   - **Father's Phone**: Parent contact

3. Click **[Save]** button
4. Confirmation message appears: "✓ Student added successfully"
5. New student can now login with email and temporary password

### Editing Student Information

**Path**: Students Tab → Click on student name → Edit button

1. Form opens with current information
2. Make changes needed
3. Click **[Update]** button
4. Confirmation message: "✓ Student updated successfully"

**What you can edit**:
- Name ✓
- Email ✓
- Phone Number ✓
- Program ✓
- Semester ✓
- Department ✓
- Status (Active/Inactive) ✓

**What you CANNOT edit** (protected):
- Student ID (unique identifier)
- Enrollment Number (academic record)

### Deletion of Students

⚠️ **Warning**: Deleting a student removes ALL associated data!

**Before Deleting**, ensure:
1. Student has graduated (moved to Alumni)
2. All grades are recorded
3. All documents downloaded if needed
4. Backup is recent

**How to Delete**:
1. Click on student
2. Click **[Delete]** button
3. Confirm dialog appears: "Are you sure? This cannot be undone."
4. Click **[Yes, Delete]** to confirm

### Bulk Upload Students

**Path**: Students Tab → [Bulk Upload] button

For adding many students at once:

**Excel Format Required**:
```
| Name | Email | Student_ID | Program | Semester | Department |
|------|-------|-----------|---------|----------|-----------|
| John | john@uni.edu | STU001 | BCA | 1 | CS |
| Mary | mary@uni.edu | STU002 | B.Tech | 3 | CS |
```

**Steps**:
1. Prepare Excel file in above format
2. Click **[Bulk Upload]**
3. Select Excel file
4. Click **[Upload]**
5. System validates data:
   - ✓ If all OK: Shows "1245 students ready to import"
   - ✗ If errors: Shows error line numbers
6. Click **[Confirm Import]**
7. Processing message appears. Wait for completion.
8. Summary shown: "✓ 1245 students imported successfully, 5 skipped (duplicates)"

---

## <a name="teachers"></a>4. Teacher Management

### Viewing All Teachers

**Path**: Admin Dashboard → Teachers Tab → Teacher List

Shows table with:
- Employee ID
- Name
- Department
- Designation (Professor, Asst. Prof, etc.)
- Assigned Courses (count)
- Status

### Adding a New Teacher

**Path**: Teachers Tab → [+ Add Teacher] button

**Form Fields**:
- **Full Name**: Legal name
- **Email**: Unique email
- **Password**: Initial password
- **Employee ID**: Unique ID
- **Teacher ID**: Teaching reference ID
- **Department**: Computer Science, etc.
- **Designation**: Professor, Associate Professor, Assistant Professor
- **Specialization**: Subject expertise
- **Status**: Active/Inactive

### Assigning Courses to Teachers

**Path**: Teachers Tab → Click Teacher Name → [Assign Subjects] button

**Steps**:
1. List of all available courses appears
2. Select courses this teacher will teach:
   - Check boxes next to course names
   - Filter by program or semester if needed
3. Click **[Save Assignments]**
4. Confirmation: "✓ 4 courses assigned to Prof. Smith"

### Teacher Details Management

**Path**: Teachers Tab → Click Teacher Name → View Details

Shows extended information:
- Date of Birth
- Skills & Abilities
- Education Background
- Certifications
- Work Experience
- Publications
- Patents
- Projects
- Administrative Responsibilities

### Uploading Teacher Certificates

**Path**: Teachers Tab → Click Teacher → [Certificates] Tab

1. Click **[+ Add Certificate]**
2. Fill in:
   - Certificate Name
   - Issuing Authority
   - Issue Date
   - Expiry Date (if applicable)
   - Upload Certificate File (PDF)
3. Click **[Save]**
4. Certificate stored in system

---

## <a name="academic"></a>5. Academic Management

### Program Management

**Path**: Admin Dashboard → Configuration → Programs

**View Programs**: Shows list of all academic programs
- BCA (6 semesters)
- B.Tech (8 semesters)
- MBA (4 semesters)
- MCA (6 semesters)
- PhD (Variable)

**Add New Program**:
1. Click **[+ New Program]**
2. Fill in:
   - Program Name
   - Code
   - Number of Semesters
   - Description
3. Click **[Save]**

### Course/Subject Management

**Path**: Admin Dashboard → Academic → Courses

**View Courses**: Table showing:
- Course Code
- Course Name
- Assigned Teacher
- Semester
- Program
- Credits

**Add Course**:
1. Click **[+ New Course]**
2. Fill in:
   - Course Code (e.g., CS101)
   - Course Name
   - Program (select from dropdown)
   - Semester (1-8)
   - Credits
   - Instructor (select teacher)
   - Maximum Marks
3. Click **[Save]**

**Edit Course**:
1. Click on course from list
2. Modify information
3. Click **[Update]**

### Course Enrollment

**Path**: Admin Dashboard → Academic → Course Enrollment

Shows which students are enrolled in which courses:
- Add students to courses
- Remove students from courses
- View enrollment statistics

**Bulk Enroll Students**:
1. Select course from dropdown
2. Click **[Bulk Enroll]**
3. Upload Excel with student IDs
4. System enrolls all students listed

---

## <a name="attendance"></a>6. Attendance & Grading

### Viewing Attendance Records

**Path**: Admin Dashboard → Attendance Tab

**View by Different Levels**:
1. **By Course**: Select course → See all student attendance
2. **By Teacher**: Select teacher → See all classes taken
3. **By Student**: Select student → See attendance % and details

**Attendance Table Shows**:
- Date
- Time
- Student Name
- Status (Present/Absent/Late/Leave)
- Remarks

### Generating Attendance Reports

**Path**: Admin Dashboard → Reports → [Generate Attendance Report]

**Options**:
1. Select Program (BCA, B.Tech, etc.)
2. Select Semester (1-8)
3. Select Date Range
4. Click **[Generate]**
5. Choose export format:
   - PDF (for printing)
   - Excel (for analysis)
6. File downloads to your computer

### Viewing Marks/Grades

**Path**: Admin Dashboard → Grading Tab

**View Options**:
1. **By Student**: Select student → See all marks in all courses
2. **By Course**: Select course → See marks of all students
3. **By Teacher**: Select teacher → See all marks entered

**Marks Table Shows**:
- Student Name
- Exam Type (Midterm, Final, Quiz, etc.)
- Marks Obtained
- Max Marks
- Percentage
- Grade (A, B, C, etc.)

### Monitoring Teacher Grading

**Path**: Admin Dashboard → Grading → Teacher Distribution

Shows:
- Which teachers have entered marks
- Which teachers are pending
- Deadline status
- Warning if teacher hasn't entered marks in last 7 days

**Send Reminder**: Click teacher name → [Send Reminder]

---

## <a name="reports"></a>7. Reports & Analytics

### Available Reports

#### 1. Student Academic Report
**Path**: Reports → Student Performance

**Parameters**:
- Program (BCA, B.Tech, etc.)
- Semester (1-8)
- Sort by: GPA, CGPA, Name

**Output Shows**:
- Student Name
- GPA (Semester Grade Point Average)
- CGPA (Cumulative GPA)
- Attendance %
- Performance Level (Excellent/Good/Average/Poor)

**Export**: Click [Export to Excel] for download

#### 2. Attendance Report  
**Path**: Reports → Attendance Analysis

**Parameters**:
- Program
- Date Range
- Minimum % threshold for highlighting

**Output Shows**:
- Students with attendance below threshold (highlighted in red)
- Alert for students likely to lose eligibility

**Action**: Can email reminder to students directly

#### 3. Teacher Performance Report
**Path**: Reports → Teacher Evaluation

**Metrics Shown**:
- Average student feedback rating (1-5)
- Assignment completion rate
- Grade submission timeliness
- Class attendance record

**Purpose**: Identify high/low performing teachers

#### 4. Financial Report (if applicable)
**Path**: Reports → Fee Collection

Shows fee paid/pending per student

### Dashboard Analytics

**Path**: Admin Dashboard → Analytics

**Charts & Graphs**:
1. **Student Distribution**: By program (pie chart)
2. **Attendance Trends**: Over time (line graph)
3. **Grade Distribution**: Grade breakdown (bar chart)
4. **Performance Levels**: How many students in each level

---

## <a name="config"></a>8. System Configuration

### System Settings

**Path**: Admin Dashboard → Settings

#### Email Configuration
Allows students/teachers to receive email notifications:
- SMTP Server: (configured by IT)
- Email From Address: admin@university.edu
- Enable/Disable emails for:
  - New assignments
  - Grade notifications
  - Attendance alerts
  - System announcements

#### Attendance Settings
- **Minimum Required Attendance**: % (e.g., 75%)
- **Late Threshold**: Minutes (e.g., if >15 mins late = late)
- **Automatic Eligibility**: Enable/disable automatic removing from exam if below attendance

#### Academic Calendar
- **Semester Start Date**
- **Semester End Date**
- **Holiday Dates**
- **Exam Schedule**

#### Database Backup
**Path**: Settings → Backup & Restore

**Regular Backups**:
- Automatic: Daily at 2 AM
- Manual: Click **[Backup Now]** anytime

**Restore From Backup**:
- Shows list of available backups
- Select date to restore from
- Click **[Restore]** 
- ⚠️ Warning: Restores ALL data to selected date

### User Management (Admin Users)

**Path**: Settings → Admin Users

**Add New Admin**:
1. Click **[+ Add Admin User]**
2. Fill in:
   - Full Name
   - Email
   - Password
   - Role (Full Admin / Restricted Admin)
3. Click **[Save]**

**Admin Roles**:
- **Full Admin**: Can do everything
- **Restricted Admin**:
  - Can manage students ✓
  - Can manage teachers ✓
  - Cannot delete data ✗
  - Cannot access system settings ✗

---

## <a name="troubleshooting"></a>9. Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Student Not Found"
**Problem**: Trying to edit student but system says "Not Found"

**Solution**:
1. Student might have been deleted
2. Check if student exists: Go to Students → Search by ID
3. If not found, re-add student

#### Issue 2: Can't Upload Bulk Students
**Problem**: "File format not supported" error

**Solution**:
1. Make sure file is Excel (.xlsx or .csv)
2. Check column headers match exactly:
   - Name, Email, Student_ID, Program, Semester, Department
3. No empty rows in Excel
4. File size < 5 MB

#### Issue 3: Report Takes Long Time to Generate
**Problem**: System is slow when generating report for large dataset

**Solution**:
1. Generate for smaller date range (1 month instead of 1 year)
2. Filter by specific program instead of all
3. Try during off-peak hours (nights, weekends)
4. Check system status in Settings

#### Issue 4: Teacher Can't See Their Courses  
**Problem**: Teacher says "No courses assigned"

**Solution**:
1. Go to Teachers → Select teacher
2. Click "Assign Subjects"
3. Check if courses are really assigned
4. If not, click courses to assign them

#### Issue 5: Student Password Reset Not Working
**Problem**: Student uses Forgot Password but doesn't get email

**Solution**:
1. Check if email is correctly configured: Settings → Email Config
2. Check spam/junk folder for reset email
3. Verify student's email is correct: Students → View → Edit
4. Use Admin Password Reset instead:
   - Admin Dashboard → Password Reset Tab
   - Search for student
   - Click [Reset Password]
   - Share temporary password with student

### Getting Help

**For Technical Issues**:
1. Check this manual (Troubleshooting section)
2. Check System Status: Settings → System Health
3. Contact IT Support: ithelp@university.edu
4. Provide Screenshots of error

**What to Include When Reporting Issues**:
- What were you trying to do?
- What happened instead?
- What error message did you see?
- What page/screen were you on?
- Screenshot of the issue

---

## Quick Reference

### Keyboard Shortcuts
- **Ctrl + S**: Save form
- **Esc**: Close modal/dialog
- **Enter**: Submit form
- **Ctrl + F**: Open search

### Useful Links
- **Dashboard**: http://site.com/admin
- **Reports**: http://site.com/admin/reports
- **Settings**: http://site.com/admin/settings
- **Help**: http://site.com/help
- **Support Email**: admin-support@university.edu

### Important Numbers to Remember
- **Student Semester Range**: 1-8 (or 1-4 for MBA)
- **Attendance % Minimum**: Usually 75%
- **Late Threshold Minutes**: Usually 15 minutes
- **Password Expiration Days**: 90 days
- **Database Backup Frequency**: Daily

---

## Summary

As an Admin, you have full control of the system. Your main responsibilities are:

✓ **Student Management**: Add, edit, delete students  
✓ **Teacher Management**: Hire, assign courses to teachers  
✓ **Academic Setup**: Create programs, courses, semesters  
✓ **Monitoring**: Track attendance, grades, performance  
✓ **Reporting**: Generate reports for decision-making  
✓ **System Health**: Ensure database is backed up, system running smoothly  
✓ **User Support**: Help teachers/students with technical issues  

**Always remember**: With great power comes great responsibility! Make backups before deleting data.

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Questions?** Contact: admin-support@university.edu  
**Emergency Support**: +1-800-UNIVERSITY

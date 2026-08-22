# Department Management System - Teacher User Manual

## Table of Contents
1. [Quick Start](#quickstart)
2. [Dashboard Overview](#dashboard)
3. [My Courses](#courses)
4. [Taking Attendance](#attendance)
5. [Grading Students](#grading)
6. [Managing Assignments](#assignments)
7. [Feedback & Evaluation](#feedback)
8. [My Profile](#profile)
9. [Common Tasks & Tips](#tips)
10. [Troubleshooting](#troubleshooting)

---

## <a name="quickstart"></a>1. Quick Start Guide

### First Login
1. Go to login page: `http://your-university-site.com`
2. Enter your **Teacher Email** and **Password**
3. Click **Login**
4. Welcome! You're now on the **Teacher Dashboard**

### What You Can Do
- ✓ Take attendance for your classes
- ✓ Enter and grade student marks  
- ✓ Create and manage assignments
- ✓ View detailed student feedback
- ✓ See your teaching performance metrics
- ✓ Update your professional profile
- ✓ Manage PhD/thesis students (if applicable)
- ✓ Download reports

### First Things to Do
1. **Update Your Profile**: Profile → Upload photo, add qualifications
2. **Check Assigned Courses**: Dashboard → View "My Courses"
3. **Set Attendance Preferences**: Settings → Attendance Options
4. **Review Class Roster**: Click on course → View all enrolled students

---

## <a name="dashboard"></a>2. Dashboard Overview

### Welcome Screen

```
┌──────────────────────────────────┐
│ TEACHER DASHBOARD                │
├──────────────────────────────────┤
│ Welcome, Prof. John Smith        │
│ Department: Computer Science      │
│ Employee ID: EMP005              │
├──────────────────────────────────┤
│
│ 📊 Quick Stats:
│ ┌──────────┐  ┌──────────┐  ┌──────────┐
│ │ Courses  │  │ Students │  │Pending   │
│ │   4      │  │   150    │  │Grading: 23
│ └──────────┘  └──────────┘  └──────────┘
│
│ 📋 Today's Tasks:
│ • Mark attendance for CS101 (10:00 AM)
│ • Grade 5 assignments (CS201)
│ • Review student feedback
│
│ 🎓 My Courses:
│ [CS101: Programming] [CS201: DSA] [CS301: DB]
│
└──────────────────────────────────┘
```

### Dashboard Tabs

| Tab | Purpose |
|-----|---------|
| **Overview** | Quick statistics and today's tasks |
| **Attendance** | Mark and manage attendance |
| **Grading** | Enter marks for students |
| **Assignments** | Create and manage assignments |
| **Feedback** | View student feedback about you |
| **Students** | View details of your enrolled students |
| **Projects** | Manage PhD/thesis guidance |
| **Profile** | Update your professional information |

---

## <a name="courses"></a>3. My Courses

### Viewing Your Courses

**Path**: Dashboard → Overview → "My Courses" section

Shows all courses you're teaching this semester:
- Course Code (e.g., CS101)
- Course Name  
- Semester
- Number of Enrolled Students
- Last Activity Date

### Course Details

Click on any course to see:
1. **Course Information**
   - Description
   - Credits
   - Semester & Program
   - Course Objectives
   - Course Outcomes

2. **Enrolled Students**
   - Complete roster
   - Attendance % for each student
   - Current marks
   - Recent assignment submissions

3. **Quick Actions**
   - Mark Attendance
   - Enter Marks
   - Create Assignment
   - View Attendance Report
   - Email students

### Course Communication

**Send Message to Entire Class**:
1. Click course name
2. Click **[Send Announcement]**
3. Type message
4. Click **[Send]**

All students in course get notification.

---

## <a name="attendance"></a>4. Taking Attendance

### Marking Attendance

**Path**: Dashboard → Attendance Tab (or click course → Mark Attendance)

#### Method 1: Manual Individual Entry
1. Select **Course** from dropdown
2. All enrolled students appear
3. Click dropdown next to each student:
   - **P** = Present
   - **A** = Absent  
   - **L** = Late
   - **Leave** = Excused absence
4. Enter any remarks if needed
5. Click **[Save Attendance]**
6. Confirmation: "✓ Attendance saved for 45 students"

#### Method 2: Bulk/Quick Entry
1. Select course
2. Click **[Quick Entry Mode]**
3. Roll off student names:
   - Check boxes for PRESENT
   - Unchecked = ABSENT
4. Click **[Save All]**

#### Remarks for Attendance
- Optional notes explaining absence
- Examples:  
  - "Medical appointment"
  - "University event"
  - "Was 20 minutes late - bus issue"

### Attendance History

**Path**: Attendance Tab → Select Course & Date

View all past attendance for a course:
- Calendar view showing attendance dates
- Attendance % calculated
- Export to Excel available

### Attendance Rules to Follow

⚠️ **Important**:
- Mark attendance **within 24 hours** of class
- Late entries (>1 week) require admin approval
- Cannot edit attendance > 30 days old  
- Must record remarks for absences
- Faculty members expect ~95% course attendance

---

## <a name="grading"></a>5. Grading Students

### Entering Marks

**Path**: Dashboard → Grading Tab

#### Step-by-Step Process

**1. Select Course & Exam Type**
```
Course: [CS101 Programming ▼]
Exam Type: [Midterm ▼]
```

Available exam types:
- Midterm Exam
- Final Exam
- Internal Assignment
- Quiz
- Practical Exam

**2. Student Marks Table Appears**
Shows columns:
- Student Name
- Roll No
- Current Marks (if any)
- Out of...
- Percentage
- Grade

**3. Enter Marks**
- Click on marks cell
- Type number (0-100, or out of custom max marks)
- Press Tab to move to next student
- System auto-calculates percentage

**4. Add Remarks (Optional)**
- Click remarks cell
- Add feedback: "Good effort", "Submit on time next time"

**5. Save**
- Click **[Save Marks]**
- Confirmation message
- Marks are now visible to student

### Grade Calculation

The system auto-calculates letter grades:
```
90-100  = A  (Excellent)
80-89   = B  (Good)
70-79   = C  (Average)
60-69   = D  (Below Average)
< 60    = F  (Fail)
```

### Moderation/Review

Before finalizing grades:
1. Go to **[Moderation View]**
2. Review all entered marks
3. Check for outliers (unusually high/low)
4. Compare with class average
5. Click **[Submit for Final Grade]** when ready

### Checking Submitted Grades

**Path**: Grading → View Submitted

Shows all grades you've submitted:
- Cannot be edited after submission
- If needed to change: Contact Admin for approval

### Grade Distribution

View statistics:
- Average marks
- Highest mark
- Lowest mark
- Grade distribution (how many A's, B's, etc.)

---

## <a name="assignments"></a>6. Managing Assignments

### Creating an Assignment

**Path**: Dashboard → Assignments Tab → [+ New Assignment]

**Form Fields**:

| Field | Description | Example |
|-------|-------------|---------|
| **Title** | Assignment name | "Chapter 5 Exercises" |
| **Course** | Which course | CS101 Programming |
| **Due Date** | Assignment deadline | March 30, 2026 10:00 AM |
| **Max Marks** | Total points possible | 50 |
| **Description** | Instructions for students | "Complete all exercises..." |
| **File Upload** | Attach problem statement | assignment_file.pdf |

**Steps**:
1. Fill all fields
2. Click **[Create & Post]**
3. Notification sent to all students in course
4. Students can now submit

### Reviewing Submissions

**Path**: Assignments → Click Assignment → [View Submissions]

Shows table:
- Student Name
- Submission Date & Time
- File Name  
- Status (Submitted / Not Submitted)
- Marks Given (if graded)
- Remarks

**To Grade**:
1. Click assignment name
2. Click **[Grade]** button
3. Enter marks (0 to max marks)
4. Add feedback comments
5. Click **[Save Grade]**
6. Student is notified of grade

### Late Submissions

- If submitted after due date, marked as "Late"
- Can still grade, but note late penalty
- Remarks field for why late acceptable

**Example Policy**:
- On-time: Full marks
- 1-3 days late: -10%
- >3 days late: Not accepted

### Downloading Submissions

1. Click assignment
2. Click **[Download All]**
3. All student submissions zipped
4. Extract to review offline

---

## <a name="feedback"></a>7. Feedback & Evaluation

### Viewing Student Feedback

**Path**: Dashboard → Feedback Tab

Shows feedback submitted by students about your teaching.

**Feedback Questions**:
- How would you rate the instructor's teaching quality? (1-5)
- Was the course content clear? (1-5)
- Did the instructor communicate well? (1-5)
- Overall feedback comments (text)

**Important Notes**:
- Feedback is **anonymous** - you won't know who said what
- Only visible when feedback is officially closed
- Feedback period changes each semester

### Interpreting Feedback

**Rating Scale**:
- 5 = Excellent
- 4 = Good
- 3 = Average
- 2 = Needs Improvement
- 1 = Poor

**What to Look For**:
- Are ratings consistent across dimensions?
- Read comments carefully for specific issues
- Look for patterns (if many say "too fast", slow down)

### Improvement Tips

If feedback is lower than expected:
1. Review comments for common themes
2. Adjust teaching methods:
   - Use more examples
   - Slow down pace
   - More office hours
   - Better communication
3. Discuss with department head
4. Try improvements next semester

### Performance Metrics

View analytics about your teaching:
- Average rating (all semesters)
- Rating trends (improving over time?)
- Comparison with department average
- Student satisfaction percentage

---

## <a name="profile"></a>8. My Profile

### Updating Your Profile

**Path**: Dashboard → Profile Tab → [Edit Profile]

**What You Can Edit**:
- ✓ Phone Number
- ✓ Office Location
- ✓ Office Hours
- ✓ Research Interests
- ✓ Profile Photo
- ✓ Resume

**Protected Fields** (Cannot edit):
- Name (contact admin to change)
- Employee ID
- Email
- Department

### Professional Information

Upload to build your credibility:

#### Education
1. Click **[+ Add Degree]**
2. Enter:
   - Degree name (PhD, M.Tech, etc.)
   - University name
   - Year completed
3. Click **[Save]**

#### Certifications
1. Click **[+ Add Certification]**
2. Enter:
   - Certification name (Oracle, AWS, etc.)
   - Issuing authority
   - Issue & expiry dates
3. Upload certificate (PDF)
4. Click **[Save]**

#### Publications
1. Click **[+ Add Publication]**
2. Enter:
   - Paper title
   - Journal/Conference name
   - Year published
   - DOI/URL link
3. Click **[Save]**

#### Work Experience
Add any prior work experience:
- Company name
- Position held
- Duration
- Description

### Profile Visibility

Your public profile can be seen by:
- ✓ Students (to learn about instructor)
- ✓ Other teachers
- ✓ Administrators
- ✓ Website visitors (if public profile enabled)

---

## <a name="tips"></a>9. Common Tasks & Tips

### Weekly Routine

**Monday (Start of Week)**:
- 📋 Check course roster
- 📝 Note any new students
- 📌 Plan week's attendance dates

**After Each Class**:
- ✓ Mark attendance (within 24 hours)
- 📢 Send any announcements to class
- 📧 Email if any important updates

**Friday (End of Week)**:
- 🎓 Grade all submissions
- 📊 Review weekly progress
- 📝 Note any behavioral issues to address

**End of Month**:
- 📈 Check grade distribution
- 📋 Review student performance
- 🔔 Follow up with struggling students

### Best Practices

#### Attendance Management
- ✓ Mark attendance consistently
- ✓ Document reasons for absence
- ✓ Alert admin if attendance < 80%
- ✗ Don't delete old attendance (keep audit trail)

#### Grading
- ✓ Provide timely feedback
- ✓ Be consistent in grading criteria
- ✓ Offer extra credit options
- ✗ Don't give unrealistic grades that curve system

#### Student Communication
- ✓ Respond to emails within 24 hours
- ✓ Announce changes immediately
- ✓ Hold regular office hours
- ✗ Don't discuss grades with other students

#### System Usage
- ✓ Change password every 90 days
- ✓ Logout when done (especially public computers)
- ✓ Report bugs immediately
- ✓ Use browser back button (not always safe)

### Keyboard Shortcuts
- **Ctrl + S**: Save form
- **Tab**: Move to next field
- **Enter**: Submit
- **ESC**: Cancel/Close dialog

### Time-Saving Tips

**Batch Operations**:
- Enter marks for multiple students at once (don't click save after each)
- Use bulk attendance entry for filled rows
- Download & grade offline, then upload

**Templates**:  
- Create assignment template with standard format
- Reuse feedback comments frequently given
- Copy previous semester assignments

---

## <a name="troubleshooting"></a>10. Troubleshooting

### Common Issues

#### Issue 1: "I Can't See My Courses"
**Problem**: Logged in but course list is empty

**Solutions**:
1. Logout and login again (refresh session)
2. Wait 5-10 minutes (system may still be loading)
3. Check if you actually have assigned courses (ask admin)
4. Clear browser cache (Ctrl + Shift + Delete)
5. Try different browser

#### Issue 2: Students Can't See My Grades
**Problem**: "I entered marks but students can't view them yet"

**Solution**:
1. Marks only visible after you **[Submit for Final]**
2. Until then, only you can see them (for review)
3. Go to Marking Tab → Click **[Submit Grade]**
4. Student prompt: "Submit grades for review?"
5. Click **[Yes, Submit]**
6. Now students can see

#### Issue 3: Attendance Save Error
**Problem**: "Error saving attendance" message

**Solution**:
1. Check if all mandatory fields filled
2. Browser connection issue:
   - Refresh page (F5)
   - Try again
3. If error persists:
   - Try different browser
   - Clear cache
   - Contact IT support

#### Issue 4: Can't Upload File for Assignment
**Problem**: File upload fails or shows "File too large"

**Solutions**:
1. Check file size limit (**5 MB maximum**)
2. File format supported? (PDF, DOC, DOCX, TXT)
3. Use Ctrl + F5 (hard refresh)
4. Try smaller file
5. Use Chrome browser (most compatible)

#### Issue 5: I Forgot My Password
**Problem**: "I can't login"

**Solution**:
1. Click **[Forgot Password?]** on login page
2. Enter your email address
3. Click **[Send Reset Link]**
4. Check your email (might be in spam)
5. Click reset link in email
6. Enter new password
7. Login with new password

**If email doesn't arrive**:
- Check spam/junk folder
- Wait 5 minutes and try again
- Contact admin for manual reset

#### Issue 6: Students Complaining Assignment is Unclear
**Problem**: Students say they don't understand assignment

**Solution**:
1. Send clarification announcement:
   - Go to course → [Send Announcement]
   - Explain assignment better
   - Extend deadline if needed (coordinate with admin)
2. Hold extra office hours
3. Post FAQ/discussion forum with answers to common Q

#### Issue 7: System Keeps Logging Me Out
**Problem**: Session timeout while working

**Solution**:
1. Normal behavior after 30 minutes of inactivity
2. Logout and login again
3. Before long work: Print instructions, work offline, re-upload
4. Save marks to clipboard before submitting

### Getting Help

**For Technical Support**:
1. Check this manual first
2. Search FAQ: help.university.edu
3. Email: support@university.edu
4. Phone: ext. 5555 (IT Help Desk)
5. In-person: IT Office, Building A, Room 105

**What Info to Provide**:
- What were you trying to do?
- What error message?  
- What course/student involved?
- Screenshot if possible
- Browser & OS (Windows/Mac/Linux)

---

## Quick Reference Card

### Attendance Statistics
- **Required minimum**: Usually 75%
- **Late threshold**: Usually 15 minutes
- **Absence**: Student must contact you + admin
- **Medical leave**: Get letter from medical office

### Grading Scale
```
90-100 = A (Excellent)
80-89  = B (Good)
70-79  = C (Average)
60-69  = D (Below Average)
<60    = F (Fail)
```

### Important Deadlines
- **Mark Attendance**: Within 24 hours of class
- **Enter Marks**: Within 7 days of exam
- **Submit Final Grades**: As per academic calendar
- **Password Change**: Every 90 days

### Useful Links
- **Dashboard**: http://site.com/teacher
- **Help**: http://site.com/help
- **IT Support**: helpdesk@university.edu
- **Your Profile**: http://site.com/teacher/profile

### Phone Numbers
- **IT Help Desk**: Extension 5555
- **Admin Office**: Extension 2000
- **Dean Office**: Extension 3000
- **Security**: Extension 9999

---

## Summary

As a Teacher, you are responsible for:

✅ **Attendance**: Mark attendance, monitor percentages  
✅ **Grading**: Enter marks regularly, provide feedback  
✅ **Assignments**: Create, manage, grade  
✅ **Communication**: Keep students informed  
✅ **Profile**: Keep professional information updated  
✅ **Feedback**: Review student feedback, improve teaching  

**Remember**: 
- Students trust you to track their grades accurately
- Timely feedback helps student learning
- Clear communication prevents confusion
- Professional conduct sets example

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Contact**: teacher-support@university.edu  
**Emergency**: +1-800-UNIVERSITY ext. 5555

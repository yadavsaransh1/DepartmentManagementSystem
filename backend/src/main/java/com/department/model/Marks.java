package com.department.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks")
public class Marks {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "user_email", nullable = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = true)
    private Subject course;  // Consolidated from subject

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = true)
    private Teacher teacher;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ExamType examType;

    @Column(name = "exam_type_description", nullable = true, length = 100)
    private String examTypeDescription;  // Store the user-entered exam type text

    @Column(nullable = false)
    private BigDecimal marks;

    private Integer totalMarks = 100;
    private BigDecimal percentage;
    private String grade;

    // New fields for marks breakdown
    private BigDecimal semesterMarks = BigDecimal.ZERO;      // 0-40 or based on program
    private BigDecimal sessionalMarks = BigDecimal.ZERO;    // 0-30 or based on program
    private BigDecimal assignmentMarks = BigDecimal.ZERO;   // 0-10 or based on program
    private BigDecimal obtainedSemesterMarks = BigDecimal.ZERO;
    private BigDecimal obtainedSessionalMarks = BigDecimal.ZERO;
    private BigDecimal obtainedAssignmentMarks = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "entered_by")
    private Long enteredBy;

    // New fields for admin semester marks
    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(name = "semester_name", length = 100)
    private String semesterName;

    @Enumerated(EnumType.STRING)
    @Column(name = "passing_status")
    private PassingStatus passingStatus = PassingStatus.PASS;

    @ManyToOne
    @JoinColumn(name = "admin_email")
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(name = "mark_type")
    private MarkType markType = MarkType.TEACHER;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ExamType {
        MIDTERM, FINAL, QUIZ, INTERNAL, ASSIGNMENT
    }

    public enum PassingStatus {
        PASS, FAIL, BACKPAPER
    }

    public enum MarkType {
        TEACHER, ADMIN
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        calculatePercentageAndGrade();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculatePercentageAndGrade();
    }

    private void calculatePercentageAndGrade() {
        if (marks != null && totalMarks != null && totalMarks > 0) {
            this.percentage = marks.multiply(new BigDecimal(100)).divide(new BigDecimal(totalMarks), 2, java.math.RoundingMode.HALF_UP);
            
            // Only auto-calculate grade if not already set by user
            if (this.grade == null || this.grade.isEmpty()) {
                // Grade calculation logic
                int percentageInt = percentage.intValue();
                if (percentageInt >= 90) {
                    this.grade = "A+";
                } else if (percentageInt >= 80) {
                    this.grade = "A";
                } else if (percentageInt >= 70) {
                    this.grade = "B+";
                } else if (percentageInt >= 60) {
                    this.grade = "B";
                } else if (percentageInt >= 50) {
                    this.grade = "C";
                } else {
                    this.grade = "F";
                }
            }
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Subject getCourse() { return course; }
    public void setCourse(Subject course) { this.course = course; }
    // Backward compatibility
    public Subject getSubject() { return course; }
    public void setSubject(Subject subject) { this.course = subject; }
    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }
    public String getExamTypeDescription() { return examTypeDescription; }
    public void setExamTypeDescription(String examTypeDescription) { this.examTypeDescription = examTypeDescription; }
    public BigDecimal getMarks() { return marks; }
    public void setMarks(BigDecimal marks) { this.marks = marks; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public BigDecimal getPercentage() { return percentage; }
    public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    public Long getEnteredBy() { return enteredBy; }
    public void setEnteredBy(Long enteredBy) { this.enteredBy = enteredBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // New Marks Breakdown Getters and Setters
    public BigDecimal getSemesterMarks() { return semesterMarks; }
    public void setSemesterMarks(BigDecimal semesterMarks) { this.semesterMarks = semesterMarks; }
    public BigDecimal getSessionalMarks() { return sessionalMarks; }
    public void setSessionalMarks(BigDecimal sessionalMarks) { this.sessionalMarks = sessionalMarks; }
    public BigDecimal getAssignmentMarks() { return assignmentMarks; }
    public void setAssignmentMarks(BigDecimal assignmentMarks) { this.assignmentMarks = assignmentMarks; }
    public BigDecimal getObtainedSemesterMarks() { return obtainedSemesterMarks; }
    public void setObtainedSemesterMarks(BigDecimal obtainedSemesterMarks) { this.obtainedSemesterMarks = obtainedSemesterMarks; }
    public BigDecimal getObtainedSessionalMarks() { return obtainedSessionalMarks; }
    public void setObtainedSessionalMarks(BigDecimal obtainedSessionalMarks) { this.obtainedSessionalMarks = obtainedSessionalMarks; }
    public BigDecimal getObtainedAssignmentMarks() { return obtainedAssignmentMarks; }
    public void setObtainedAssignmentMarks(BigDecimal obtainedAssignmentMarks) { this.obtainedAssignmentMarks = obtainedAssignmentMarks; }
    
    // Admin Semester Marks Getters and Setters
    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }
    public String getSemesterName() { return semesterName; }
    public void setSemesterName(String semesterName) { this.semesterName = semesterName; }
    public PassingStatus getPassingStatus() { return passingStatus; }
    public void setPassingStatus(PassingStatus passingStatus) { this.passingStatus = passingStatus; }
    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }
    public MarkType getMarkType() { return markType; }
    public void setMarkType(MarkType markType) { this.markType = markType; }
}

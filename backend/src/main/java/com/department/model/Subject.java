package com.department.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "courses")
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column
    private Integer semester;

    @Column
    private Integer credits;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = true)
    private Program program;

    @Column(nullable = true)
    private String course;

    @Column(nullable = true, name = "program")
    private String programName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "is_legacy", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isLegacy = false;

    @Column(name = "source_table", length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'COURSES'")
    private String sourceTable = "COURSES";

    // Cascade delete relationships mapped to "course" field in related entities after consolidation
    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubjectEnrollment> enrollments;

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendances;

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Marks> marks;

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Assignment> assignments;

    @JsonIgnore
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Syllabus> syllabuses;

    public Subject() {}

    public Subject(String courseCode, String courseName, Teacher teacher) {
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.teacher = teacher;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Integer getCredits() { return credits; }
    public void setCredits(Integer credits) { this.credits = credits; }

    public Program getProgram() { return program; }
    public void setProgram(Program program) { this.program = program; }

    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }

    public String getProgramName() { return programName; }
    public void setProgramName(String programName) { this.programName = programName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsLegacy() { return isLegacy; }
    public void setIsLegacy(Boolean isLegacy) { this.isLegacy = isLegacy; }

    public String getSourceTable() { return sourceTable; }
    public void setSourceTable(String sourceTable) { this.sourceTable = sourceTable; }

    public List<SubjectEnrollment> getEnrollments() { return enrollments; }
    public void setEnrollments(List<SubjectEnrollment> enrollments) { this.enrollments = enrollments; }

    public List<Attendance> getAttendances() { return attendances; }
    public void setAttendances(List<Attendance> attendances) { this.attendances = attendances; }

    public List<Marks> getMarks() { return marks; }
    public void setMarks(List<Marks> marks) { this.marks = marks; }

    public List<Assignment> getAssignments() { return assignments; }
    public void setAssignments(List<Assignment> assignments) { this.assignments = assignments; }

    public List<Syllabus> getSyllabuses() { return syllabuses; }
    public void setSyllabuses(List<Syllabus> syllabuses) { this.syllabuses = syllabuses; }

    // Legacy getters/setters for backward compatibility during migration
    public String getSubjectCode() { return courseCode; }
    public void setSubjectCode(String subjectCode) { this.courseCode = subjectCode; }

    public String getSubjectName() { return courseName; }
    public void setSubjectName(String subjectName) { this.courseName = subjectName; }
}

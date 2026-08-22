package com.department.dto;

import java.time.LocalDateTime;

public class SyllabusDTO {
    private Long id;
    private Long courseId;  // Changed from subjectId
    private String courseName;  // Changed from subjectName
    private String courseCode;  // Changed from subjectCode
    private String program;
    private String semester;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
    private String description;

    public SyllabusDTO() {}

    public SyllabusDTO(Long id, Long courseId, String courseName, String courseCode, 
                      String program, String semester, String fileName, String fileType, 
                      Long fileSize, LocalDateTime uploadedAt, String uploadedByName, String description) {
        this.id = id;
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.program = program;
        this.semester = semester;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.uploadedByName = uploadedByName;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    
    // Backward compatibility methods
    public Long getSubjectId() { return courseId; }
    public void setSubjectId(Long subjectId) { this.courseId = subjectId; }

    public String getSubjectName() { return courseName; }
    public void setSubjectName(String subjectName) { this.courseName = subjectName; }

    public String getSubjectCode() { return courseCode; }
    public void setSubjectCode(String subjectCode) { this.courseCode = subjectCode; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

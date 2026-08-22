package com.department.dto;

import java.time.LocalDate;

public class AlumniDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String program;
    private Integer semester;
    private Float marks;
    private String passFail;
    private LocalDate joinDate;
    private LocalDate passingDate;
    private String currentOccupation;
    private String company;
    private String customFields;
    
    // Additional Student fields to be fetched from database
    private String contactNo;
    private String department;
    private String enrollmentNumber;
    private String gender;
    private String address;
    private Float attendancePercentage;

    public AlumniDTO() {}

    public AlumniDTO(Long studentId, String studentName, String program, Integer semester) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.program = program;
        this.semester = semester;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Float getMarks() { return marks; }
    public void setMarks(Float marks) { this.marks = marks; }

    public String getPassFail() { return passFail; }
    public void setPassFail(String passFail) { this.passFail = passFail; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public LocalDate getPassingDate() { return passingDate; }
    public void setPassingDate(LocalDate passingDate) { this.passingDate = passingDate; }

    public String getCurrentOccupation() { return currentOccupation; }
    public void setCurrentOccupation(String currentOccupation) { this.currentOccupation = currentOccupation; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
    
    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { this.contactNo = contactNo; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Float getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Float attendancePercentage) { this.attendancePercentage = attendancePercentage; }
}

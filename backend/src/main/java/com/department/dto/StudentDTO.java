package com.department.dto;

public class StudentDTO {
    private Long id;
    private Long userId;  // Added: User ID for document access control
    private String email;
    private String fullName;
    private String studentId;
    private String enrollmentNumber;
    private String department;
    private String program;
    private String address;
    private String gender;
    private String state;
    private String district;
    private String contactNo;
    private String phoneNumber;  // Alias for contactNo
    private Integer semester;
    private Float attendancePercentage;
    private String customFields;  // JSON string with additional fields from bulk upload

    public StudentDTO() {}

    public StudentDTO(Long id, String email, String fullName, String studentId, String enrollmentNumber) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.studentId = studentId;
        this.enrollmentNumber = enrollmentNumber;
    }

    public StudentDTO(Long id, String email, String fullName, String studentId, String enrollmentNumber, String department, String program) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.studentId = studentId;
        this.enrollmentNumber = enrollmentNumber;
        this.department = department;
        this.program = program;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setUserEmail(String userEmail) { this.email = userEmail; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    // Alias for backward compatibility with frontend
    public String getCourse() { return program; }
    public void setCourse(String course) { this.program = course; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getContactNo() { return contactNo; }
    public void setContactNo(String contactNo) { 
        this.contactNo = contactNo;
        this.phoneNumber = contactNo;  // Keep in sync
    }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { 
        this.phoneNumber = phoneNumber;
        this.contactNo = phoneNumber;  // Keep in sync
    }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public Float getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(Float attendancePercentage) { this.attendancePercentage = attendancePercentage; }

    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
}

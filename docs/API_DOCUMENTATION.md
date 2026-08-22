# Department Management System - Complete API Reference

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints (except /auth/\*) require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. AUTHENTICATION ENDPOINTS

### 1.1 Login
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@university.com",
  "password": "password123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "user@university.com",
  "fullName": "John Doe",
  "role": "STUDENT"
}

Error (401 Unauthorized):
{
  "error": "Invalid email or password"
}
```

### 1.2 Register
```
POST /auth/register
Content-Type: application/json

Request Body (Student):
{
  "email": "student@university.com",
  "password": "securepass123",
  "fullName": "Jane Doe",
  "role": "STUDENT",
  "studentId": "STU001",
  "enrollmentNumber": "ENR001",
  "department": "Computer Science",
  "course": "B.Tech",
  "semester": 4
}

Request Body (Teacher):
{
  "email": "teacher@university.com",
  "password": "securepass123",
  "fullName": "Dr. John Smith",
  "role": "TEACHER",
  "teacherId": "TEA001",
  "department": "Computer Science",
  "subject": "Data Structures",
  "specialization": "Algorithms"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 2,
  "email": "student@university.com",
  "fullName": "Jane Doe",
  "role": "STUDENT"
}

Error (400 Bad Request):
{
  "error": "Email already exists"
}
```

### 1.3 Test API
```
GET /auth/test

Response (200 OK):
"API is working!"
```

---

## 2. STUDENT ENDPOINTS

### 2.1 Get Student Profile
```
GET /students/profile
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 1,
  "email": "student@university.com",
  "fullName": "Jane Doe",
  "studentId": "STU001",
  "enrollmentNumber": "ENR001",
  "department": "Computer Science",
  "semester": 4,
  "attendancePercentage": 85.5
}

Error (404 Not Found):
{
  "error": "Student not found"
}
```

### 2.2 Get Student by ID
```
GET /students/{studentId}
Authorization: Bearer {token}

Parameters:
- studentId (path): Long - Student ID

Response (200 OK):
{
  "id": 1,
  "email": "student@university.com",
  "fullName": "Jane Doe",
  "studentId": "STU001",
  "enrollmentNumber": "ENR001",
  "department": "Computer Science",
  "semester": 4,
  "attendancePercentage": 85.5
}
```

### 2.3 Update Student Attendance
```
PUT /students/{studentId}/attendance
Authorization: Bearer {token}

Parameters:
- studentId (path): Long - Student ID

Response (200 OK):
{
  "id": 1,
  "email": "student@university.com",
  "fullName": "Jane Doe",
  "attendancePercentage": 87.5
}
```

---

## 3. ATTENDANCE ENDPOINTS

### 3.1 Mark Attendance
```
POST /attendance/mark
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "studentId": 1,
  "subjectId": 5,
  "attendanceDate": "2024-01-15",
  "status": "PRESENT",
  "remarks": "Present"
}

Status Values: PRESENT, ABSENT, LATE, LEAVE

Response (200 OK):
{
  "id": 10,
  "studentId": 1,
  "studentName": "Jane Doe",
  "subjectId": 5,
  "subjectCode": "CS201",
  "attendanceDate": "2024-01-15",
  "status": "PRESENT",
  "remarks": "Present"
}

Error (400 Bad Request):
{
  "error": "Student or Subject not found"
}
```

### 3.2 Mark Bulk Attendance (NEW)
```
POST /attendance/bulk
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
[
  {
    "studentId": 1,
    "subjectId": 5,
    "teacherId": 2,
    "attendanceDate": "2024-01-15",
    "status": "PRESENT"
  },
  {
    "studentId": 2,
    "subjectId": 5,
    "teacherId": 2,
    "attendanceDate": "2024-01-15",
    "status": "ABSENT"
  },
  {
    "studentId": 3,
    "subjectId": 5,
    "teacherId": 2,
    "attendanceDate": "2024-01-15",
    "status": "LATE"
  }
]

Response (200 OK):
{
  "message": "Bulk attendance marked successfully",
  "count": 3
}
```

### 3.3 Get Student Attendance
```
GET /attendance/student/{studentId}/subject/{subjectId}
Authorization: Bearer {token}

Parameters:
- studentId (path): Long
- subjectId (path): Long

Response (200 OK):
[
  {
    "id": 10,
    "studentId": 1,
    "studentName": "Jane Doe",
    "subjectId": 5,
    "subjectCode": "CS201",
    "attendanceDate": "2024-01-15",
    "status": "PRESENT",
    "remarks": "Present"
  },
  {
    "id": 11,
    "studentId": 1,
    "studentName": "Jane Doe",
    "subjectId": 5,
    "subjectCode": "CS201",
    "attendanceDate": "2024-01-16",
    "status": "ABSENT",
    "remarks": "Sick"
  }
]
```

### 3.4 Get Attendance Percentage
```
GET /attendance/percentage?studentId=1&subjectId=5
Authorization: Bearer {token}

Query Parameters:
- studentId: Long
- subjectId: Long

Response (200 OK):
85.5
```

### 3.5 Get Subject Attendance Statistics (NEW)
```
GET /attendance/stats/subject/{subjectId}
Authorization: Bearer {token}

Parameters:
- subjectId (path): Long

Response (200 OK):
{
  "present": 45,
  "absent": 8,
  "late": 5,
  "leave": 2,
  "total": 60
}

Description:
Returns attendance statistics for a subject including:
- present: Total present count
- absent: Total absent count
- late: Total late count
- leave: Total leave count
- total: Grand total of attendance records
```

### 3.6 Get Teacher's Attendance Records
```
GET /attendance/teacher/{teacherId}/subject/{subjectId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {token}

Parameters:
- teacherId (path): Long
- subjectId (path): Long
- startDate (query): Date (YYYY-MM-DD)
- endDate (query): Date (YYYY-MM-DD)

Response (200 OK):
[
  {
    "id": 10,
    "studentId": 1,
    "studentName": "Jane Doe",
    "subjectId": 5,
    "subjectCode": "CS201",
    "attendanceDate": "2024-01-15",
    "status": "PRESENT",
    "remarks": "Present"
  },
  {
    "id": 11,
    "studentId": 2,
    "studentName": "John Doe",
    "subjectId": 5,
    "subjectCode": "CS201",
    "attendanceDate": "2024-01-15",
    "status": "ABSENT",
    "remarks": ""
  }
]
```

---

## 4. DOCUMENT ENDPOINTS

### 4.1 Upload Document
```
POST /documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Request Parameters:
- name (form): String - Document name
- description (form): String - Document description
- visibility (form): String - PUBLIC, PRIVATE, or RESTRICTED
- allowedRoles (form): String (optional) - Comma-separated roles for RESTRICTED visibility
- file (form): File - The document file to upload

Response (200 OK):
{
  "id": 1,
  "documentCode": "DOC-ABC123",
  "documentName": "Lecture Notes",
  "description": "Chapter 1 introduction",
  "visibility": "PUBLIC",
  "allowedRoles": null,
  "uploadedByEmail": "teacher@university.com",
  "downloadCount": 0
}

Error (400 Bad Request):
{
  "error": "Failed to save file: ..."
}
```

### 4.2 Get Public Documents
```
GET /documents/public
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "documentCode": "DOC-ABC123",
    "documentName": "Lecture Notes",
    "description": "Chapter 1 introduction",
    "visibility": "PUBLIC",
    "allowedRoles": null,
    "uploadedByEmail": "teacher@university.com",
    "downloadCount": 5
  },
  {
    "id": 2,
    "documentCode": "DOC-DEF456",
    "documentName": "Practice Problems",
    "description": "Sets 1-5",
    "visibility": "PUBLIC",
    "allowedRoles": null,
    "uploadedByEmail": "teacher@university.com",
    "downloadCount": 12
  }
]
```

### 4.3 Get User's Documents
```
GET /documents/my-documents
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "documentCode": "DOC-ABC123",
    "documentName": "Lecture Notes",
    "description": "Chapter 1 introduction",
    "visibility": "PRIVATE",
    "allowedRoles": null,
    "uploadedByEmail": "teacher@university.com",
    "downloadCount": 0
  }
]
```

### 4.4 Search Documents
```
GET /documents/search?keyword=lecture
Authorization: Bearer {token}

Query Parameters:
- keyword: String - Search term

Response (200 OK):
{
  "id": 1,
  "documentCode": "DOC-ABC123",
  "documentName": "Lecture Notes",
  "description": "Chapter 1 introduction",
  "visibility": "PUBLIC",
  "allowedRoles": null,
  "uploadedByEmail": "teacher@university.com",
  "downloadCount": 5
}
```

---

## 5. REPORT ENDPOINTS

### 5.1 Generate Attendance Report
```
POST /reports/attendance?studentId=1&subjectId=5
Authorization: Bearer {token}

Query Parameters:
- studentId: Long
- subjectId: Long

Response (200 OK):
{
  "id": 1,
  "reportCode": "RPT-XYZ789",
  "reportName": "Attendance Report - Student 1",
  "reportType": "ATTENDANCE",
  "generatedBy": {
    "id": 3,
    "email": "teacher@university.com",
    "role": "TEACHER"
  },
  "generatedDate": "2024-01-20T10:30:00",
  "reportData": "Attendance Percentage: 85.5%",
  "isAutomated": false,
  "description": null
}
```

### 5.2 Generate Student Report
```
POST /reports/student
Authorization: Bearer {token}

Response (200 OK):
{
  "id": 2,
  "reportCode": "RPT-ABC123",
  "reportName": "Student Report - Jane Doe",
  "reportType": "STUDENT",
  "generatedBy": {
    "id": 1,
    "email": "student@university.com",
    "role": "STUDENT"
  },
  "generatedDate": "2024-01-20T10:30:00",
  "reportData": null,
  "isAutomated": false,
  "description": null
}
```

### 5.3 Get Reports by Type
```
GET /reports/type/{reportType}
Authorization: Bearer {token}

Parameters:
- reportType (path): ATTENDANCE, ACADEMIC, DOCUMENT, STUDENT, or TEACHER

Response (200 OK):
[
  {
    "id": 1,
    "reportCode": "RPT-XYZ789",
    "reportName": "Attendance Report - Student 1",
    "reportType": "ATTENDANCE",
    "generatedDate": "2024-01-20T10:30:00",
    "isAutomated": false
  }
]
```

### 5.4 Get My Reports
```
GET /reports/my-reports
Authorization: Bearer {token}

Response (200 OK):
[
  {
    "id": 1,
    "reportCode": "RPT-XYZ789",
    "reportName": "Attendance Report - Student 1",
    "reportType": "ATTENDANCE",
    "generatedDate": "2024-01-20T10:30:00",
    "reportData": "Attendance Percentage: 85.5%",
    "isAutomated": false
  },
  {
    "id": 2,
    "reportCode": "RPT-ABC123",
    "reportName": "Student Report - Jane Doe",
    "reportType": "STUDENT",
    "generatedDate": "2024-01-20T10:35:00",
    "isAutomated": false
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "message": "Unauthorized: Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "status": 403,
  "message": "Access denied: You don't have permission"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error: Details"
}
```

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

- No explicit rate limiting in v1.0
- Recommended: Implement rate limiting in production

---

## CORS Configuration

Allowed Origins:
- http://localhost:3000
- http://localhost:5173

Allowed Methods:
- GET, POST, PUT, DELETE, OPTIONS

Allowed Headers:
- All headers (*)

---

## Authentication Details

### JWT Token Structure
```
Header: {
  "alg": "HS512",
  "typ": "JWT"
}

Payload: {
  "sub": "user@university.com",
  "role": "STUDENT",
  "iat": 1674158400,
  "exp": 1674244800
}
```

### Token Expiration
- Default: 24 hours (86400000 milliseconds)
- Configurable in `application.yml`

---

## Example Usage with cURL

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@university.com","password":"password123"}'
```

### Get Student Profile
```bash
curl -X GET http://localhost:8080/api/students/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Mark Attendance
```bash
curl -X POST http://localhost:8080/api/attendance/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "studentId": 1,
    "subjectId": 5,
    "attendanceDate": "2024-01-15",
    "status": "PRESENT",
    "remarks": ""
  }'
```

### Upload Document
```bash
curl -X POST http://localhost:8080/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "name=Lecture Notes" \
  -F "description=Chapter 1" \
  -F "visibility=PUBLIC" \
  -F "file=@/path/to/file.pdf"
```

---

Last Updated: February 2024
API Version: 1.0.0

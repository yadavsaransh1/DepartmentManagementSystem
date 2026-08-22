# University Management System - Backend API Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture)
2. [Project Structure](#structure)
3. [Setup & Installation](#setup)
4. [API Endpoints](#endpoints)
5. [Services & Business Logic](#services)
6. [Database Integration](#database)
7. [Security & Authentication](#security)
8. [Error Handling](#errors)
9. [Configuration](#config)
10. [Deployment](#deployment)

---

## <a name="architecture"></a>1. Architecture Overview

### Technology Stack
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **ORM**: Spring Data JPA/Hibernate
- **Database**: MySQL/MariaDB
- **Security**: JWT (JSON Web Tokens)
- **Build**: Maven
- **API Protocol**: RESTful (JSON)
- **Logging**: SLF4J with Logback
- **File Upload**: Apache Commons FileUpload

### Architecture Layers
```
┌─────────────────────────────────┐
│      REST Controllers            │  (Handles HTTP requests)
├─────────────────────────────────┤
│      Services Layer              │  (Business logic layer)
├─────────────────────────────────┤
│    Repository Layer (JPA)        │  (Data access layer)
├─────────────────────────────────┤
│ Database (MySQL/MariaDB)         │  (Persistent storage)
└─────────────────────────────────┘
```

### Design Patterns Used
- **MVC Pattern**: Controllers → Services → Repositories → Database
- **DAO Pattern**: Repository interfaces for data persistence
- **Dependency Injection**: Spring's @Autowired for IoC
- **DTO Pattern**: Separate data transfer objects from entities
- **Exception Handling**: Global exception handler with @ControllerAdvice

---

## <a name="structure"></a>2. Project Structure

```
backend/
├── src/main/java/com/university/
│   ├── controller/           (27 REST Controllers)
│   │   ├── AuthController.java
│   │   ├── StudentController.java
│   │   ├── TeacherController.java
│   │   ├── SubjectController.java
│   │   ├── AttendanceController.java
│   │   ├── MarksController.java
│   │   ├── AssignmentController.java
│   │   ├── SupervisorAllocationController.java
│   │   ├── ProjectController.java
│   │   ├── DocumentController.java
│   │   ├── NotificationController.java
│   │   └── ... (17 more controllers)
│   │
│   ├── service/              (35+ Service Classes)
│   │   ├── AuthService.java
│   │   ├── StudentService.java
│   │   ├── TeacherService.java
│   │   ├── TeacherDetailsService.java
│   │   ├── AttendanceService.java
│   │   ├── AttendanceExportService.java
│   │   ├── MarksService.java
│   │   ├── AssignmentService.java
│   │   ├── AssignmentSubmissionService.java
│   │   ├── ProjectService.java
│   │   ├── DocumentService.java
│   │   ├── SupervisorAllocationService.java
│   │   ├── AlumniService.java
│   │   ├── NotificationService.java
│   │   ├── ReportService.java
│   │   ├── ExportService.java
│   │   └── ... (20+ more services)
│   │
│   ├── entity/              (29 JPA Entities)
│   │   ├── User.java
│   │   ├── Student.java
│   │   ├── Teacher.java
│   │   ├── TeacherDetails.java
│   │   ├── Course.java
│   │   ├── CourseEnrollment.java
│   │   ├── Attendance.java
│   │   ├── Marks.java
│   │   ├── Assignment.java
│   │   ├── AssignmentSubmission.java
│   │   ├── SupervisorAllocation.java
│   │   ├── ProjectDocument.java
│   │   ├── Document.java
│   │   ├── Notification.java
│   │   └── ... (14 more entities)
│   │
│   ├── repository/          (29 Repository Interfaces)
│   │   ├── UserRepository.java
│   │   ├── StudentRepository.java
│   │   ├── TeacherRepository.java
│   │   ├── CourseRepository.java
│   │   ├── CourseEnrollmentRepository.java
│   │   ├── AttendanceRepository.java
│   │   ├── MarksRepository.java
│   │   ├── AssignmentRepository.java
│   │   └── ... (21 more repositories)
│   │
│   ├── dto/                 (25+ Data Transfer Objects)
│   │   ├── StudentDTO.java
│   │   ├── TeacherDTO.java
│   │   ├── CourseDTO.java
│   │   ├── AttendanceDTO.java
│   │   ├── MarksDTO.java
│   │   └── ... (20+ more DTOs)
│   │
│   ├── security/
│   │   ├── SecurityConfig.java      (JWT, CORS, filtering)
│   │   ├── JwtTokenProvider.java    (Token generation/validation)
│   │   ├── AuthenticationFilter.java (Request filter)
│   │   └── UserDetailsService.java  (Principal service)
│   │
│   ├── config/
│   │   ├── DataSourceConfig.java
│   │   ├── JpaConfig.java
│   │   ├── CorsConfig.java
│   │   └── FileUploadConfig.java
│   │
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   └── ValidationException.java
│   │
│   └── Application.java      (Main entry point)
│
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   ├── application-prod.properties
│   └── logback.xml
│
├── pom.xml                   (Maven configuration)
└── target/                   (Compiled artifacts)
```

---

## <a name="setup"></a>3. Setup & Installation

### Prerequisites
- Java 17 or higher
- Maven 3.8+
- MySQL 8.0+ or MariaDB 10.5+
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd University\ Management/backend
```

#### 2. Configure Database
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/university_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

#### 3. Create Database
```sql
CREATE DATABASE university_db;
USE university_db;
```

#### 4. Build Project
```bash
mvn clean install
```

Compiles code, runs tests, creates JAR in `target/` folder.

#### 5. Run Application
```bash
mvn spring-boot:run
```

Application will start on `http://localhost:8080`

#### 6. Verify Installation
```bash
curl http://localhost:8080/api/health
```

Should return HTTP 200 status.

---

## <a name="endpoints"></a>4. API Endpoints

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints (`/auth`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/login` | User authentication | None | PUBLIC |
| POST | `/register` | Register new user | None | PUBLIC |
| POST | `/logout` | Logout user | Bearer Token | ANY |
| POST | `/refresh-token` | Refresh JWT token | Bearer Token | ANY |
| POST | `/forgot-password` | Request password reset | None | PUBLIC |
| POST | `/reset-password` | Reset password with token | None | PUBLIC |
| POST | `/admin/reset-user-password` | Admin reset user password | Bearer Token | ADMIN |

### Student Management Endpoints (`/students`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Get all students | Bearer Token | ADMIN/TEACHER |
| GET | `/profile` | Get authenticated student profile | Bearer Token | STUDENT |
| GET | `/profile/all-subjects` | Get student's enrolled subjects | Bearer Token | STUDENT |
| GET | `/{studentId}` | Get student by ID | Bearer Token | ADMIN/STUDENT |
| POST | `/` | Create new student | Bearer Token | ADMIN |
| PUT | `/{studentId}` | Update student | Bearer Token | ADMIN/STUDENT |
| DELETE | `/{studentId}` | Delete student | Bearer Token | ADMIN |
| POST | `/bulk-upload` | Bulk upload students | Bearer Token | ADMIN |

### Teacher Management (`/teachers`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/` | Get all teachers | Bearer Token | ADMIN |
| GET | `/profile` | Get authenticated teacher profile | Bearer Token | TEACHER |
| GET | `/{teacherId}` | Get teacher by ID | Bearer Token | ADMIN/TEACHER |
| POST | `/` | Create new teacher | Bearer Token | ADMIN |
| PUT | `/{teacherId}` | Update teacher | Bearer Token | ADMIN/TEACHER |
| PUT | `/{teacherId}/subjects` | Assign subjects | Bearer Token | ADMIN |
| DELETE | `/{teacherId}` | Delete teacher | Bearer Token | ADMIN |

### Teacher Details Extended (`/teacher-details`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/save` | Save detailed teacher info | Bearer Token | TEACHER/ADMIN |
| GET | `/{teacherId}` | Get teacher details | Bearer Token | PUBLIC |
| GET | `/{teacherId}/exists` | Check if details exist | Bearer Token | ANY |
| PUT | `/{teacherId}` | Update teacher details | Bearer Token | TEACHER/ADMIN |
| DELETE | `/{teacherId}` | Delete teacher details | Bearer Token | ADMIN |

### Course/Subject Management (`/subjects`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/unique-programs` | Get all programs | None | PUBLIC |
| GET | `/semesters-by-program/{program}` | Get program semesters | None | PUBLIC |
| GET | `/by-program/{program}` | Get courses by program | Bearer Token | ANY |
| GET | `/by-teacher/{teacherId}` | Get teacher's courses | Bearer Token | TEACHER/ADMIN |
| GET | `/{subjectId}` | Get course details | Bearer Token | ANY |
| POST | `/` | Create course | Bearer Token | ADMIN |
| PUT | `/{subjectId}` | Update course | Bearer Token | ADMIN |

### Attendance Management (`/attendance`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/mark` | Mark attendance | Bearer Token | TEACHER |
| POST | `/bulk` | Mark bulk attendance | Bearer Token | TEACHER |
| GET | `/` | Get all records (filtered) | Bearer Token | ADMIN |
| GET | `/student/{studentId}/subject/{subjectId}` | Get  student attendance | Bearer Token | STUDENT/TEACHER |
| GET | `/percentage` | Calculate percentage | Bearer Token | STUDENT |
| GET | `/teacher/{teacherId}/subject/{subjectId}` | Get teacher records | Bearer Token | TEACHER |
| GET | `/export` | Export to Excel | Bearer Token | TEACHER/ADMIN |

### Marks Management (`/marks`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Record marks | Bearer Token | TEACHER |
| GET | `/{id}` | Get mark record | Bearer Token | ADMIN/TEACHER |
| GET | `/student/{studentId}` | Get student marks | Bearer Token | STUDENT |
| GET | `/subject/{subjectId}` | Get course marks | Bearer Token | TEACHER |
| GET | `/student/{studentId}/subject/{subjectId}` | Get specific marks | Bearer Token | STUDENT |
| GET | `/teacher/{teacherId}` | Get teacher records | Bearer Token | TEACHER |

### Assignment Management (`/assignments`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Create assignment | Bearer Token | TEACHER |
| GET | `/` | Get all assignments | Bearer Token | ANY |
| GET | `/{assignmentId}` | Get assignment details | Bearer Token | ANY |
| GET | `/subject/{subjectId}` | Get course assignments | Bearer Token | ANY |
| GET | `/teacher/{teacherId}` | Get teacher assignments | Bearer Token | TEACHER |
| PUT | `/{assignmentId}` | Update assignment | Bearer Token | TEACHER |
| DELETE | `/{assignmentId}` | Delete assignment | Bearer Token | TEACHER |

### Assignment Submission (`/submissions`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Submit assignment | Bearer Token | STUDENT |
| GET | `/{id}` | Get submission details | Bearer Token | STUDENT/TEACHER |
| GET | `/assignment/{assignmentId}` | Get all submissions | Bearer Token | TEACHER |
| GET | `/student/{studentId}` | Get student submissions | Bearer Token | STUDENT |
| PUT | `/{id}/grade` | Grade submission | Bearer Token | TEACHER |
| DELETE | `/{id}` | Delete submission | Bearer Token | TEACHER |

### Teacher Feedback (`/teacher-feedback`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/` | Submit feedback | Bearer Token | STUDENT |
| GET | `/` | Get all feedback | Bearer Token | ADMIN |
| GET | `/{feedbackId}` | Get feedback detail | Bearer Token | ANY |
| GET | `/student/{studentId}` | Get student feedback | Bearer Token | STUDENT |
| GET | `/teacher/{teacherId}` | Get teacher feedback | Bearer Token | TEACHER/ADMIN |
| GET | `/activation-status` | Check active feedback | Bearer Token | ANY |
| PUT | `/{feedbackId}` | Update feedback | Bearer Token | STUDENT |

### Supervisor/Project (`/supervisors`, `/projects`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/supervisors/allocate` | Allocate supervisor | Bearer Token | ADMIN |
| POST | `/supervisors/allocate-phd` | Allocate PhD guide | Bearer Token | ADMIN |
| GET | `/supervisors/allocations` | Get all allocations | Bearer Token | ADMIN |
| GET | `/supervisors/student/{studentId}` | Get student supervisor | Bearer Token | STUDENT |
| POST | `/projects/documents/upload` | Upload project doc | Bearer Token | STUDENT/TEACHER |
| POST | `/projects/messages/send` | Send message | Bearer Token | STUDENT/TEACHER |
| GET | `/projects/messages/{allocationId}` | Get messages | Bearer Token | STUDENT/TEACHER |

### Document & Routine Management (`/documents`, `/routines`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/documents/upload` | Upload document | Bearer Token | ADMIN/TEACHER |
| GET | `/documents` | Get documents | Bearer Token | ANY |
| GET | `/documents/{documentId}/download` | Download document | Bearer Token | ANY |
| DELETE | `/documents/{documentId}` | Delete document | Bearer Token | ADMIN/TEACHER |
| POST | `/routines/upload` | Upload routine | Bearer Token | ADMIN |
| GET | `/routines/all` | Get all routines | Bearer Token | ANY |
| GET | `/routines/{routineId}/download` | Download routine | Bearer Token | ANY |

### Notifications (`/notifications`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/create` | Create notification | Bearer Token | ADMIN/TEACHER |
| GET | `/visible/{userId}` | Get visible notifications | Bearer Token | ANY |
| GET | `/all-active` | Get all notifications | Bearer Token | ADMIN |
| GET | `/{notificationId}` | Get notification detail | Bearer Token | ANY |
| PUT | `/{notificationId}` | Update notification | Bearer Token | ADMIN |

---

## <a name="services"></a>5. Services & Business Logic

### Core Services Overview

#### StudentService
**Responsibilities**: Student lifecycle management
```java
public class StudentService {
    // CRUD operations
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student createStudent(StudentDTO dto);
    Student updateStudent(Long id, StudentDTO dto);
    void deleteStudent(Long id);
    
    // Business operations
    StudentDTO getStudentProfile(Long userId);
    List<SubjectDTO> getStudentSubjects(Long studentId);
    void bulkUploadStudents(MultipartFile file);
    List<Student> findByProgram(String program);
}
```

#### TeacherService
**Responsibilities**: Teacher profile and assignment management
```java
public class TeacherService {
    List<Teacher> getAllTeachers();
    Teacher getTeacherById(Long id);
    Teacher createTeacher(TeacherDTO dto);
    Teacher updateTeacher(Long id, TeacherDTO dto);
    void deleteTeacher(Long id);
    Teacher getTeacherProfile(Long userId);
    void assignSubjectsToTeacher(Long teacherId, List<Long> subjectIds);
}
```

#### TeacherDetailsService
**Responsibilities**: Extended teacher qualifications and experience
```java
public class TeacherDetailsService {
    TeacherDetailsDTO getTeacherDetails(Long teacherId);
    void saveTeacherDetails(Long teacherId, TeacherDetailsDTO details);
    void updateTeacherDetails(Long teacherId, TeacherDetailsDTO details);
    boolean detailsExists(Long teacherId);
    // JSON field handling for education, certifications, etc.
}
```

#### AttendanceService
**Responsibilities**: Attendance tracking and reporting
```java
public class AttendanceService {
    Attendance markAttendance(AttendanceDTO dto);
    void markBulkAttendance(List<AttendanceDTO> records);
    List<Attendance> getStudentAttendance(Long studentId, Long courseId);
    double calculateAttendancePercentage(Long studentId, Long courseId);
    List<Attendance> getTeacherRecords(Long teacherId, Long courseId);
    // Export functionality
    byte[] exportToExcel(List<Attendance> records) throws IOException;
}
```

#### MarksService
**Responsibilities**: Grade recording and management
```java
public class MarksService {
    Marks recordMarks(MarksDTO dto);
    Marks getMarkRecord(Long markId);
    List<Marks> getStudentMarks(Long studentId);
    List<Marks> getSubjectMarks(Long courseId);
    List<Marks> getStudentCourseMarks(Long studentId, Long courseId);
    void updateMarks(Long markId, int marksObtained);
    double calculateGPA(Long studentId);
}
```

#### AssignmentService
**Responsibilities**: Assignment creation and distribution
```java
public class AssignmentService {
    Assignment createAssignment(Assignment assignment, MultipartFile file);
    Assignment updateAssignment(Long assignmentId, Assignment assignment);
    void deleteAssignment(Long assignmentId);
    Assignment getAssignmentDetails(Long assignmentId);
    List<Assignment> getCourseAssignments(Long courseId);
    List<Assignment> getTeacherAssignments(Long teacherId);
    List<Assignment> getUpcomingAssignments(Long courseId);
}
```

#### AttendanceExportService
**Responsibilities**: Export attendance to PDF/Excel
```java
public class AttendanceExportService {
    byte[] exportAttendanceToPDF(List<Attendance> records);
    byte[] exportAttendanceToExcel(List<Attendance> records);
    void drawTable(PDPageContentStream stream, List<Attendance> data);
    // PDF-specific methods for formatting
}
```

#### SupervisorAllocationService
**Responsibilities**: PhD/Project supervision assignment
```java
public class SupervisorAllocationService {
    SupervisorAllocation allocateSupervisor(SupervisorAllocationDTO dto);
    SupervisorAllocation allocatePhDGuide(Long studentId, String guideName);
    SupervisorAllocation getStudentSupervisor(Long studentId);
    List<Student> getSupervisorStudents(Long teacherId);
    void updateAllocation(Long allocationId, SupervisorAllocationDTO dto);
    void deleteAllocation(Long allocationId);
}
```

#### NotificationService
**Responsibilities**: System-wide announcements
```java
public class NotificationService {
    Notification createNotification(NotificationDTO dto);
    List<Notification> getVisibleNotifications(Long userId);
    List<Notification> getAllActiveNotifications();
    void updateNotification(Long notificationId, NotificationDTO dto);
    void deleteNotification(Long notificationId);
    // Visibility logic based on roles
}
```

#### ReportService
**Responsibilities**: Generate various reports
```java
public class ReportService {
    Report generateAttendanceReport(ReportFilterDTO filter);
    Report generateStudentReport(Long studentId);
    Report generateAcademicReport(String program, int semester);
    List<Report> getReportsByType(String reportType);
    List<Report> getMyReports(Long userId);
    byte[] exportReportToExcel(Report report);
}
```

---

## <a name="database"></a>6. Database Integration

### JPA Configuration
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # or validate for production
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQLDialect
        use_sql_comments: true
    open-in-view: false
```

### Entity Relationships Example

```java
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<CourseEnrollment> enrollments = new ArrayList<>();
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Attendance> attendanceRecords = new ArrayList<>();
    
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Marks> marks = new ArrayList<>();
}

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;
    
    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<CourseEnrollment> enrollments = new ArrayList<>();
    
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Assignment> assignments = new ArrayList<>();
}
```

---

## <a name="security"></a>7. Security & Authentication

### JWT Token Flow

#### 1. Login Request
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "password123"
}
```

#### 2. Response with Token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiU3R1ZGVudCIsImlhdCI6MTUxNjIzOTAyMn0.signature",
  "refreshToken": "refresh_token_xyz",
  "expiresIn": 3600,
  "type": "Bearer",
  "user": {
    "id": 123,
    "email": "student@university.edu",
    "fullName": "John Student",
    "role": "STUDENT"
  }
}
```

#### 3. Subsequent Requests
```bash
GET /api/students/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Configuration
```properties
jwt.secret=your-secret-key-min-256-chars-long
jwt.expiration=3600000  # 1 hour in milliseconds
jwt.refresh-expiration=604800000  # 7 days
```

### CORS Configuration
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

---

## <a name="errors"></a>8. Error Handling

### Global Exception Handler
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("DUPLICATE_ENTRY", "Data already exists"));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("SERVER_ERROR", "An error occurred"));
    }
}
```

### Common HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created
- **204 No Content**: Successful, no response body
- **400 Bad Request**: Invalid input
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Authenticated but no permission
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Data conflict (duplicate)
- **500 Internal Server Error**: Server error

---

## <a name="config"></a>9. Configuration

### application.properties
```properties
# SERVER
server.port=8080
server.servlet.context-path=/
server.tomcat.max-connections=200

# DATABASE
spring.datasource.url=jdbc:mysql://localhost:3306/university_db
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT
jwt.secret=your-super-secret-key-that-is-at-least-256-bits-long-for-HS256
jwt.expiration=3600000
jwt.refresh-expiration=604800000

# FILE UPLOAD
file.upload.dir=/uploads
file.upload.max-size=5242880  # 5 MB

# LOGGING
logging.level.root=INFO
logging.level.com.university=DEBUG
logging.file.name=logs/application.log
```

---

## <a name="deployment"></a>10. Deployment

### Build JAR
```bash
mvn clean package -DskipTests
```

Creates `university-system-1.0-RELEASE.jar` in `target/` folder.

### Run JAR
```bash
java -jar target/university-system-1.0-RELEASE.jar
```

### Docker Deployment
```dockerfile
FROM openjdk:17-slim
ADD target/university-system-1.0-RELEASE.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
EXPOSE 8080
```

Build and run:
```bash
docker build -t university-backend:1.0 .
docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/university_db university-backend:1.0
```

---

## Code Comments Best Practices

### Example: Service with Detailed Comments
```java
/**
 * AttendanceService handles all attendance-related operations including
 * recording, calculation, and export of attendance data.
 * 
 * Dependencies injected:
 * - AttendanceRepository: Database operations
 * - StudentService: Student data access
 * - CourseRepository: Course information
 * 
 * @author Technical Team
 * @version 1.0
 */
@Service
@Slf4j
public class AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    /**
     * Records attendance for a student in a course.
     * 
     * Process:
     * 1. Validate student is enrolled in course
     * 2. Check if attendance already marked for this date/time
     * 3. Save attendance record
     * 4. Update student performance metrics
     * 
     * @param studentId Unique student identifier
     * @param courseId Unique course identifier
     * @param status Attendance status (PRESENT, ABSENT, LATE, LEAVE)
     * @param attendanceDate Date of attendance
     * @return Saved Attendance object
     * @throws StudentNotEnrolledException if student not in course
     * @throws DuplicateAttendanceException if already marked
     */
    public Attendance markAttendance(Long studentId, Long courseId, 
                                     String status, LocalDate attendanceDate) {
        // Validate enrollment first
        if (!studentService.isEnrolledIn(studentId, courseId)) {
            throw new StudentNotEnrolledException("Student not enrolled");
        }
        
        // Check for duplicate
        if (attendanceRepository.exists(studentId, courseId, attendanceDate)) {
            throw new DuplicateAttendanceException("Already marked");
        }
        
        // Create and save
        Attendance attendance = new Attendance();
        attendance.setStudentId(studentId);
        attendance.setCourseId(courseId);
        attendance.setStatus(status);
        attendance.setAttendanceDate(attendanceDate);
        
        return attendanceRepository.save(attendance);
    }
}
```

---

## Conclusion

The University Management System backend is built on Spring Boot with a clean, layered architecture. It provides comprehensive RESTful APIs for all university management functions including academic administration, student lifecycle management, attendance tracking, and performance evaluation.

**Key Features**:
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Comprehensive error handling
- ✅ File upload/download support
- ✅ Export functionality (Excel/PDF)
- ✅ Cascading deletes for data consistency
- ✅ Transactional integrity

**Last Updated**: March 2026  
**Version**: 1.0  
**Maintained By**: Technical Documentation Team

# Department Management System - Technical Documentation

## Table of Contents
1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Installation & Setup](#installation--setup)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Backend Development](#backend-development)
7. [Frontend Development](#frontend-development)
8. [Deployment](#deployment)
9. [Security](#security)
10. [Testing](#testing)

## Architecture

The application follows a modular 3-tier architecture:

```
┌─────────────────────────────────────────┐
│          Client Layer (React)           │
│  (Login, Dashboard, Forms, Reports)     │
└──────────────────┬──────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────┐
│        Application Layer (Spring Boot)  │
│  (Controllers, Services, Business Logic)│
└──────────────────┬──────────────────────┘
                   │ JDBC
┌──────────────────▼──────────────────────┐
│     Persistence Layer (MySQL)           │
│   (User, Student, Attendance, Docs)     │
└─────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.1.5
- **Java Version**: 17
- **Build Tool**: Maven 3.9
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **ORM**: Hibernate (JPA)

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router 6
- **Styling**: CSS3

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Version Control**: Git

## Installation & Setup

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.9+
- Docker & Docker Compose (optional)

### Backend Setup

1. **Clone and Navigate**
```bash
cd backend
```

2. **Configure Database**
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/university_db
    username: root
    password: root
```

3. **Build Project**
```bash
mvn clean install
```

4. **Run Application**
```bash
mvn spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Run Development Server**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Using Docker

1. **Navigate to Docker Directory**
```bash
cd docker
```

2. **Start All Services**
```bash
docker-compose up -d
```

3. **Verify Services**
```bash
docker-compose ps
```

4. **Access Application**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- MySQL: localhost:3306

## Database Schema

### Key Tables

#### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'TEACHER', 'ADMIN'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);
```

#### Students Table
```sql
CREATE TABLE students (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    student_id VARCHAR(50) UNIQUE,
    enrollment_number VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    course VARCHAR(100),
    semester INT,
    attendance_percentage FLOAT DEFAULT 0
);
```

#### Teachers Table
```sql
CREATE TABLE teachers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE,
    teacher_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    subject VARCHAR(100),
    specialization VARCHAR(255),
    employee_id VARCHAR(50)
);
```

#### Attendance Table
```sql
CREATE TABLE attendance (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'LATE', 'LEAVE'),
    remarks VARCHAR(255),
    created_at TIMESTAMP
);
```

#### Documents Table
```sql
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    document_code VARCHAR(50) UNIQUE,
    document_name VARCHAR(255),
    description TEXT,
    file_path VARCHAR(500),
    file_size BIGINT,
    uploaded_by BIGINT,
    visibility ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED'),
    allowed_roles VARCHAR(255),
    download_count INT DEFAULT 0
);
```

## API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@university.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "type": "Bearer",
  "id": 1,
  "email": "user@university.com",
  "fullName": "John Doe",
  "role": "STUDENT"
}
```

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@university.com",
  "password": "securepass123",
  "fullName": "Jane Doe",
  "role": "STUDENT",
  "studentId": "STU001",
  "enrollmentNumber": "ENR001",
  "department": "Computer Science",
  "semester": 4
}
```

### Student Endpoints

#### Get Student Profile
```
GET /api/students/profile
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "email": "student@university.com",
  "fullName": "Jane Doe",
  "studentId": "STU001",
  "attendancePercentage": 85.5
}
```

### Attendance Endpoints

#### Mark Attendance
```
POST /api/attendance/mark
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentId": 1,
  "subjectId": 5,
  "attendanceDate": "2024-01-15",
  "status": "PRESENT",
  "remarks": ""
}
```

#### Get Attendance Percentage
```
GET /api/attendance/percentage?studentId=1&subjectId=5
Authorization: Bearer {token}

Response: 85.5
```

### Document Endpoints

#### Upload Document
```
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Fields:
- name: "Lecture Notes"
- description: "Chapter 1 notes"
- visibility: "PUBLIC"
- file: (binary file)
```

#### Get Public Documents
```
GET /api/documents/public
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "documentCode": "DOC-ABC123",
    "documentName": "Lecture Notes",
    "visibility": "PUBLIC",
    "downloadCount": 42
  }
]
```

### Report Endpoints

#### Generate Attendance Report
```
POST /api/reports/attendance?studentId=1&subjectId=5
Authorization: Bearer {token}

Response:
{
  "id": 1,
  "reportCode": "RPT-XYZ789",
  "reportName": "Attendance Report - Student 1",
  "reportType": "ATTENDANCE",
  "reportData": "Attendance Percentage: 85.5%"
}
```

## Backend Development

### Project Structure
```
backend/
├── src/main/java/com/university/
│   ├── controller/         # REST Controllers
│   ├── service/            # Business Logic
│   ├── model/              # JPA Entities
│   ├── repository/         # Data Access
│   ├── dto/                # Data Transfer Objects
│   ├── security/           # Security Config
│   └── DepartmentManagementApplication.java
├── src/main/resources/
│   ├── application.yml     # Configuration
│   └── schema.sql          # Database Schema
└── pom.xml                 # Maven Dependencies
```

### Adding a New Feature

1. **Create Entity** in `model/`
```java
@Entity
public class MyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
```

2. **Create Repository** in `repository/`
```java
public interface MyEntityRepository extends JpaRepository<MyEntity, Long> {
    Optional<MyEntity> findByName(String name);
}
```

3. **Create Service** in `service/`
```java
@Service
public class MyEntityService {
    @Autowired
    private MyEntityRepository repository;
}
```

4. **Create Controller** in `controller/`
```java
@RestController
@RequestMapping("/api/myentity")
public class MyEntityController {
    @Autowired
    private MyEntityService service;
}
```

## Frontend Development

### Project Structure
```
frontend/
├── src/
│   ├── components/         # Reusable Components
│   ├── pages/              # Page Components
│   ├── services/           # API Services
│   ├── styles/             # CSS Files
│   ├── App.jsx             # Main App
│   └── main.jsx            # Entry Point
├── index.html              # HTML Template
├── vite.config.js          # Vite Config
└── package.json            # NPM Dependencies
```

### Adding a New Page

1. **Create Page Component** in `pages/`
```jsx
export const MyPage = () => {
  return <div>My Page Content</div>;
};
```

2. **Create Styles** in `styles/`
```css
.my-page {
  padding: 20px;
}
```

3. **Add to App.jsx**
```jsx
<Route path="/mypage" element={<MyPage />} />
```

## Deployment

### Docker Deployment

1. **Build Images**
```bash
docker-compose build
```

2. **Run Containers**
```bash
docker-compose up -d
```

3. **Check Status**
```bash
docker-compose ps
docker-compose logs backend
```

### AWS Deployment

1. Push to ECR
2. Create ECS tasks
3. Configure RDS for database
4. Set up ALB for load balancing
5. Configure CloudFront for frontend

## Security

### JWT Security
- Tokens expire after 24 hours
- Refresh tokens implemented
- Secure keys stored in environment variables

### Password Security
- BCrypt hashing
- Minimum 8 characters
- Special characters recommended

### API Security
- CORS configured for allowed origins
- HTTPS enforced in production
- SQL injection prevention via parameterized queries
- XSS protection via sanitization

### Best Practices
1. Change default admin password immediately
2. Use strong JWT secret (min 256 bits)
3. Keep dependencies updated
4. Regular security audits
5. Monitor access logs

## Testing

### Backend Testing
```bash
mvn test
```

### Frontend Testing
```bash
npm run test
```

### Integration Testing
```bash
npm run integration-test
```

---

**Last Updated**: February 2024
**Version**: 1.0.0

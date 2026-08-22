# Department Management System - README

## 🎓 Overview

The Department Management System is a comprehensive, modular web application designed to streamline department operations with a focus on simplicity and efficiency. It includes five key modules addressing student management, attendance tracking, document repository, and report generation.

## 🚀 Features

### Module 1: Student Management
- One-time student registration with verification
- Personal profile access with real-time updates
- View complete attendance records
- Track attendance percentage per subject
- Download academic documents

### Module 2: Attendance Management
- Teachers can mark attendance for their subjects
- Support for multiple attendance statuses (Present, Absent, Late, Leave)
- Attendance reports and analytics
- Automated attendance percentage calculation
- Batch attendance marking

### Module 3: Document Repository
- Upload and manage documents with metadata
- Three-tier visibility control:
  - **Public**: Accessible to all users
  - **Private**: Only uploader can access
  - **Restricted**: Specific roles/groups only
- Full-text search across documents
- Download tracking and analytics
- Comprehensive document management for admins

### Module 4: Report Generation
- **Manual Reports**: Generate on-demand
  - Attendance reports
  - Academic reports
  - Student performance summaries
- **Automated Reports**: Schedule regular report generation
- Multiple export formats (PDF, Excel)
- Report history and archival

### Module 5: Documentation
- **User Manual**: Step-by-step guides for all roles
- **Technical Documentation**: System architecture and development guide
- **API Documentation**: Complete endpoint reference
- **Deployment Guide**: Installation and configuration instructions

## 👥 User Roles

### Student
- Register and manage profile
- View personal attendance records
- Access assigned documents
- Generate personal reports
- Browse public documents

### Teacher
- Register and manage profile
- Mark and manage attendance for their subjects
- Access attendance analytics
- Upload study materials and resources
- Generate attendance reports

### Admin
- Full system access
- User and role management
- System monitoring and configuration
- Generate comprehensive reports
- Manage all documents and resources

## 📋 Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.1.5
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT Authentication
- **Build**: Maven

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **Routing**: React Router 6
- **HTTP Client**: Axios
- **Styling**: CSS3

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: MySQL containerized

## 🏗️ Project Structure

```
University Management/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/university/
│   │       ├── controller/     # REST APIs
│   │       ├── service/        # Business logic
│   │       ├── model/          # JPA entities
│   │       ├── repository/     # Data access
│   │       ├── dto/            # Data transfer objects
│   │       └── security/       # Auth & security
│   ├── src/main/resources/
│   │   └── application.yml     # Configuration
│   ├── pom.xml                 # Maven dependencies
│   └── Dockerfile              # Docker image
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── styles/             # CSS files
│   │   ├── App.jsx             # Main app
│   │   └── main.jsx            # Entry point
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite config
│   ├── package.json            # NPM dependencies
│   └── Dockerfile              # Docker image
│
├── database/
│   └── schema.sql              # Database schema
│
├── docker/
│   ├── docker-compose.yml      # Compose configuration
│   └── Dockerfile.mysql        # MySQL Docker config
│
└── docs/
    ├── USER_MANUAL.md          # User guide
    ├── TECHNICAL_DOCUMENTATION.md  # Developer guide
    ├── API_DOCUMENTATION.md    # API reference (in technical docs)
    └── DEPLOYMENT_GUIDE.md     # Setup instructions
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.9+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
# Navigate to docker directory
cd docker

# Start all services
docker-compose up -d

# Verify services
docker-compose ps

# Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
# MySQL: localhost:3306
```

### Manual Setup

#### Backend
```bash
cd backend
# Configure database in src/main/resources/application.yml
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## 📖 Documentation Files

- **[USER_MANUAL.md](./docs/USER_MANUAL.md)**: Complete guide for all user types
- **[TECHNICAL_DOCUMENTATION.md](./docs/TECHNICAL_DOCUMENTATION.md)**: Architecture, APIs, and development guide
- **[DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)**: Installation and deployment instructions (included in technical docs)

## 🔐 Default Credentials

**Admin Account** (Created automatically):
- Email: `admin@university.com`
- Password: `admin123`

⚠️ **Important**: Change the admin password immediately in production!

## 🔒 Security Features

- JWT-based authentication with 24-hour token expiration
- BCrypt password hashing
- Role-based access control (RBAC)
- CORS configuration for API security
- SQL injection prevention
- XSS attack mitigation
- HTTPS support in production

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Students
- `GET /api/students/profile` - Get current student profile
- `PUT /api/students/{id}/attendance` - Update attendance

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/percentage` - Get attendance percentage
- `GET /api/attendance/student/{studentId}/subject/{subjectId}` - Get student attendance

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/public` - Get public documents
- `GET /api/documents/my-documents` - Get user's documents

### Reports
- `POST /api/reports/attendance` - Generate attendance report
- `GET /api/reports/my-reports` - Get user's reports

## 🛠️ Development

### Adding a Backend Feature
1. Create entity in `model/`
2. Create repository in `repository/`
3. Create service in `service/`
4. Create controller in `controller/`

### Adding a Frontend Feature
1. Create page component in `pages/`
2. Create CSS file in `styles/`
3. Create API service in `services/`
4. Add route in `App.jsx`

## 🐛 Troubleshooting

### MySQL Connection Issues
- Verify MySQL is running: `docker ps` or check services
- Check credentials in `application.yml`
- Ensure database exists

### Frontend Not Loading
- Clear browser cache
- Check if backend is running on port 8080
- Verify CORS configuration

### API Errors
- Check backend logs: `docker logs university_backend`
- Verify JWT token in Authorization header
- Check request payload format

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚢 Deployment

### Docker Deployment
```bash
cd docker
docker-compose up -d
```

### Production Checklist
- [ ] Change admin password
- [ ] Update JWT secret in configuration
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure environment variables
- [ ] Set up database backups
- [ ] Enable application logging
- [ ] Configure firewall rules
- [ ] Test all functionality

## 📞 Support & Contribution

For issues and suggestions:
1. Check existing documentation
2. Review troubleshooting section
3. Contact system administrator
4. Submit bug reports with details

## 📄 License

This project is provided as-is for educational and organizational use.

## 👨‍💻 Development Team

Department Management System - Hackathon Project
Version: 1.0.0
Last Updated: February 2024

---

**Happy coding! 🎉**

For detailed documentation, see:
- [User Manual](./docs/USER_MANUAL.md)
- [Technical Documentation](./docs/TECHNICAL_DOCUMENTATION.md)

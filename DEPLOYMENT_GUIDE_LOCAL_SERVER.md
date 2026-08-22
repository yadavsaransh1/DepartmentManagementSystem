# Department Management System - Local Server Deployment Guide

**Date**: April 3, 2026  
**Target**: Local Department Server Deployment  
**System**: Department Management System (Full Stack: Java + React)

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [System Requirements](#system-requirements)
3. [Prerequisites Installation](#prerequisites-installation)
4. [Database Setup](#database-setup)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Service Configuration](#service-configuration)
8. [Testing & Verification](#testing--verification)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance Guide](#maintenance-guide)

---

## Pre-Deployment Checklist

- [ ] Get server admin credentials
- [ ] Verify network connectivity to server
- [ ] Backup existing databases (if any)
- [ ] Prepare deployment user account on server
- [ ] Reserve static IP address for server
- [ ] Test email service (SMTP) configuration
- [ ] Prepare SSL certificates (if HTTPS required)
- [ ] Document server hostname/IP address
- [ ] Create deployment schedule
- [ ] Inform users about downtime window (if applicable)

---

## System Requirements

### Server Hardware (Minimum)

| Component | Requirement |
|-----------|------------|
| **CPU** | Intel i7/AMD Ryzen 5 (4 cores, 2.5+ GHz) |
| **RAM** | 8 GB (Recommended: 16 GB) |
| **Storage** | 100 GB SSD (Recommended: 256 GB SSD) |
| **Network** | 1 Gbps LAN connection |
| **OS** | Windows Server 2019+ / Ubuntu 20.04+ |

### Software Requirements

| Software | Version | Purpose |
|----------|---------|---------|
| **Java JDK** | 11 or 17 | Backend Runtime |
| **MySQL Server** | 8.0+ | Database |
| **Node.js** | 16 LTS or 18 LTS | Frontend Build Tool |
| **npm** | 8+ | Package Manager |
| **Python** | 3.8+ | Utility Scripts |

---

## Prerequisites Installation

### Step 1: Install Java JDK 17

**Windows:**
```batch
# Download from: https://download.oracle.com/java/17/latest/jdk-17_windows-x64_bin.exe
# Or use Windows Package Manager:
winget install Oracle.JDK.17

# Verify installation
java -version
javac -version

# Set JAVA_HOME environment variable
setx JAVA_HOME "C:\Program Files\Java\jdk-17.0.x"
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install openjdk-17-jdk openjdk-17-jre

# Verify
java -version

# Set JAVA_HOME
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
echo $JAVA_HOME
```

### Step 2: Install MySQL Server 8.0+

**Windows:**
```batch
# Download: https://dev.mysql.com/downloads/mysql/
# Or use Windows Pakcage Manager:
winget install Oracle.MySQL

# After installation, start MySQL service:
mysql --version
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server

# Verify
mysql --version

# Secure MySQL
sudo mysql_secure_installation

# Start service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 3: Install Node.js & npm

**Windows:**
```batch
# Download: https://nodejs.org/en/download/ (LTS version)
# Or use Windows Package Manager:
winget install OpenJS.NodeJS.LTS

# Verify
node --version
npm --version
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### Step 4: Install Maven (for backend build)

**Windows:**
```batch
# Download: https://maven.apache.org/download.cgi
# Extract to: C:\Program Files\Apache\maven
# Add to PATH: C:\Program Files\Apache\maven\bin

# Verify
mvn --version
```

**Linux:**
```bash
sudo apt install maven

# Verify
mvn --version
```

---

## Database Setup

### Step 1: Create Database User

```sql
-- Login as MySQL root
mysql -u root -p

-- Create database
CREATE DATABASE university_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create deployment user
CREATE USER 'university_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';

-- Grant privileges
GRANT ALL PRIVILEGES ON university_db.* TO 'university_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW GRANTS FOR 'university_user'@'localhost';
```

### Step 2: Initialize Database Schema

```bash
# Navigate to backend directory
cd backend

# Option A: If using Hibernate JPA (auto-schema generation)
# Update application.properties:
spring.jpa.hibernate.ddl-auto=create-drop  # Use only on first deployment!
                                            # Then change to 'validate' or 'update'

# Option B: Manual SQL import (Recommended for production)
# Export schema from source database or create manually
mysql -u university_user -p university_db < database_schema.sql
```

### Step 3: Import Initial Data (Optional)

```bash
# If you have sample data
mysql -u university_user -p university_db < sample_data.sql
```

### Step 4: Verify Database

```sql
-- Connect as deployment user
mysql -u university_user -p university_db

-- List all tables
SHOW TABLES;

-- Verify user creation
SELECT COUNT(*) FROM users;

-- Check status
SELECT 
  SCHEMANAME as 'Database',
  COUNT(*) as 'Total Tables'
FROM INFORMATION_SCHEMA.TABLES
GROUP BY SCHEMANAME;
```

---

## Backend Deployment

### Step 1: Build Backend

```bash
# Navigate to backend directory
cd backend

# Clean and build
mvn clean package -DskipTests -q

# Wait for build to complete (usually 2-5 minutes)
# You should see: BUILD SUCCESS

# Verify JAR was created
ls -la target/university-management-*.jar
```

### Step 2: Configure Application Properties

Edit: `backend/src/main/resources/application.properties`

```properties
# ====== DATABASE CONFIGURATION ======
spring.datasource.url=jdbc:mysql://localhost:3306/university_db
spring.datasource.username=university_user
spring.datasource.password=SecurePassword123!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ====== JPA/HIBERNATE ======
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# ====== SERVER ======
server.port=8080
server.servlet.context-path=/api
server.compression.enabled=true

# ====== LOGGING ======
logging.level.root=INFO
logging.level.com.university=DEBUG
logging.file.name=logs/application.log

# ====== JWT & SECURITY ======
jwt.secret.key=YourSecretKeyHereChangeInProduction123!@#
jwt.expiration.time=86400000

# ====== EMAIL CONFIGURATION (Optional) ======
mail.smtp.host=smtp.gmail.com
mail.smtp.port=587
mail.smtp.username=your-email@gmail.com
mail.smtp.password=your-app-password
mail.smtp.auth=true
mail.smtp.starttls.enable=true

# ====== FILE UPLOAD ======
file.upload.dir=/var/university-files/uploads
file.max.size=10485760

# ====== CORS CONFIGURATION ======
cors.allowed.origins=http://localhost:3000,http://localhost:5173,http://server-ip:3000
```

### Step 3: Deploy Backend JAR

```bash
# Create deployment directory
mkdir -p /opt/university-management/backend
mkdir -p /opt/university-management/logs
mkdir -p /var/university-files/uploads

# Copy built JAR
cp backend/target/university-management-*.jar /opt/university-management/backend/

# Create startup script
cat > /opt/university-management/backend/start.sh << 'EOF'
#!/bin/bash
cd /opt/university-management/backend
java -Xmx2G -Xms1G -jar university-management-*.jar
EOF

# Make executable
chmod +x /opt/university-management/backend/start.sh

# Test startup
cd /opt/university-management/backend
./start.sh
```

### Step 4: Setup Background Service (Systemd - Linux)

```bash
# Create systemd service file
sudo tee /etc/systemd/system/university-backend.service << 'EOF'
[Unit]
Description=Department Management System Backend
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/university-management/backend
ExecStart=/opt/university-management/backend/start.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable university-backend
sudo systemctl start university-backend

# Verify status
sudo systemctl status university-backend
```

### Step 5: Verify Backend is Running

```bash
# Test backend health endpoint
curl -i http://localhost:8080/api/health

# Expected response: 200 OK

# Check logs
tail -f /opt/university-management/logs/application.log
```

---

## Frontend Deployment

### Step 1: Build Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run build
npm run build

# This creates 'dist' folder with production build
ls -la dist/
```

### Step 2: Configure Environment

Edit: `frontend/.env.production`

```
VITE_API_URL=http://server-ip:8080/api
VITE_APP_NAME=Department Management System
VITE_PHI_SERVICE_URL=http://server-ip:5000/api
```

### Step 3: Setup Web Server (Nginx)

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Create nginx config
sudo tee /etc/nginx/sites-available/university-frontend << 'EOF'
server {
    listen 80;
    server_name uw-mgmt.yourdomain.com;  # Change to your domain/IP
    
    root /var/www/university-frontend;
    index index.html;
    
    # SPA routing: send all requests to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to backend
    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/university-frontend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### Step 4: Deploy Frontend Build

```bash
# Create deployment directory
sudo mkdir -p /var/www/university-frontend

# Copy production build
sudo cp -r frontend/dist/* /var/www/university-frontend/

# Set permissions
sudo chown -R www-data:www-data /var/www/university-frontend
sudo chmod -R 755 /var/www/university-frontend

# Verify
ls -la /var/www/university-frontend/
```

### Step 5: Test Frontend Access

```
Open browser: http://server-ip
Should see login page
```

---

## Service Configuration

### Environment Variables Setup

**Linux - Add to `/etc/environment`:**

```bash
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
MYSQL_HOME=/usr
NODE_ENV=production
APP_ENV=production
```

### Create Startup Script (`start-all.sh`)

```bash
#!/bin/bash

echo "Starting Department Management System..."

# Start MySQL (if not auto-starting)
systemctl start mysql
echo "✓ MySQL started"

# Start Backend
systemctl start university-backend
echo "✓ Backend started"

# Start Nginx (if not auto-starting)
systemctl start nginx
echo "✓ Frontend/Nginx started"

# Wait for services
sleep 5

# Check health
echo ""
echo "Checking services..."
curl -s http://localhost:8080/api/health && echo "✓ Backend healthy"
curl -s http://localhost/ > /dev/null && echo "✓ Frontend healthy"

echo ""
echo "System startup complete!"
echo "Access at: http://server-ip"
```

### Create Shutdown Script (`stop-all.sh`)

```bash
#!/bin/bash

echo "Stopping Department Management System..."

systemctl stop university-backend
echo "✓ Backend stopped"

systemctl stop nginx
echo "✓ Frontend stopped"

echo "Shutdown complete!"
```

---

## Testing & Verification

### Step 1: Backend API Testing

```bash
# Health check
curl -i http://localhost:8080/api/health

# Login test
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"admin123"}'

# Get users
curl -H "Authorization: Bearer {TOKEN}" http://localhost:8080/api/users
```

### Step 2: Frontend Testing

Open browser and test:

1. **Login Page** → http://server-ip
2. **Student Dashboard** → Login as student
3. **Teacher Dashboard** → Login as teacher
4. **Admin Panel** → Login as admin
5. **Test Key Features**:
   - View marks
   - Check attendance
   - Upload documents
   - View notifications

### Step 3: Database Verification

```sql
-- Check connectivity
SELECT 1;

-- Verify data integrity
SELECT COUNT(*) as StudentCount FROM students;
SELECT COUNT(*) as TeacherCount FROM teachers;
SELECT COUNT(*) as MarkRecords FROM marks;

-- Check service status
SHOW PROCESSLIST;
SHOW ENGINE INNODB STATUS \G
```

### Step 4: Performance Testing

```bash
# Backend response time test
time curl http://localhost:8080/api/health

# Load testing (install apache bench: apt install apache2-utils)
ab -n 100 -c 10 http://localhost:8080/api/health

# Monitor system resources
top
htop
```

---

## Troubleshooting

### Issue: Backend won't start

```bash
# Check logs
tail -100 /opt/university-management/logs/application.log

# Check port availability
netstat -tuln | grep 8080

# Kill process on port 8080
sudo lsof -i :8080
sudo kill -9 <PID>

# Verify Java installation
java -version

# Check database connection
mysql -u university_user -p university_db -e "SELECT 1"
```

### Issue: Frontend shows blank page

```bash
# Check nginx logs
sudo tail -f /var/nginx/error.log

# Check browser console (F12)
# Look for 404 or CORS errors

# Verify API connection
curl http://localhost:8080/api/health

# Clear browser cache
# Ctrl+Shift+Delete or equivalent
```

### Issue: Database connection failed

```bash
# Check MySQL service
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Test connection
mysql -h localhost -u university_user -p university_db -e "SELECT 1"

# Check user privileges
mysql -u root -p -e "SHOW GRANTS FOR 'university_user'@'localhost'"

# Verify database exists
mysql -u root -p -e "SHOW DATABASES" | grep university_db
```

### Issue: CORS errors in frontend

**Solution**: Update backend CORS configuration:

```java
// In SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://server-ip",
        "http://server-ip:3000",
        "http://department.local"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Issue: File upload failures

```bash
# Check upload directory permissions
ls -la /var/university-files/

# Fix permissions
chmod -R 755 /var/university-files/uploads
chown -R www-data:www-data /var/university-files/

# Verify disk space
df -h

# Check file size limit in nginx
# Add to nginx config:
client_max_body_size 50M;
```

---

## Maintenance Guide

### Regular Tasks

**Daily:**
- Monitor system resources (CPU, RAM, Disk)
- Check error logs: `tail -f /opt/university-management/logs/application.log`
- Verify services are running: `systemctl status university-backend`

**Weekly:**
- Database backup
- Review error logs for patterns
- Test critical workflows

**Monthly:**
- Performance analysis
- Security updates checking
- Database optimization (ANALYZE, OPTIMIZE)

**Quarterly:**
- Full system backup
- Disaster recovery test
- Load testing

### Backup Strategy

```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/var/backups/university"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
mysqldump -u university_user -p university_db > $BACKUP_DIR/db_backup_$DATE.sql

# Application files backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /opt/university-management/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Performance Optimization

```properties
# backend/application.properties
# Connection pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

# Caching
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379

# Session management
spring.session.store-type=jdbc

# Query optimization
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### Monitoring Setup

```bash
# Install monitoring tools
sudo apt install prometheus grafana-server

# Enable status page at: http://server-ip:3000
sudo systemctl start grafana-server
```

---

## Security Recommendations

1. **Enable HTTPS (SSL/TLS)**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot certonly --nginx -d yourdomain.com
   
   # Update nginx config to use certificates
   ```

2. **Setup Firewall**
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp  # SSH
   sudo ufw allow 80/tcp  # HTTP
   sudo ufw allow 443/tcp # HTTPS
   sudo ufw allow 3306/tcp # MySQL (internal only)
   ```

3. **Enable 2FA for Admins**
   - Configure in admin settings
   - Document for users

4. **Regular Security Updates**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

5. **Database** Password Security
   - Use strong passwords
   - Change default MySQL root password
   - Limit MySQL access to localhost only

---

## Post-Deployment Checklist

- [ ] All services running and healthy
- [ ] Database backup created
- [ ] Frontend accessible at http://server-ip
- [ ] Login with test accounts verified
- [ ] File uploads working
- [ ] All key features tested
- [ ] Monitoring setup complete
- [ ] Backup schedule configured
- [ ] Users notified of new system
- [ ] Documentation provided to IT staff
- [ ] Emergency contacts documented
- [ ] Disaster recovery plan in place

---

## Support & Documentation

For issues or questions:
1. Check logs first
2. Review this guide's troubleshooting section
3. Contact your IT department
4. Reference: [Backend Documentation](../Technical%20Documentation/)

**Deployment completed by**: _______________  
**Deployment date**: _______________  
**Server details**: _______________  
**Admin contact**: _______________

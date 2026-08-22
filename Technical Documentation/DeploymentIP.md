# Server IP Address Change Guide

## Overview
This guide explains how to change the server IP address when deploying to a new environment or when the network IP changes. The Department Management System uses a centralized configuration approach to make IP changes simple and safe.

---

## Quick Summary: Where IPs Are Configured

| Component | File | Current Value | Environment |
|-----------|------|---------------|-------------|
| **Backend Server** | `backend/src/main/resources/application.properties` | `10.52.9.128:8080` | All environments |
| **Frontend API** | `frontend/.env.local` | `localhost:8080` | Local Development |
| **Frontend API** | `frontend/.env.network` | `10.52.9.128:8080` | Network Deployment |
| **Frontend API** | `frontend/.env.production` | `your-production-domain` | Production |
| **Phi Service** | `.env.network` | `10.52.9.128:5000` | Phi AI Chat |
| **CORS Origins** | `application.properties` | Multiple entries | Backend Authorization |

---

## Scenario 1: Change Server IP Address (e.g., 10.52.9.128 → 192.168.1.100)

### Step 1: Update Backend Configuration

**File**: `backend/src/main/resources/application.properties`

**Old:**
```properties
server.address=10.52.9.128
server.port=8080
```

**New:**
```properties
server.address=192.168.1.100
server.port=8080
```

### Step 2: Update CORS Allowed Origins

**File**: `backend/src/main/resources/application.properties`

Find this line:
```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,...,http://10.52.9.128:3000,http://10.52.9.128:5173,http://10.52.9.128:5174
```

**Replace all instances of `10.52.9.128` with `192.168.1.100`:**

```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,...,http://192.168.1.100:3000,http://192.168.1.100:5173,http://192.168.1.100:5174
```

### Step 3: Update Frontend Configuration

**File**: `frontend/.env.network`

**Old:**
```
VITE_SERVER_HOST=10.52.9.128
VITE_SERVER_PORT=5173
VITE_API_BASE_URL=http://10.52.9.128:8080
VITE_PHI_API_BASE_URL=http://10.52.9.128:5000
```

**New:**
```
VITE_SERVER_HOST=192.168.1.100
VITE_SERVER_PORT=5173
VITE_API_BASE_URL=http://192.168.1.100:8080
VITE_PHI_API_BASE_URL=http://192.168.1.100:5000
```

### Step 4: Rebuild and Deploy

#### Backend:
```bash
cd backend
mvn clean package
java -jar target/DepartmentManagement-0.0.1-SNAPSHOT.jar
```

Or using the provided scripts:
```bash
cd University Management
./rebuild-backend.bat   # Windows
# or
./build-backend.bat
```

#### Frontend:
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Build with the network environment
npm run build -- --mode network

# Or start development server
npm run dev -- --mode network
```

### Step 5: Verify the Changes

1. **Check Backend is Running:**
   ```bash
   curl http://192.168.1.100:8080/api/health
   ```

2. **Test API Endpoint:**
   ```bash
   curl http://192.168.1.100:8080/api/teachers
   ```

3. **Check Frontend in Browser:**
   - Navigate to `http://192.168.1.100:5173`
   - Open Developer Console (F12 → Network tab)
   - Perform an API action (login, fetch data)
   - Verify API calls go to `http://192.168.1.100:8080/api/...`
   - Check Console for any CORS errors

---

## Scenario 2: Add a New Environment Configuration

If you need to deploy to multiple environments (e.g., staging, testing, etc.), follow these steps:

### Step 1: Create New Environment File

Create a new file: `frontend/.env.staging`

```
VITE_SERVER_HOST=staging-server-ip
VITE_SERVER_PORT=5173
VITE_API_BASE_URL=http://staging-server-ip:8080
VITE_PHI_API_BASE_URL=http://staging-server-ip:5000
```

### Step 2: Update Backend Configuration for Staging

Create a new backend configuration file or use Spring profiles.

**Option A: Application properties with profiles**

Create: `backend/src/main/resources/application-staging.properties`

```properties
server.address=staging-server-ip
server.port=8080
app.cors.allowed-origins=http://staging-server-ip:3000,http://staging-server-ip:5173,http://staging-server-ip:5174
```

### Step 3: Run with Staging Environment

**Frontend:**
```bash
npm run dev -- --mode staging
# or
npm run build -- --mode staging
```

**Backend:**
```bash
java -jar target/app.jar --spring.profiles.active=staging
```

---

## Scenario 3: Production Deployment

### Step 1: Update Production Environment File

**File**: `frontend/.env.production`

```
VITE_SERVER_HOST=your-production-domain.com
VITE_SERVER_PORT=80
VITE_API_BASE_URL=http://your-production-domain.com
VITE_PHI_API_BASE_URL=http://your-production-domain.com:5000
```

### Step 2: Update Backend for Production

**File**: `backend/src/main/resources/application.properties`

```properties
server.address=your-production-domain.com
server.port=8080
app.cors.allowed-origins=http://your-production-domain.com,https://your-production-domain.com,http://your-production-domain.com:80

# Production-specific settings
spring.jpa.hibernate.ddl-auto=validate
jwt.secret=your-production-secret-key-very-long-and-secure
```

### Step 3: Build for Production

**Frontend:**
```bash
npm run build -- --mode production
# Deploy the 'dist' folder to your production server
```

**Backend:**
```bash
mvn clean package -DskipTests
# Deploy the JAR file to production server
```

---

## Important Configuration Files Reference

### Frontend Files That Read Environment Variables

| File | What It Reads | How It's Used |
|------|---------------|---------------|
| `frontend/.env.local` | `VITE_API_BASE_URL`, `VITE_PHI_API_BASE_URL` | Local development server |
| `frontend/.env.network` | `VITE_API_BASE_URL`, `VITE_PHI_API_BASE_URL` | Network IP deployment |
| `frontend/.env.production` | `VITE_API_BASE_URL`, `VITE_PHI_API_BASE_URL` | Production deployment |
| `frontend/src/utils/apiClient.js` | Uses `VITE_API_BASE_URL` and `VITE_PHI_API_BASE_URL` | All API calls throughout app |
| `frontend/src/config/api.js` | Uses `VITE_API_BASE_URL` | All endpoint definitions |
| `frontend/vite.config.js` | Uses `VITE_SERVER_HOST`, `VITE_SERVER_PORT` | Dev server configuration |

### Backend Files That Configure IP

| File | What It Controls | Default | Note |
|------|------------------|---------|------|
| `application.properties` | Server binding address and port | `10.52.9.128:8080` | Must match network setup |
| `application.properties` | CORS allowed origins | Multiple entries | Must include all client IPs/domains |
| `application-staging.properties` | Staging-specific config | N/A | Optional, for staging environment |
| `application-production.properties` | Production-specific config | N/A | Optional, for production environment |

---

## Common IP Change Patterns

### Pattern 1: Entire Network IP Change
When the server moves to a different network subnet:

1. Backend: `server.address` = new IP
2. Backend: `app.cors.allowed-origins` = update all IPs
3. Frontend: `.env.network` = update `VITE_API_BASE_URL` and `VITE_PHI_API_BASE_URL`

**Files to Edit:** 2 (1 backend + 1 frontend)

### Pattern 2: Domain-Based Access (Production)
When moving to a domain instead of IP:

1. Backend: `server.address` = domain or 0.0.0.0 (listen on all)
2. Backend: `app.cors.allowed-origins` = domain
3. Frontend: `.env.production` = domain without port or with HTTPS

**Files to Edit:** 2 (1 backend + 1 frontend)

### Pattern 3: Port Change Only
When only the port changes (e.g., 8080 → 9090):

1. Backend: `server.port` = new port
2. Backend: `app.cors.allowed-origins` = update ports
3. Frontend: `VITE_API_BASE_URL` = update port in URL

**Files to Edit:** 2 (1 backend + 1 frontend)

---

## Troubleshooting IP Change Issues

### Issue 1: CORS Error After IP Change
**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Verify backend's `app.cors.allowed-origins` includes the new IP/domain
- Restart the backend service
- Clear browser cache (Ctrl+Shift+Delete)
- Verify frontend is sending requests to correct IP

### Issue 2: Cannot Connect to Backend
**Error**: `Connection refused` or `Unable to reach server`

**Solution:**
- Verify server is running: `curl http://new-ip:8080/api/health`
- Check firewall allows port 8080
- Verify `VITE_API_BASE_URL` in `.env` file matches actual backend IP
- Ensure frontend is using correct `.env` file (`.env.network` vs `.env.local`)

### Issue 3: Phi Service Not Working
**Error**: Chat feature not responding

**Solution:**
- Verify `VITE_PHI_API_BASE_URL` is updated to new IP
- Check Phi service is running on port 5000: `curl http://new-ip:5000/api/phi/health`
- Check backend CORS includes the new IP for Phi requests
- Restart both frontend dev server and Phi service

### Issue 4: API Calls Using Old IP After Deployment
**Error**: Frontend still trying to connect to old IP

**Solution:**
- Ensure correct `.env` file is being used during build
- For Vite: `npm run build -- --mode network` (or appropriate mode)
- Clear browser cache completely
- In dev mode, restart the Vite dev server after `.env` change
- Verify `API_BASE_URL` in apiClient.js is picking up correct value

---

## Verification Checklist

After changing IP addresses, verify:

- [ ] Backend service is running on new IP and port
  ```bash
  curl http://new-ip:8080/api/health
  ```

- [ ] Frontend environment file (.env.network, etc.) has new IP
  ```bash
  cat frontend/.env.network
  ```

- [ ] Backend CORS configuration includes new IP
  ```bash
  grep "app.cors.allowed-origins" backend/src/main/resources/application.properties
  ```

- [ ] Frontend builds successfully with new IP
  ```bash
  npm run build -- --mode network  # or appropriate mode
  ```

- [ ] Frontend loads and makes API calls to new IP (check Network tab in DevTools)

- [ ] Login works (requires successful API call to backend)

- [ ] File uploads work (requires backend connectivity)

- [ ] Phi chat works (if Phi service is running)

- [ ] All CRUD operations work (create, read, update, delete)

---

## Emergency IP Revert

If something goes wrong and you need to revert to the previous IP:

1. **Identify current IP**: Check the `.env` files and `application.properties`

2. **Revert frontend** (2 minutes):
   ```bash
   cd frontend
   git checkout frontend/.env.network
   npm install
   npm run build -- --mode network
   ```

3. **Revert backend** (5 minutes):
   ```bash
   cd backend
   git checkout src/main/resources/application.properties
   mvn clean package
   java -jar target/app.jar
   ```

4. **Verify**: Test login and API calls

---

## Summary: IP Change Checklist

```markdown
## For IP Change from [OLD_IP] to [NEW_IP]

### Backend Changes
- [ ] Edit: backend/src/main/resources/application.properties
  - [ ] Change server.address=OLD_IP to server.address=NEW_IP
  - [ ] Update app.cors.allowed-origins (replace all OLD_IP with NEW_IP)
- [ ] Rebuild and restart backend

### Frontend Changes  
- [ ] Edit: frontend/.env.network
  - [ ] VITE_SERVER_HOST=NEW_IP
  - [ ] VITE_API_BASE_URL=http://NEW_IP:8080
  - [ ] VITE_PHI_API_BASE_URL=http://NEW_IP:5000
- [ ] Rebuild frontend

### Verification
- [ ] Backend health check: curl http://NEW_IP:8080/api/health
- [ ] Frontend loads: http://NEW_IP:5173
- [ ] Login works
- [ ] API calls show correct IP in Network tab
```

---

## Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review the **Verification Checklist** 
3. Check browser console (F12 → Console) for error messages
4. Check backend logs for CORS or connection errors
5. Ensure both backend and frontend are fully rebuilt after IP change

For configuration issues specific to your environment, refer to:
- [ENVIRONMENT_CONFIG_GUIDE.md](../ENVIRONMENT_CONFIG_GUIDE.md)
- [CONFIGURATION_REFACTORING_COMPLETE.md](../CONFIGURATION_REFACTORING_COMPLETE.md)

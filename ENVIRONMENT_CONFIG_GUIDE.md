# Environment Configuration Guide

## Overview

The application now uses **centralized configuration** for IP addresses, ports, and CORS origins. This eliminates the need to edit multiple files when changing deployment environments.

---

## Backend Configuration

### How It Works

CORS origins are defined in **one place**: `application.properties`

```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,...
```

The `SecurityConfig.java` reads this property and applies it globally to all controllers. **No `@CrossOrigin` decorators are needed on individual controllers.**

### Switching Environments (Backend)

**For Local Development:**
```properties
server.address=localhost
server.port=8080
app.cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177,http://localhost:5178,http://localhost:5179,http://localhost:5180
```

**For Network/IP-based Deployment:**
```properties
server.address=10.52.9.128
server.port=8080
app.cors.allowed-origins=http://10.52.9.128:3000,http://10.52.9.128:5173,http://10.52.9.128:5174,http://10.52.9.128:5175,...
```

**For Production (Domain-based):**
```properties
server.address=0.0.0.0
server.port=8080
app.cors.allowed-origins=https://mydomain.com,https://app.mydomain.com,...
```

### To Add a New Frontend Origin

Simply add it to the comma-separated list in `app.cors.allowed-origins`:

```properties
app.cors.allowed-origins=http://localhost:5173,http://10.52.9.128:5173,http://newhost:5173,...
```

**All controllers automatically get access to this new origin. No file edits needed.**

---

## Frontend Configuration

### How It Works

Frontend uses **environment files** with Vite:

- `.env.local` - Local development (localhost)
- `.env.network` - Network deployment (IP-based)
- `.env.production` - Production deployment (domain-based)

The `api.js` reads the backend URL from these environment files:

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

The `vite.config.js` reads server and proxy settings from environment files.

### Environment Files

#### `.env.local` (Local Development)
```
VITE_SERVER_HOST=localhost
VITE_SERVER_PORT=5173
VITE_API_BASE_URL=http://localhost:8080
```

#### `.env.network` (Network/IP Deployment)
```
VITE_SERVER_HOST=10.52.9.128
VITE_SERVER_PORT=5173
VITE_API_BASE_URL=http://10.52.9.128:8080
```

#### `.env.production` (Production Domain)
```
VITE_SERVER_HOST=0.0.0.0
VITE_SERVER_PORT=80
VITE_API_BASE_URL=https://mydomain.com
```

### Running Frontend with Different Environments

**Local Development:**
```bash
npm run dev
# or
npm run dev -- --mode local
```

**Network Deployment:**
```bash
npm run dev -- --mode network
```

**Production Build:**
```bash
npm run build -- --mode production
```

---

## Architecture Benefits

### Before (Old Approach)
- ❌ Hardcoded IP in 30+ files
- ❌ Each controller had @CrossOrigin decorator
- ❌ SecurityConfig, DepartmentManagementApplication, and controllers all had duplicate CORS config
- ❌ Changing IP meant editing 6+ files

### After (New Approach)
- ✅ CORS origins defined in **ONE** place (`app.cors.allowed-origins`)
- ✅ All controllers inherit CORS from SecurityConfig
- ✅ Frontend reads backend URL from **environment files**
- ✅ Changing environment requires editing **only .env files**
- ✅ Easy to manage local, network, and production configs

---

## Summary Table

| Component | Location | Change Impact |
|-----------|----------|----------------|
| Backend CORS origins | `application.properties` (line ~6) | ✅ All controllers |
| Backend server address | `application.properties` (line ~3) | ✅ Backend |
| Frontend API URL | `.env.local/.env.network/.env.production` | ✅ All API calls |
| Frontend server host | `.env.local/.env.network/.env.production` | ✅ Dev server |
| Controller CORS decorators | **REMOVED** - No longer needed | ✅ Cleaner code |

---

## Quick Change Checklist

**To change deployment from `10.52.9.128` to `192.168.1.100`:**

### Backend
- [ ] Edit `application.properties` line 3: `server.address=192.168.1.100`
- [ ] Edit `application.properties` line 6: Update all `10.52.9.128` to `192.168.1.100` in `app.cors.allowed-origins`

### Frontend
- [ ] Edit `.env.network` line 1: `VITE_SERVER_HOST=192.168.1.100`
- [ ] Edit `.env.network` line 3: `VITE_API_BASE_URL=http://192.168.1.100:8080`

**Total: 4 edits instead of 30+**


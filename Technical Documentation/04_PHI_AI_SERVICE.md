# Phi AI Service - Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation)
4. [API Endpoints](#api-endpoints)
5. [Phi Model Details](#phi-model)
6. [Integration with Backend](#integration)
7. [Chat Flow](#chat-flow)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## <a name="overview"></a>1. Overview

### What is Phi AI Service?

The **Phi AI Service** is a lightweight AI chatbot service integrated into the University Management System. It provides intelligent conversational support to students, teachers, and admins using Microsoft's Phi-3.5-mini language model.

### Purpose

- **Student Support**: Answer FAQs, provide course information, academic guidance
- **Teacher Assistance**: Help with grading, student management, course planning
- **Admin Support**: System navigation, database queries, reporting
- **24/7 Availability**: No human required - instant responses

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Flask | 2.x |
| **LLM Model** | Microsoft Phi-3.5-mini | 4-bit quantized |
| **CORS** | Flask-CORS | Latest |
| **Hardware** | CPU-only (optional GPU) | Any |

### Key Features

✅ **Context-Aware**: Uses user type, enrollment, and history  
✅ **Lightweight**: Runs on CPU, minimal resources  
✅ **Memory Efficient**: 4-bit quantization reduces from 16GB to ~3GB  
✅ **Real-time**: Sub-second response times  
✅ **Multi-user**: Separate chat history per user  
✅ **Fallback-safe**: Graceful handling of failures  

---

## <a name="architecture"></a>2. Architecture

### Service Architecture

```
┌─────────────────────────────────────────┐
│     Frontend (React Application)        │
│     http://localhost:5173               │
├─────────────────────────────────────────┤
│           ↓ HTTP Requests               │
│           ↓ Access Token                │
├─────────────────────────────────────────┤
│  Phoenix AI Chatbot Component           │
│  (Uses /api/phi/chat endpoint)          │
├─────────────────────────────────────────┤
│           ↓ JSON Requests               │
│           ↓ Messages & User ID          │
├─────────────────────────────────────────┤
│    Phi AI Service (Flask)               │
│    http://localhost:5000                │
│  ┌─────────────────────────────────┐   │
│  │ Flask App                       │   │
│  │ ├─ Health Check Endpoint        │   │
│  │ ├─ Chat Endpoint                │   │
│  │ ├─ History Management           │   │
│  │ └─ Request Validation           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Phi Model (4-bit quantized)     │   │
│  │ ├─ 3.5 billion parameters       │   │
│  │ ├─ Optimized for inference      │   │
│  │ └─ CPU or GPU execution         │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Chat History (In-Memory)        │   │
│  │ ├─ Per-user conversation logs   │   │
│  │ ├─ Last 10 messages kept        │   │
│  │ └─ Timestamp tracking           │   │
│  └─────────────────────────────────┘   │
├─────────────────────────────────────────┤
│         Optional: Backend API           │
│    http://localhost:8080                │
│  (for enhanced context features)        │
└─────────────────────────────────────────┘
```

### Data Flow

**Request Flow**:
1. User types message in frontend chatbot widget
2. Frontend sends POST request to `/api/phi/chat`
3. Includes: `userId`, `userType`, `message`, `userInfo`
4. Flask validates request
5. Updates chat history
6. Sends to Phi model with context
7. Model generates response
8. Response sent back to frontend
9. Frontend displays in chat UI

**Response Example**:
```json
{
  "status": "success",
  "response": "Based on your course enrollment, you have 3 active courses...",
  "userId": "STU001",
  "tokens_used": 245,
  "timestamp": "2026-03-22T10:30:45.123Z"
}
```

---

## <a name="installation"></a>3. Installation & Setup

### Prerequisites

1. **Python 3.10+**
   ```powershell
   python --version  # Should show 3.10 or higher
   ```

2. **pip (Python Package Manager)**
   ```powershell
   pip --version
   ```

3. **Virtual Environment (Recommended)**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

### Installation Steps

**Step 1: Navigate to phi-service directory**
```powershell
cd "C:\Users\HP\OneDrive\Desktop\University Management\phi-service"
```

**Step 2: Install dependencies**
```powershell
pip install -r requirements.txt
```

This installs:
- `flask` - Web framework
- `flask-cors` - Cross-origin support
- `transformers` - Hugging Face transformers library
- `torch` - PyTorch (CPU or GPU)
- `bitsandbytes` - 4-bit quantization
- `accelerate` - Model optimization

**Step 3: Download Phi Model (First Run)**
```powershell
python -m phi_model
```

This downloads Microsoft's Phi-3.5-mini model (~3.5GB after quantization). 
**First time: ~5-10 minutes depending on internet**

**Step 4: Start the service**
```powershell
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
 * Debug mode is off
```

### Verify Installation

```powershell
# In another terminal
curl http://localhost:5000/api/phi/health

# Should return:
# {
#   "status": "Phi AI Service is running",
#   "model": "Phi-3.5-mini (4-bit quantized)",
#   "timestamp": "2026-03-22T10:30:45.123Z"
# }
```

---

## <a name="api-endpoints"></a>4. API Endpoints

### Health Check Endpoint

**Endpoint**: `GET /api/phi/health`

**Purpose**: Verify service is running and model is loaded

**Response**:
```json
{
  "status": "Phi AI Service is running",
  "model": "Phi-3.5-mini (4-bit quantized)",
  "timestamp": "2026-03-22T10:30:45.123Z"
}
```

**Status Code**: `200 OK`

---

### Chat Endpoint

**Endpoint**: `POST /api/phi/chat`

**Purpose**: Send message and receive AI response

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "userId": "STU001",
  "userType": "student",
  "message": "What are my current courses?",
  "userInfo": {
    "name": "Rajesh Kumar",
    "email": "rajesh@university.edu",
    "enrolledCourses": ["CS101", "MATH201", "ENG101"],
    "semester": "3rd",
    "cgpa": 3.75
  }
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | Unique user identifier (student/teacher/admin ID) |
| `userType` | string | Yes | One of: `student`, `teacher`, `admin` |
| `message` | string | Yes | User's chat message |
| `userInfo` | object | No | Additional context about user |

**Response (Success)**:
```json
{
  "status": "success",
  "response": "You are currently enrolled in CS101 (Programming), MATH201 (Calculus), and ENG101 (English Literature). Your attendance in CS101 is 87% which meets the requirement. Would you like details about any specific course?",
  "userId": "STU001",
  "tokens_used": 245,
  "timestamp": "2026-03-22T10:30:45.123Z"
}
```

**Response (Error)**:
```json
{
  "status": "error",
  "error": "Message cannot be empty",
  "userId": "STU001",
  "timestamp": "2026-03-22T10:30:45.123Z"
}
```

**Status Codes**:
- `200 OK` - Successful response
- `400 Bad Request` - Missing required fields
- `500 Internal Server Error` - Model error

---

## <a name="phi-model"></a>5. Phi Model Details

### Model Information

**Name**: Microsoft Phi-3.5-mini  
**Size**: 3.8 billion parameters  
**Quantization**: 4-bit (bitsandbytes)  
**Memory**: ~3GB after quantization (vs 16GB full precision)  
**License**: MIT  
**Source**: [Microsoft on Hugging Face](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)

### Model Capabilities

✅ **Strengths**:
- Fast inference (sub-second responses)
- Low memory footprint
- Good at instruction following
- Effective for educational context
- Supports multi-turn conversations

❌ **Limitations**:
- Smaller vocabulary than larger models
- May decline unknown/specialized topics
- Context window: 4,096 tokens max
- No real-time internet access

### Quantization Details

**Why 4-bit?**
- Reduces model size from 16GB to ~3GB
- Minimal quality loss (< 2%)
- Enables CPU-only execution
- Quantized with bitsandbytes library

**Configuration**:
```python
# In phi_model.py
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)
```

### Max Tokens & Context

- **Max Input Tokens**: 4,096
- **Max Output Tokens**: 1,024 (default)
- **Chat History Kept**: Last 10 messages
- **Message Pruning**: Oldest messages removed if exceeds limit

---

## <a name="integration"></a>6. Integration with Backend

### Optional: Connect to Backend API

The Phi service can optionally integrate with the main backend to get real context:

**Backend Endpoints for Context**:
```
GET /api/students/{studentId}          - Student details
GET /api/students/{studentId}/courses  - Enrolled courses
GET /api/students/{studentId}/marks    - Grade information
GET /api/attendance/{studentId}        - Attendance records
GET /api/teachers/{teacherId}/courses  - Teacher's courses
```

**How to Enable**:
1. Edit `backend/src/main/resources/application.properties`
2. Add: `phi.service.url=http://localhost:5000`
3. Add: `backend.service.url=http://localhost:8080`

**Code Example** (in app.py):
```python
import requests

def get_student_context(student_id):
    """Fetch student context from backend"""
    try:
        response = requests.get(
            f"http://localhost:8080/api/students/{student_id}",
            timeout=5
        )
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return None

# Then use in chat:
if user_type == 'student':
    context = get_student_context(user_id)
    # Include in prompt
```

---

## <a name="chat-flow"></a>7. Chat Flow

### Complete Message Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. User types message in frontend chatbot widget           │
│     Example: "What's my GPA?"                               │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Frontend sends POST to /api/phi/chat with:              │
│     - userId: "STU001"                                      │
│     - userType: "student"                                   │
│     - message: "What's my GPA?"                             │
│     - userInfo: {cgpa: 3.75, semester: "3rd", ...}         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Flask receives request in /api/phi/chat handler         │
│     - Validates required fields                             │
│     - Checks message is not empty                           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Chat history retrieval                                  │
│     - Gets previous 10 messages for this user               │
│     - Timestamps each message                               │
├─────────────────────────────────────────────────────────────┤
│  Current History:                                            │
│  [                                                           │
│    {role: "user", content: "Hi", timestamp: "..."},         │
│    {role: "assistant", content: "Hello!", timestamp: "..."},│
│    {role: "user", content: "How do I submit assignments?"}  │
│  ]                                                           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Build prompt with context                               │
│     - System prompt (role, university context)              │
│     - Previous conversation history                         │
│     - User info (CGPA, semester, enrollment)                │
│     - Current user message                                  │
├─────────────────────────────────────────────────────────────┤
│  Final Prompt:                                               │
│  """You are a helpful university AI assistant helping       │
│  students. Current user is in semester 3 with CGPA 3.75...  │
│  Previous messages: [history here]                          │
│  Student asks: What's my GPA?                               │
│  """                                                         │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Send to Phi Model for inference                         │
│     - Tokenize prompt                                       │
│     - Run model (typically 2-5 seconds)                     │
│     - Generate token by token                               │
│     - Limit output to 1,024 tokens max                      │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  7. Model generates response                                 │
│     Output: "Your current CGPA is 3.75/4.0, which is        │
│     excellent! You're maintaining: A in CS101, B in         │
│     MATH201, A in ENG101. Keep up the great work!"          │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Save to chat history                                    │
│     Add to user's history:                                  │
│     - User message with timestamp                           │
│     - AI response with timestamp                            │
│     - Remove oldest if > 10 messages                        │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  9. Format response JSON                                    │
│     {                                                        │
│       "status": "success",                                  │
│       "response": "Your current CGPA...",                   │
│       "userId": "STU001",                                   │
│       "tokens_used": 187,                                   │
│       "timestamp": "2026-03-22T10:30:45.123Z"              │
│     }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  10. Send back to frontend                                  │
│      Frontend displays response in chat widget              │
│      User sees: "Your current CGPA is 3.75..."             │
└─────────────────────────────────────────────────────────────┘
```

---

## <a name="deployment"></a>8. Deployment

### Development (Current Setup)

**Start Service**:
```powershell
cd phi-service
python app.py
```

**Access**: http://localhost:5000

### Production Deployment

#### Option 1: Gunicorn (Recommended)

```bash
# Install Gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# With error logs
gunicorn -w 4 -b 0.0.0.0:5000 --error-logfile error.log app:app
```

#### Option 2: Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /phi-service

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
CMD ["python", "app.py"]
```

**Build and Run**:
```bash
docker build -t phi-service .
docker run -p 5000:5000 phi-service
```

#### Option 3: Windows Service

Create batch file `phi-service.bat`:
```batch
@echo off
cd "C:\path\to\phi-service"
python app.py
pause
```

Use `nssm` (Non-Sucking Service Manager) to create Windows service

### Configuration for Production

**Update in `app.py`**:
```python
if __name__ == '__main__':
    # Development
    app.run(debug=False, host='0.0.0.0', port=5000)
    
    # Production: disable debug
    app.run(debug=False, host='0.0.0.0', port=5000, 
            ssl_context='adhoc')  # Enable HTTPS
```

---

## <a name="troubleshooting"></a>9. Troubleshooting

### Issue 1: "ModuleNotFoundError: No module named 'torch'"

**This means**: PyTorch not installed

**Solution**:
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

For GPU support:
```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### Issue 2: "Model not found" or "Connection timeout"

**This means**: Phi model not downloaded

**Solution**:
```powershell
# Download model (internet required, ~3.5 GB)
python -c "from transformers import AutoModelForCausalLM; AutoModelForCausalLM.from_pretrained('microsoft/Phi-3.5-mini-instruct', trust_remote_code=True)"
```

Check disk space: Model needs ~10GB free

### Issue 3: "Memory error" or "CUDA out of memory"

**This means**: Insufficient RAM (needs ~3GB)

**Solutions**:
1. Close other applications
2. If CPU only: Ensure 4GB+ free RAM
3. Reduce `max_output_tokens` in code:
   ```python
   max_tokens = 512  # Instead of 1024
   ```

### Issue 4: "Port 5000 already in use"

**Solution**:
```powershell
# Find process using port 5000
Get-NetTCPConnection -LocalPort 5000

# Kill the process
Get-Process python | Stop-Process -Force

# Or change port in app.py:
app.run(port=5001)
```

### Issue 5: "Slow responses" (>10 seconds per message)

**Likely causes**:
- System running other heavy tasks
- CPU throttling enabled
- Using old/slow CPU

**Solutions**:
1. Close other applications
2. Check CPU usage: `Get-Process | Sort-Object CPU -Descending`
3. Reduce context window (fewer historical messages)
4. For GPU speedup: Install proper CUDA support

### Issue 6: "Empty or nonsensical responses"

**This means**: Model inference issue

**Solutions**:
1. Check temperature settings (not too high):
   ```python
   response = model.generate(..., temperature=0.7)
   ```

2. Clear model cache:
   ```powershell
   Remove-Item $env:APPDATA\.cache\huggingface\hub -Recurse -Force
   python -c "from phi_model import phi_model; print(phi_model)"
   ```

3. Restart service

---

## Performance Metrics

### Expected Performance

| Metric | Value |
|--------|-------|
| **Response Time** | 2-5 seconds |
| **Memory Usage** | 2-3GB (with system) |
| **Tokens per Minute** | ~100-200 |
| **Concurrent Users** | 1 (single-threaded default) |
| **Model Size** | 3GB (quantized) |

### Optimization Tips

1. **Enable GPU** (if available):
   ```python
   device = "cuda"  # Instead of "cpu"
   ```

2. **Reduce context length**:
   ```python
   MAX_HISTORY_LENGTH = 5  # Instead of 10
   ```

3. **Batch requests** (advanced):
   - Use request queuing
   - Process multiple users' requests

4. **Caching**:
   - Cache common responses
   - Reduce model inference

---

## Security Considerations

### Current Implementation

⚠️ **Warning**: Current implementation is **development-only**

- No authentication on endpoints
- CORS allows all origins
- No rate limiting
- Messages stored in memory (lost on restart)

### For Production

1. **Add Authentication**:
   ```python
   from flask_httpauth import HTTPBearerAuth
   auth = HTTPBearerAuth()
   
   @app.route('/api/phi/chat', methods=['POST'])
   @auth.login_required
   def chat():
       # Only authenticated users
   ```

2. **Add Rate Limiting**:
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app)
   
   @app.route('/api/phi/chat', methods=['POST'])
   @limiter.limit("10 per minute")
   def chat():
       # Max 10 requests per minute per IP
   ```

3. **Persistent Storage**:
   ```python
   # Save to database instead of memory
   db.session.add(ChatHistory(...))
   db.session.commit()
   ```

4. **Input Validation**:
   ```python
   if len(message) > 5000:
       return {"error": "Message too long"}, 400
   ```

---

## Summary

The Phi AI Service enhances the University Management System by providing:

✅ **Intelligent Chatbot** - Answers student and teacher questions  
✅ **Context-Aware** - Understands user type and academic context  
✅ **Lightweight** - Runs on modest hardware  
✅ **Real-time** - Fast responses for better UX  
✅ **Extensible** - Easy to integrate with backend API  

**For more info**:
- QUICK_START.md - How to start/stop the service
- phi_model.py - Model initialization code
- app.py - Flask application code
- requirements.txt - All dependencies

---

**Last Updated**: March 2026  
**Version**: 1.0  
**Contact**: Technical Support

# Phi Service - Enable Full AI Responses

## Overview
The Phi service supports two modes:

1. **Fallback Mode** (Currently Active)
   - Provides structured template responses
   - Guides users on how to ask better questions
   - Works on any system

2. **Full AI Mode** (Recommended)
   - Uses Microsoft Phi-3.5-mini LLM
   - Answers virtually ANY question intelligently
   - Requires specific setup

---

## Current Status: Fallback Mode ⚠️

The Phi service is currently running in **Fallback Mode** because the actual Phi model hasn't loaded yet. This is normal and often intentional - the model requires:
- Python with transformers library
- PyTorch with CUDA support (for GPU acceleration)
- ~4-6GB of disk space for model weights
- 4-8GB of RAM minimum

**The fallback mode is STILL very helpful** - it provides structured guidance and helps users ask better questions.

---

## Enable Full AI Mode (Phi-3.5-mini Model)

### Step 1: Check System Requirements

**Windows:**
```bash
python --version                    # Need Python 3.9+
pip list | findstr torch           # Check if PyTorch installed
pip list | findstr transformers    # Check if transformers installed
```

**Linux/Mac:**
```bash
python3 --version                  # Need Python 3.9+
pip list | grep torch              # Check if PyTorch installed
pip list | grep transformers       # Check if transformers installed
```

### Step 2: Install Required Libraries

**Option A: CPU-Only (Slower but works everywhere)**
```bash
cd phi-service
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
pip install transformers==4.35.0
pip install bitsandbytes
pip install -r requirements.txt
```

**Option B: GPU Acceleration (NVIDIA CUDA - Much Faster)**
```bash
cd phi-service

# For NVIDIA GPUs with CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Or for CUDA 11.8
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Then install remaining dependencies
pip install transformers==4.35.0
pip install bitsandbytes
pip install -r requirements.txt
```

### Step 3: Verify Installation

```bash
python -c "from transformers import AutoModelForCausalLM; print('✓ Transformers OK')"
python -c "import torch; print(f'✓ PyTorch OK, CUDA available: {torch.cuda.is_available()}')"
```

### Step 4: Start Phi Service

```bash
cd phi-service
python -m flask --app app_v2 run --host=10.52.9.128 --port=5000
```

**Watch for this message:**
```
✓ Using Phi-3.5-mini model for intelligent responses
```

If you see this, the **Full AI Mode is active**! 🎉

---

## What Changes When Full AI Mode is Enabled

### Now You Can Ask:
- "Explain quantum computing to me like I'm 10"
- "What are the best ways to learn machine learning?"
- "Help me debug this Python error: [code snippet]"
- "Compare React vs Vue for building web applications"
- "What's the capital of France?" 
- "How do I calculate compound interest?"
- "Explain photosynthesis step by step"
- **ANY question** - the AI will intelligently respond

### Response Quality:
- ✅ Contextually relevant answers
- ✅ Explains complex concepts simply
- ✅ Provides examples and analogies
- ✅ Remembers conversation history
- ✅ Adapts explanations to user level
- ✅ Can help with virtually any topic

---

## Troubleshooting

### Issue: "Model loading failed" or "Out of memory"

**Solution 1: Reduce Model Size (Already Done!)**
```
The app_v2.py uses 4-bit quantization to reduce memory from ~8GB to ~2-3GB
This should work on most systems.
```

**Solution 2: Use CPU-Only Mode (Slower)**
```bash
# This is automatic if CUDA isn't available
# Responses will be slower but will still work
```

**Solution 3: Increase Available RAM**
- Close other applications
- Restart the Phi service

### Issue: First Response Takes Long Time

This is **normal!** The first response downloads the model (~2-3GB) and loads it into memory.
Subsequent responses will be much faster.

---

## Performance Expectations

### Fallback Mode (Current):
- Response Time: ~100ms
- Memory Usage: ~50MB
- Quality: Structured guidance, templates

### Full AI Mode:
- First Response: 2-10 minutes (downloading + loading model)
- Subsequent Responses: 5-30 seconds (CPU) or 2-5 seconds (GPU)
- Memory Usage: 2-4GB
- Quality: Intelligent answers to any question

---

## Switching Between Modes

**To Run in Fallback Mode:**
```bash
# Don't install the full transformers setup
# Just run the service as-is
python -m flask --app app_v2 run --host=10.52.9.128 --port=5000
```

**To Run in Full AI Mode:**
```bash
# Follow the installation steps above
# Then run the service
python -m flask --app app_v2 run --host=10.52.9.128 --port=5000
```

The service automatically detects which mode to use based on whether the model loads successfully!

---

## Current Service Configuration

### File: `phi-service/app_v2.py`
- ✅ Fallback mode with intelligent general responses
- ✅ HTML-formatted structured answers
- ✅ Greeting and question detection
- ✅ Chat history storage per user
- ✅ Multiple endpoints: /chat, /history, /health, /clear

### File: `phi-service/phi_model_v2.py`
- Uses Microsoft Phi-3.5-mini model
- 4-bit quantization for memory efficiency
- Flash attention for faster inference
- Automatic GPU/CPU fallback

---

## Testing the Phi Service

### Health Check
```bash
curl http://10.52.9.128:5000/api/phi/health
```

### Send a Message
```bash
curl -X POST http://10.52.9.128:5000/api/phi/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "What is the capital of France?",
    "userInfo": {"role": "student"}
  }'
```

### Get Chat History
```bash
curl http://10.52.9.128:5000/api/phi/history/test-user
```

---

## Summary

| Feature | Fallback Mode | Full AI Mode |
|---------|---------------|-------------|
| **Setup** | Works out of box | Requires PyTorch/Transformers |
| **Responses** | Template-based | Intelligent answers |
| **Any Question** | Guided responses | Direct answers |
| **Speed** | Fast | Slower but better |
| **Memory** | ~50MB | 2-4GB |
| **Quality** | Good | Excellent |

---

## Next Steps

1. **Test Current Service**: Use the health check endpoint above
2. **Check Current Mode**: Look for model loading status in logs
3. **Install Full AI** (Optional): Follow steps above if you want intelligent responses
4. **Use the Chat**: Start asking questions in PhiChat!

---

## Additional Resources

- [Microsoft Phi Model Docs](https://huggingface.co/microsoft/Phi-3.5-mini-instruct)
- [PyTorch Installation Guide](https://pytorch.org/get-started/locally/)
- [Transformers Library Docs](https://huggingface.co/docs/transformers/)

---

## Support

If the Phi service isn't responding properly:
1. Check that it's running: `ps aux | grep app_v2`
2. Check the logs for errors
3. Verify networking: `curl http://10.52.9.128:5000/api/phi/health`
4. Try restarting the service
5. Check if port 5000 is in use: `netstat -an | findstr 5000` (Windows) or `lsof -i :5000` (Linux)


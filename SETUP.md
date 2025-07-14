# Secure-Sense Setup Guide

## Quick Setup

### 1. Run the Setup Script
```bash
./setup.sh
```

This will:
- Install OLLAMA if not already installed
- Start the OLLAMA server
- Pull the required model (deepseek-r1:latest)
- Test the setup

### 2. Start the Backend
```bash
cd backend
python app.py
```

The backend will run on `http://127.0.0.1:8000`

### 3. Load the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder

## Manual Setup (if script fails)

### Install OLLAMA
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Start OLLAMA
```bash
ollama serve
```

### Pull the Model
```bash
ollama pull deepseek-r1:latest
```

### Test OLLAMA
```bash
cd backend
python test_ollama.py
```

## What Changed

The `/mask` endpoint now:
1. **Always uses OLLAMA** for sensitive data detection
2. **No longer requires** user policies or detectors in MongoDB
3. **Works immediately** without database setup
4. **Falls back gracefully** if OLLAMA is unavailable

## Testing

### Test the API directly:
```bash
curl -X POST http://127.0.0.1:8000/masking/mask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_input": "My email is test@example.com and phone is (123) 456-7890"}'
```

### Test with the Extension:
1. Go to ChatGPT
2. Type a message with sensitive data
3. The extension should detect and mask it

## Troubleshooting

### OLLAMA Connection Issues
- Check if OLLAMA is running: `curl http://localhost:11434/api/tags`
- Restart OLLAMA: `ollama serve`

### Model Issues
- Check available models: `ollama list`
- Pull the model: `ollama pull deepseek-r1:latest`

### Backend Issues
- Check logs for errors
- Verify MongoDB connection (if using policies)
- Test with the test script: `python test_ollama.py`

## Architecture

```
Extension → Background Script → Python Backend → OLLAMA Model
     ↓              ↓              ↓              ↓
User Input → API Call → /mask endpoint → Sensitive Detection
```

The model now directly classifies sensitive information without requiring complex policy setup! 
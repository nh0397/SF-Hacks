# Secure-Sense 🔒

A comprehensive privacy protection system that safeguards sensitive information when interacting with Large Language Models (LLMs) like ChatGPT. Built for SF-Hacks 2025.

![Secure Sense Demo](Secure%20Sense.gif)

## 🎯 Project Overview

Secure-Sense is a multi-component privacy protection system that automatically detects and masks sensitive data before it reaches LLM platforms. It consists of:

- **Chrome Extension**: Real-time sensitive data detection on ChatGPT
- **Backend API**: Flask-based server with OLLAMA integration for ML-powered detection
- **Web Dashboard**: React-based admin interface for policy management
- **File Processing**: Support for PDF and DOCX document analysis

## 🚀 Features

### 🔍 Smart Detection
- **ML-Powered**: Uses OLLAMA with deepseek-r1 model for intelligent sensitive data detection
- **Multiple Data Types**: Detects emails, phone numbers, SSNs, credit cards, addresses, DOBs, API keys, passwords, bank accounts, and driver's licenses
- **Real-time Processing**: Instant detection and masking as you type
- **Fallback Support**: Graceful degradation when OLLAMA is unavailable

### 🛡️ Privacy Protection
- **Automatic Masking**: Replaces sensitive data with `[ENTITY_TYPE]` placeholders
- **File Upload Support**: Process PDF and DOCX documents for sensitive content
- **Policy Management**: Customizable detection rules and policies
- **Violation Tracking**: Monitor and log privacy violations

### 🎨 User Experience
- **Seamless Integration**: Works directly on ChatGPT without interrupting workflow
- **Visual Feedback**: Clear indicators when sensitive data is detected
- **Admin Dashboard**: Comprehensive web interface for system management
- **Cross-platform**: Chrome extension with web dashboard

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chrome        │    │   Flask         │    │   OLLAMA        │
│   Extension     │───▶│   Backend       │───▶│   Model         │
│                 │    │   (Python)      │    │   (deepseek-r1) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React         │    │   MongoDB       │    │   File          │
│   Dashboard     │    │   Database      │    │   Processing    │
│   (Admin UI)    │    │   (Policies)    │    │   (PDF/DOCX)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **Flask-JWT-Extended** - Authentication
- **Flask-CORS** - Cross-origin support
- **PyMongo** - MongoDB integration
- **OLLAMA** - Local LLM inference

### Extension
- **Chrome Extension Manifest V3** - Modern extension framework
- **Content Scripts** - Page injection
- **Background Service Worker** - Event handling

### AI/ML
- **OLLAMA** - Local LLM server
- **deepseek-r1** - Sensitive data detection model
- **Custom Entity Extraction** - Pattern-based detection

## 📦 Quick Setup

### 1. Automated Setup
```bash
# Clone the repository
git clone <repository-url>
cd SF-Hacks

# Run the setup script
./setup.sh
```

### 2. Manual Setup

#### Install OLLAMA
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
ollama pull deepseek-r1:latest
```

#### Start Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select `extension/` folder

#### Start Frontend (Optional)
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
username=your_mongodb_username
password=your_mongodb_password
JWT_SECRET_KEY=your_jwt_secret
```

### API Endpoints
- `POST /masking/mask` - Detect and mask sensitive data
- `POST /auth/login` - User authentication
- `GET /detectors` - List available detectors
- `POST /policy` - Manage detection policies

## 🧪 Testing

### Test OLLAMA Setup
```bash
cd backend
python test_ollama.py
```

### Test API Directly
```bash
curl -X POST http://127.0.0.1:8000/masking/mask \
  -H "Content-Type: application/json" \
  -d '{"user_input": "My email is test@example.com and phone is (123) 456-7890"}'
```

### Test Extension
1. Go to ChatGPT
2. Type a message with sensitive data
3. Verify detection and masking

## 📁 Project Structure

```
SF-Hacks/
├── backend/                 # Flask API server
│   ├── app.py              # Main application
│   ├── routes/             # API endpoints
│   ├── models/             # Database models
│   ├── extractors/         # File processing
│   ├── Ollama/             # ML detection pipeline
│   └── requirements.txt    # Python dependencies
├── frontend/               # React admin dashboard
│   ├── src/                # React components
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── extension/              # Chrome extension
│   ├── src/                # Extension scripts
│   ├── manifest.json       # Extension config
│   └── assets/             # Extension assets
├── setup.sh                # Automated setup script
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

## 🚨 Troubleshooting

### OLLAMA Issues
```bash
# Check if OLLAMA is running
curl http://localhost:11434/api/tags

# Restart OLLAMA
ollama serve

# Check available models
ollama list
```

### Backend Issues
- Verify MongoDB connection
- Check environment variables
- Review logs for errors
- Test with `python test_ollama.py`

### Extension Issues
- Reload extension in Chrome
- Check browser console for errors
- Verify host permissions in manifest.json

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**SF-Hacks 2024 Team:**
- **Jay** - Backend Development & ML Integration
- **Naisarg** - Frontend Development & UI/UX
- **Khalid** - Extension Development & Security
- **Shreyas** - System Architecture & DevOps

## 🙏 Acknowledgments

- **OLLAMA** for providing local LLM inference
- **Chrome Extension API** for browser integration
- **Flask** and **React** communities for excellent documentation
- **SF-Hacks** organizers for the amazing hackathon experience

---

**🔒 Protect your privacy, one message at a time!**
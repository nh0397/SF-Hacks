#!/bin/bash

echo "🚀 Setting up Secure-Sense with OLLAMA..."

# Check if OLLAMA is installed
if ! command -v ollama &> /dev/null; then
    echo "📦 Installing OLLAMA..."
    curl -fsSL https://ollama.ai/install.sh | sh
else
    echo "✅ OLLAMA is already installed"
fi

# Start OLLAMA if not running
echo "🔧 Starting OLLAMA server..."
ollama serve &
OLLAMA_PID=$!

# Wait for OLLAMA to start
echo "⏳ Waiting for OLLAMA to start..."
sleep 5

# Check if OLLAMA is running
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ OLLAMA server is running"
else
    echo "❌ Failed to start OLLAMA server"
    exit 1
fi

# Pull the required model
echo "📥 Pulling deepseek-r1:latest model..."
ollama pull deepseek-r1:latest

# Test the setup
echo "🧪 Testing OLLAMA setup..."
cd backend
python test_ollama.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo "   1. Start the backend: cd backend && python app.py"
    echo "   2. Load the extension in Chrome"
    echo "   3. Test the sensitive data detection"
else
    echo "❌ Setup failed. Please check the errors above."
    exit 1
fi

# Keep OLLAMA running
echo "🔄 OLLAMA server is running in the background (PID: $OLLAMA_PID)"
echo "   To stop: kill $OLLAMA_PID" 
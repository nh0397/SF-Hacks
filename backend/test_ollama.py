#!/usr/bin/env python3
"""
Test script to verify OLLAMA connection and model availability
"""

import requests
import json
import sys

def test_ollama_connection():
    """Test if OLLAMA server is running and accessible"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ OLLAMA server is running")
            return True
        else:
            print(f"❌ OLLAMA server returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to OLLAMA server. Is it running?")
        print("   Start OLLAMA with: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Error connecting to OLLAMA: {e}")
        return False

def test_model_availability():
    """Test if the required model is available"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        models = response.json().get("models", [])
        
        required_model = "llama3.2:3b"
        available_models = [model["name"] for model in models]
        
        if required_model in available_models:
            print(f"✅ Required model '{required_model}' is available")
            return True
        else:
            print(f"❌ Required model '{required_model}' is not available")
            print(f"   Available models: {available_models}")
            print(f"   Install with: ollama pull {required_model}")
            return False
    except Exception as e:
        print(f"❌ Error checking model availability: {e}")
        return False

def test_sensitive_detection():
    """Test sensitive data detection with a sample message"""
    test_message = "My email is test@example.com and my phone is (123) 456-7890"
    
    system_prompt = """
    You are a sensitive data detection expert. Your task is to identify and extract sensitive information from user messages.

    SENSITIVE DATA TYPES TO DETECT:
    1. EMAIL: Email addresses (e.g., user@domain.com)
    2. PHONE: Phone numbers (e.g., (123) 456-7890, 123-456-7890)
    3. SSN: Social Security Numbers (e.g., 123-45-6789)
    4. CREDIT_CARD: Credit card numbers (e.g., 4539 1488 0343 6467)
    5. ADDRESS: Physical addresses (e.g., 123 Main St, Springfield, IL 62704)
    6. DOB: Dates of birth (e.g., 12/24/1988, 1988-12-24)

    RESPONSE FORMAT (JSON only):
    {
        "detected_entities": {
            "EMAIL": ["email1@example.com"],
            "PHONE": ["(123) 456-7890"]
        },
        "masked_message": "Original message with sensitive data replaced by [ENTITY_TYPE]"
    }
    """

    user_prompt = f"""
    Analyze this message for sensitive data:
    "{test_message}"
    
    Return the JSON response with detected entities and masked message.
    """

    payload = {
        "model": "llama3.2:3b",  # Using faster model
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ],
        "stream": False
    }

    try:
        print(f"🧪 Testing sensitive data detection with: '{test_message}'")
        response = requests.post("http://localhost:11434/api/chat", json=payload, timeout=60)  # Increased timeout
        response.raise_for_status()
        
        result = response.json()
        content = result["message"]["content"]
        
        # Try to parse JSON response
        try:
            parsed = json.loads(content)
            detected = parsed.get("detected_entities", {})
            masked = parsed.get("masked_message", test_message)
            
            print("✅ Sensitive data detection test successful!")
            print(f"   Detected entities: {detected}")
            print(f"   Masked message: {masked}")
            return True
            
        except json.JSONDecodeError:
            print("❌ OLLAMA response is not valid JSON")
            print(f"   Raw response: {content}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing sensitive data detection: {e}")
        return False

def main():
    print("🔍 Testing OLLAMA setup...\n")
    
    # Test 1: Connection
    if not test_ollama_connection():
        print("\n💡 To fix connection issues:")
        print("   1. Install OLLAMA: curl -fsSL https://ollama.ai/install.sh | sh")
        print("   2. Start OLLAMA: ollama serve")
        sys.exit(1)
    
    # Test 2: Model availability
    if not test_model_availability():
        print("\n💡 To fix model issues:")
        print("   1. Pull the model: ollama pull llama3.2:3b")
        sys.exit(1)
    
    # Test 3: Sensitive detection
    if not test_sensitive_detection():
        print("\n💡 To fix detection issues:")
        print("   1. Check OLLAMA logs for errors")
        print("   2. Try a different model if available")
        sys.exit(1)
    
    print("\n🎉 All tests passed! OLLAMA is ready to use.")

if __name__ == "__main__":
    main() 
from extractors.masking_main import Masking
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pymongo import MongoClient
from datetime import datetime
from config import Config
from dotenv import load_dotenv
import os
from models.model import MongoDB
from bson.objectid import ObjectId
import json
from loguru import logger
import requests
import re

load_dotenv()

username = os.getenv("username")
password = os.getenv("password")
# Initialize MongoDB connection
client = MongoDB(username, password).connect()
db = client.get_database("dashboard")
policy_collection = db.get_collection("policies")
detectors_collection = db.get_collection("detectors")

masking_bp = Blueprint("masking", __name__)

@masking_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Optionally, check the file's stream length
    file_content = file.read()
    print(f"Received file {file.filename} with {len(file_content)} bytes.")

    # Save the file in the "uploadedFiles" folder
    upload_folder = os.path.join(os.getcwd(), 'uploadedFiles')
    # if not os.path.exists(upload_folder):
    os.makedirs(upload_folder, exist_ok=True)  # Create the directory if it doesn't exist
    save_path = os.path.join(upload_folder, file.filename)
    # Since we've already read the file, we need to reset the pointer if we want to save it
    file.stream.seek(0)
    file.save(save_path)
    
    print(f"File saved to: {save_path}")
    return jsonify({"message": "File saved successfully", "file_path": save_path}), 200

@masking_bp.route('/mask', methods=['POST'])
@jwt_required()
def mask():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        user_input = data.get('user_input', "")
        if not user_input:
            return jsonify({"error": "user_input is required"}), 400

        # Use OLLAMA directly for sensitive data detection (simplified approach)
        try:
            ollama_response = call_ollama_for_sensitive_detection(user_input)
            
            # Check if any sensitive data was detected
            detected_entities = ollama_response.get("detected_entities", {})
            has_sensitive_data = len(detected_entities) > 0
            
            # Create response in the expected format
            out = {
                "original_input": user_input,
                "masked_input": ollama_response.get("masked_message", user_input),
                "is_sensitive": has_sensitive_data,
                "masked_entities": detected_entities,
                "entities_found": list(detected_entities.keys()) if detected_entities else [],
                "success": True,
                "is_block": False,  # Default to not blocking
                "blocked_entities": []
            }
            
            # Optional: Check user policies for blocking logic (if policies exist)
            try:
                policies = policy_collection.find({"user_id": user_id})
                policies_list = []
                for policy in policies:
                    policy["_id"] = str(policy["_id"])
                    policies_list.append(policy)
                
                if policies_list:
                    # Apply blocking logic if policies exist
                    is_block = False
                    blocked_entities = []
                    for ind_policy_data in policies_list:
                        ind_policy_dets, policy_action = ind_policy_data.get('detectors', []), ind_policy_data.get('action', 'mask').lower()
                        if policy_action.lower() == 'block' and set(ind_policy_dets).intersection(set(out.get('entities_found', []))):
                            is_block = True
                            blocked_entities.extend(list(set(ind_policy_dets).intersection(set(out.get('entities_found', [])))))
                    
                    out['is_block'] = is_block
                    out['blocked_entities'] = blocked_entities
                    
            except Exception as policy_error:
                logger.warning(f"Policy check failed, using default settings: {policy_error}")
                # Continue with default settings if policy check fails
            
            return jsonify(out), 200
            
        except Exception as ollama_error:
            logger.error(f"OLLAMA detection failed: {ollama_error}")
            # Fallback response if OLLAMA fails
            out = {
                "original_input": user_input,
                "masked_input": user_input,
                "is_sensitive": False,
                "masked_entities": {},
                "entities_found": [],
                "success": True,
                "is_block": False,
                "blocked_entities": []
            }
            return jsonify(out), 200

    except Exception as e:
        logger.error(f"Error in mask endpoint: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}", "success": False}), 500

@masking_bp.route('/check-sensitive-data', methods=['POST'])
@jwt_required()
def check_sensitive_data():
    """
    Simplified endpoint to check if user message contains sensitive data using Ollama.
    Returns a standardized response format for frontend integration.
    """
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        user_message = data.get('message', "")
        if not user_message:
            return jsonify({"error": "message is required"}), 400

        # Call Ollama directly for sensitive data detection
        ollama_response = call_ollama_for_sensitive_detection(user_message)
        
        # Standardize the response format
        response = {
            "success": True,
            "message": user_message,
            "has_sensitive_data": len(ollama_response.get("detected_entities", {})) > 0,
            "detected_entities": ollama_response.get("detected_entities", {}),
            "masked_message": ollama_response.get("masked_message", user_message),
            "entity_count": sum(len(entities) for entities in ollama_response.get("detected_entities", {}).values()),
            "timestamp": datetime.utcnow().isoformat()
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"Error in check_sensitive_data: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"An error occurred: {str(e)}",
            "has_sensitive_data": False,
            "detected_entities": {},
            "masked_message": user_message if 'user_message' in locals() else "",
            "entity_count": 0
        }), 500

def fallback_regex_detection(user_message):
    """
    Fallback detection using regex patterns when OLLAMA is unavailable or too slow.
    """
    detected_entities = {}
    masked_message = user_message
    
    # Email detection
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, user_message)
    if emails:
        detected_entities["EMAIL"] = emails
        for email in emails:
            masked_message = masked_message.replace(email, "[EMAIL]")
    
    # Phone number detection
    phone_pattern = r'\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}'
    phones = re.findall(phone_pattern, user_message)
    if phones:
        detected_entities["PHONE"] = phones
        for phone in phones:
            masked_message = masked_message.replace(phone, "[PHONE]")
    
    # SSN detection
    ssn_pattern = r'\d{3}[-\s]?\d{2}[-\s]?\d{4}'
    ssns = re.findall(ssn_pattern, user_message)
    if ssns:
        detected_entities["SSN"] = ssns
        for ssn in ssns:
            masked_message = masked_message.replace(ssn, "[SSN]")
    
    # Credit card detection (basic)
    cc_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
    ccs = re.findall(cc_pattern, user_message)
    if ccs:
        detected_entities["CREDIT_CARD"] = ccs
        for cc in ccs:
            masked_message = masked_message.replace(cc, "[CREDIT_CARD]")
    
    return {
        "detected_entities": detected_entities,
        "masked_message": masked_message
    }

def call_ollama_for_sensitive_detection(user_message):
    """
    Directly calls Ollama API to detect sensitive data in the user message.
    Returns a structured response with detected entities and masked message.
    """
    system_prompt = """
    You are a sensitive data detection expert. Your task is to identify and extract sensitive information from user messages.

    SENSITIVE DATA TYPES TO DETECT:
    1. EMAIL: Email addresses (e.g., user@domain.com)
    2. PHONE: Phone numbers (e.g., (123) 456-7890, 123-456-7890)
    3. SSN: Social Security Numbers (e.g., 123-45-6789)
    4. CREDIT_CARD: Credit card numbers (e.g., 4539 1488 0343 6467)
    5. ADDRESS: Physical addresses (e.g., 123 Main St, Springfield, IL 62704)
    6. DOB: Dates of birth (e.g., 12/24/1988, 1988-12-24)
    7. API_KEY: API keys or tokens (e.g., sk-1234567890abcdef)
    8. PASSWORD: Passwords or passcodes
    9. BANK_ACCOUNT: Bank account numbers
    10. DRIVER_LICENSE: Driver's license numbers

    RESPONSE FORMAT (JSON only):
    {
        "detected_entities": {
            "EMAIL": ["email1@example.com", "email2@example.com"],
            "PHONE": ["(123) 456-7890"],
            "SSN": ["123-45-6789"]
        },
        "masked_message": "Original message with sensitive data replaced by [ENTITY_TYPE]"
    }

    RULES:
    - Only extract complete, valid entities
    - Do not extract partial matches
    - Replace detected entities in masked_message with [ENTITY_TYPE] format
    - Return ONLY valid JSON, no additional text
    - If no sensitive data is found, return empty detected_entities and original message as masked_message
    """

    user_prompt = f"""
    Analyze this message for sensitive data:
    "{user_message}"
    
    Return the JSON response with detected entities and masked message.
    """

    url = "http://localhost:11434/api/chat"
    payload = {
        "model": "llama3.2:3b",  # Using faster model
        "messages": [
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": user_prompt.strip()}
        ],
        "stream": False
    }

    try:
        logger.info(f"Calling OLLAMA for message: {user_message[:100]}...")
        response = requests.post(url, json=payload, timeout=60)  # Increased timeout to 60 seconds
        response.raise_for_status()
        response_json = response.json()

        if "message" not in response_json or "content" not in response_json["message"]:
            raise ValueError("Invalid response structure from Ollama")

        content = response_json["message"]["content"]
        logger.debug(f"OLLAMA raw response: {content}")
        
        # Try to extract JSON from the response
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            # Try to find JSON in the response (handle cases where model adds explanatory text)
            start = content.find("{")
            end = content.rfind("}") + 1
            if start != -1 and end != 0:
                try:
                    json_str = content[start:end]
                    result = json.loads(json_str)
                except json.JSONDecodeError:
                    # Try to clean up common JSON formatting issues
                    json_str = json_str.replace('\n', ' ').replace('\r', ' ')
                    json_str = re.sub(r'//.*?(?=\n|$)', '', json_str)  # Remove comments
                    try:
                        result = json.loads(json_str)
                    except json.JSONDecodeError:
                        logger.warning("Could not parse JSON from OLLAMA response, using fallback")
                        return fallback_regex_detection(user_message)
            else:
                logger.warning("No JSON found in OLLAMA response, using fallback")
                return fallback_regex_detection(user_message)

        # Validate and clean the response
        detected_entities = result.get("detected_entities", {})
        masked_message = result.get("masked_message", user_message)

        # Remove empty entity lists
        detected_entities = {k: v for k, v in detected_entities.items() if v and len(v) > 0}

        logger.info(f"OLLAMA detected entities: {list(detected_entities.keys())}")
        return {
            "detected_entities": detected_entities,
            "masked_message": masked_message
        }

    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to OLLAMA server. Is it running?")
        return {
            "detected_entities": {},
            "masked_message": user_message
        }
    except requests.exceptions.Timeout:
        logger.error("OLLAMA request timed out (60 seconds). Model might be too slow.")
        logger.info("Using fallback regex detection.")
        return fallback_regex_detection(user_message)
    except Exception as e:
        logger.error(f"Error calling Ollama: {str(e)}")
        logger.info("Using fallback regex detection.")
        return fallback_regex_detection(user_message)
from extractors.main_masking_ext import Masking
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

        # Parse the request body
        policies = policy_collection.find({"user_id": user_id})
        policies_list = []
        for policy in policies:
            policy["_id"] = str(policy["_id"])  # Convert ObjectId to string
            policies_list.append(policy)
        
        if not policies_list:
            return jsonify({"error": "No policy associated with user"}), 400
        
        detector_list = list(set([det_name for ind_policy_data in policies_list for det_name in ind_policy_data.get('detectors', [])]))
        logger.info(f"detector_list: {detector_list}")
        
        # get individual detector data
        # Needs to be modularised-> using factory class logic
        ml_detectors = []
        regex_detectors = []
        keyword_detectors = []
        for det_name in detector_list:
            ind_detector_data = detectors_collection.find_one({"detector_name": det_name, "user_id": user_id})
            if not ind_detector_data:
                logger.error(f"For detector: {det_name}| not present in detector collection")
                continue
            ind_det_type = ind_detector_data.get('detector_type')
            if not ind_det_type:
                logger.error(f"For detector: {det_name}| no detector type present")
                continue

            if ind_det_type.lower() == "ml_based":
                ml_detectors.append({
                    "detector_name": ind_detector_data['detector_name'],
                    "description": ind_detector_data['description']
                })

            elif ind_det_type.lower() == "regex":
                regex_detectors.append({
                    "detector_name": ind_detector_data['detector_name'],
                    "regex_patterns": ind_detector_data['regex_patterns']
                })

            else:
                keyword_detectors.append({
                    "detector_name": ind_detector_data['detector_name'],
                    "keywords": ind_detector_data['keywords']
                })

        try:
            out = Masking().mask(user_input, ml_detectors, regex_detectors, keyword_detectors)

            # Also add blocking logic
            is_block = False
            blocked_entities = []
            for ind_policy_data in policies_list:
                ind_policy_dets, policy_action = ind_policy_data.get('detectors', []), ind_policy_data.get('action', 'mask').lower()
                if policy_action.lower() == 'block' and set(ind_policy_dets).intersection(set(out.get('entities_found', []))):
                    is_block = True
                    blocked_entities.extend(list(set(ind_policy_dets).intersection(set(out.get('entities_found', [])))))
                    
            out['is_block'] = is_block
            out['blocked_entities'] = blocked_entities
            out['success'] = True

            return jsonify(out), 200
        
        except Exception as e:
            out["success"] = False
            return jsonify({"error": f"An error occurred: {str(e)}", "success": False}), 500

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
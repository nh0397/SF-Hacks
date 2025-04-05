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

load_dotenv()

username = os.getenv("username")
password = os.getenv("password")
# Initialize MongoDB connection
client = MongoDB(username, password).connect()
db = client.get_database("dashboard")
detectors_collection = db.get_collection("detectors")

detector_bp = Blueprint("detector", __name__)

@detector_bp.route('/create_detector', methods=['POST'])
@jwt_required()
def create_detector():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        detector_name = data.get('detector_name', "")
        detector_type = data.get('detector_type', "")

        # Validate input
        if not detector_name or not detector_type:
            return jsonify({"error": "Detector name and type are required"}), 400

        # Prepare the policy document
        detector = {
            "detector_name": detector_name,
            "user_id": user_id,
            "detector_type": detector_type,
            "created_at": datetime.utcnow().isoformat()
        }

        if detector_type == "ml_based":
            description = data.get('description', "")
            if not description:
                return jsonify({"error": "Description is required for ML-based detectors"}), 400
            detector["description"] = description
        elif detector_type == "regex":
            regex_patters = data.get('regex_patterns', [])
            if not regex_patters:
                return jsonify({"error": "Regex patterns are required for regex detectors"}), 400
            detector["regex_patterns"] = regex_patters
        elif detector_type == "keywords":
            keywords = data.get('keywords', [])
            if not keywords:
                return jsonify({"error": "Keywords are required for keyword detectors"}), 400
            detector["keywords"] = keywords

        else:
            return jsonify({"error": "Only ml based, regex, keywords detector_type allowed"}), 400

        # Insert into MongoDB
        detectors_collection.insert_one(detector)

        return jsonify({"message": "Detector created successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@detector_bp.route('/list_detectors', methods=['GET'])
@jwt_required()
def list_detectors():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Build the query
        query = {"user_id": user_id}

        # Fetch detectors from MongoDB
        detectors = list(detectors_collection.find(query, {"_id": 0}))

        return jsonify({"detectors": detectors}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@detector_bp.route('/delete_detector', methods=['DELETE'])
@jwt_required()
def delete_detector():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        detector_name = data.get('detector_name', "")

        # Validate input
        if not detector_name:
            return jsonify({"error": "Detector name is required"}), 400

        # Find and delete the detector
        result = detectors_collection.delete_one({"detector_name": detector_name, "user_id": user_id})

        if result.deleted_count == 0:
            return jsonify({"error": "Detector not found or you don't have access to this detector"}), 404

        return jsonify({"message": "Detector deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@detector_bp.route('/update_detector', methods=['PUT'])
@jwt_required()
def update_detector():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        detector_name = data.get('detector_name', "")
        new_detector_name = data.get('new_detector_name', "")
        detector_type = data.get('detector_type', "")

        # Validate input
        if not detector_name or not new_detector_name or not detector_type:
            return jsonify({"error": "Detector name, new detector name and type are required"}), 400

        # Prepare the update document
        update_document = {
            "detector_name": new_detector_name,
            "detector_type": detector_type,
            "updated_at": datetime.utcnow().isoformat()
        }

        if detector_type == "ml_based":
            description = data.get('description', "")
            if not description:
                return jsonify({"error": "Description is required for ML-based detectors"}), 400
            update_document["description"] = description
        elif detector_type == "regex":
            regex_patters = data.get('regex_patterns', [])
            if not regex_patters:
                return jsonify({"error": "Regex patterns are required for regex detectors"}), 400
            update_document["regex_patterns"] = regex_patters
        elif detector_type == "keywords":
            keywords = data.get('keywords', [])
            if not keywords:
                return jsonify({"error": "Keywords are required for keyword detectors"}), 400
            update_document["keywords"] = keywords

        else:
            return jsonify({"error": "Only ml based, regex, keywords detector_type allowed"}), 400

        # Update the detector in MongoDB
        result = detectors_collection.update_one(
            {"detector_name": detector_name, "user_id": user_id},
            {"$set": update_document}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Detector not found or you don't have access to this detector"}), 404

        return jsonify({"message": "Detector updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
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
policy_collection = db.get_collection("policies")

policy_bp = Blueprint("policy", __name__)

@policy_bp.route('/create_policy', methods=['POST'])
@jwt_required()
def create_policy():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()

        # Insert into MongoDB
        policy_collection.insert_one({"user_id": user_id, "created_at": datetime.utcnow().isoformat(), **data})

        return jsonify({"message": "Policy created successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@policy_bp.route('/delete_policy', methods=['DELETE'])
@jwt_required()
def delete_policy():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        policy_name = data.get('policy_name', "")
        if not policy_name:
            return jsonify({"error": "Policy name is required"}), 400
        
        # Find the policy by name and user_id
        policy = policy_collection.find_one({"policy_name": policy_name, "user_id": user_id})
        if not policy:
            return jsonify({"error": "Policy not found"}), 404
        # Delete the policy
        policy_collection.delete_one({"_id": policy["_id"]})
        return jsonify({"message": "Policy deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@policy_bp.route('/list_policies', methods=['GET'])
@jwt_required()
def list_policies():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Find all policies for the user
        policies = list(policy_collection.find({"user_id": user_id}))

        # Convert ObjectId to string for JSON serialization
        for policy in policies:
            policy["_id"] = str(policy["_id"])

        return jsonify(policies), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@policy_bp.route('/update_policy', methods=['PUT'])
@jwt_required()
def update_policy():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        policy_name = data.get('policy_name', "")
        if not policy_name:
            return jsonify({"error": "Policy name is required"}), 400

        # Find the policy by name and user_id
        policy = policy_collection.find_one({"policy_name": policy_name, "user_id": user_id})
        if not policy:
            return jsonify({"error": "Policy not found"}), 404

        # Update the policy
        policy_collection.update_one({"_id": policy["_id"]}, {"$set": data})

        return jsonify({"message": "Policy updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@policy_bp.route('/get_policy', methods=['GET'])
@jwt_required()
def get_policy():
    try:
        # Get the current user from JWT
        user_id = get_jwt_identity()

        # Parse the request body
        data = request.get_json()
        policy_name = data.get('policy_name', "")
        if not policy_name:
            return jsonify({"error": "Policy name is required"}), 400

        # Find the policy by name and user_id
        policy = policy_collection.find_one({"policy_name": policy_name, "user_id": user_id})
        if not policy:
            return jsonify({"error": "Policy not found"}), 404

        # Convert ObjectId to string for JSON serialization
        policy["_id"] = str(policy["_id"])

        return jsonify(policy), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
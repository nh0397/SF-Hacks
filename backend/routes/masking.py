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
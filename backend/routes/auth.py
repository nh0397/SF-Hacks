from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
from models.user import create_user, find_user_by_username, check_password
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup(): # add one policy by default for a user
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if find_user_by_username(username):
        return jsonify({"error": "Username already exists"}), 400

    create_user(first_name, last_name, username, email, password)
    return jsonify({"message": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Find user by username
    user = find_user_by_username(username)
    if not user or not check_password(user['password'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    # Generate a JWT token
    access_token = create_access_token(
        identity=str(user["_id"]),  # Use user ID as the identity
        additional_claims={"username": username, "email": user["email"]}
    )
    # access_token = "dummy_string"

    # Return the token and user info
    return jsonify({
        "access_token": access_token,
        "user": {
            "username": username,
            "email": user["email"]
        }
    }), 200


@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()  # Retrieves the identity (username)
    claims = get_jwt()  # Retrieves additional claims (e.g., email)
    email = claims.get("email")
    return jsonify({"message": f"Welcome, {current_user}!", "email": email}), 200
from flask_bcrypt import Bcrypt
from models.model import MongoDB
from dotenv import load_dotenv
import os
from loguru import logger

load_dotenv()

username = os.getenv("username")
password = os.getenv("password")

bcrypt = Bcrypt()
client = MongoDB(username, password).connect()
db = client.get_database("dashboard")
users_collection = db.get_collection("users")
# policys_collection = db.get_collection("policies")

# users_collection.delete_many({})  # Clear the collection for testing purposes
# policys_collection.delete_many({})  # Clear the collection for testing purposes


def create_user(first_name, last_name, username, email, password):
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = {"first_name": first_name, "last_name": last_name, "username": username, "email": email, "password": hashed_password}
    users_collection.insert_one(user)

def find_user_by_username(username):
    return users_collection.find_one({"username": username})

def check_password(hashed_password, password):
    return bcrypt.check_password_hash(hashed_password, password)
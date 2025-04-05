import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Add this for JWT
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # Set expiration to 1 hour
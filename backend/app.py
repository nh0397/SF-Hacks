from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS  # Import CORS
from routes.auth import auth_bp
from routes.detectors import detector_bp
from routes.policy import policy_bp
from routes.masking import masking_bp
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for the entire app
CORS(app)
CORS(auth_bp)
CORS(detector_bp)
CORS(policy_bp)
CORS(masking_bp)
# Initialize JWT
jwt = JWTManager(app)

# Register the Blueprints
app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(detector_bp, url_prefix='/detectors')
app.register_blueprint(policy_bp, url_prefix='/policy')
app.register_blueprint(masking_bp, url_prefix='/masking')

@app.route('/')
def index():
    return "Welcome to the secure alley backend"

if __name__ == '__main__':
    # app.run(debug=True)
    app.run(host="0.0.0.0", port=8000, debug=True)
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# User 모델
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# DB 생성
with app.app_context():
    db.create_all()

# 기존 라우트
@app.route('/')
def home():
    return jsonify({"message": "Welcome to Project Alpha API"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        "message": "Backend connection successful!",
        "status": "OK",
        "data": {
            "timestamp": "2024-01-01",
            "version": "1.0.0"
        }
    })

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify({
        "message": "Received your data",
        "received": data
    })

# 인증 라우트
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    
    user = User(username=username, email=email)
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

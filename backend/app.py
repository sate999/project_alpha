from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # React와 통신을 위한 CORS 설정

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Project Alpha API"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
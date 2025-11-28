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

@app.route('/api/test', methods = ['GET'])
def test():
    return jsonify({
        "message" : "Backend connection successful !",
        "status" : "OK",
        "data" : {
            "timestamp" : "2024 - 01 - 01",
            "version" : "1.0.0"
        }
    })

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    return jsonify({
        "message": "Received your data",
        "received": data
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import timedelta, datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# 업로드 설정
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'webm'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# =====================
# Models
# =====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    products = db.relationship('Product', backref='owner', lazy=True)
    wishlist = db.relationship('Wishlist', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='판매중')
    image_url = db.Column(db.String(500))
    video_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self, user_id=None):
        is_wishlisted = False
        if user_id:
            wishlist_item = Wishlist.query.filter_by(user_id=user_id, product_id=self.id).first()
            is_wishlisted = wishlist_item is not None
        
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'status': self.status,
            'image_url': self.image_url,
            'video_url': self.video_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'owner': self.owner.username,
            'owner_id': self.user_id,
            'is_wishlisted': is_wishlisted
        }

class Wishlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    product = db.relationship('Product', backref='chat_rooms')
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='buying_chats')
    seller = db.relationship('User', foreign_keys=[seller_id], backref='selling_chats')
    messages = db.relationship('Message', backref='chat_room', lazy=True, order_by='Message.created_at')

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chat_room_id = db.Column(db.Integer, db.ForeignKey('chat_room.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    sender = db.relationship('User', backref='sent_messages')

# =====================
# Routes
# =====================

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        file_url = f"/uploads/{filename}"
        return jsonify({"url": file_url}), 201
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/')
def home():
    return jsonify({"message": "Welcome to 유니브당근 API"})

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy"})

# =====================
# Auth Routes
# =====================

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
    
    access_token = create_access_token(identity=str(user.id))
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
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email
    })

# =====================
# Product Routes
# =====================

@app.route('/api/products', methods=['GET'])
@jwt_required(optional=True)
def get_products():
    user_id = get_jwt_identity()
    products = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify([p.to_dict(user_id=int(user_id) if user_id else None) for p in products])

@app.route('/api/products/<int:id>', methods=['GET'])
@jwt_required(optional=True)
def get_product(id):
    user_id = get_jwt_identity()
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict(user_id=int(user_id) if user_id else None))

@app.route('/api/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    name = data.get('name')
    description = data.get('description', '')
    price = data.get('price')
    image_url = data.get('image_url')
    video_url = data.get('video_url')
    
    if not name or price is None:
        return jsonify({"error": "Name and price are required"}), 400
    
    product = Product(
        name=name,
        description=description,
        price=price,
        image_url=image_url,
        video_url=video_url,
        user_id=int(user_id)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify(product.to_dict(user_id=int(user_id))), 201

@app.route('/api/products/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    user_id = get_jwt_identity()
    product = Product.query.get_or_404(id)
    
    if product.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.status = data.get('status', product.status)
    product.image_url = data.get('image_url', product.image_url)
    product.video_url = data.get('video_url', product.video_url)
    
    db.session.commit()
    
    return jsonify(product.to_dict(user_id=int(user_id)))

@app.route('/api/products/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    user_id = get_jwt_identity()
    product = Product.query.get_or_404(id)
    
    if product.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({"message": "Product deleted"})

# =====================
# Wishlist Routes
# =====================

@app.route('/api/wishlist', methods=['GET'])
@jwt_required()
def get_wishlist():
    user_id = get_jwt_identity()
    wishlist_items = Wishlist.query.filter_by(user_id=int(user_id)).all()
    products = [Product.query.get(item.product_id).to_dict(user_id=int(user_id)) for item in wishlist_items]
    return jsonify(products)

@app.route('/api/wishlist/<int:product_id>', methods=['POST'])
@jwt_required()
def add_to_wishlist(product_id):
    user_id = get_jwt_identity()
    
    existing = Wishlist.query.filter_by(user_id=int(user_id), product_id=product_id).first()
    if existing:
        return jsonify({"error": "Already in wishlist"}), 400
    
    wishlist_item = Wishlist(user_id=int(user_id), product_id=product_id)
    db.session.add(wishlist_item)
    db.session.commit()
    
    return jsonify({"message": "Added to wishlist"}), 201

@app.route('/api/wishlist/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    user_id = get_jwt_identity()
    
    wishlist_item = Wishlist.query.filter_by(user_id=int(user_id), product_id=product_id).first()
    if not wishlist_item:
        return jsonify({"error": "Not in wishlist"}), 404
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({"message": "Removed from wishlist"})

# =====================
# MyPage Routes
# =====================

@app.route('/api/my/products', methods=['GET'])
@jwt_required()
def get_my_products():
    user_id = get_jwt_identity()
    products = Product.query.filter_by(user_id=int(user_id)).order_by(Product.created_at.desc()).all()
    return jsonify([p.to_dict(user_id=int(user_id)) for p in products])

# =====================
# Chat Routes
# =====================

@app.route('/api/chat/room/<int:product_id>', methods=['POST'])
@jwt_required()
def create_or_get_chat_room(product_id):
    user_id = int(get_jwt_identity())
    product = Product.query.get_or_404(product_id)
    
    if product.user_id == user_id:
        return jsonify({"error": "자신의 상품에는 채팅할 수 없습니다"}), 400
    
    chat_room = ChatRoom.query.filter_by(
        product_id=product_id,
        buyer_id=user_id
    ).first()
    
    if not chat_room:
        chat_room = ChatRoom(
            product_id=product_id,
            buyer_id=user_id,
            seller_id=product.user_id
        )
        db.session.add(chat_room)
        db.session.commit()
    
    return jsonify({
        "id": chat_room.id,
        "product": product.to_dict(),
        "buyer": chat_room.buyer.username,
        "seller": chat_room.seller.username
    })

@app.route('/api/chat/rooms', methods=['GET'])
@jwt_required()
def get_my_chat_rooms():
    user_id = int(get_jwt_identity())
    
    chat_rooms = ChatRoom.query.filter(
        (ChatRoom.buyer_id == user_id) | (ChatRoom.seller_id == user_id)
    ).order_by(ChatRoom.created_at.desc()).all()
    
    result = []
    for room in chat_rooms:
        last_message = Message.query.filter_by(chat_room_id=room.id).order_by(Message.created_at.desc()).first()
        result.append({
            "id": room.id,
            "product": {"id": room.product.id, "name": room.product.name, "image_url": room.product.image_url},
            "other_user": room.seller.username if room.buyer_id == user_id else room.buyer.username,
            "last_message": last_message.content if last_message else None,
            "last_message_time": last_message.created_at.isoformat() if last_message else None
        })
    
    return jsonify(result)

@app.route('/api/chat/room/<int:room_id>/messages', methods=['POST'])
@jwt_required()
def send_message(room_id):
    user_id = int(get_jwt_identity())
    chat_room = ChatRoom.query.get_or_404(room_id)
    
    if chat_room.buyer_id != user_id and chat_room.seller_id != user_id:
        return jsonify({"error": "권한이 없습니다"}), 403
    
    data = request.get_json()
    content = data.get('content')
    
    if not content:
        return jsonify({"error": "메시지 내용이 필요합니다"}), 400
    
    message = Message(
        chat_room_id=room_id,
        sender_id=user_id,
        content=content
    )
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        "id": message.id,
        "sender": message.sender.username,
        "content": message.content,
        "created_at": message.created_at.isoformat()
    }), 201

@app.route('/api/chat/room/<int:room_id>/messages', methods=['GET'])
@jwt_required()
def get_messages(room_id):
    user_id = int(get_jwt_identity())
    chat_room = ChatRoom.query.get_or_404(room_id)
    
    if chat_room.buyer_id != user_id and chat_room.seller_id != user_id:
        return jsonify({"error": "권한이 없습니다"}), 403
    
    messages = Message.query.filter_by(chat_room_id=room_id).order_by(Message.created_at.asc()).all()
    
    return jsonify([{
        "id": m.id,
        "sender": m.sender.username,
        "sender_id": m.sender_id,
        "content": m.content,
        "created_at": m.created_at.isoformat()
    } for m in messages])

# =====================
# Run
# =====================

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

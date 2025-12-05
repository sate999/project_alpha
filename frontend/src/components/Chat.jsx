import { useState, useEffect, useRef } from "react";
import { getMyChatRooms, getMessages, sendMessage, createChatRoom } from "../services/api";

const API_BASE_URL = "http://localhost:5000";

function Chat({ user, onBack, initialProductId }) {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (initialProductId) {
      startChat(initialProductId);
    } else {
      fetchChatRooms();
    }
  }, [initialProductId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let interval;
    if (selectedRoom) {
      interval = setInterval(() => {
        fetchMessages(selectedRoom.id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    try {
      const data = await getMyChatRooms();
      setChatRooms(data);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async (productId) => {
    try {
      setLoading(true);
      const room = await createChatRoom(productId);
      setSelectedRoom(room);
      fetchMessages(room.id);
      fetchChatRooms();
    } catch (err) {
      alert(err.response?.data?.error || "채팅방 생성 실패");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const data = await getMessages(roomId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await sendMessage(selectedRoom.id, newMessage);
      setNewMessage("");
      fetchMessages(selectedRoom.id);
    } catch (err) {
      console.error(err);
    }
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room.id);
  };

  return (
    <div className="chat-section">
      <div className="chat-header">
        <button className="back-btn" onClick={selectedRoom && !initialProductId ? () => setSelectedRoom(null) : onBack}>
          ← 뒤로
        </button>
        <h3>💬 {selectedRoom ? (selectedRoom.product?.name || selectedRoom.other_user) : "채팅"}</h3>
      </div>

      {!selectedRoom ? (
        <div className="chat-rooms">
          {chatRooms.length === 0 ? (
            <p className="no-chats">채팅 내역이 없습니다.</p>
          ) : (
            chatRooms.map((room) => (
              <div key={room.id} className="chat-room-item" onClick={() => selectRoom(room)}>
                {room.product.image_url && (
                  <img src={`${API_BASE_URL}${room.product.image_url}`} alt={room.product.name} />
                )}
                <div className="chat-room-info">
                  <h4>{room.product.name}</h4>
                  <p className="chat-user">{room.other_user}</p>
                  {room.last_message && (
                    <p className="last-message">{room.last_message}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="chat-conversation">
          <div className="messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.sender === user.username ? 'mine' : 'other'}`}
              >
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="message-input" onSubmit={handleSend}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="메시지를 입력하세요..."
            />
            <button type="submit">전송</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chat;

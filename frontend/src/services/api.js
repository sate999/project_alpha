import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 자동 첨부
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 인증 API
export const register = async (username, email, password) => {
  const response = await api.post("/api/auth/register", { username, email, password });
  return response.data;
};

export const login = async (username, password) => {
  const response = await api.post("/api/auth/login", { username, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/api/auth/me");
  return response.data;
};

// 상품 API
export const getProducts = async () => {
  const response = await api.get("/api/products");
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (data) => {
  const response = await api.post("/api/products", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/api/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/api/products/${id}`);
  return response.data;
};

// 파일 업로드
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 찜하기 API
export const getWishlist = async () => {
  const response = await api.get("/api/wishlist");
  return response.data;
};

export const addToWishlist = async (productId) => {
  const response = await api.post(`/api/wishlist/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/api/wishlist/${productId}`);
  return response.data;
};

export default api;

// 마이페이지 API
export const getMyProducts = async () => {
  const response = await api.get("/api/my/products");
  return response.data;
};

// 채팅 API
export const createChatRoom = async (productId) => {
  const response = await api.post(`/api/chat/room/${productId}`);
  return response.data;
};

export const getMyChatRooms = async () => {
  const response = await api.get("/api/chat/rooms");
  return response.data;
};

export const getMessages = async (roomId) => {
  const response = await api.get(`/api/chat/room/${roomId}/messages`);
  return response.data;
};

export const sendMessage = async (roomId, content) => {
  const response = await api.post(`/api/chat/room/${roomId}/messages`, { content });
  return response.data;
};

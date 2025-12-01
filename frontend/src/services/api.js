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

// 기존 API
export const getHealth = async () => {
  const response = await api.get("/api/health");
  return response.data;
};

export const getTest = async () => {
  const response = await api.get("/api/test");
  return response.data;
};

export const postEcho = async (data) => {
  const response = await api.post("/api/echo", data);
  return response.data;
};

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

export default api;

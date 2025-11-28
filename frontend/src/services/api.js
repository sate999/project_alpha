import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API 함수들
export const getHealth = async () => {
  try {
    const response = await api.get("/api/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching health:", error);
    throw error;
  }
};

export const getTest = async () => {
  try {
    const response = await api.get("/api/test");
    return response.data;
  } catch (error) {
    console.error("Error fetching test:", error);
    throw error;
  }
};

export const postEcho = async (data) => {
  try {
    const response = await api.post("/api/echo", data);
    return response.data;
  } catch (error) {
    console.error("Error posting echo:", error);
    throw error;
  }
};

export default api;

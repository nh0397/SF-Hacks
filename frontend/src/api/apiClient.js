import axios from "axios";
import API_BASE_URL from "../config";
import { getSecureToken } from "../utils/security";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach token
apiClient.interceptors.request.use(async (config) => {
  const token = getSecureToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle API errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error: ", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

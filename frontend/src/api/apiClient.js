import axios from "axios";
import { getSecureToken } from "../utils/security";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Auto-attach token from sessionStorage
apiClient.interceptors.request.use(
  async (config) => {
    const token = getSecureToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error: ", error.response || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
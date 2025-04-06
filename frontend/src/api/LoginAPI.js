import apiClient from "./apiClient";
import { setSecureToken } from "../utils/security"; // 👈 Import the setter

export const loginAPI = async (formData) => {
  try {
    const response = await apiClient.post("/auth/login", formData);

    // ✅ Save token into sessionStorage
    const token = response.data.access_token;
    if (token) {
      setSecureToken(token);
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};
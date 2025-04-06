import apiClient from "./apiClient"; // Centralized axios instance

export const loginAPI = async (formData) => {
  try {
    const response = await apiClient.post("/auth/login", formData);
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

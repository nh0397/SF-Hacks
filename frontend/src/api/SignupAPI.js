import apiClient from "./apiClient";

export const signupAPI = async (formData) => {
  try {
    const response = await apiClient.post("/signup", formData);
    return response.data;
  } catch (error) {
    console.error("Signup failed:", error);
    throw error;
  }
};

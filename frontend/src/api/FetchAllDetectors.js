import apiClient from "./apiClient";

export const fetchAllDetectors = async (username) => {
  try {
    // For example: PUT /policy/detector/5
    const response = await apiClient.get(`/detectors/${username}`);
    return response.data;
  } catch (error) {
    console.error("Updating detector failed:", error);
    throw error;
  }
};

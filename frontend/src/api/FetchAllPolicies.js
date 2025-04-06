import apiClient from "./apiClient";

export const fetchAllPolicies = async (username) => {
  try {
    // For example: PUT /policy/detector/5
    const response = await apiClient.get(`/policies/${username}`);
    return response.data;
  } catch (error) {
    console.error("Fetching policies failed:", error);
    throw error;
  }
};

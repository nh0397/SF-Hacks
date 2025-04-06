import apiClient from "./apiClient"; 

export const addDetectorAPI = async (detectorData) => {
  try {
    const { username,name, ...payload } = detectorData;

    // For example: PUT /policy/detector/5
    const response = await apiClient.put(`/detectors/${username}/${name}`, payload);
    return response.data;
  } catch (error) {
    console.error("Updating detector failed:", error);
    throw error;
  }
};

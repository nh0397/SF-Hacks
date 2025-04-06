import apiClient from "./apiClient"; 

export const DeleteDetectorAPI = async (detectorData) => {
  try {
    const { username,detectorName } = detectorData;

    // For example: PUT /policy/detector/5
    const response = await apiClient.delete(`/detectors/${username}/${detectorName}`);
    return response.data;
  } catch (error) {
    console.error("Deleting Detector Failed:", error);
    throw error;
  }
};

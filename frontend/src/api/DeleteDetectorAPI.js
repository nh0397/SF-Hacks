import apiClient from "./apiClient";

export const DeleteDetectorAPI = async (detectorData) => {
  try {
    const { username, detector_name } = detectorData;

    // Explicitly pass body & headers
    const response = await apiClient.delete("/detectors/delete_detector", {
      data: { username, detector_name },
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data;
  } catch (error) {
    console.error("Deleting Detector Failed:", error);
    throw error;
  }
};
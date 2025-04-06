import apiClient from "./apiClient"; 


export const DeletePolicyAPI = async (policyData) => {
  try {
    const { username,policy_name } = policyData;

    // For example: PUT /policy/detector/5
    const response = await apiClient.delete(`/policies/${username}/${policy_name}`);
    return response.data;
  } catch (error) {
    console.error("Deleting Policy Failed:", error);
    throw error;
  }
};

import apiClient from "./apiClient"; 

export const addPolicyAPI = async (policyData) => {
  try {
    const { username,policy_name, ...payload } = policyData;

    // For example: PUT /policy/detector/5
    const response = await apiClient.put(`/policies/${username}/${policy_name}`, payload);
    return response.data;
  } catch (error) {
    console.error("Updating/creating Policy failed:", error);
    throw error;
  }
};

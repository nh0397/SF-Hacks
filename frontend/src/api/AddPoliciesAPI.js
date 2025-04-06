import apiClient from "./apiClient"; 

export const addPolicyAPI = async (policyData) => {
  try {
    const response = await apiClient.post(`/policy/create_policy`, policyData);
    return response.data;
  } catch (error) {
    console.error("Updating/creating Policy failed:", error);
    throw error;
  }
};
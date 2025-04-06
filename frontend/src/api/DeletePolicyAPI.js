import apiClient from "./apiClient"; 

export const DeletePolicyAPI = async (policyData) => {
  try {
    const { username, policy_name } = policyData;
    // Send the payload in the DELETE request using the data property
    const response = await apiClient.delete(`/policy/delete_policy`, {
      data: { username, policy_name },
      headers: { "Content-Type": "application/json" }
    });
    return response.data;
  } catch (error) {
    console.error("Deleting Policy Failed:", error);
    throw error;
  }
};
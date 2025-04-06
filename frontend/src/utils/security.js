export const getSecureToken = () => sessionStorage.getItem("authToken");
export const setSecureToken = (token) => sessionStorage.setItem("authToken", token);
export const removeSecureToken = () => sessionStorage.removeItem("authToken");

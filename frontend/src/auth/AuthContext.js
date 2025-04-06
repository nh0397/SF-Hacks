import { createContext, useContext, useState } from "react";
import { getSecureToken, setSecureToken, removeSecureToken } from "../utils/security";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (token) => {
    setSecureToken(token);
    setUser({ token });
  };

  const logout = () => {
    removeSecureToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

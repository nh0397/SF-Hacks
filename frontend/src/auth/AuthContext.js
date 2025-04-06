import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user data from sessionStorage when the app starts
  useEffect(() => {
    const savedUser = sessionStorage.getItem("username");
    if (savedUser) {
      setUser({ username: savedUser });
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("username", userData.username); // ✅ Store in sessionStorage
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear(); // ✅ Clear sessionStorage on logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

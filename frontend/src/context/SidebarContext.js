import React, { createContext, useContext, useState } from "react";

// Create Sidebar Context
const SidebarContext = createContext();

// Custom Hook
export const useSidebar = () => useContext(SidebarContext);

// Sidebar Provider
export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
};

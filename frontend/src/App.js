import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { SidebarProvider, useSidebar } from "./context/SidebarContext"; // ✅ Import Sidebar Context
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import "./App.css"; // ✅ Import global styles
import Detectors from "./pages/Detectors/Detectors";
import Policies from "./pages/Policies/Policies";

const MainLayout = ({ children }) => {
  const { isCollapsed } = useSidebar(); // ✅ Access sidebar state

  return (
    <div className={`app-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <Navbar />
      <div className="content-container">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        {" "}
        {/* ✅ Wrap everything inside SidebarProvider */}
        <Router>
          <Routes>
            <Route path="" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/detectors"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Detectors />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/policies"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Policies />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
}

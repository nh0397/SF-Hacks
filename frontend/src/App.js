import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

export default function App() {
  return (
    <AuthProvider>
      <Router>  {/* ✅ Wrap the entire app with <Router> */}
        <Routes>
          <Route path="/" element={<Login />} /> 
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
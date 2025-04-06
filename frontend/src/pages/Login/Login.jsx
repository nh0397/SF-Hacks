import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./Login.css";
import logo from "../../assets/logo.png";
import { loginAPI } from "../../api/LoginAPI";
import { useAuth } from "../../auth/AuthContext"; // ✅ Import AuthContext

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ Get login function from context
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAPI(formData);
      sessionStorage.setItem("token", response.access_token); // ✅ Store JWT for backend requests
      sessionStorage.setItem("username", response.user.username); // ✅ Store username

      login({ username: response.user.username }); // ✅ Update AuthContext
      navigate("/dashboard"); // ✅ Redirect to dashboard
    } catch (error) {
      alert("Login failed. Check credentials."); // Show error message
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <Typography variant="h6" className="tagline">
          Enabling enterprises to institutionalize data-driven decision making
        </Typography>
      </div>

      <div className="login-right">
        <Box className="login-box box-top">
          <img src={logo} alt="Secure Alley Logo" className="logo" />
          <Typography variant="h4" className="welcome-text">Welcome to Secure Alley</Typography>
          <Typography variant="body2" className="subtext">Sign in with your credentials</Typography>
        </Box>
        <Box className="login-box box-bottom">
          <form onSubmit={handleSubmit} className="login-form">
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth className="login-btn">
              Sign In
            </Button>
            <Typography variant="body2" className="login-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </Typography>
          </form>
        </Box>
      </div>
    </div>
  );
}

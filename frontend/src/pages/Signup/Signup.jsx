import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment, Typography, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./Signup.css";
import logo from "../../assets/logo.png";
import { signupAPI } from "../../api/SignupAPI";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signupAPI(formData);
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <Typography variant="h6" className="tagline">
          Join Secure Alley and secure your data-driven decisions.
        </Typography>
      </div>

      <div className="signup-right">
        <Box className="signup-box box-top">
          <img src={logo} alt="Secure Alley Logo" className="logo" />
          <Typography variant="h4" className="welcome-text">Create Your Account</Typography>
          <Typography variant="body2" className="subtext">Sign up with your details</Typography>
        </Box>
        <Box className="signup-box box-bottom">
          <form onSubmit={handleSubmit} className="signup-form">
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
              label="Email"
              name="email"
              type="email"
              value={formData.email}
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
            <Button type="submit" variant="contained" color="primary" fullWidth className="signup-btn">
              Sign Up
            </Button>
            <Typography variant="body2" className="login-link">
              Already have an account? <Link to="/login">Log in</Link>
            </Typography>
          </form>
        </Box>
      </div>
    </div>
  );
}

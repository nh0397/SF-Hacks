import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, LogOut } from 'lucide-react';
import { Menu, MenuItem, MenuList, ClickAwayListener, Paper, Grow, Popper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from "../../assets/logo.png"

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open/Close Profile Menu
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.clear(); // ✅ Clear session storage
    navigate('/login'); // ✅ Redirect to login page
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      {/* Logo */}
      <div className="navbar-logo">
        <div className="logo-container">
          <div className="logo-icon" >
            <img src={logo} className='logo'/>
          </div>
          <span className="logo-text">Secure Alley</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search..." 
          className="search-input"
        />
      </div>

      {/* Right Side */}
      <div className="navbar-right">
        {/* Notifications */}
        <div className="notification-container">
          <Bell className="notification-icon" size={20} />
          <span className="notification-badge">3</span>
        </div>

        {/* Profile Dropdown */}
        <div className="profile-container" onClick={handleProfileMenuOpen}>
          <div className="profile-image">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=60&q=80" 
              alt="Profile" 
            />
          </div>
          <div className="profile-info">
            <p className="profile-name">Archit D</p>
          </div>
          <ChevronDown size={16} className="profile-chevron" />
        </div>

        {/* Dropdown Menu */}
        <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} transition disablePortal>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList>
                    <MenuItem onClick={handleLogout}>
                      <LogOut size={18} style={{ marginRight: '8px' }} />
                      Logout
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </nav>
  );
};

export default Navbar;

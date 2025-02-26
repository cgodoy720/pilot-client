import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';
import logo from '../../assets/logo.png'
import logoFull from '../../assets/logo-full.png'

const Layout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box className="layout">
      <nav className={`layout__sidebar ${isExpanded ? 'layout__sidebar--expanded' : 'layout__sidebar--collapsed'}`}>
        <div className="layout__sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-small" />
            <img src={logoFull} alt="Full Logo" className="logo-full" />
          </div>
          <IconButton 
            className="layout__toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ color: 'white' }}
          >
            {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </div>
        
        <div className="layout__nav-links">
          <Link to="/dashboard" className="layout__nav-item">
            <DashboardIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Dashboard</span>}
          </Link>
          <Link to="/gpt" className="layout__nav-item">
            <ChatIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">GPT-4-TURBO</span>}
          </Link>
          <Link to="/calendar" className="layout__nav-item">
            <CalendarMonthIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Calendar</span>}
          </Link>
          <Link to="/learning" className="layout__nav-item">
            <SchoolIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Learning</span>}
          </Link>
        </div>

        <div className="layout__bottom-links">
          <a href="#" className="layout__nav-item">
            <DarkModeIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Theme</span>}
          </a>
          <button onClick={handleLogout} className="layout__nav-item layout__logout-btn">
            <LogoutIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Logout</span>}
          </button>
        </div>
      </nav>
      
      <main className="layout__content">
        {children}
      </main>
    </Box>
  );
};

export default Layout; 
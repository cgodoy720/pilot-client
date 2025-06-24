import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';
import logo from '../../assets/logo.png'
import logoFull from '../../assets/logo-full.png'

const Layout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user has active status
  const isActive = user?.active !== false;
  // Check if user is admin or staff
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle Learning link click for inactive users
  const handleLearningClick = (e) => {
    if (!isActive) {
      e.preventDefault();
      // If already on dashboard, no need to navigate
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
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
          <Link to="/dashboard" className={`layout__nav-item ${location.pathname === '/dashboard' ? 'layout__nav-item--active' : ''}`}>
            <DashboardIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Dashboard</span>}
          </Link>
          
          {isActive ? (
            <Link to="/learning" className={`layout__nav-item ${location.pathname === '/learning' ? 'layout__nav-item--active' : ''}`}>
              <SchoolIcon className="layout__nav-icon" />
              {isExpanded && <span className="layout__nav-text">Learning</span>}
            </Link>
          ) : (
            <Tooltip title="You have historical access only" placement="right">
              <span className="layout__nav-item layout__nav-item--disabled" onClick={handleLearningClick}>
                <SchoolIcon className="layout__nav-icon" />
                {isExpanded && <span className="layout__nav-text">Learning</span>}
              </span>
            </Tooltip>
          )}
          
          <Link to="/gpt" className={`layout__nav-item ${location.pathname === '/gpt' ? 'layout__nav-item--active' : ''}`}>
            <ChatIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">GPT-4-TURBO</span>}
          </Link>
          <Link to="/calendar" className={`layout__nav-item ${location.pathname === '/calendar' ? 'layout__nav-item--active' : ''}`}>
            <CalendarMonthIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Calendar</span>}
          </Link>
          
          <Link to="/stats" className={`layout__nav-item ${location.pathname === '/stats' ? 'layout__nav-item--active' : ''}`}>
            <AssessmentIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">My Progress</span>}
          </Link>
          
          {isAdmin && (
            <Link to="/admin-dashboard" className={`layout__nav-item ${location.pathname === '/admin-dashboard' ? 'layout__nav-item--active' : ''}`}>
              <AdminPanelSettingsIcon className="layout__nav-icon" />
              {isExpanded && <span className="layout__nav-text">Admin Dashboard</span>}
            </Link>
          )}
        </div>

        <div className="layout__bottom-links">
          {/* <a href="#" className="layout__nav-item">
            <DarkModeIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Theme</span>}
          </a> */}
          <Link to="/account" className={`layout__nav-item ${location.pathname === '/account' ? 'layout__nav-item--active' : ''}`}>
            <PersonIcon className="layout__nav-icon" />
            {isExpanded && <span className="layout__nav-text">Account</span>}
          </Link>
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
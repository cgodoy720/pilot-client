import React from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import './Pathfinder.css';

function Pathfinder() {
  const location = useLocation();
  
  // Redirect to dashboard if on /pathfinder root
  if (location.pathname === '/pathfinder' || location.pathname === '/pathfinder/') {
    return <Navigate to="/pathfinder/dashboard" replace />;
  }

  return (
    <div className="pathfinder">
      {/* Secondary Navigation */}
      <nav className="pathfinder__nav">
        <NavLink
          to="/pathfinder/dashboard"
          className={({ isActive }) =>
            `pathfinder__nav-link ${isActive ? 'pathfinder__nav-link--active' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/pathfinder/networking"
          className={({ isActive }) =>
            `pathfinder__nav-link ${isActive ? 'pathfinder__nav-link--active' : ''}`
          }
        >
          Hustle Tracker
        </NavLink>
        <NavLink
          to="/pathfinder/projects"
          className={({ isActive }) =>
            `pathfinder__nav-link ${isActive ? 'pathfinder__nav-link--active' : ''}`
          }
        >
          Build Tracker
        </NavLink>
        <NavLink
          to="/pathfinder/applications"
          className={({ isActive }) =>
            `pathfinder__nav-link ${isActive ? 'pathfinder__nav-link--active' : ''}`
          }
        >
          Job Tracker
        </NavLink>
      </nav>

      {/* Content Area */}
      <div className="pathfinder__content">
        <Outlet />
      </div>
    </div>
  );
}

export default Pathfinder;


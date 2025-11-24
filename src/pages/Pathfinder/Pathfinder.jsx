import React from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';

function Pathfinder() {
  const location = useLocation();
  
  // Redirect to dashboard if on /pathfinder root
  if (location.pathname === '/pathfinder' || location.pathname === '/pathfinder/') {
    return <Navigate to="/pathfinder/dashboard" replace />;
  }

  return (
    <div className="w-full max-w-full mx-auto overflow-x-hidden bg-[#f5f5f5] min-h-screen text-[#1a1a1a]">
      {/* Secondary Navigation */}
      <nav className="h-[45px] flex gap-0 border-b-2 border-[#e0e0e0] mb-8 bg-[#f5f5f5]">
        <NavLink
          to="/pathfinder/dashboard"
          className={({ isActive }) =>
            `h-full px-6 text-base font-semibold transition-all duration-200 border-b-[3px] flex items-center ${
              isActive 
                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]' 
                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/pathfinder/networking"
          className={({ isActive }) =>
            `h-full px-6 text-base font-semibold transition-all duration-200 border-b-[3px] flex items-center ${
              isActive 
                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]' 
                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
            }`
          }
        >
          Hustle Tracker
        </NavLink>
        <NavLink
          to="/pathfinder/projects"
          className={({ isActive }) =>
            `h-full px-6 text-base font-semibold transition-all duration-200 border-b-[3px] flex items-center ${
              isActive 
                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]' 
                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
            }`
          }
        >
          Build Tracker
        </NavLink>
        <NavLink
          to="/pathfinder/applications"
          className={({ isActive }) =>
            `h-full px-6 text-base font-semibold transition-all duration-200 border-b-[3px] flex items-center ${
              isActive 
                ? 'text-[#4242ea] border-[#4242ea] bg-[rgba(66,66,234,0.05)]' 
                : 'text-[#666666] border-transparent hover:text-[#1a1a1a] hover:bg-[rgba(66,66,234,0.05)]'
            }`
          }
        >
          Job Tracker
        </NavLink>
      </nav>

      {/* Content Area */}
      <div className="w-full max-w-full overflow-x-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default Pathfinder;


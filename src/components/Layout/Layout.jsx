import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar as CalendarIcon, ChevronDown, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingCurtain from '../LoadingCurtain/LoadingCurtain';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const Layout = ({ children, isLoading = false }) => {
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVolunteersExpanded, setIsVolunteersExpanded] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-expand Volunteers section when on a volunteer page
  useEffect(() => {
    if (location.pathname.includes('volunteer')) {
      setIsVolunteersExpanded(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const toggleMobileNavbar = () => {
    setIsMobileNavbarOpen(!isMobileNavbarOpen);
  };

  const closeMobileNavbar = () => {
    setIsMobileNavbarOpen(false);
  };

  // Get the current page icon for mobile menu button
  const getCurrentPageIcon = () => {
    const iconMap = {
      '/dashboard': logo,
      '/learning': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '/ai-chat': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '/calendar': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '/performance': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '/assessment': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      '/account': (
        <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
          <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    };

    // Check for admin routes
    if (location.pathname === '/admin-dashboard' && (user?.role === 'admin' || user?.role === 'staff')) {
      return <Settings className="h-4 w-4 text-[#E3E3E3]" />;
    }
    if (location.pathname === '/admin/assessment-grades' && (user?.role === 'admin' || user?.role === 'staff')) {
      return <Award className="h-4 w-4 text-[#E3E3E3]" />;
    }
    if (location.pathname === '/admissions-dashboard' && (user?.role === 'admin' || user?.role === 'staff')) {
      return <Users className="h-4 w-4 text-[#E3E3E3]" />;
    }
    if ((location.pathname === '/content' || location.pathname.startsWith('/content')) && (user?.role === 'admin' || user?.role === 'staff')) {
      return <Bug className="h-4 w-4 text-[#E3E3E3]" />;
    }
    if (location.pathname === '/admin-prompts' && (user?.role === 'admin' || user?.role === 'staff')) {
      return <Brain className="h-4 w-4 text-[#E3E3E3]" />;
    }
    if ((location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback') &&
        (user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff')) {
      return <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />;
    }
    // Pathfinder routes
    if (location.pathname.startsWith('/pathfinder')) {
      return <ArrowRight className="h-4 w-4 text-[#E3E3E3]" />;
    }
    // Payment routes
    if (location.pathname.startsWith('/payment')) {
      return <Briefcase className="h-4 w-4 text-[#E3E3E3]" />;
    }
    // Workshop routes
    if (location.pathname.startsWith('/workshop')) {
      return <CalendarIcon className="h-4 w-4 text-[#E3E3E3]" />;
    }

    return iconMap[location.pathname] || logo;
  };

  // Helper to render nav items (reduces code duplication)
  const renderNavLink = (to, icon, label, condition = true, isActiveCheck = null) => {
    if (!condition) return null;
    
    const isActiveRoute = isActiveCheck ? isActiveCheck() : location.pathname === to || location.pathname.startsWith(to + '/');
    
    if (isMobile && !isMobileNavbarOpen) return null;
    
    const linkClass = cn(
      "relative flex items-center",
      isMobile ? "h-[53px]" : "h-[44px]",
      isActiveRoute ? "bg-[#4242EA]" : "hover:bg-white/10"
    );
    
    const iconContainer = cn(
      "absolute left-0 top-0 flex items-center justify-center",
      isMobile ? "w-[60px] h-[53px]" : "w-[50px] h-[44px]"
    );
    
    const textContainer = cn(
      "flex items-center transition-all duration-300 ease-in-out",
      isMobile 
        ? "ml-[60px]"
        : isNavbarHovered 
          ? "ml-[50px] opacity-100" 
          : "ml-[50px] opacity-0 w-0 overflow-hidden"
    );
    
    return (
      <Link
        to={to}
        onClick={isMobile ? closeMobileNavbar : undefined}
        className={linkClass}
      >
        <div className={iconContainer}>
          {icon}
        </div>
        <div className={textContainer}>
          <span className="text-white text-sm font-medium whitespace-nowrap">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className={cn("flex h-screen w-full", isPathfinderPage ? "bg-white" : "bg-background")}>
      {/* Sidebar - Responsive behavior */}
      <nav
        className={cn(
          "bg-[#1E1E1E] flex flex-col fixed left-0 top-0 h-full transition-all duration-300 z-[60]",
          isMobile
            ? isMobileNavbarOpen
              ? "w-[386px]" // Mobile expanded width (overlay)
              : "w-0" // Mobile collapsed: completely hidden
            : isNavbarHovered
              ? "w-[250px]" // Desktop expanded width
              : "w-[50px]" // Desktop collapsed width
        )}
        onMouseEnter={() => !isMobile && setIsNavbarHovered(true)}
        onMouseLeave={() => !isMobile && setIsNavbarHovered(false)}
      >
        {/* Mobile Menu Button / Current Page Indicator */}
        {isMobile && (
          <div className="relative">
            <button
              onClick={toggleMobileNavbar}
              className={cn(
                "w-[60px] h-[53px] flex items-center justify-center",
                isMobileNavbarOpen ? "bg-[#4242EA]" : "bg-[#4242EA] hover:bg-blue-600"
              )}
            >
              {location.pathname === '/dashboard' ? (
                <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
              ) : (
                getCurrentPageIcon()
              )}
            </button>

            {/* Mobile Close Button */}
            {isMobileNavbarOpen && (
              <button
                onClick={closeMobileNavbar}
                className="absolute right-3 top-3 text-white hover:text-gray-300 z-[80]"
              >
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Links */}
        {renderNavLink('/dashboard', <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />, 'Dashboard')}
        
        {renderNavLink('/learning', (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'Learning', !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant)}
        
        {renderNavLink('/ai-chat', (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'AI Chat', !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant)}
        
        {renderNavLink('/calendar', (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'Calendar', !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant)}
        
        {/* Pathfinder - NEW from dev (hidden for volunteers) */}
        {renderNavLink('/pathfinder/dashboard', <ArrowRight className="h-4 w-4 text-[#E3E3E3]" />, 'Pathfinder',
          !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant && !isVolunteer,
          () => location.pathname.startsWith('/pathfinder')
        )}
        
        {/* Pathfinder Admin - NEW from dev */}
        {renderNavLink('/pathfinder/admin', <Settings className="h-4 w-4 text-[#E3E3E3]" />, 'Pathfinder Admin', 
          (user?.role === 'admin' || user?.role === 'staff')
        )}
        
        {/* My Performance - Show for fellows, admin, and staff; Hide for workshop participants, workshop admins, applicants, and volunteers */}
        {renderNavLink('/performance', (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'Performance', !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant && !isVolunteer)}
        
        {/* Assessment - Show for fellows, admin, and staff; Hide for workshop participants, workshop admins, and applicants */}
        {/* {renderNavLink('/assessment', (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'Assessment', !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant)} */}
        
        {/* Payment - NEW from dev */}
        {/* {renderNavLink('/payment', <Briefcase className="h-4 w-4 text-[#E3E3E3]" />, 'Payment', 
          !isWorkshopParticipant && !isWorkshopAdmin && !isApplicant,
          () => location.pathname.startsWith('/payment')
        )} */}
        
        {/* Workshop Admin Dashboard - NEW from dev */}
        {renderNavLink('/workshop-admin-dashboard', <Wrench className="h-4 w-4 text-[#E3E3E3]" />, 'Workshop Admin', 
          isWorkshopAdmin
        )}
        
        {/* Admin sections */}
        {renderNavLink('/admin-dashboard', <Settings className="h-4 w-4 text-[#E3E3E3]" />, 'Admin Dashboard', 
          user?.role === 'admin' || user?.role === 'staff'
        )}
        
        {renderNavLink('/admin/assessment-grades', <Award className="h-4 w-4 text-[#E3E3E3]" />, 'Assessment Grades', 
          user?.role === 'admin' || user?.role === 'staff'
        )}
        
        {renderNavLink('/admissions-dashboard', <Users className="h-4 w-4 text-[#E3E3E3]" />, 'Admissions', 
          user?.role === 'admin' || user?.role === 'staff'
        )}
        
        {renderNavLink('/content', <Bug className="h-4 w-4 text-[#E3E3E3]" />, 'Content Generation', 
          user?.role === 'admin' || user?.role === 'staff',
          () => location.pathname === '/content' || location.pathname.startsWith('/content/')
        )}
        
        {renderNavLink('/admin-prompts', <Brain className="h-4 w-4 text-[#E3E3E3]" />, 'AI Prompts', 
          user?.role === 'admin' || user?.role === 'staff'
        )}
        
        {/* Admin Attendance Dashboard - NEW from dev */}
        {renderNavLink('/admin-attendance-dashboard', <CalendarIcon className="h-4 w-4 text-[#E3E3E3]" />, 'Attendance Admin', 
          user?.role === 'admin' || user?.role === 'staff'
        )}
        
        {/* Volunteers Section - Collapsible */}
        {(user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && (
          <>
            {/* Volunteers Header (Collapsible) */}
            {((isMobile && isMobileNavbarOpen) || !isMobile) && (
              <button
                onClick={() => setIsVolunteersExpanded(!isVolunteersExpanded)}
                className={cn(
                  "relative flex items-center w-full",
                  isMobile ? "h-[53px]" : "h-[44px]",
                  location.pathname.includes('volunteer') ? "bg-[#4242EA]/50" : "hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute left-0 top-0 flex items-center justify-center",
                  isMobile ? "w-[60px] h-[53px]" : "w-[50px] h-[44px]"
                )}>
                  <Heart className="h-4 w-4 text-[#E3E3E3]" />
                </div>
                <div className={cn(
                  "flex items-center justify-between flex-1 transition-all duration-300 ease-in-out",
                  isMobile
                    ? "ml-[60px] pr-4"
                    : isNavbarHovered
                      ? "ml-[50px] pr-4 opacity-100"
                      : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}>
                  <span className="text-white text-sm font-medium whitespace-nowrap">Volunteers</span>
                  {(isMobile || isNavbarHovered) && (
                    isVolunteersExpanded
                      ? <ChevronDown className="h-4 w-4 text-[#E3E3E3]" />
                      : <ChevronRight className="h-4 w-4 text-[#E3E3E3]" />
                  )}
                </div>
              </button>
            )}

            {/* Volunteer Sub-items */}
            {isVolunteersExpanded && (
              <div className={cn(
                "flex flex-col",
                isMobile ? "pl-4" : isNavbarHovered ? "pl-3" : "pl-0"
              )}>
                {/* My Schedule - Volunteer self-service view */}
                {user?.role === 'volunteer' && renderNavLink(
                  '/my-schedule',
                  <CalendarIcon className="h-4 w-4 text-[#E3E3E3]" />,
                  'My Schedule',
                  true,
                  () => location.pathname === '/my-schedule'
                )}

                {/* Volunteer List - Admin/Staff only */}
                {(user?.role === 'admin' || user?.role === 'staff') && renderNavLink(
                  '/volunteer-list',
                  <ListChecks className="h-4 w-4 text-[#E3E3E3]" />,
                  'List',
                  true,
                  () => location.pathname === '/volunteer-list'
                )}

                {/* Volunteer Calendar - Admin/Staff only */}
                {(user?.role === 'admin' || user?.role === 'staff') && renderNavLink(
                  '/volunteer-roster',
                  <ClipboardList className="h-4 w-4 text-[#E3E3E3]" />,
                  'Calendar',
                  true,
                  () => location.pathname === '/volunteer-roster'
                )}

                {/* Volunteer Attendance - Admin/Staff only */}
                {(user?.role === 'admin' || user?.role === 'staff') && renderNavLink(
                  '/volunteer-attendance',
                  <UserCheck className="h-4 w-4 text-[#E3E3E3]" />,
                  'Attendance',
                  true,
                  () => location.pathname === '/volunteer-attendance'
                )}

                {/* Volunteer Feedback */}
                {renderNavLink(
                  user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback',
                  <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />,
                  'Feedback',
                  true,
                  () => location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback'
                )}
              </div>
            )}
          </>
        )}

        {/* Spacer to push profile and logout to bottom */}
        <div className="flex-1"></div>

        {/* Account */}
        {/* {renderNavLink('/account', (
          <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
            <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ), 'Account')} */}

        {/* Logout */}
        {(isMobile && isMobileNavbarOpen) || !isMobile ? (
          <button
            onClick={() => {
              handleLogout();
              if (isMobile) closeMobileNavbar();
            }}
            className={cn(
              "relative flex items-center hover:bg-white/10 text-[#E3E3E3] w-full",
              isMobile ? "h-[53px]" : "h-[44px]"
            )}
          >
            <div className={cn(
              "absolute left-0 top-0 flex items-center justify-center",
              isMobile ? "w-[60px] h-[53px]" : "w-[50px] h-[44px]"
            )}>
              <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={cn(
              "flex items-center transition-all duration-300 ease-in-out",
              isMobile 
                ? "ml-[60px]"
                : isNavbarHovered 
                  ? "ml-[50px] opacity-100" 
                  : "ml-[50px] opacity-0 w-0 overflow-hidden"
            )}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
            </div>
          </button>
        ) : null}
      </nav>
      
      {/* Main Content - Desktop: 50px left margin for collapsed navbar, Mobile: no margin */}
      <main className={cn(
        "flex-1 overflow-auto",
        isPathfinderPage ? "bg-white" : "bg-[#EFEFEF]",
        isMobile ? "ml-0" : "ml-[50px]"
      )}>
        {/* Mobile Header Bar - Only show on mobile */}
        {isMobile && (
          <div className="sticky top-0 z-50 bg-[#E751E7] h-[53px] flex items-center justify-end px-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="9" cy="9" r="1" fill="currentColor"/>
                  <circle cx="15" cy="9" r="1" fill="currentColor"/>
                </svg>
                <span className="text-white font-medium">( 3 ) missed assignments</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Page Content */}
        {children}
      </main>
      
      {/* Loading Curtain Overlay */}
      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
};

export default Layout;

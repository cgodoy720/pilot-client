import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Award, Users, Bug, Brain, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const Layout = ({ children }) => {
  const [isNavbarHovered, setIsNavbarHovered] = useState(false);
  const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
      '/gpt': (
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
      '/stats': (
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

    return iconMap[location.pathname] || logo;
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar - Responsive behavior */}
      <nav
        className={cn(
          "bg-[#1E1E1E] flex flex-col fixed left-0 top-0 h-full transition-all duration-300 z-[60]",
          isMobile
            ? isMobileNavbarOpen
              ? "w-[386px]" // Mobile expanded width (overlay)
              : "w-0" // Mobile collapsed: completely hidden
            : isNavbarHovered
              ? "w-[200px]" // Desktop expanded width
              : "w-[50px]" // Desktop collapsed width
        )}
        onMouseEnter={() => !isMobile && setIsNavbarHovered(true)}
        onMouseLeave={() => !isMobile && setIsNavbarHovered(false)}
      >
        {/* Mobile Menu Button / Current Page Indicator */}
        {isMobile ? (
          // Mobile: Show current page icon as menu button
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

            {/* Mobile Navbar Overlay - Only show when expanded */}
            {isMobileNavbarOpen && (
              <>
                {/* Mobile Navbar Content */}
                <div className="absolute top-[53px] left-0 w-[386px] h-[calc(100vh-53px)] bg-[#1E1E1E] z-[70]">
                  {/* Dashboard */}
                  <Link
                    to="/dashboard"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Dashboard</span>
                    </div>
                  </Link>

                  {/* Learning */}
                  <Link
                    to="/learning"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Learning</span>
                    </div>
                  </Link>

                  {/* AI Chat */}
                  <Link
                    to="/gpt"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">AI Chat</span>
                    </div>
                  </Link>

                  {/* Calendar */}
                  <Link
                    to="/calendar"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Calendar</span>
                    </div>
                  </Link>

                  {/* Progress */}
                  <Link
                    to="/stats"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Progress</span>
                    </div>
                  </Link>

                  {/* Assessment */}
                  <Link
                    to="/assessment"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Assessment</span>
                    </div>
                  </Link>

                  {/* Admin Items */}
                  {(user?.role === 'admin' || user?.role === 'staff') && (
                    <>
                      {/* Admin Dashboard */}
                      <Link
                        to="/admin-dashboard"
                        onClick={closeMobileNavbar}
                        className={cn(
                          "relative h-[53px] flex items-center border-b border-gray-700",
                          location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                        )}
                      >
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Settings className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admin Dashboard</span>
                        </div>
                      </Link>

                      {/* Assessment Grades */}
                      <Link
                        to="/admin/assessment-grades"
                        onClick={closeMobileNavbar}
                        className={cn(
                          "relative h-[53px] flex items-center border-b border-gray-700",
                          location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                        )}
                      >
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Award className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Assessment Grades</span>
                        </div>
                      </Link>

                      {/* Admissions */}
                      <Link
                        to="/admissions-dashboard"
                        onClick={closeMobileNavbar}
                        className={cn(
                          "relative h-[53px] flex items-center border-b border-gray-700",
                          location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                        )}
                      >
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admissions</span>
                        </div>
                      </Link>

                      {/* Content Generation */}
                      <Link
                        to="/content"
                        onClick={closeMobileNavbar}
                        className={cn(
                          "relative h-[53px] flex items-center border-b border-gray-700",
                          (location.pathname === '/content' || location.pathname.startsWith('/content')) ? "bg-[#4242EA]" : "hover:bg-gray-800"
                        )}
                      >
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Bug className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Content Generation</span>
                        </div>
                      </Link>

                      {/* AI Prompts */}
                      <Link
                        to="/admin-prompts"
                        onClick={closeMobileNavbar}
                        className={cn(
                          "relative h-[53px] flex items-center border-b border-gray-700",
                          location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                        )}
                      >
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Brain className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">AI Prompts</span>
                        </div>
                      </Link>
                    </>
                  )}

                  {/* Volunteer Feedback */}
                  {(user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && (
                    <Link
                      to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'}
                      onClick={closeMobileNavbar}
                      className={cn(
                        "relative h-[53px] flex items-center border-b border-gray-700",
                        (location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback') ? "bg-[#4242EA]" : "hover:bg-gray-800"
                      )}
                    >
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link>
                  )}

                  {/* Account */}
                  <Link
                    to="/account"
                    onClick={closeMobileNavbar}
                    className={cn(
                      "relative h-[53px] flex items-center border-b border-gray-700",
                      location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800"
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                        <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Account</span>
                    </div>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileNavbar();
                    }}
                    className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full text-left"
                  >
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                        <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Logout</span>
                    </div>
                  </button>
                </div>

                {/* Mobile Close Button */}
                <button
                  onClick={closeMobileNavbar}
                  className="absolute right-3 top-3 text-white hover:text-gray-300 z-[80]"
                >
                  <X className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        ) : (
          // Desktop: Normal navbar behavior
          <Link
            to="/dashboard"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <img
                src={logo}
                alt="Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Dashboard</span>
            </div>
          </Link>
        )}

        {/* Learning - Open book icon - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/learning"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/learning"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
            </div>
          </Link>
        )}

        {/* AI Chat - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/gpt"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/gpt"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
            </div>
          </Link>
        )}

        {/* Calendar - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/calendar"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/calendar"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
            </div>
          </Link>
        )}

        {/* Progress - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/stats"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/stats"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
            </div>
          </Link>
        )}

        {/* Assessment - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/assessment"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/assessment"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
            </div>
          </Link>
        )}

        {/* Admin Dashboard - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to="/admin-dashboard"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/admin-dashboard"
              className={cn(
                "relative h-[44px] flex items-center",
                location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>
          )
        )}

        {/* Assessment Grades - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to="/admin/assessment-grades"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/admin/assessment-grades"
              className={cn(
                "relative h-[44px] flex items-center",
                location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>
          )
        )}

        {/* Admissions - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to="/admissions-dashboard"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/admissions-dashboard"
              className={cn(
                "relative h-[44px] flex items-center",
                location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>
          )
        )}

        {/* Content Generation - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to="/content"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                (location.pathname === '/content' || location.pathname.startsWith('/content')) ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/content"
              className={cn(
                "relative h-[44px] flex items-center",
                (location.pathname === '/content' || location.pathname.startsWith('/content')) ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link>
          )
        )}

        {/* AI Prompts - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to="/admin-prompts"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to="/admin-prompts"
              className={cn(
                "relative h-[44px] flex items-center",
                location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
            </Link>
          )
        )}

        {/* Volunteer Feedback - Show for volunteers and admins and only in expanded mobile navbar */}
        {isMobile ? (
          (user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen && (
            <Link
              to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'}
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                (location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback') ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
            </Link>
          )
        ) : (
          (user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && (
            <Link
              to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'}
              className={cn(
                "relative h-[44px] flex items-center",
                (location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback') ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div
                className={cn(
                  "flex items-center transition-all duration-300 ease-in-out",
                  isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}
              >
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
            </Link>
          )
        )}

        {/* Spacer to push profile and logout to bottom */}
        <div className="flex-1"></div>

        {/* Profile - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <Link
              to="/account"
              onClick={closeMobileNavbar}
              className={cn(
                "relative h-[53px] flex items-center",
                location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800"
              )}
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                  <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
              </div>
            </Link>
          )
        ) : (
          <Link
            to="/account"
            className={cn(
              "relative h-[44px] flex items-center",
              location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
            </div>
          </Link>
        )}

        {/* Logout - Only show in expanded mobile navbar */}
        {isMobile ? (
          isMobileNavbarOpen && (
            <button
              onClick={handleLogout}
              className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full"
            >
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                  <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
              </div>
            </button>
          )
        ) : (
          <button
            onClick={handleLogout}
            className="relative h-[44px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full"
          >
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div
              className={cn(
                "flex items-center transition-all duration-300 ease-in-out",
                isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden"
              )}
            >
              <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
            </div>
          </button>
        )}
      </nav>
      
      {/* Main Content - Desktop: 50px left margin for collapsed navbar, Mobile: no margin */}
      <main className={cn(
        "flex-1 overflow-auto bg-[#EFEFEF]",
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
    </div>
  );
};

export default Layout; 
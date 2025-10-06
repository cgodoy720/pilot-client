import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Award, Users, Bug, Brain, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const Layout = ({ children }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar - Fixed 60px width to match Figma */}
      <nav className="w-[60px] bg-[#1E1E1E] flex flex-col fixed left-0 top-0 h-full z-50">
        {/* Dashboard - Contains logo and has blue background as shown in Figma */}
        <Link
          to="/dashboard"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <img
            src={logo}
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
        </Link>

        {/* Learning */}
        <Link
          to="/learning"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 14.5L8.5 11.5M12 14.5L15.5 11.5M12 14.5V6.5" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 9.5H18C18.5304 9.5 19.0391 9.71071 19.4142 10.0858C19.7893 10.4609 20 10.9696 20 11.5V17.5C20 18.0304 19.7893 18.5391 19.4142 18.9142C19.0391 19.2893 18.5304 19.5 18 19.5H6C5.46957 19.5 4.96086 19.2893 4.58579 18.9142C4.21071 18.5391 4 18.0304 4 17.5V11.5C4 10.9696 4.21071 10.4609 4.58579 10.0858C4.96086 9.71071 5.46957 9.5 6 9.5H8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 15.5H9C8.44772 15.5 8 15.9477 8 16.5V17.5C8 18.0523 8.44772 18.5 9 18.5H15C15.5523 18.5 16 18.0523 16 17.5V16.5C16 15.9477 15.5523 15.5 15 15.5Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* AI Chat */}
        <Link
          to="/gpt"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Calendar */}
        <Link
          to="/calendar"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Progress */}
        <Link
          to="/stats"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Assessment */}
        <Link
          to="/assessment"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Admin Dashboard - Only show for admins */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to="/admin-dashboard"
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <Settings className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* Assessment Grades - Only show for admins */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to="/admin/assessment-grades"
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <Award className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* Admissions - Only show for admins */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to="/admissions-dashboard"
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <Users className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* Content Generation - Only show for admins */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to="/content"
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              (location.pathname === '/content' || location.pathname.startsWith('/content')) ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <Bug className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* AI Prompts - Only show for admins */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to="/admin-prompts"
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <Brain className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* Volunteer Feedback - Show for volunteers and admins */}
        {(user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && (
          <Link
            to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'}
            className={cn(
              "w-[60px] h-[53px] flex items-center justify-center",
              (location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback') ? "bg-[#4242EA]" : "hover:bg-gray-800"
            )}
          >
            <MessageCircle className="h-6 w-6 text-[#E3E3E3]" />
          </Link>
        )}

        {/* Spacer to push profile and logout to bottom */}
        <div className="flex-1"></div>

        {/* Profile */}
        <Link
          to="/account"
          className={cn(
            "w-[60px] h-[53px] flex items-center justify-center",
            location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800"
          )}
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-[60px] h-[53px] flex items-center justify-center hover:bg-gray-800 text-[#E3E3E3]"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
            <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </nav>
      
      {/* Main Content - Fixed margin to match Figma */}
      <main className="flex-1 overflow-auto bg-[#EFEFEF] ml-[60px]">
        {children}
      </main>
    </div>
  );
};

export default Layout; 
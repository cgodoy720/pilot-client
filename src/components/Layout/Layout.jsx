import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  MessageSquare, 
  LogOut, 
  Calendar, 
  GraduationCap, 
  Settings, 
  Bug, 
  BarChart3, 
  Users, 
  Brain, 
  FileQuestion, 
  MessageCircle, 
  Award 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import logo from '../../assets/logo.png'
import logoFull from '../../assets/logo-full.png'

const Layout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user has active status
  const isActive = user?.active !== false;
  // Check if user is admin or staff
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';
  // Check if user is volunteer
  const isVolunteer = user?.role === 'volunteer';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle Learning link click for inactive users
  const handleLearningClick = (e) => {
    if (!isActive) {
      e.preventDefault();
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true },
    { path: '/learning', icon: GraduationCap, label: 'Learning', active: isActive, disabled: !isActive },
    { path: '/gpt', icon: MessageSquare, label: 'AI Chat', active: true },
    { path: '/calendar', icon: Calendar, label: 'Calendar', active: true },
    { path: '/stats', icon: BarChart3, label: 'My Progress', active: true },
    { path: '/assessment', icon: FileQuestion, label: 'Assessment', active: isActive, disabled: !isActive },
  ];

  const volunteerItems = [
    { path: '/volunteer-feedback', icon: MessageCircle, label: 'Volunteer Feedback' }
  ];

  const adminItems = [
    { path: '/admin-dashboard', icon: Settings, label: 'Admin Dashboard' },
    { path: '/admin/assessment-grades', icon: Award, label: 'Assessment Grades' },
    { path: '/admissions-dashboard', icon: Users, label: 'Admissions' },
    { path: '/content', icon: Bug, label: 'Content Generation' },
    { path: '/admin-prompts', icon: Brain, label: 'AI Prompts' },
    { path: '/admin-volunteer-feedback', icon: MessageCircle, label: 'Volunteer Feedback' },
  ];

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <nav className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 relative",
        isExpanded ? "w-64" : "w-20"
      )}>
        {/* Header */}
        <div className="flex justify-center items-center p-4 relative">
          <div className="relative h-8 w-full flex justify-start items-center">
            <img 
              src={logo} 
              alt="Logo" 
              className={cn(
                "h-full w-auto object-contain transition-opacity duration-300 absolute left-3",
                isExpanded ? "opacity-0" : "opacity-100"
              )}
            />
            <img 
              src={logoFull} 
              alt="Full Logo" 
              className={cn(
                "h-full w-auto object-contain transition-opacity duration-300 absolute left-3",
                isExpanded ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
          
          {/* Toggle Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute -right-10 top-5 bg-primary text-primary-foreground p-1 rounded-r-lg shadow-lg hover:bg-primary/90 transition-colors z-10 h-8 w-8"
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrentPath = location.pathname === item.path;
            
            if (item.disabled) {
              return (
                <div
                  key={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed"
                  title="You have historical access only"
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isExpanded && <span>{item.label}</span>}
                </div>
              );
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isCurrentPath
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
          
          {/* Volunteer Items */}
          {isVolunteer && volunteerItems.map((item) => {
            const Icon = item.icon;
            const isCurrentPath = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isCurrentPath
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
          
          {/* Admin Items */}
          {isAdmin && adminItems.map((item) => {
            const Icon = item.icon;
            const isCurrentPath = location.pathname === item.path || 
              (item.path === '/content' && location.pathname.startsWith('/content'));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isCurrentPath
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Logout</span>}
          </Button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
};

export default Layout; 
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const NavDropdown = ({ 
  id,
  trigger, 
  items, 
  condition = true, 
  isMobile = false, 
  isNavbarHovered = false,
  isMobileNavbarOpen = false,
  closeMobileNavbar,
  isOpen = false,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if any of the dropdown items is currently active
  const isAnyItemActive = items.some(item => {
    if (item.to === location.pathname) return true;
    if (item.to !== '/' && location.pathname.startsWith(item.to)) return true;
    return false;
  });

  // Auto-expand when on an active route
  // Must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (condition && isAnyItemActive && !isOpen) {
      onToggle(id);
    }
  }, [location.pathname, condition]); // Only run when pathname or condition changes

  // Don't render if condition is false
  if (!condition) return null;

  // Don't render on mobile if navbar is not open
  if (isMobile && !isMobileNavbarOpen) return null;

  const handleItemClick = (to) => {
    navigate(to);
    if (isMobile && closeMobileNavbar) {
      closeMobileNavbar();
    }
  };

  const TriggerIcon = trigger.icon;

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => onToggle(id)} 
        className={cn(
          "relative flex items-center w-full",
          isMobile ? "h-[53px]" : "h-[44px]",
          "hover:bg-white/10"
        )}
      >
        <div className={cn(
          "absolute left-0 top-0 flex items-center justify-center",
          isMobile ? "w-[60px] h-[53px]" : "w-[50px] h-[44px]"
        )}>
          <TriggerIcon className="h-4 w-4 text-[#E3E3E3]" />
        </div>
        <div className={cn(
          "flex items-center justify-between flex-1",
          isMobile 
            ? "ml-[60px] pr-4"
            : isNavbarHovered 
              ? "ml-[50px] pr-4 opacity-100" 
              : "ml-[50px] opacity-0 w-0 overflow-hidden"
        )}>
          <span className="text-white text-sm font-medium whitespace-nowrap">
            {trigger.label}
          </span>
          {(isMobile || isNavbarHovered) && (
            isOpen
              ? <ChevronDown className="h-4 w-4 text-[#E3E3E3]" />
              : <ChevronRight className="h-4 w-4 text-[#E3E3E3]" />
          )}
        </div>
      </button>

      {/* Dropdown Items */}
      {isOpen && (
        <div className="flex flex-col">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.to || 
                            (item.to !== '/' && location.pathname.startsWith(item.to));
            
            return (
              <button
                key={item.to}
                onClick={() => handleItemClick(item.to)}
                className={cn(
                  "relative flex items-center w-full",
                  isMobile ? "h-[53px]" : "h-[44px]",
                  isActive ? "bg-[#4242EA]" : "hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "absolute left-0 top-0 flex items-center justify-center",
                  isMobile ? "w-[60px] h-[53px]" : "w-[50px] h-[44px]"
                )}>
                  <ItemIcon className="h-4 w-4 text-[#E3E3E3]" />
                </div>
                <div className={cn(
                  "flex items-center",
                  isMobile 
                    ? "ml-[60px]"
                    : isNavbarHovered 
                      ? "ml-[50px] opacity-100" 
                      : "ml-[50px] opacity-0 w-0 overflow-hidden"
                )}>
                  <span className="text-white text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

NavDropdown.propTypes = {
  id: PropTypes.string.isRequired,
  trigger: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  condition: PropTypes.bool,
  isMobile: PropTypes.bool,
  isNavbarHovered: PropTypes.bool,
  isMobileNavbarOpen: PropTypes.bool,
  closeMobileNavbar: PropTypes.func,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

export default NavDropdown;


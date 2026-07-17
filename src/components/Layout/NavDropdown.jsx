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

  // Check if a route matches the current pathname (exact or nested child)
  const isRouteActive = (to) =>
    location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));

  // Check if an item is active, using optional activeMatch override
  const isItemActive = (item) =>
    item.activeMatch ? item.activeMatch(location.pathname) : isRouteActive(item.to);

  // Check if any of the dropdown items is currently active
  const isAnyItemActive = items.some(item => isItemActive(item));

  // Find the active item's label for collapsed title display
  const activeItemLabel = isAnyItemActive
    ? items.find(item => isItemActive(item))?.label
    : null;

  // Auto-expand when on an active route
  // Must be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (condition && isAnyItemActive && !isOpen) {
      onToggle(id);
    }
  }, [location.pathname, condition, isNavbarHovered]); // Re-trigger on hover to auto-expand

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
          isAnyItemActive ? "bg-[#4242EA]" : "hover:bg-white/10"
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
        <div
          className={cn(
            'flex flex-col relative',
            // When collapsed with the vertical page-title overlay showing, the
            // children area must be tall enough for the rotated label even if
            // the dropdown has only one item (1 × 44px row), or the label
            // overflows into the trigger icon above.
            !isMobile && !isNavbarHovered && activeItemLabel && 'min-h-[176px]'
          )}
        >
          {/* Vertical page title overlay — spans full children area when collapsed */}
          {!isMobile && !isNavbarHovered && activeItemLabel && (
            <div className="absolute inset-0 w-[50px] flex items-center justify-center z-10 pointer-events-none">
              <span
                className="text-white text-xs font-medium tracking-wider whitespace-nowrap"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {activeItemLabel}
              </span>
            </div>
          )}

          {items.map((item) => {
            const ItemIcon = item.icon;

            return (
              <button
                key={item.to}
                onClick={() => handleItemClick(item.to)}
                className={cn(
                  "relative flex items-center w-full",
                  isMobile ? "h-[53px]" : "h-[44px]",
                  "hover:bg-white/10"
                )}
              >
                {ItemIcon ? (
                  <>
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
                  </>
                ) : (
                  <div className={cn(
                    "flex items-center",
                    isMobile
                      ? "ml-[72px]"
                      : isNavbarHovered
                        ? "ml-[62px] opacity-100"
                        : "ml-[62px] opacity-0 w-0 overflow-hidden"
                  )}>
                    <span className="text-white text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                )}
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
      icon: PropTypes.elementType,
      label: PropTypes.string.isRequired,
      activeMatch: PropTypes.func,
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


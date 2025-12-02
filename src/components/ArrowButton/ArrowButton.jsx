import React, { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const ArrowButton = ({ 
  onClick, 
  borderColor = 'white',
  arrowColor = 'white',
  backgroundColor = 'transparent',
  hoverBackgroundColor = 'white',
  hoverArrowColor = '#4242EA',
  hoverBorderColor,
  size = 'md',
  rotation = 0,
  disabled = false,
  className = '',
  useChevron = false,
  strokeWidth = 2
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-[18px] h-[18px]'
  };

  // Chevrons use taller dimensions to appear longer
  const chevronIconSizes = {
    sm: 'w-10 h-10',
    md: 'w-10 h-10',
    lg: 'w-10 h-10'
  };

  const Icon = useChevron ? ChevronRight : ArrowRight;
  const iconSizeClass = useChevron ? chevronIconSizes[size] : iconSizes[size];

  const currentBorderColor = isHovered && hoverBorderColor ? hoverBorderColor : borderColor;

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative flex items-center justify-center rounded-[0.4rem] overflow-hidden transition-all duration-300',
        !disabled && 'group active:scale-95',
        disabled && 'cursor-not-allowed',
        sizeClasses[size],
        className
      )}
      style={{
        border: `1px solid ${currentBorderColor}`,
        backgroundColor: backgroundColor,
        transition: 'border-color 0.3s ease, background-color 0.3s ease'
      }}
    >
      <Icon 
        className={cn(
          'relative z-10 transition-colors duration-300',
          !disabled && 'group-hover:!text-[var(--hover-arrow)]',
          iconSizeClass
        )}
        style={{ 
          color: arrowColor,
          '--hover-arrow': hoverArrowColor,
          transform: rotation ? `rotate(${rotation}deg)` : undefined
        }}
        strokeWidth={strokeWidth}
      />
      {!disabled && (
        <div 
          className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
          style={{ backgroundColor: hoverBackgroundColor }}
        />
      )}
    </button>
  );
};

export default ArrowButton;

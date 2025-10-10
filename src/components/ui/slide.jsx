import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Slide component for animating elements in/out
 * Built with Framer Motion for Animate UI pattern
 */

const slideVariants = {
  // Slide out to the left
  exitLeft: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1], // Custom easing
    }
  },
  // Slide out to the right
  exitRight: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  // Slide in from the left
  enterFromLeft: {
    x: ['-100%', '0%'],
    opacity: [0, 1],
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  // Slide in from the right
  enterFromRight: {
    x: ['100%', '0%'],
    opacity: [0, 1],
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  // Static/visible state
  center: {
    x: '0%',
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  }
};

export const Slide = ({ 
  children, 
  direction = 'left', // 'left' | 'right' | null
  isVisible = true,
  delay = 0,
  className = '',
  ...props 
}) => {
  // Determine which animation variant to use
  const getAnimateVariant = () => {
    if (!isVisible) {
      return direction === 'left' ? 'exitLeft' : 'exitRight';
    }
    return 'center';
  };

  const getInitialVariant = () => {
    if (!isVisible) {
      return direction === 'left' ? 'exitLeft' : 'exitRight';
    }
    // When entering, come from opposite direction
    return direction === 'left' ? 'enterFromRight' : 'enterFromLeft';
  };

  return (
    <motion.div
      className={className}
      initial={getInitialVariant()}
      animate={getAnimateVariant()}
      exit={direction === 'left' ? 'exitLeft' : 'exitRight'}
      variants={slideVariants}
      style={{ originX: 0.5 }}
      transition={{
        delay: delay,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * SlideGroup - For staggered animations
 */
export const SlideGroup = ({ 
  children, 
  direction = 'left',
  staggerDelay = 0.05,
  className = '',
  ...props 
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          }
        },
        exit: {
          transition: {
            staggerChildren: staggerDelay,
          }
        }
      }}
      {...props}
    >
      {React.Children.map(children, (child, index) => (
        <Slide key={index} direction={direction} delay={index * staggerDelay}>
          {child}
        </Slide>
      ))}
    </motion.div>
  );
};

/**
 * AnimatedSlideList - Wrapper for AnimatePresence with sliding
 */
export const AnimatedSlideList = ({ 
  children,
  direction = 'left',
  mode = 'wait', // 'wait' | 'sync' | 'popLayout'
  ...props 
}) => {
  return (
    <AnimatePresence mode={mode} {...props}>
      {children}
    </AnimatePresence>
  );
};

export default Slide;


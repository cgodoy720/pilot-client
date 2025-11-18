import React, { useEffect, useState } from 'react';
import './LoadingCurtain.css';

const LoadingCurtain = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setProgress(0);
      
      // Simulate smooth loading progress from 1-100
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          // Increment by 2-4 for smooth progression
          const increment = Math.floor(Math.random() * 3) + 2;
          return Math.min(prev + increment, 100);
        });
      }, 50);

      return () => clearInterval(interval);
    } else if (!isLoading && shouldRender) {
      // When loading finishes, ensure we reach 100% before closing
      setProgress(100);
    }
  }, [isLoading, shouldRender]);

  useEffect(() => {
    if (!isLoading && shouldRender) {
      // Wait a moment to show 100%, then wait for curtain animation to complete
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 800); // Increased from 600ms to 800ms to show 100% briefly
      return () => clearTimeout(timeout);
    }
  }, [isLoading, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className={`loading-curtain ${!isLoading ? 'loaded' : ''}`}>
      <img 
        src="/logo.png" 
        alt="Pursuit Logo" 
        className="loading-curtain__logo"
      />
      <span className="loading-curtain__text">LOADING</span>
      <span className="loading-curtain__percentage">{progress}%</span>
    </div>
  );
};

export default LoadingCurtain;

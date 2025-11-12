import React, { useEffect, useState } from 'react';
import './LoadingCurtain.css';

const LoadingCurtain = ({ isLoading }) => {
  const [progress, setProgress] = useState(0);
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
      setProgress(0);
      
      // Simulate loading progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && shouldRender) {
      // Wait for curtain animation to fully complete (0.5s) before unmounting
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, 600);
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

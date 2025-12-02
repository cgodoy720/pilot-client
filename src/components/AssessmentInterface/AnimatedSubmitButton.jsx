import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

function AnimatedSubmitButton({ onClick, disabled, isLoading, children, className }) {
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    // Create particle effect
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newParticles = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 50 + Math.random() * 30;
      const size = 2 + Math.random() * 3;
      
      return {
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size,
        life: 1,
        decay: 0.02 + Math.random() * 0.02
      };
    });
    
    setParticles(newParticles);
    
    // Animate particles
    const animateParticles = () => {
      setParticles(prevParticles => {
        const updated = prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.vx * 0.016,
          y: particle.y + particle.vy * 0.016,
          life: particle.life - particle.decay
        })).filter(particle => particle.life > 0);
        
        if (updated.length > 0) {
          requestAnimationFrame(animateParticles);
        }
        
        return updated;
      });
    };
    
    requestAnimationFrame(animateParticles);
    
    // Call original click handler
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled}
        className={`relative overflow-hidden ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          children
        )}
      </Button>
      
      {/* Particle container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              opacity: particle.life,
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.1s ease-out'
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default AnimatedSubmitButton;

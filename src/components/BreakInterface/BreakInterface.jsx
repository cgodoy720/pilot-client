import React, { useState, useEffect } from 'react';
import './BreakInterface.css';

const BreakInterface = ({ taskTitle }) => {
  // Array of fun/funny GIF URLs
  const breakGifs = [
    'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', // Coffee break
    'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif', // Relaxing cat
    'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif', // Dancing
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Stretching
    'https://media.giphy.com/media/l0HlRnAWXxn0MhKLK/giphy.gif', // Take a break
    'https://media.giphy.com/media/3o7TKTDn976rzVgky4/giphy.gif', // Eating
    'https://media.giphy.com/media/l0MYzLLxlJDfYtzy0/giphy.gif', // Relaxing
    'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif', // Coffee time
    'https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif', // Chill vibes
    'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', // Happy break
  ];

  const [selectedGif, setSelectedGif] = useState('');

  // Select a random GIF on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * breakGifs.length);
    setSelectedGif(breakGifs[randomIndex]);
  }, []);

  // Determine heading based on task title
  const getHeading = () => {
    if (taskTitle?.toLowerCase().includes('lunch')) {
      return 'Lunch Time! 🍽️';
    }
    return 'Take a Break! ☕';
  };

  return (
    <div className="break-interface">
      <div className="break-interface__content">
        <h1 className="break-interface__heading">
          {getHeading()}
        </h1>
        
        <p className="break-interface__message">
          {taskTitle?.toLowerCase().includes('lunch') 
            ? 'Enjoy your meal and recharge for the rest of the day!'
            : 'Step away from your screen, stretch, and come back refreshed!'}
        </p>
        
        {selectedGif && (
          <div className="break-interface__gif-container">
            <img 
              src={selectedGif} 
              alt="Break time animation" 
              className="break-interface__gif"
            />
          </div>
        )}
        
        <p className="break-interface__hint">
          Use the navigation arrows above to continue when you're ready.
        </p>
      </div>
    </div>
  );
};

export default BreakInterface;


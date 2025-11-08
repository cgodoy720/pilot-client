import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const DailyOverview = ({ currentDay, tasks, onStartActivity }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  if (!currentDay || !tasks || tasks.length === 0) {
    return (
      <div className="min-h-screen bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-carbon-black mb-4">Loading today's activities...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-bg-light flex items-center justify-center px-8 py-12 transition-opacity duration-800 ${
      isAnimating ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="w-full max-w-2xl">
        {/* Simple Daily Goal - centered container, left-aligned text */}
        <div className="text-left mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-carbon-black leading-tight">
            {currentDay.daily_goal || 'Today, you\'re gonna be learning lorem ipsum dolor sit amet, consectetur adipiscing elit'}.
          </h1>
        </div>
        
        {/* Simple Activities List - centered container, left-aligned text */}
        <div className="text-left mb-12">
          <h2 className="text-xl font-bold text-carbon-black mb-6">Here are today's activities:</h2>
          
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id} className="text-carbon-black">
                <span className="text-base font-proxima">
                  {task.task_title || `Activity ${index + 1}`} ({task.duration_minutes || 30} mins)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Simple GO Button - centered */}
        <div className="text-center">
          <p className="text-carbon-black mb-6 font-proxima">
            Smash the button when you're ready!
          </p>
          <Button 
            onClick={() => {
              setIsAnimating(true);
              // Delay the actual navigation until fade is complete
              setTimeout(() => {
                onStartActivity(tasks[0]);
              }, 600);
            }}
            size="lg"
            className="bg-pursuit-purple hover:bg-pursuit-purple/90 text-white px-16 py-4 text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isAnimating}
          >
            GO
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyOverview;

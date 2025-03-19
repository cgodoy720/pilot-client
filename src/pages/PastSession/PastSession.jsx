import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './PastSession.css';

function PastSession() {
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [daySchedule, setDaySchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDaySchedule = async () => {
      if (!dayId) {
        setError('No day ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/curriculum/days/${dayId}/schedule`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch day schedule');
        }

        const data = await response.json();
        setDaySchedule(data);
      } catch (error) {
        console.error('Error fetching day schedule:', error);
        setError('Failed to load the day schedule. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDaySchedule();
  }, [dayId, token]);

  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  if (isLoading) {
    return (
      <div className="past-session">
        <div className="past-session__loading">
          <p>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error || !daySchedule) {
    return (
      <div className="past-session">
        <div className="past-session__error">
          <h2>Error</h2>
          <p>{error || 'Unable to load session details'}</p>
          <button onClick={handleBackToCalendar} className="past-session__back-button">
            Back to Calendar
          </button>
        </div>
      </div>
    );
  }

  const { day, timeBlocks } = daySchedule;

  return (
    <div className="past-session">
      <div className="past-session__header">
        <button onClick={handleBackToCalendar} className="past-session__back-button">
          &larr; Back to Calendar
        </button>
        <h1>Day {day.day_number}</h1>
        <p className="past-session__date">
          {new Date(day.day_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        {day.daily_goal && (
          <div className="past-session__goal">
            <h2>Daily Goal</h2>
            <p>{day.daily_goal}</p>
          </div>
        )}
      </div>

      <div className="past-session__content">
        <div className="past-session__schedule">
          <h2>Daily Schedule</h2>
          {timeBlocks.length === 0 ? (
            <p>No scheduled blocks for this day.</p>
          ) : (
            <div className="past-session__blocks">
              {timeBlocks.map((block) => (
                <div key={block.block_id} className="past-session__block">
                  <div className="past-session__block-header">
                    <h3>{block.block_title}</h3>
                    <div className="past-session__block-time">
                      {new Date(block.start_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(block.end_time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {block.block_description && (
                    <div className="past-session__block-description">
                      <p>{block.block_description}</p>
                    </div>
                  )}

                  {block.tasks && block.tasks.length > 0 && (
                    <div className="past-session__tasks">
                      <h4>Tasks</h4>
                      <ul>
                        {block.tasks.map((task) => (
                          <li key={task.task_id} className="past-session__task">
                            <div className="past-session__task-header">
                              <h5>{task.task_title}</h5>
                              {task.duration_minutes && (
                                <span>{task.duration_minutes} min</span>
                              )}
                            </div>
                            {task.task_description && (
                              <p>{task.task_description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {block.learning_objectives && (
                    <div className="past-session__objectives">
                      <h4>Learning Objectives</h4>
                      <p>{block.learning_objectives}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PastSession; 
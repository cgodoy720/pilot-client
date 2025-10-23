// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './FacilitatorView.css';

const FacilitatorView = () => {
  const { token } = useAuth();
  const [facilitatorNotes, setFacilitatorNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dayNumber, setDayNumber] = useState('');

  const fetchFacilitatorNotes = async () => {
    if (!dayNumber) {
      setError('Please enter a Day Number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/facilitator-notes/day/${dayNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No facilitator notes found for this day');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setFacilitatorNotes(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch facilitator notes');
      }
      
    } catch (error) {
      console.error('Error fetching facilitator notes:', error);
      setError(error.message);
      setFacilitatorNotes(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchFacilitatorNotes();
  };

  return (
    <div className="facilitator-view">
      <div className="facilitator-view__content">
        <div className="facilitator-view__header">
          <h1>Facilitator View</h1>
          <p>Access facilitator notes and delivery guidance for session days</p>
        </div>

        <form onSubmit={handleSubmit} className="facilitator-view__search">
          <div className="facilitator-view__search-fields">
            <div className="facilitator-view__field">
              <label htmlFor="dayNumber">Day Number</label>
              <input
                type="number"
                id="dayNumber"
                value={dayNumber}
                onChange={(e) => setDayNumber(e.target.value)}
                placeholder="e.g., 9"
                className="facilitator-view__input"
                min="1"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || !dayNumber}
            className="facilitator-view__search-btn"
          >
            {loading ? 'Loading...' : 'Load Notes'}
          </button>
        </form>

        {error && (
          <div className="facilitator-view__error">
            {error}
          </div>
        )}

        {facilitatorNotes && (
          <div className="facilitator-view__notes">
            <div className="facilitator-view__session-info">
              <h2>Day {facilitatorNotes.dayNumber}</h2>
              {facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].day_date && (
                <p className="facilitator-view__date">{facilitatorNotes.tasks[0].day_date}</p>
              )}
              {facilitatorNotes.tasks.length > 0 && facilitatorNotes.tasks[0].daily_goal && (
                <div className="facilitator-view__daily-goal">
                  <strong>Daily Goal:</strong> {facilitatorNotes.tasks[0].daily_goal}
                </div>
              )}
            </div>

            <div className="facilitator-view__tasks">
              <h3>Task-by-Task Facilitation Notes ({facilitatorNotes.taskCount} tasks)</h3>
              
              {facilitatorNotes.tasks.map((task, index) => (
                <div key={task.id || index} className="facilitator-view__task">
                  <div className="facilitator-view__task-header">
                    <h4>{task.task_title}</h4>
                    <div className="facilitator-view__task-time">
                      {task.start_time} - {task.end_time}
                    </div>
                  </div>
                  <div className="facilitator-view__task-notes">
                    {task.facilitator_notes}
                  </div>
                </div>
              ))}
              
              {facilitatorNotes.taskCount === 0 && (
                <p>No tasks with facilitator notes found for this day.</p>
              )}
            </div>
          </div>
        )}

        {!facilitatorNotes && !loading && !error && (
          <div className="facilitator-view__empty-state">
            <p>Enter a Day Number above to load facilitator notes</p>
            <div className="facilitator-view__examples">
              <h4>Examples:</h4>
              <ul>
                <li><strong>Day Number:</strong> 1, 9, 15, 25</li>
              </ul>
              <p>This will show all tasks for that day that have facilitator notes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitatorView; 
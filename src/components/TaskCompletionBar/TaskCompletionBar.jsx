import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import './TaskCompletionBar.css';

function TaskCompletionBar({ onNextExercise, onAiFeedback, isLastTask = false }) {
  return (
    <div className="task-completion-bar">
      <div className="task-completion-bar__content">
        {/* Left side - AI Feedback button */}
        <div className="task-completion-bar__left">
          <button 
            className="task-completion-bar__feedback-btn"
            onClick={onAiFeedback}
          >
            AI Feedback
          </button>
        </div>

        {/* Right side - Next Exercise or Success Message */}
        <div className="task-completion-bar__right">
          {isLastTask ? (
            <div className="task-completion-bar__success-message">
              🎉 Great work today! You've completed all exercises.
            </div>
          ) : (
            <>
              <span className="task-completion-bar__next-text">Next Exercise</span>
              <button 
                className="task-completion-bar__next-btn"
                onClick={onNextExercise}
              >
                <FaArrowRight />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCompletionBar;


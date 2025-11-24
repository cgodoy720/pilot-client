import React from 'react';
import ArrowButton from '../ArrowButton/ArrowButton';
import './TaskCompletionBar.css';

function TaskCompletionBar({ onNextExercise, isLastTask = false }) {
  return (
    <div className="task-completion-bar">
      <div className="task-completion-bar__content">
        {/* Right side - Next Exercise or Success Message */}
        <div className="task-completion-bar__right">
          {isLastTask ? (
            <div className="task-completion-bar__success-message">
              🎉 Great work today! You've completed all exercises.
            </div>
          ) : (
            <>
              <span className="task-completion-bar__next-text">Next Exercise</span>
              <ArrowButton
                onClick={onNextExercise}
                borderColor="white"
                arrowColor="#4242EA"
                backgroundColor="white"
                hoverBackgroundColor="#4242EA"
                hoverArrowColor="#FFFFFF"
                hoverBorderColor="#4242EA"
                size="md"
                strokeWidth={1}
                className="!w-8 !h-8"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCompletionBar;


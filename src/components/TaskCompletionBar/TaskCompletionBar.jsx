import React from 'react';
import { FaFileAlt } from 'react-icons/fa';
import ArrowButton from '../ArrowButton/ArrowButton';
import './TaskCompletionBar.css';

function TaskCompletionBar({ onNextExercise, isLastTask = false, showViewSubmission = false, onViewSubmission }) {
  return (
    <div className="task-completion-bar">
      <div className="task-completion-bar__content">
        {/* Left side - View Submission button (only when deliverable exists) */}
        <div className="task-completion-bar__left">
          {showViewSubmission && (
            <button 
              className="task-completion-bar__view-submission"
              onClick={onViewSubmission}
            >
              <FaFileAlt className="task-completion-bar__view-submission-icon" />
              <span>View Submission</span>
            </button>
          )}
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


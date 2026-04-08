import React from 'react';

const TaskDetailPanel = ({ task }) => {
  if (!task) return null;

  // Parse feedback
  const rawFeedback = task.all_feedback || [];
  const feedbackParts = Array.isArray(rawFeedback)
    ? rawFeedback.filter(Boolean)
    : String(rawFeedback).split('|').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-[#FAFAFA] border-t border-[#E3E3E3] px-4 py-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
      {/* Task info */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>Present: <strong className="text-[#1E1E1E]">{task.present_builders || 0}</strong></span>
        <span>Completed: <strong className="text-[#1E1E1E]">{Math.min(task.completed_count || 0, task.present_builders || 0)}</strong></span>
        {task.deliverable_type && task.deliverable_type !== 'none' && task.deliverable_type !== 'text' && (
          <span>Deliverable: <strong className="text-[#1E1E1E]">{task.deliverable_type}</strong></span>
        )}
      </div>

      {/* AI Feedback */}
      {feedbackParts.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-2">
            AI Analysis Feedback ({feedbackParts.length})
          </p>
          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
            {feedbackParts.map((part, i) => (
              <div key={i} className="text-xs text-slate-600 leading-relaxed bg-white rounded p-2.5 border-l-2 border-[#4242EA]">
                {part}
              </div>
            ))}
          </div>
        </div>
      )}

      {feedbackParts.length === 0 && (
        <p className="text-xs text-slate-400">No AI analysis feedback for this task.</p>
      )}
    </div>
  );
};

export default TaskDetailPanel;

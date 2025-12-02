import React from 'react';

// Helper function to get stage labels matching kanban board
export const getStageLabel = (stage) => {
  const labels = {
    ideation: 'Ideation',
    planning: 'Planning & Design',
    development: 'Development',
    testing: 'Testing',
    launch: 'Launch',
    prospect: 'Prospect',
    applied: 'Applied',
    screen: 'Phone Screen',
    oa: 'Online Assessment',
    interview: 'Interview',
    offer: 'Offer',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn'
  };
  return labels[stage] || stage;
};

// Render stage history timeline for job applications
export const renderStageTimeline = (stageHistory) => {
  if (!stageHistory || stageHistory.length === 0) return null;
  
  // Show all stages, but skip "prospect" if the job has moved beyond it
  const stagesToShow = stageHistory.filter((entry, index) => {
    // Keep prospect only if it's the only stage, otherwise skip it
    if (entry.stage === 'prospect' && stageHistory.length > 1) {
      return false;
    }
    return true;
  });
  
  return (
    <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
      {stagesToShow.map((entry, index) => (
        <React.Fragment key={index}>
          <span className="flex flex-col items-center">
            <span className="font-medium">
              {entry.stage === 'prospect' ? 'Added' : getStageLabel(entry.stage)}
            </span>
            <span className="text-[10px] text-gray-500">
              {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </span>
          {index < stagesToShow.length - 1 && (
            <span className="text-gray-400">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Helper function to get milestone details
export const getMilestoneInfo = (item) => {
  switch (item.milestone_type) {
    case 'offer':
      return {
        icon: '🎉',
        text: `${item.first_name} ${item.last_name} received ${item.weekly_offers} offer${item.weekly_offers > 1 ? 's' : ''}!`,
        type: 'highlight'
      };
    case 'launch':
      return {
        icon: '🚀',
        text: `${item.first_name} ${item.last_name} launched ${item.weekly_launches} project${item.weekly_launches > 1 ? 's' : ''}!`,
        type: 'highlight'
      };
    case 'interviews':
      return {
        icon: '💼',
        text: `${item.first_name} ${item.last_name} had ${item.weekly_interviews} interviews this week!`,
        type: 'highlight'
      };
    case 'applications':
      return {
        icon: '📝',
        text: `${item.first_name} ${item.last_name} submitted ${item.weekly_applications} applications!`,
        type: 'highlight'
      };
    case 'networking':
      return {
        icon: '🤝',
        text: `${item.first_name} ${item.last_name} did ${item.weekly_networking} hustle activities!`,
        type: 'highlight'
      };
    // Major Milestones
    case 'first_application':
      return {
        icon: '🎉',
        text: `${item.first_name} ${item.last_name} submitted their first application!`,
        type: 'highlight'
      };
    case 'milestone_10_apps':
      return {
        icon: '🚀',
        text: `${item.first_name} ${item.last_name} reached 10 applications!`,
        type: 'highlight'
      };
    case 'milestone_25_apps':
      return {
        icon: '🔥',
        text: `${item.first_name} ${item.last_name} reached 25 applications!`,
        type: 'highlight'
      };
    case 'milestone_50_apps':
      return {
        icon: '🏆',
        text: `${item.first_name} ${item.last_name} reached 50 applications!`,
        type: 'highlight'
      };
    case 'milestone_100_apps':
      return {
        icon: '💯',
        text: `${item.first_name} ${item.last_name} reached 100 applications!`,
        type: 'highlight'
      };
    case 'first_hustle':
      return {
        icon: '⚡',
        text: `${item.first_name} ${item.last_name} completed their first hustle!`,
        type: 'highlight'
      };
    case 'milestone_10_hustles':
      return {
        icon: '⚡',
        text: `${item.first_name} ${item.last_name} reached 10 hustles!`,
        type: 'highlight'
      };
    case 'milestone_25_hustles':
      return {
        icon: '⚡',
        text: `${item.first_name} ${item.last_name} reached 25 hustles!`,
        type: 'highlight'
      };
    case 'milestone_50_hustles':
      return {
        icon: '⚡',
        text: `${item.first_name} ${item.last_name} reached 50 hustles!`,
        type: 'highlight'
      };
    case 'milestone_100_hustles':
      return {
        icon: '⚡',
        text: `${item.first_name} ${item.last_name} reached 100 hustles!`,
        type: 'highlight'
      };
    case 'first_interview':
      return {
        icon: '🎯',
        text: `${item.first_name} ${item.last_name} had their first interview!`,
        type: 'highlight'
      };
    case 'milestone_5_interviews':
      return {
        icon: '🎙️',
        text: `${item.first_name} ${item.last_name} reached 5 interviews!`,
        type: 'highlight'
      };
    case 'milestone_10_interviews':
      return {
        icon: '🌟',
        text: `${item.first_name} ${item.last_name} reached 10 interviews!`,
        type: 'highlight'
      };
    case 'first_offer':
      return {
        icon: '🎊',
        text: `${item.first_name} ${item.last_name} received their first offer!`,
        type: 'highlight'
      };
    case 'no_hustles':
      return {
        icon: '⚠️',
        text: `${item.first_name} ${item.last_name} has no hustles`,
        type: 'flag'
      };
    case 'no_builds':
      return {
        icon: '⚠️',
        text: `${item.first_name} ${item.last_name} has no builds`,
        type: 'flag'
      };
    case 'no_jobs':
      return {
        icon: '⚠️',
        text: `${item.first_name} ${item.last_name} has no job applications`,
        type: 'flag'
      };
    case 'inactive':
      return {
        icon: '🔴',
        text: `${item.first_name} ${item.last_name} had no activity this week`,
        type: 'flag'
      };
    default:
      return null;
  }
};

// Calculate week date range for display (Sunday-Saturday)
export const getWeekDateRange = (offset) => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day; // Sunday of current week
  const sunday = new Date(now.setDate(diff));
  sunday.setDate(sunday.getDate() + (offset * 7)); // Apply offset
  sunday.setHours(0, 0, 0, 0);
  
  const saturday = new Date(sunday);
  saturday.setDate(saturday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);
  
  const options = { month: 'short', day: 'numeric' };
  return `${sunday.toLocaleDateString('en-US', options)} - ${saturday.toLocaleDateString('en-US', options)}`;
};


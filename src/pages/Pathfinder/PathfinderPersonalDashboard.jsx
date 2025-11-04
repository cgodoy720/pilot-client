import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './PathfinderPersonalDashboard.css';

function PathfinderPersonalDashboard() {
  const { token } = useAuth();
  const [applicationStats, setApplicationStats] = useState(null);
  const [networkingStats, setNetworkingStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [weeklyGoals, setWeeklyGoals] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch application stats, networking stats, project stats, milestones, and weekly goals
      const [appResponse, netResponse, projResponse, dashResponse, goalsResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/networking/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/projects/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/weekly-goals/current`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (appResponse.ok) {
        const appData = await appResponse.json();
        // appData now has { allTime: {...}, weekly: {...} }
        setApplicationStats(appData);
      }

      if (netResponse.ok) {
        const netData = await netResponse.json();
        // netData now has { allTime: {...}, weekly: {...} }
        setNetworkingStats(netData);
      }

      if (projResponse.ok) {
        const projData = await projResponse.json();
        setProjectStats(projData);
      }

      if (dashResponse.ok) {
        const dashData = await dashResponse.json();
        setMilestones(dashData.milestones);
        
        // Check for new achievements
        checkForNewAchievements(dashData.milestones);
      }

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setWeeklyGoals(goalsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error loading dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render trend indicator
  const renderTrend = (trend, fireTier = 0) => {
    if (!trend || trend.trend === 'stable' || trend.change === 0) return null;
    
    const isPositive = trend.trend === 'up';
    const arrow = isPositive ? '↗' : '↘';
    const explanationText = isPositive ? 'Up from last week' : 'Down from last week';
    
    return (
      <div className={`pathfinder-personal-dashboard__trend ${!isPositive ? 'pathfinder-personal-dashboard__trend--negative' : ''}`}>
        <div className="pathfinder-personal-dashboard__trend-main">
          <span className="pathfinder-personal-dashboard__trend-arrow">{arrow}</span>
          <span className="pathfinder-personal-dashboard__trend-percent">
            {trend.percentChange > 0 ? '+' : ''}{trend.percentChange}%
          </span>
          {fireTier > 0 && (
            <span className={`pathfinder-personal-dashboard__fire-indicator pathfinder-personal-dashboard__fire-indicator--tier-${fireTier}`}>
              {fireTier === 1 && '🔥'}
              {fireTier === 2 && '🔥🔥'}
              {fireTier === 3 && '🔥🔥🔥'}
            </span>
          )}
        </div>
        <span className="pathfinder-personal-dashboard__trend-explanation">
          {explanationText}
        </span>
      </div>
    );
  };

  // Helper function to determine fire tier based on positive trend
  const getFireTier = (trend) => {
    if (!trend || trend.trend !== 'up' || trend.percentChange < 200) return 0;
    if (trend.percentChange >= 900) return 3;
    if (trend.percentChange >= 500) return 2;
    return 1;
  };

  const checkForNewAchievements = (milestoneData) => {
    if (!milestoneData || !milestoneData.milestones || milestoneData.milestones.length === 0) {
      return;
    }

    // Check localStorage for last seen milestone data
    const lastSeenMilestoneData = localStorage.getItem('lastSeenMilestoneData');
    const primaryMilestone = milestoneData.milestones[0];
    
    if (!primaryMilestone) return;
    
    // Store milestone data as JSON with type, category, and progress
    const currentMilestoneData = {
      type: primaryMilestone.type,
      category: primaryMilestone.category,
      progress: primaryMilestone.progress
    };
    
    const currentDataString = JSON.stringify(currentMilestoneData);
    
    // If this is the first time or milestone data has changed
    if (lastSeenMilestoneData !== currentDataString) {
      const lastData = lastSeenMilestoneData ? JSON.parse(lastSeenMilestoneData) : null;
      
      // Only celebrate if:
      // 1. This is a new milestone type we haven't seen before, OR
      // 2. The progress has INCREASED in the same category (not decreased)
      const shouldCelebrate = !lastData || 
        (currentMilestoneData.type !== lastData.type && currentMilestoneData.progress >= (lastData.progress || 0)) ||
        (currentMilestoneData.category === lastData.category && currentMilestoneData.progress > lastData.progress);
      
      if (shouldCelebrate) {
        setShowCelebration(true);
        
        // Trigger confetti celebration!
        triggerConfetti();
        
        // Auto-hide celebration after 5 seconds
        setTimeout(() => setShowCelebration(false), 5000);
      }
      
      // Always update the stored milestone data
      localStorage.setItem('lastSeenMilestoneData', currentDataString);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleShare = (platform, milestone) => {
    if (!milestone) return;
    
    // Create personalized, first-person share text based on milestone category and count
    let shareText = '';
    
    // Extract the count from the milestone message if available
    const countMatch = milestone.message.match(/(\d+)/);
    const count = countMatch ? countMatch[1] : '';
    
    switch(milestone.category) {
      case 'hustles':
        if (count === '1') {
          shareText = `🎉 I just logged my first networking activity! Starting my job search journey with intentional hustle. #JobSearch #Networking`;
        } else if (count === '5') {
          shareText = `💪 Just hit ${count} networking activities! Building relationships and expanding my professional network. #JobSearch #Networking`;
        } else if (count === '10') {
          shareText = `🚀 ${count} networking activities complete! I'm actively building connections and putting myself out there. #JobSearch #Networking #CareerGrowth`;
        } else if (count === '25') {
          shareText = `🔥 ${count} networking activities and counting! Consistency is key in the job search. #JobSearch #Networking #Hustle`;
        } else if (count === '50') {
          shareText = `⭐ Just reached ${count} networking activities! My network is growing and opportunities are flowing. #JobSearch #Networking #CareerSuccess`;
        } else {
          shareText = `🎯 ${count} networking activities logged! Every connection counts in the job search. #JobSearch #Networking`;
        }
        break;
        
      case 'applications':
        if (count === '1') {
          shareText = `📝 I just submitted my first job application! Taking action on my career goals. #JobSearch #CareerGoals`;
        } else if (count === '5') {
          shareText = `📊 ${count} job applications submitted! Building momentum in my job search. #JobSearch #Applications`;
        } else if (count === '10') {
          shareText = `🎯 Just hit ${count} job applications! Staying consistent and focused on finding the right opportunity. #JobSearch #CareerGrowth`;
        } else if (count === '25') {
          shareText = `🚀 ${count} applications submitted! I'm putting in the work to land my next role. #JobSearch #CareerHustle`;
        } else if (count === '50') {
          shareText = `💪 ${count} job applications and going strong! Persistence pays off in the job search. #JobSearch #NeverGiveUp`;
        } else {
          shareText = `📈 ${count} job applications submitted! Every application is a step closer to my goal. #JobSearch #Applications`;
        }
        break;
        
      case 'interviews':
        if (count === '1') {
          shareText = `🎉 I just landed my first interview! All that hard work is paying off. #JobSearch #Interview #Success`;
        } else if (count === '5') {
          shareText = `🔥 ${count} interviews secured! My networking and applications are converting to real opportunities. #JobSearch #Interviews`;
        } else if (count === '10') {
          shareText = `⭐ ${count} interviews complete! Each conversation brings me closer to the right fit. #JobSearch #InterviewSuccess`;
        } else {
          shareText = `🎯 ${count} interviews and counting! Building confidence with every conversation. #JobSearch #Interviews`;
        }
        break;
        
      case 'offers':
        if (count === '1') {
          shareText = `🎊 I just received my first job offer! The hustle paid off. #JobOffer #Success #CareerWin`;
        } else if (count === '2') {
          shareText = `🏆 ${count} job offers! Multiple companies want me - feeling grateful for the opportunities. #JobOffers #CareerSuccess`;
        } else {
          shareText = `🌟 ${count} job offers received! The market is recognizing my value. #JobOffers #CareerSuccess #Winning`;
        }
        break;
        
      case 'acceptances':
        if (count === '1') {
          shareText = `🎉 I ACCEPTED A JOB OFFER! My job search journey has come to a successful end. Thank you to everyone who supported me! #NewJob #JobAccepted #CareerSuccess`;
        } else if (count === '2') {
          shareText = `🏆 Just accepted job offer #${count}! Grateful for the opportunities and excited for what's ahead. #NewJob #CareerGrowth`;
        } else {
          shareText = `🌟 Accepted job offer #${count}! My career journey continues with amazing opportunities. #NewJob #CareerSuccess`;
        }
        break;
        
      case 'rejections':
        shareText = `💪 Received some rejections but staying resilient! Every "no" brings me closer to the right "yes". #JobSearch #Resilience #KeepGoing`;
        break;
        
      case 'streak':
        const streakMatch = milestone.message.match(/(\d+)-day/);
        const days = streakMatch ? streakMatch[1] : count;
        if (days) {
          shareText = `🔥 ${days}-day streak! Staying consistent with my job search activities every single day. #JobSearch #Consistency #Dedication`;
        } else {
          shareText = `🔥 Building a strong job search streak! Consistency is the key to success. #JobSearch #Dedication`;
        }
        break;
        
      default:
        shareText = `🚀 Making progress on my job search journey! Tracking my activities and staying focused on my goals. #JobSearch #CareerGrowth`;
    }
    
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch(platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case 'linkedin':
        // LinkedIn shareArticle API with title and summary
        const title = encodeURIComponent('Job Search Progress');
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${title}&summary=${encodedText}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const renderWelcomeContent = () => {
    if (!milestones || !milestones.milestones || milestones.milestones.length === 0) {
      return (
        <>
          <h1 className="pathfinder-personal-dashboard__welcome-title">Welcome to Pathfinder</h1>
          <h2>Welcome to your job search tracker</h2>
          <p>Track applications, networking activities, and monitor your progress.</p>
        </>
      );
    }

    // Get hustle and application milestones
    const hustleMilestone = milestones.milestones.find(m => m.category === 'hustles');
    const applicationMilestone = milestones.milestones.find(m => m.category === 'applications');
    const milestonesToShow = [hustleMilestone, applicationMilestone].filter(Boolean);
    
    // If no hustle or application milestones, show the first milestone
    if (milestonesToShow.length === 0) {
      milestonesToShow.push(milestones.milestones[0]);
    }
    
    // Determine the appropriate action button based on milestone category
    const getActionButton = (category) => {
      switch (category) {
        case 'applications':
          return {
            label: 'Add Job',
            to: '/pathfinder/applications',
            state: { openModal: true }
          };
        case 'hustles':
          return {
            label: 'Add Hustle',
            to: '/pathfinder/networking',
            state: { openForm: true }
          };
        case 'interviews':
          return {
            label: 'Add Job',
            to: '/pathfinder/applications',
            state: { openModal: true }
          };
        case 'offers':
          return {
            label: 'View Applications',
            to: '/pathfinder/applications'
          };
        case 'rejections':
          return {
            label: 'Add Job',
            to: '/pathfinder/applications',
            state: { openModal: true }
          };
        case 'streak':
          return {
            label: 'Add Activity',
            to: '/pathfinder/networking',
            state: { openForm: true }
          };
        default:
          return {
            label: 'Add Job',
            to: '/pathfinder/applications',
            state: { openModal: true }
          };
      }
    };

    // Helper to render a single milestone card
    const renderMilestoneCard = (milestone, index) => {
      // More comprehensive emoji regex that catches all emojis including rocket 🚀 and star ⭐
      const emojiMatch = milestone.message.match(/^([\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}])\s*/u);
      const emoji = emojiMatch ? emojiMatch[1] : '';
      const messageText = emoji ? milestone.message.slice(emojiMatch[0].length).trim() : milestone.message;
      const actionButton = getActionButton(milestone.category);
      
      return (
        <div key={index} className={`pathfinder-personal-dashboard__milestone-container ${showCelebration && index === 0 ? 'celebrating' : ''}`}>
          {/* Share Buttons in Top Right */}
          <div className="pathfinder-personal-dashboard__share-buttons pathfinder-personal-dashboard__share-buttons--top-right">
            <button 
              className="pathfinder-personal-dashboard__share-btn pathfinder-personal-dashboard__share-btn--twitter"
              onClick={() => handleShare('twitter', milestone)}
              title="Share on X (Twitter)"
            >
              𝕏
            </button>
            <button 
              className="pathfinder-personal-dashboard__share-btn pathfinder-personal-dashboard__share-btn--linkedin"
              onClick={() => handleShare('linkedin', milestone)}
              title="Share on LinkedIn"
            >
              in
            </button>
          </div>
          
          <div className="pathfinder-personal-dashboard__milestone">
            {emoji && <span className="pathfinder-personal-dashboard__milestone-icon">{emoji}</span>}
            <div className="pathfinder-personal-dashboard__milestone-content">
              <h2>{messageText}</h2>
              <p>{milestone.subtext}</p>
              {milestone.achievedDate && (
                <span className="pathfinder-personal-dashboard__milestone-date">
                  Achieved on {new Date(milestone.achievedDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              )}
            </div>
          </div>
          
          {milestone.nextMilestone && (
            <div className="pathfinder-personal-dashboard__next-goal">
              <div className="pathfinder-personal-dashboard__next-goal-header">
                <span className="pathfinder-personal-dashboard__next-goal-label">Next milestone:</span>
                <div className="pathfinder-personal-dashboard__next-goal-cta">
                  <span className="pathfinder-personal-dashboard__next-goal-target">
                    {milestone.nextMilestone.threshold} {milestone.category}
                  </span>
                  <span className="pathfinder-personal-dashboard__next-goal-arrow">→</span>
                  <Link 
                    to={actionButton.to}
                    state={actionButton.state}
                    className="pathfinder-personal-dashboard__milestone-action-link"
                  >
                    {actionButton.label}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <>
        <h1 className="pathfinder-personal-dashboard__welcome-title">Welcome to Pathfinder</h1>
        
        {/* Weekly Goals Card */}
        {weeklyGoals && (
          <div className="pathfinder-personal-dashboard__weekly-goals">
            <div className="pathfinder-personal-dashboard__weekly-goals-left">
              <h3>This Week's Goals</h3>
              <p className="pathfinder-personal-dashboard__weekly-goals-dates">
                {new Date(weeklyGoals.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                {new Date(weeklyGoals.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              {weeklyGoals.message && (
                <div className="pathfinder-personal-dashboard__weekly-goals-message">
                  {weeklyGoals.created_by_first_name || 'Pursuit'} says:
                  <br />
                  "{weeklyGoals.message}"
                </div>
              )}
            </div>
            <div className="pathfinder-personal-dashboard__weekly-goals-right">
              <div className="pathfinder-personal-dashboard__weekly-goals-stats">
                {weeklyGoals.networking_goal > 0 && (
                  <div className="pathfinder-personal-dashboard__weekly-goal">
                    <span className="pathfinder-personal-dashboard__weekly-goal-label">Hustle</span>
                    <div className="pathfinder-personal-dashboard__weekly-goal-progress">
                      <span className="pathfinder-personal-dashboard__weekly-goal-current">
                        {networkingStats?.weekly?.total_activities || 0}
                      </span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-separator">/</span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-target">
                        {weeklyGoals.networking_goal}
                      </span>
                    </div>
                  </div>
                )}
                {weeklyGoals.applications_goal > 0 && (
                  <div className="pathfinder-personal-dashboard__weekly-goal">
                    <span className="pathfinder-personal-dashboard__weekly-goal-label">Applications</span>
                    <div className="pathfinder-personal-dashboard__weekly-goal-progress">
                      <span className="pathfinder-personal-dashboard__weekly-goal-current">
                        {applicationStats?.weekly?.total_applications || 0}
                      </span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-separator">/</span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-target">
                        {weeklyGoals.applications_goal}
                      </span>
                    </div>
                  </div>
                )}
                {weeklyGoals.interviews_goal > 0 && (
                  <div className="pathfinder-personal-dashboard__weekly-goal">
                    <span className="pathfinder-personal-dashboard__weekly-goal-label">Interviews</span>
                    <div className="pathfinder-personal-dashboard__weekly-goal-progress">
                      <span className="pathfinder-personal-dashboard__weekly-goal-current">
                        {applicationStats?.weekly?.interviews || 0}
                      </span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-separator">/</span>
                      <span className="pathfinder-personal-dashboard__weekly-goal-target">
                        {weeklyGoals.interviews_goal}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {milestonesToShow.map((milestone, index) => renderMilestoneCard(milestone, index))}
        
        {/* Milestone History */}
        {milestones.milestones.length > 1 && (
          <div className="pathfinder-personal-dashboard__milestone-history">
            <span className="pathfinder-personal-dashboard__history-label">Recent Achievements:</span>
            <div className="pathfinder-personal-dashboard__history-list">
              {milestones.milestones.slice(1, 4).map((milestone, index) => (
                <div key={index} className="pathfinder-personal-dashboard__history-item">
                  <span className="pathfinder-personal-dashboard__history-icon">
                    {milestone.message.match(/^([\u{1F300}-\u{1F9FF}])/u)?.[1] || '✓'}
                  </span>
                  <div className="pathfinder-personal-dashboard__history-content">
                    <span className="pathfinder-personal-dashboard__history-text">
                      {milestone.message.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '')}
                    </span>
                    {milestone.achievedDate && (
                      <span className="pathfinder-personal-dashboard__history-date">
                        {new Date(milestone.achievedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Quick Actions and Streak Section */}
        <div className="pathfinder-personal-dashboard__bottom-section">
          {/* Streak Card */}
        {milestones.currentStreak >= 2 && (
          <div className="pathfinder-personal-dashboard__streak">
            <span className="pathfinder-personal-dashboard__streak-icon">🔥</span>
            <div className="pathfinder-personal-dashboard__streak-content">
              <span className="pathfinder-personal-dashboard__streak-text">
                {milestones.currentStreak} day streak!
              </span>
              <p className="pathfinder-personal-dashboard__streak-subtext">
                Keep up the momentum!
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pathfinder-personal-dashboard__actions">
          <h3>Quick Actions</h3>
          <div className="pathfinder-personal-dashboard__action-cards">
            <Link 
              to="/pathfinder/networking" 
              state={{ openForm: true }}
              className="pathfinder-personal-dashboard__action-card"
            >
              + Add Hustle
            </Link>
            <Link 
              to="/pathfinder/applications" 
              state={{ openModal: true }}
              className="pathfinder-personal-dashboard__action-card"
            >
              + Add Job
            </Link>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (isLoading) {
    return <div className="pathfinder-personal-dashboard__loading">Loading dashboard...</div>;
  }

  return (
    <div className="pathfinder-personal-dashboard">
      {error && (
        <div className="pathfinder-personal-dashboard__error">
          {error}
        </div>
      )}

      <div className="pathfinder-personal-dashboard__layout">
        {/* Left Side - Welcome Card */}
        <div className="pathfinder-personal-dashboard__left">
          <div className="pathfinder-personal-dashboard__welcome">
            {renderWelcomeContent()}
          </div>
        </div>

        {/* Right Side - All Stats and Actions */}
        <div className="pathfinder-personal-dashboard__right">
          {/* Networking Statistics */}
          <div className="pathfinder-personal-dashboard__section">
            <div className="pathfinder-personal-dashboard__section-header">
              <h3>Hustle Tracker</h3>
              <Link to="/pathfinder/networking" className="pathfinder-personal-dashboard__view-link">
                View All →
              </Link>
            </div>
            
            {/* Weekly Stats */}
            {networkingStats?.weekly && (
              <>
                <div className="pathfinder-personal-dashboard__stats-period">
                  <span className="pathfinder-personal-dashboard__period-label">This Week</span>
                  <span className="pathfinder-personal-dashboard__period-dates">
                    ({networkingStats.weekly.week_start_date && new Date(networkingStats.weekly.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {networkingStats.weekly.week_end_date && new Date(networkingStats.weekly.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="pathfinder-personal-dashboard__stats pathfinder-personal-dashboard__stats--weekly">
                  {/* Combined Hustle Tracker Card */}
                  <div className="pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--merged pathfinder-personal-dashboard__stat-card--weekly">
                    <div className="pathfinder-personal-dashboard__stat-item">
                    <div className="pathfinder-personal-dashboard__stat-label">Total Activities</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {networkingStats.weekly.total_activities || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.totalActivities)}
                  </div>
                    <div className="pathfinder-personal-dashboard__stat-divider"></div>
                    <div className="pathfinder-personal-dashboard__stat-item">
                      <div className="pathfinder-personal-dashboard__stat-label">Digital</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {networkingStats.weekly.social_media_count || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.socialMedia)}
                  </div>
                    <div className="pathfinder-personal-dashboard__stat-divider"></div>
                    <div className="pathfinder-personal-dashboard__stat-item">
                      <div className="pathfinder-personal-dashboard__stat-label">IRL</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {networkingStats.weekly.in_person_count || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.inPerson)}
                  </div>
                  </div>
                  {/* Combined Build Tracker Card */}
                  <Link to="/pathfinder/projects" className="pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--merged pathfinder-personal-dashboard__stat-card--weekly pathfinder-personal-dashboard__stat-card--builds pathfinder-personal-dashboard__stat-card--clickable">
                    <div className="pathfinder-personal-dashboard__stat-item">
                      <div className="pathfinder-personal-dashboard__stat-label">Builds in Progress</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                        {projectStats ? (parseInt(projectStats.planning_count || 0) + parseInt(projectStats.development_count || 0) + parseInt(projectStats.testing_count || 0)) : 0}
                      </div>
                      {projectStats && (
                        <div className="pathfinder-personal-dashboard__stat-breakdown">
                          <div>{projectStats.planning_count || 0} Planning</div>
                          <div>{projectStats.development_count || 0} In Development</div>
                          <div>{projectStats.testing_count || 0} Testing</div>
                        </div>
                      )}
                    </div>
                    <div className="pathfinder-personal-dashboard__stat-divider"></div>
                    <div className="pathfinder-personal-dashboard__stat-item">
                      <div className="pathfinder-personal-dashboard__stat-label">Builds Completed</div>
                      <div className="pathfinder-personal-dashboard__stat-value">
                        {projectStats?.launch_count || 0}
                      </div>
                  </div>
                  </Link>
                </div>
              </>
            )}
            
            {/* All-Time Stats */}
            <div className="pathfinder-personal-dashboard__stats-period">
              <span className="pathfinder-personal-dashboard__period-label">All Time</span>
            </div>
            <div className="pathfinder-personal-dashboard__stats">
              {/* Combined Hustle Tracker Card */}
              <div className="pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--merged">
                <div className="pathfinder-personal-dashboard__stat-item">
                <div className="pathfinder-personal-dashboard__stat-label">Total Activities</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {networkingStats?.allTime?.total_activities || 0}
                </div>
              </div>
                <div className="pathfinder-personal-dashboard__stat-divider"></div>
                <div className="pathfinder-personal-dashboard__stat-item">
                  <div className="pathfinder-personal-dashboard__stat-label">Digital</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {networkingStats?.allTime?.social_media_count || 0}
                </div>
              </div>
                <div className="pathfinder-personal-dashboard__stat-divider"></div>
                <div className="pathfinder-personal-dashboard__stat-item">
                  <div className="pathfinder-personal-dashboard__stat-label">IRL</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {networkingStats?.allTime?.in_person_count || 0}
                  </div>
                </div>
              </div>
              {/* Combined Build Tracker Card */}
              <Link to="/pathfinder/projects" className="pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--merged pathfinder-personal-dashboard__stat-card--builds pathfinder-personal-dashboard__stat-card--clickable">
                <div className="pathfinder-personal-dashboard__stat-item">
                  <div className="pathfinder-personal-dashboard__stat-label">Builds in Progress</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                    {projectStats ? (parseInt(projectStats.planning_count || 0) + parseInt(projectStats.development_count || 0) + parseInt(projectStats.testing_count || 0)) : 0}
                  </div>
                </div>
                <div className="pathfinder-personal-dashboard__stat-divider"></div>
                <div className="pathfinder-personal-dashboard__stat-item">
                  <div className="pathfinder-personal-dashboard__stat-label">Builds Completed</div>
                  <div className="pathfinder-personal-dashboard__stat-value">
                    {projectStats?.launch_count || 0}
                </div>
              </div>
              </Link>
            </div>
          </div>

          {/* Application Statistics */}
          <div className="pathfinder-personal-dashboard__section pathfinder-personal-dashboard__section--with-divider">
            <div className="pathfinder-personal-dashboard__section-header">
              <h3>Job Applications</h3>
              <Link to="/pathfinder/applications" className="pathfinder-personal-dashboard__view-link">
                View All →
              </Link>
            </div>
            
            {/* Weekly Stats */}
            {applicationStats?.weekly && (
              <>
                <div className="pathfinder-personal-dashboard__stats-period">
                  <span className="pathfinder-personal-dashboard__period-label">This Week</span>
                  <span className="pathfinder-personal-dashboard__period-dates">
                    ({applicationStats.weekly.week_start_date && new Date(applicationStats.weekly.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {applicationStats.weekly.week_end_date && new Date(applicationStats.weekly.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="pathfinder-personal-dashboard__stats pathfinder-personal-dashboard__stats--weekly">
                  <div className={`pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--weekly ${getFireTier(applicationStats.weekly.trends?.prospects) === 3 ? 'pathfinder-personal-dashboard__stat-card--fire-tier-3' : ''}`}>
                    <div className="pathfinder-personal-dashboard__stat-label">Prospects</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {applicationStats.weekly.prospects || 0}
                    </div>
                    {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.prospects, getFireTier(applicationStats.weekly.trends.prospects))}
                  </div>
                  <div className={`pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--weekly ${getFireTier(applicationStats.weekly.trends?.totalApplications) === 3 ? 'pathfinder-personal-dashboard__stat-card--fire-tier-3' : ''}`}>
                    <div className="pathfinder-personal-dashboard__stat-label">Total Applications</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {applicationStats.weekly.total_applications || 0}
                    </div>
                    {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.totalApplications, getFireTier(applicationStats.weekly.trends.totalApplications))}
                  </div>
                  <div className={`pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--weekly ${getFireTier(applicationStats.weekly.trends?.interviews) === 3 ? 'pathfinder-personal-dashboard__stat-card--fire-tier-3' : ''}`}>
                    <div className="pathfinder-personal-dashboard__stat-label">Interviews</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {applicationStats.weekly.interview_count || 0}
                    </div>
                    {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.interviews, getFireTier(applicationStats.weekly.trends.interviews))}
                  </div>
                  <div className={`pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--weekly ${getFireTier(applicationStats.weekly.trends?.offers) === 3 ? 'pathfinder-personal-dashboard__stat-card--fire-tier-3' : ''}`}>
                    <div className="pathfinder-personal-dashboard__stat-label">Offers</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {applicationStats.weekly.offer_count || 0}
                    </div>
                    {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.offers, getFireTier(applicationStats.weekly.trends.offers))}
                  </div>
                  <div className="pathfinder-personal-dashboard__stat-card pathfinder-personal-dashboard__stat-card--weekly">
                    <div className="pathfinder-personal-dashboard__stat-label">Rejected</div>
                    <div className="pathfinder-personal-dashboard__stat-value">
                      {applicationStats.weekly.rejected_count || 0}
                    </div>
                    {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.rejected)}
                  </div>
                </div>
              </>
            )}
            
            {/* All-Time Stats */}
            <div className="pathfinder-personal-dashboard__stats-period">
              <span className="pathfinder-personal-dashboard__period-label">All Time</span>
            </div>
            <div className="pathfinder-personal-dashboard__stats">
              <div className="pathfinder-personal-dashboard__stat-card">
                <div className="pathfinder-personal-dashboard__stat-label">Prospects</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {applicationStats?.allTime?.prospects || 0}
                </div>
              </div>
              <div className="pathfinder-personal-dashboard__stat-card">
                <div className="pathfinder-personal-dashboard__stat-label">Total Applications</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {applicationStats?.allTime?.total_applications || 0}
                </div>
              </div>
              <div className="pathfinder-personal-dashboard__stat-card">
                <div className="pathfinder-personal-dashboard__stat-label">Interviews</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {applicationStats?.allTime?.interview_count || 0}
                </div>
              </div>
              <div className="pathfinder-personal-dashboard__stat-card">
                <div className="pathfinder-personal-dashboard__stat-label">Offers</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {applicationStats?.allTime?.offer_count || 0}
                </div>
              </div>
              <div className="pathfinder-personal-dashboard__stat-card">
                <div className="pathfinder-personal-dashboard__stat-label">Rejected</div>
                <div className="pathfinder-personal-dashboard__stat-value">
                  {applicationStats?.allTime?.rejected_count || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathfinderPersonalDashboard;


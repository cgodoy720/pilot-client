import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

function PathfinderPersonalDashboard() {
  const { token, user } = useAuth();
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
        fetch(`${import.meta.env.VITE_API_URL}/api/weekly-goals/current${user?.cohort ? `?cohort=${encodeURIComponent(user.cohort)}` : ''}`, {
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
      <div className={`flex flex-col gap-0.5 ${!isPositive ? 'text-red-500' : 'text-green-600'}`}>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="text-base">{arrow}</span>
          <span>
            {trend.percentChange > 0 ? '+' : ''}{trend.percentChange}%
          </span>
          {fireTier > 0 && (
            <span className={`${fireTier === 3 ? 'animate-pulse' : ''}`}>
              {fireTier === 1 && '🔥'}
              {fireTier === 2 && '🔥🔥'}
              {fireTier === 3 && '🔥🔥🔥'}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[#999]">
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
          <h1 className="m-0 mb-4 text-2xl font-bold text-[#1a1a1a] tracking-tight text-left">Welcome to Pathfinder</h1>
          <h2 className="m-0 mb-2 text-xl font-bold text-[#1a1a1a]">Welcome to your job search tracker</h2>
          <p className="m-0 text-base text-[#666666]">Track applications, networking activities, and monitor your progress.</p>
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
        <div key={index} className={`relative ${showCelebration && index === 0 ? 'celebrating' : ''}`}>
          <div className="flex items-start gap-4 mb-4">
            {emoji && <span className="text-4xl flex-shrink-0">{emoji}</span>}
            <div className="flex-1 pr-20">
              <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 leading-tight">{messageText}</h2>
              <p className="text-sm text-[#666666] mb-2 leading-relaxed">{milestone.subtext}</p>
              {milestone.achievedDate && (
                <span className="text-xs text-[#999999] font-medium">
                  Achieved on {new Date(milestone.achievedDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              )}
            </div>
            {/* Share Buttons - Positioned in the right margin */}
            <div className="absolute top-0 right-0 flex gap-1">
              <Button 
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-black text-white hover:bg-gray-800 text-xs"
                onClick={() => handleShare('twitter', milestone)}
                title="Share on X (Twitter)"
              >
                𝕏
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-[#0077b5] text-white hover:bg-[#005885] text-xs font-bold"
                onClick={() => handleShare('linkedin', milestone)}
                title="Share on LinkedIn"
              >
                in
              </Button>
            </div>
          </div>
          
          {milestone.nextMilestone && (
            <div className="bg-[#f8f9fa] rounded-lg p-4 border border-[#e0e0e0]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#666666] uppercase tracking-wide">Next Milestone:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      {milestone.nextMilestone.threshold} {milestone.category}
                    </span>
                    <span className="text-[#4242ea]">→</span>
                  </div>
                </div>
                <Link 
                  to={actionButton.to}
                  state={actionButton.state}
                  className="text-decoration-none"
                >
                  <Button size="sm" className="bg-[#4242ea] text-white hover:bg-[#3333d1] text-xs px-3 py-1.5">
                    {actionButton.label}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    return (
      <>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6 tracking-tight">Welcome to Pathfinder</h1>
        
        {/* Weekly Goals Card */}
        {weeklyGoals && (
          <div className="bg-[#f8f9fa] rounded-lg p-5 border border-[#e0e0e0] mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">This Week's Goals</h3>
              <p className="text-sm text-[#666666] font-medium">
                {new Date(weeklyGoals.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                {new Date(weeklyGoals.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              {weeklyGoals.message && (
                <div className="mt-3 p-3 bg-white rounded border border-[#e0e0e0] text-sm">
                  <span className="font-medium text-[#4242ea]">{weeklyGoals.created_by_first_name || 'Pursuit'} says:</span>
                  <br />
                  <span className="text-[#1a1a1a] italic">"{weeklyGoals.message}"</span>
                </div>
              )}
            </div>
            <div className="pathfinder-personal-dashboard__weekly-goals-right">
              <div className="pathfinder-personal-dashboard__weekly-goals-stats">
                {weeklyGoals.networking_goal > 0 && (
                  <div className="pathfinder-personal-dashboard__weekly-goal">
                    <span className="pathfinder-personal-dashboard__weekly-goal-label">Hustle</span>
                    <div className="pathfinder-personal-dashboard__weekly-goal-progress">
                      <span className={`pathfinder-personal-dashboard__weekly-goal-current ${
                        (networkingStats?.weekly?.total_activities || 0) >= weeklyGoals.networking_goal 
                          ? 'pathfinder-personal-dashboard__weekly-goal-achieved' 
                          : ''
                      }`}>
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
                      <span className={`pathfinder-personal-dashboard__weekly-goal-current ${
                        (applicationStats?.weekly?.total_applications || 0) >= weeklyGoals.applications_goal 
                          ? 'pathfinder-personal-dashboard__weekly-goal-achieved' 
                          : ''
                      }`}>
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
                      <span className={`pathfinder-personal-dashboard__weekly-goal-current ${
                        (applicationStats?.weekly?.interviews || 0) >= weeklyGoals.interviews_goal 
                          ? 'pathfinder-personal-dashboard__weekly-goal-achieved' 
                          : ''
                      }`}>
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
        
        {/* Main Milestones Section */}
        <div className="space-y-6 mt-6">
          {milestonesToShow.map((milestone, index) => (
            <div key={index} className="bg-white rounded-lg p-5 border border-[#e0e0e0] shadow-sm">
              {renderMilestoneCard(milestone, index)}
            </div>
          ))}
        </div>
        
        {/* Milestone History */}
        {milestones.milestones.length > 1 && (
          <div className="mt-8 pt-6 border-t border-[#e0e0e0]">
            <h4 className="text-sm font-semibold text-[#666666] uppercase tracking-wide mb-4">Recent Achievements:</h4>
            <div className="space-y-3">
              {milestones.milestones.slice(1, 4).map((milestone, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-[#f8f9fa] rounded-lg border border-[#e0e0e0]">
                  <span className="text-lg flex-shrink-0">
                    {milestone.message.match(/^([\u{1F300}-\u{1F9FF}])/u)?.[1] || '✓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[#1a1a1a] block leading-tight">
                      {milestone.message.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '')}
                    </span>
                    {milestone.achievedDate && (
                      <span className="text-xs text-[#666666] mt-1 block">
                        {new Date(milestone.achievedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Streak Section */}
        {milestones.currentStreak >= 2 && (
          <div className="mt-8 pt-6 border-t border-[#e0e0e0]">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <span className="text-lg font-bold text-[#1a1a1a] block">
                    {milestones.currentStreak} day streak!
                  </span>
                  <p className="text-sm text-[#666666] m-0">
                    Keep up the momentum!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Quick Actions</h3>
          <div className="flex gap-3">
            <Link 
              to="/pathfinder/networking" 
              state={{ openForm: true }}
              className="flex-1"
            >
              <Button className="w-full px-6 py-4 bg-[#4242ea] text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(66,66,234,0.2)] hover:bg-[#3333d1] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(66,66,234,0.4)]">
                + Add Hustle
              </Button>
            </Link>
            <Link 
              to="/pathfinder/applications" 
              state={{ openModal: true }}
              className="flex-1"
            >
              <Button className="w-full px-6 py-4 bg-[#4242ea] text-white border-none rounded-md font-semibold cursor-pointer transition-all duration-300 shadow-[0_2px_8px_rgba(66,66,234,0.2)] hover:bg-[#3333d1] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(66,66,234,0.4)]">
                + Add Job
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="w-full px-8 pb-8 text-[#1a1a1a]">
      {error && (
        <div className="p-4 bg-red-100 text-red-600 border border-red-200 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-6 items-stretch">
        {/* Left Side - Welcome Card */}
        <div className="flex-[0_0_40%] flex flex-col">
          <div className="h-auto p-4 bg-white rounded-lg border border-[rgba(66,66,234,0.2)] flex flex-col justify-start shadow-sm">
            {renderWelcomeContent()}
          </div>
        </div>

        {/* Right Side - All Stats and Actions */}
        <div className="flex-[0_0_60%] flex flex-col">
          {/* Networking Statistics */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-xl font-semibold text-[#1a1a1a]">Hustle Tracker</h3>
              <Link to="/pathfinder/networking" className="text-[#4242ea] no-underline font-semibold text-[0.95rem] transition-colors duration-200 hover:text-[#3333d1]">
                View All →
              </Link>
            </div>
            
            {/* Weekly Stats */}
            {networkingStats?.weekly && (
              <>
                <div className="flex items-baseline gap-2 mt-6 mb-2">
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-wide">This Week</span>
                  <span className="text-[0.7rem] text-[#999999] font-medium opacity-70">
                    ({networkingStats.weekly.week_start_date && new Date(networkingStats.weekly.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {networkingStats.weekly.week_end_date && new Date(networkingStats.weekly.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-4 overflow-visible mb-4">
                  {/* Combined Hustle Tracker Card */}
                  <Card className="flex-row items-center justify-between col-span-3 overflow-visible bg-white border-[#e0e0e0]">
                    <CardContent className="p-6 flex items-center justify-between w-full gap-4">
                    <div className="flex-1 flex flex-col items-start self-start text-left">
                    <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Total Activities</div>
                    <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                      {networkingStats.weekly.total_activities || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.totalActivities)}
                  </div>
                    <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                    <div className="flex-1 flex flex-col items-start self-start text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Digital</div>
                    <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                      {networkingStats.weekly.social_media_count || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.socialMedia)}
                  </div>
                    <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                    <div className="flex-1 flex flex-col items-start self-start text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">IRL</div>
                    <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                      {networkingStats.weekly.in_person_count || 0}
                    </div>
                    {networkingStats.weekly.trends && renderTrend(networkingStats.weekly.trends.inPerson)}
                  </div>
                    </CardContent>
                  </Card>
                  {/* Combined Build Tracker Card */}
                  <Link to="/pathfinder/projects" className="col-span-2 no-underline text-inherit">
                  <Card className="flex-row items-center justify-between bg-white border-[#e0e0e0] h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-6 flex items-center justify-between w-full gap-4">
                    <div className="flex-1 flex flex-col items-start self-start text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Builds in Progress</div>
                    <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {projectStats ? (parseInt(projectStats.planning_count || 0) + parseInt(projectStats.development_count || 0) + parseInt(projectStats.testing_count || 0)) : 0}
                      </div>
                      {projectStats && (
                        <div className="flex flex-col gap-1 mt-2 text-xs text-[#666]">
                          <div>{projectStats.planning_count || 0} Planning</div>
                          <div>{projectStats.development_count || 0} In Development</div>
                          <div>{projectStats.testing_count || 0} Testing</div>
                        </div>
                      )}
                    </div>
                    <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                    <div className="flex-1 flex flex-col items-start self-start text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Builds Completed</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {projectStats?.launch_count || 0}
                      </div>
                  </div>
                    </CardContent>
                  </Card>
                  </Link>
                </div>
              </>
            )}
            
            {/* All-Time Stats */}
            <div className="flex items-baseline gap-2 mt-6 mb-2">
              <span className="text-xs font-bold text-[#666666] uppercase tracking-wide">All Time</span>
            </div>
            <div className="grid grid-cols-5 gap-4 overflow-visible">
              {/* Combined Hustle Tracker Card */}
              <Card className="flex-row items-center justify-between col-span-3 overflow-visible bg-white border-[#e0e0e0]">
                <CardContent className="p-6 flex items-center justify-between w-full gap-4">
                <div className="flex-1 flex flex-col items-start self-start text-left">
                <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Total Activities</div>
                <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                  {networkingStats?.allTime?.total_activities || 0}
                </div>
              </div>
                <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                <div className="flex-1 flex flex-col items-start self-start text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Digital</div>
                <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                  {networkingStats?.allTime?.social_media_count || 0}
                </div>
              </div>
                <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                <div className="flex-1 flex flex-col items-start self-start text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">IRL</div>
                <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                  {networkingStats?.allTime?.in_person_count || 0}
                  </div>
                </div>
                </CardContent>
              </Card>
              {/* Combined Build Tracker Card */}
              <Link to="/pathfinder/projects" className="col-span-2 no-underline text-inherit">
              <Card className="flex-row items-center justify-between bg-white border-[#e0e0e0] h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-6 flex items-center justify-between w-full gap-4">
                <div className="flex-1 flex flex-col items-start self-start text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Builds in Progress</div>
                <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {projectStats ? (parseInt(projectStats.planning_count || 0) + parseInt(projectStats.development_count || 0) + parseInt(projectStats.testing_count || 0)) : 0}
                  </div>
                </div>
                <div className="w-px self-stretch bg-[#d1d5db] my-0 mx-4"></div>
                <div className="flex-1 flex flex-col items-start self-start text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1 text-left">Builds Completed</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {projectStats?.launch_count || 0}
                </div>
              </div>
                </CardContent>
              </Card>
              </Link>
            </div>
          </div>

          {/* Application Statistics */}
          <div className="mb-8 pt-8 border-t border-[rgba(66,66,234,0.15)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-xl font-semibold text-[#1a1a1a]">Job Applications</h3>
              <Link to="/pathfinder/applications" className="text-[#4242ea] no-underline font-semibold text-[0.95rem] transition-colors duration-200 hover:text-[#3333d1]">
                View All →
              </Link>
            </div>
            
            {/* Weekly Stats */}
            {applicationStats?.weekly && (
              <>
                <div className="flex items-baseline gap-2 mt-6 mb-2">
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-wide">This Week</span>
                  <span className="text-[0.7rem] text-[#999999] font-medium opacity-70">
                    ({applicationStats.weekly.week_start_date && new Date(applicationStats.weekly.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {applicationStats.weekly.week_end_date && new Date(applicationStats.weekly.week_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-4 overflow-visible mb-4">
                  <Card className={`bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${getFireTier(applicationStats.weekly.trends?.prospects) === 3 ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-4 text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Prospects</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {applicationStats.weekly.prospects || 0}
                      </div>
                      {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.prospects, getFireTier(applicationStats.weekly.trends.prospects))}
                    </CardContent>
                  </Card>
                  <Card className={`bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${getFireTier(applicationStats.weekly.trends?.totalApplications) === 3 ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-4 text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Total Applications</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {applicationStats.weekly.total_applications || 0}
                      </div>
                      {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.totalApplications, getFireTier(applicationStats.weekly.trends.totalApplications))}
                    </CardContent>
                  </Card>
                  <Card className={`bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${getFireTier(applicationStats.weekly.trends?.interviews) === 3 ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-4 text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Interviews</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {applicationStats.weekly.interview_count || 0}
                      </div>
                      {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.interviews, getFireTier(applicationStats.weekly.trends.interviews))}
                    </CardContent>
                  </Card>
                  <Card className={`bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${getFireTier(applicationStats.weekly.trends?.offers) === 3 ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-4 text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Offers</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {applicationStats.weekly.offer_count || 0}
                      </div>
                      {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.offers, getFireTier(applicationStats.weekly.trends.offers))}
                    </CardContent>
                  </Card>
                  <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <CardContent className="p-4 text-left">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Rejected</div>
                      <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                        {applicationStats.weekly.rejected_count || 0}
                      </div>
                      {applicationStats.weekly.trends && renderTrend(applicationStats.weekly.trends.rejected)}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            
            {/* All-Time Stats */}
            <div className="flex items-baseline gap-2 mt-6 mb-2">
              <span className="text-xs font-bold text-[#666666] uppercase tracking-wide">All Time</span>
            </div>
            <div className="grid grid-cols-5 gap-4 overflow-visible">
              <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4 text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1">Prospects</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {applicationStats?.allTime?.prospects || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4 text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1">Total Applications</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {applicationStats?.allTime?.total_applications || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4 text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1">Interviews</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {applicationStats?.allTime?.interview_count || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4 text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1">Offers</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {applicationStats?.allTime?.offer_count || 0}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white border-[#e0e0e0] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4 text-left">
                  <div className="text-sm font-medium text-[#1a1a1a] mb-1">Rejected</div>
                  <div className="text-3xl font-bold text-[#1a1a1a] mb-1 leading-none">
                    {applicationStats?.allTime?.rejected_count || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading Curtain */}
      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
}

export default PathfinderPersonalDashboard;


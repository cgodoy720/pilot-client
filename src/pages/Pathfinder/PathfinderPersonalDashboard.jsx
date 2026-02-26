import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Badge } from '../../components/ui/badge';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import './PathfinderPersonalDashboard.css';

// ── Label maps for strategy tags ──────────────────────────────────────────────

const INTEREST_LABELS = {
  technology: 'Technology',
  finance: 'Finance',
  healthcare: 'Healthcare',
  education: 'Education',
  government: 'Government',
  retail: 'Retail',
  media_entertainment: 'Media & Entertainment',
  manufacturing: 'Manufacturing',
  real_estate: 'Real Estate',
  consulting: 'Consulting',
  nonprofit: 'Nonprofit',
  legal: 'Legal',
  energy: 'Energy',
  transportation: 'Transportation',
  hospitality: 'Hospitality',
  other: 'Other',
};

const EMPLOYMENT_PATH_LABELS = {
  role_based: 'Role-Based',
  mode_based: 'Mode-Based',
  both: 'Role & Mode',
};

const TIMELINE_LABELS = {
  '1_month': '1 Month',
  '3_months': '3 Months',
  '6_months': '6 Months',
  '1_year': '1 Year',
  exploring: 'Exploring',
};

const COMPANY_STAGE_LABELS = {
  startup: 'Startup',
  growth: 'Growth',
  enterprise: 'Enterprise',
  any: 'Any Stage',
};

// ── Component ─────────────────────────────────────────────────────────────────

function PathfinderPersonalDashboard() {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [interests, setInterests] = useState(null);
  const [weeklyGoalData, setWeeklyGoalData] = useState(null);
  const [liveSuggestion, setLiveSuggestion] = useState(null);
  const [streak, setStreak] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [resumeCount, setResumeCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent the goal-hit toast from firing more than once per session
  const goalCelebrated = useRef(false);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const base = import.meta.env.VITE_API_URL;

      const [interestsRes, goalRes, suggestionRes, eventsRes, dashRes, resumesRes] = await Promise.all([
        fetch(`${base}/api/pathfinder/interests`, { headers }),
        fetch(`${base}/api/pathfinder/weekly-goal`, { headers }),
        fetch(`${base}/api/pathfinder/weekly-goal/suggestion`, { headers }),
        fetch(`${base}/api/pathfinder/events`, { headers }),
        // Dashboard endpoint used for streak data only — non-critical
        fetch(`${base}/api/pathfinder/applications/dashboard`, { headers }),
        fetch(`${base}/api/pathfinder/resumes`, { headers }),
      ]);

      if (interestsRes.ok) {
        setInterests(await interestsRes.json());
      }

      if (goalRes.ok) {
        const goalData = await goalRes.json();
        setWeeklyGoalData(goalData);
        checkGoalCompletion(goalData);
      }

      if (suggestionRes.ok) {
        setLiveSuggestion(await suggestionRes.json());
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        const today = new Date(new Date().toDateString());
        const upcoming = eventsData
          .filter(e => e.is_featured && new Date(e.event_date) >= today)
          .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
          .slice(0, 3);
        setFeaturedEvents(upcoming);
      }

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setStreak(dashData.milestones?.currentStreak || 0);
      }

      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumeCount(resumesData.length);
      } else {
        setResumeCount(0);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Error loading dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGoalCompletion = (goalData) => {
    if (
      goalData.goal &&
      goalData.progress?.total >= goalData.goal &&
      !goalCelebrated.current
    ) {
      goalCelebrated.current = true;
      Swal.fire({
        toast: true,
        position: 'top-right',
        icon: 'success',
        title: 'You hit your weekly goal! 🎯',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  // ── Goal setup handler ───────────────────────────────────────────────────────

  const handleSaveGoal = async () => {
    const num = parseInt(goalInput, 10);
    if (!num || num < 1) return;

    try {
      setIsSavingGoal(true);
      const headers = { Authorization: `Bearer ${token}` };
      const base = import.meta.env.VITE_API_URL;

      const res = await fetch(`${base}/api/pathfinder/weekly-goal`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalActivities: num }),
      });

      if (res.ok) {
        const updated = await fetch(`${base}/api/pathfinder/weekly-goal`, { headers });
        if (updated.ok) {
          const newGoalData = await updated.json();
          setWeeklyGoalData(newGoalData);

          // If the Builder already passed their new goal, celebrate instead
          if (
            newGoalData.goal &&
            newGoalData.progress?.total >= newGoalData.goal &&
            !goalCelebrated.current
          ) {
            goalCelebrated.current = true;
            Swal.fire({
              toast: true,
              position: 'top-right',
              icon: 'success',
              title: 'You hit your weekly goal! 🎯',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
            });
          } else {
            Swal.fire({
              toast: true,
              position: 'top-right',
              icon: 'success',
              title: 'Weekly goal set! 💪',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true,
            });
          }
        }
        setGoalInput('');
      }
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setIsSavingGoal(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────────

  const buildLookbookUrl = () => {
    const rawFirst = (user?.firstName || user?.first_name || '').trim();
    const rawLast = (user?.lastName || user?.last_name || '').trim();
    // Take only the first word of firstName to handle middle names stored in that field
    const first = rawFirst.split(/\s+/)[0].toLowerCase();
    // Replace spaces in lastName with hyphens to handle multi-word surnames; preserve existing hyphens
    const last = rawLast.replace(/\s+/g, '-').toLowerCase();
    return first && last ? `https://lookbook.pursuit.org/people/${first}-${last}` : null;
  };

  const renderResumeCta = () => {
    if (resumeCount === null || resumeCount > 0) return null;
    return (
      <div className="pathfinder-personal-dashboard__resume-cta">
        <span className="pathfinder-personal-dashboard__resume-cta-text">
          📄 No resume uploaded yet
        </span>
        <Link to="/pathfinder/applications">
          <Button
            size="sm"
            variant="outline"
            className="border-amber-300 text-amber-800 hover:bg-amber-50 whitespace-nowrap"
          >
            Upload Resume →
          </Button>
        </Link>
      </div>
    );
  };

  const renderGoalStatementCard = () => {
    if (!interests) {
      return (
        <div className="pathfinder-personal-dashboard__goal-statement pathfinder-personal-dashboard__goal-statement--empty">
          <div className="pathfinder-personal-dashboard__goal-statement-empty-content">
            <span className="pathfinder-personal-dashboard__goal-statement-empty-icon">🧭</span>
            <div>
              <p className="pathfinder-personal-dashboard__goal-statement-empty-title">No strategy set yet</p>
              <p className="pathfinder-personal-dashboard__goal-statement-empty-sub">
                Define your focus to unlock your goal statement.
              </p>
            </div>
          </div>
          <Link to="/pathfinder/applications">
            <Button size="sm" className="bg-[#4242ea] text-white hover:bg-[#3333d1] whitespace-nowrap">
              Set My Strategy →
            </Button>
          </Link>
        </div>
      );
    }

    const tags = [
      interests.primary_interest && {
        label: INTEREST_LABELS[interests.primary_interest] || interests.primary_interest,
        color: 'purple',
      },
      interests.employment_path && {
        label: EMPLOYMENT_PATH_LABELS[interests.employment_path] || interests.employment_path,
        color: 'blue',
      },
      interests.timeline && {
        label: TIMELINE_LABELS[interests.timeline] || interests.timeline,
        color: 'green',
      },
      interests.target_company_stage && {
        label: COMPANY_STAGE_LABELS[interests.target_company_stage] || interests.target_company_stage,
        color: 'orange',
      },
    ].filter(Boolean);

    return (
      <div className="pathfinder-personal-dashboard__goal-statement">
        <div className="pathfinder-personal-dashboard__goal-statement-header">
          <h2 className="pathfinder-personal-dashboard__goal-statement-title">My Strategy</h2>
          <Link to="/pathfinder/applications" className="pathfinder-personal-dashboard__goal-statement-edit">
            Edit →
          </Link>
        </div>
        <div className="pathfinder-personal-dashboard__goal-statement-tags">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`pathfinder-personal-dashboard__goal-tag pathfinder-personal-dashboard__goal-tag--${tag.color}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
        {interests.skills && (
          <p className="pathfinder-personal-dashboard__goal-statement-skills">
            Skills: {interests.skills}
          </p>
        )}
        {(() => {
          const lookbookUrl = buildLookbookUrl();
          const hasLinks = lookbookUrl || interests.portfolio_url;
          if (!hasLinks) return null;
          return (
            <div className="pathfinder-personal-dashboard__goal-statement-links">
              {lookbookUrl && (
                <a
                  href={lookbookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pathfinder-personal-dashboard__profile-link"
                >
                  🔗 Lookbook
                </a>
              )}
              {lookbookUrl && interests.portfolio_url && (
                <span className="pathfinder-personal-dashboard__profile-link-sep">·</span>
              )}
              {interests.portfolio_url && (
                <a
                  href={interests.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pathfinder-personal-dashboard__profile-link"
                >
                  Portfolio ↗
                </a>
              )}
            </div>
          );
        })()}
      </div>
    );
  };

  const renderProgressSection = () => {
    // Prefer snapshotted suggestion from the saved goal row; fall back to live suggestion
    const suggestion = weeklyGoalData?.staffSuggestion ?? liveSuggestion?.suggestion ?? null;

    const weekLabel = weeklyGoalData?.weekOf
      ? (() => {
          const sunday = new Date(weeklyGoalData.weekOf + 'T00:00:00');
          const saturday = new Date(sunday);
          saturday.setDate(sunday.getDate() + 6);
          return `${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${saturday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        })()
      : null;

    return (
      <div className="pathfinder-personal-dashboard__progress-section">
        <div className="pathfinder-personal-dashboard__progress-header">
          <div>
            <h3 className="pathfinder-personal-dashboard__progress-title">This Week</h3>
            {weekLabel && (
              <span className="pathfinder-personal-dashboard__progress-dates">{weekLabel}</span>
            )}
          </div>
          {streak > 0 && (
            <div className="pathfinder-personal-dashboard__streak-badge">
              <span className="pathfinder-personal-dashboard__streak-flame">🔥</span>
              <span className="pathfinder-personal-dashboard__streak-count">{streak}-week streak</span>
            </div>
          )}
        </div>

        {weeklyGoalData?.goal
          ? renderProgressBar(suggestion)
          : renderSetupForm(suggestion)
        }
      </div>
    );
  };

  const renderProgressBar = (suggestion) => {
    const { goal, progress } = weeklyGoalData;
    const total = progress?.total ?? 0;
    const pct = Math.min((total / goal) * 100, 100);
    const isComplete = total >= goal;

    // Cap the marker so its tick arrow is always fully visible inside the bar
    const suggestionPct = suggestion
      ? Math.min((suggestion / goal) * 100, 96)
      : null;

    return (
      <>
        <div className="pathfinder-personal-dashboard__progress-counts">
          <span
            className={`pathfinder-personal-dashboard__progress-current${isComplete ? ' pathfinder-personal-dashboard__progress-current--complete' : ''}`}
          >
            {total}
          </span>
          <span className="pathfinder-personal-dashboard__progress-separator">/</span>
          <span className="pathfinder-personal-dashboard__progress-goal">{goal}</span>
          {progress && (
            <span className="pathfinder-personal-dashboard__progress-breakdown-inline">
              — {progress.applications} apps · {progress.networking} networking · {progress.projects} builds
            </span>
          )}
        </div>

        <div className="pathfinder-personal-dashboard__progress-track">
          <div
            className={`pathfinder-personal-dashboard__progress-fill${isComplete ? ' pathfinder-personal-dashboard__progress-fill--complete' : ''}`}
            style={{ width: `${pct}%` }}
          />
          {suggestionPct !== null && (
            <div
              className="pathfinder-personal-dashboard__suggestion-marker"
              style={{ left: `${suggestionPct}%` }}
              title={`Staff suggests ${suggestion} activities`}
            />
          )}
        </div>

        <div className="pathfinder-personal-dashboard__progress-meta">
          {suggestion && (
            <span className="pathfinder-personal-dashboard__suggestion-label">
              Staff suggests {suggestion}
            </span>
          )}
        </div>

        {isComplete && (
          <p className="pathfinder-personal-dashboard__goal-complete-msg">
            Goal reached! 🎯 Keep going!
          </p>
        )}
      </>
    );
  };

  const renderSetupForm = (suggestion) => (
    <div className="pathfinder-personal-dashboard__setup-form">
      <p className="pathfinder-personal-dashboard__setup-prompt">
        How many activities are you aiming for this week?
      </p>
      {suggestion && (
        <p className="pathfinder-personal-dashboard__setup-suggestion">
          Your staff suggests <strong>{suggestion}</strong> this week
        </p>
      )}
      <div className="pathfinder-personal-dashboard__setup-input-row">
        <input
          type="number"
          min="1"
          max="100"
          value={goalInput}
          onChange={e => setGoalInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSaveGoal()}
          placeholder={suggestion ? String(suggestion) : '5'}
          className="pathfinder-personal-dashboard__setup-input"
        />
        <Button
          onClick={handleSaveGoal}
          disabled={isSavingGoal || !goalInput}
          className="bg-[#4242ea] text-white hover:bg-[#3333d1] disabled:opacity-50"
        >
          {isSavingGoal ? 'Saving…' : 'Set My Goal'}
        </Button>
      </div>
    </div>
  );

  const renderFeaturedEvents = () => {
    if (!featuredEvents.length) return null;

    return (
      <div className="pathfinder-personal-dashboard__events">
        <div className="pathfinder-personal-dashboard__events-header">
          <h3 className="pathfinder-personal-dashboard__events-title">Featured Upcoming Events</h3>
          <Link to="/pathfinder/events" className="pathfinder-personal-dashboard__events-link">
            View All →
          </Link>
        </div>
        <div className="pathfinder-personal-dashboard__events-list">
          {featuredEvents.map(event => (
            <Card
              key={event.event_id}
              className="bg-white border-[#e0e0e0] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              onClick={() => navigate(`/pathfinder/events/${event.event_id}`)}
            >
              <CardContent className="p-4">
                <div className="font-semibold text-[#1a1a1a] mb-2">{event.title}</div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#666666]">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <Badge
                    className={
                      event.location_type === 'virtual' ? 'bg-blue-100 text-blue-700' :
                      event.location_type === 'in_person' ? 'bg-green-100 text-green-700' :
                      event.location_type === 'hybrid' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }
                  >
                    {event.location_type === 'virtual' ? 'Virtual' :
                     event.location_type === 'in_person' ? 'In-Person' :
                     event.location_type === 'hybrid' ? 'Hybrid' : 'TBD'}
                  </Badge>
                  {event.user_registration && (
                    <Badge className="bg-blue-100 text-blue-700">Attending ✓</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderQuickActions = () => (
    <div className="pathfinder-personal-dashboard__actions">
      <div className="pathfinder-personal-dashboard__action-cards">
        <Link to="/pathfinder/networking" state={{ openForm: true }} className="flex-1">
          <Button className="w-full pathfinder-personal-dashboard__action-card">
            + Add Hustle
          </Button>
        </Link>
        <Link to="/pathfinder/applications" state={{ openModal: true }} className="flex-1">
          <Button className="w-full pathfinder-personal-dashboard__action-card">
            + Add Job
          </Button>
        </Link>
      </div>
    </div>
  );

  // ── Layout ───────────────────────────────────────────────────────────────────

  return (
    <div className="pathfinder-personal-dashboard">
      {error && (
        <div className="pathfinder-personal-dashboard__error">{error}</div>
      )}

      {renderGoalStatementCard()}
      {renderResumeCta()}
      {renderFeaturedEvents()}
      {renderProgressSection()}
      {renderQuickActions()}

      <LoadingCurtain isLoading={isLoading} />
    </div>
  );
}

export default PathfinderPersonalDashboard;

import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AttendancePolicy.css';

const AttendancePolicy = () => {
  const navigate = useNavigate();

  // Force scroll to top on mount and after navigation
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });

  useEffect(() => {
    // Additional scroll attempts to ensure it sticks
    window.scrollTo(0, 0);
    const timer1 = setTimeout(() => window.scrollTo(0, 0), 0);
    const timer2 = setTimeout(() => window.scrollTo(0, 0), 10);
    const timer3 = setTimeout(() => window.scrollTo(0, 0), 100);

    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      // Mark this page as visited
      localStorage.setItem('onboarding-visited-task-2', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="attendance-policy">
      <div className="attendance-policy__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="attendance-policy__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="attendance-policy__content">
          <h1 className="attendance-policy__title">Pursuit Attendance Policy</h1>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Why Attendance Matters</h2>
            <p>
              Coming to class is very important. This program moves fast, and you learn by working with others. You need to be here to succeed.
            </p>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Attendance Rules</h2>
            <p>You must attend at least 80% of all classes.</p>
            <p><strong>Required Sessions:</strong></p>
            <ul>
              <li><strong>Monday-Wednesday:</strong> 6:30 PM - 10:00 PM (Building projects)</li>
              <li><strong>Saturday-Sunday:</strong> 10:00 AM - 4:00 PM (Professional skills)</li>
            </ul>
            <p><strong>How We Track Attendance:</strong></p>
            <ul>
              <li>Please be sure to log into our attendance app every day upon arrival onsite</li>
            </ul>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">When You Can Miss Class (Excused Absences)</h2>
            <p>You can miss class without penalty for these reasons:</p>
            <ul>
              <li><strong>Medical emergencies</strong> - You're sick or need to care for a family member</li>
              <li><strong>Family emergencies</strong> - A death or serious illness in your immediate family</li>
              <li><strong>Legal reasons</strong> - Court, jury duty, or other required legal appointments</li>
              <li><strong>Religious holidays</strong> - Days important to your religion</li>
              <li><strong>Special events</strong> - Important life events (weddings, graduations) with approval ahead of time</li>
            </ul>
            <p><strong>What You Need to Do:</strong></p>
            <ul>
              <li><strong>Tell us before you miss class</strong> - Send an email to Afiyah (afiyah@pursuit.org) at least 24 hours ahead of class time.</li>
              <li><strong>Emergency?</strong> - Let us know via Slack or Email as soon as you can</li>
              <li><strong>Need proof?</strong> - If you miss more than 2 classes in a row or miss many times, we may ask for documentation</li>
              <li><strong>Catch up on work</strong> - You must review what you missed, finish assignments, and work with your group to catch up</li>
            </ul>
            <p className="attendance-policy__note"><strong>Note:</strong> If you are going to be late, please slack Afiyah and let her know your ETA.</p>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Missing Class Without a Good Reason (Unexcused Absences)</h2>
            <p>
              If you don't have one of the approved reasons above OR you don't tell us ahead of time, your absence is unexcused.
            </p>
            <p><strong>What Happens:</strong></p>
            <ul>
              <li><strong>After 2 unexcused absences</strong> - You get a formal warning</li>
              <li><strong>After 3 unexcused absences</strong> - You'll meet with staff and create an improvement plan</li>
              <li><strong>3 unexcused absences in 2 weeks</strong> - Required meeting with staff about your commitment</li>
            </ul>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Serious Consequences</h2>
            <p>You can be removed from the program if:</p>
            <ul>
              <li>You don't follow your improvement plan</li>
              <li>Your attendance drops below 75%</li>
              <li>You have 5 or more unexcused absences in any 2-week period</li>
              <li>You're gone for 7 days in a row without approval</li>
            </ul>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Our Commitment to You</h2>
            <p>
              This policy helps everyone succeed. Because the program is intense and you work together, everyone needs to show up. We want to help you when things get hard, but we also need to prepare you for real jobs where showing up matters.
            </p>
          </section>

          <section className="attendance-policy__section">
            <h2 className="attendance-policy__section-title">Pursuit AI-Native Calendar</h2>
            <div className="attendance-policy__calendar-visualization">
              <div className="attendance-policy__calendar-grid">
                <div className="attendance-policy__calendar-day">Mon</div>
                <div className="attendance-policy__calendar-day">Tue</div>
                <div className="attendance-policy__calendar-day">Wed</div>
                <div className="attendance-policy__calendar-day">Thu</div>
                <div className="attendance-policy__calendar-day">Fri</div>
                <div className="attendance-policy__calendar-day">Sat</div>
                <div className="attendance-policy__calendar-day">Sun</div>
                
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--evening">6:30 PM - 10:00 PM</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--evening">6:30 PM - 10:00 PM</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--evening">6:30 PM - 10:00 PM</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--off">No Class</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--off">No Class</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--weekend">10:00 AM - 4:00 PM</div>
                <div className="attendance-policy__calendar-session attendance-policy__calendar-session--weekend">10:00 AM - 4:00 PM</div>
              </div>
            </div>
            <p className="attendance-policy__calendar-note">
              <strong>Note:</strong> This is your weekly schedule. Monday-Wednesday evenings and Saturday-Sunday days are required attendance.
            </p>
          </section>
        </div>

        <div className="attendance-policy__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/guide');
            }}
            className="attendance-policy__nav-button attendance-policy__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/slack');
            }}
            className="attendance-policy__nav-button attendance-policy__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePolicy;


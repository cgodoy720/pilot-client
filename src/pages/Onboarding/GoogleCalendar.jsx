import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './GoogleCalendar.css';

const GoogleCalendar = () => {
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
      localStorage.setItem('onboarding-visited-task-5', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="google-calendar">
      <div className="google-calendar__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="google-calendar__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="google-calendar__content">
          <h1 className="google-calendar__title">Using Your Google Calendar at Pursuit</h1>

          <section className="google-calendar__section">
            <h2 className="google-calendar__section-title">What is Google Calendar?</h2>
            <p>
              Google Calendar is one of the best tools for managing your time. You'll use it to keep track of your schedule, set up meetings with staff and other Builders, and stay organized throughout the program.
            </p>
            <p><strong>As a Pursuit Builder, we want you to feel comfortable:</strong></p>
            <ul>
              <li>Creating and update both individual and recurring meetings on Google Calendar.</li>
              <li>Adding and removing notifications from calendar events.</li>
              <li>Accepting, declining, and rescheduling meetings.</li>
              <li>Creating meetings with an associated Zoom meeting room, using the Zoom plugin.</li>
            </ul>
          </section>

          <section className="google-calendar__section">
            <h2 className="google-calendar__section-title">Getting Started with Google Calendar</h2>
            <p><strong>Watch and Learn:</strong> Watch the video below to learn how Google Calendar works. Practice the skills listed above so you feel comfortable using it.</p>
            
            <div className="google-calendar__video-container">
              <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/IyHvKYeeuB8"
                title="Google Calendar Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="google-calendar__video"
              ></iframe>
            </div>

            <p><strong>Pin Your Calendar:</strong> You'll use Google Calendar a lot, so make it easy to access! Pin the Google Calendar tab in Chrome so it shows up as a small icon at the top of your browser. This way, you can always see your schedule with one click.</p>
          </section>

          <section className="google-calendar__section">
            <h2 className="google-calendar__section-title">How You'll Use Calendar at Pursuit</h2>
            <p><strong>Receiving Invitations:</strong> You'll get meeting and event invitations through both Google Calendar and Gmail. When you get an invitation, you'll need to respond by accepting, declining, or suggesting a new time.</p>
            <p><strong>Setting Up Meetings with Zoom:</strong> When you need to meet with your team or schedule a project meeting, you can add a Zoom link right in the calendar invite. Use the Zoom integration to make this easy!</p>
            <p className="google-calendar__note"><strong>Note:</strong> All classes will be held in-person.</p>
          </section>

          <section className="google-calendar__section">
            <h2 className="google-calendar__section-title">Seeing Other People's Calendars</h2>
            <p>
              Because you have a Pursuit email, you can see when other Pursuit members are busy or free. This makes scheduling meetings much easier!
            </p>
            <p><strong>How to view someone's calendar:</strong></p>
            <ol>
              <li>Look for the search area above where your calendars are listed</li>
              <li>Type in the person's name or email address</li>
              <li>Select the right person from the results</li>
              <li>Their calendar will appear alongside yours so you can see their availability</li>
            </ol>
            
            <div className="google-calendar__image-container">
              <img 
                src="/google-calendar-meet-with.png" 
                alt="How to view someone's calendar in Google Calendar"
                className="google-calendar__image"
              />
            </div>

            <p><strong>Meeting with Staff:</strong> Many Pursuit staff members post "Office Hours" on their calendars. If you see an Office Hours event:</p>
            <ul>
              <li>Click on the event</li>
              <li>Click "Go to appointment page for this calendar"</li>
              <li>Book a time slot that works for you</li>
            </ul>
          </section>

          <section className="google-calendar__section">
            <h2 className="google-calendar__section-title">Calendar Etiquette</h2>
            <p>
              Please be sure to confirm your attendance to all events during the AI Native. Follow the Instructions below to practice accepting invitiations two ways.
            </p>
            <p><strong>Option 1 - From Your Email:</strong></p>
            <ol>
              <li>Sign into your Pursuit email at mail.google.com</li>
              <li>Find the calendar invitation in your inbox</li>
              <li>Click "YES" to accept</li>
            </ol>
            <p><strong>Option 2 - From Your Calendar:</strong></p>
            <ol>
              <li>Open your Pursuit email at mail.google.com</li>
              <li>Click the Calendar icon on the right side of your screen</li>
              <li>Find the event called [In-Person] AI Native Program - L1 (it starts December 6 and repeats)</li>
              <li>Click to accept the invitation</li>
            </ol>
          </section>
        </div>

        <div className="google-calendar__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/pursuit-email');
            }}
            className="google-calendar__nav-button google-calendar__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/kisi');
            }}
            className="google-calendar__nav-button google-calendar__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendar;


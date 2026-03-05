import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PursuitEmail.css';

const PursuitEmail = () => {
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
      localStorage.setItem('onboarding-visited-task-4', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="pursuit-email">
      <div className="pursuit-email__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="pursuit-email__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="pursuit-email__content">
          <h1 className="pursuit-email__title">Your Pursuit Email</h1>
          
          <div className="pursuit-email__intro">
            <p>
              One of the many benefits of joining our community as a Builder is getting a Pursuit-branded email account. Your email format will be first.last@pursuit.org. Email is a critical part of professional communication, and learning to use it well now will not only help you get a job, but be a high-performing employee.
            </p>
          </div>

          <section className="pursuit-email__section">
            <h2 className="pursuit-email__section-title">Gmail at Pursuit</h2>
            <p>
              We use Gmail as our Pursuit email platform. Gmail is a powerful service that allows you to do more than just send emails. You'll use your Gmail account for a number of tasks, such as:
            </p>
            <ul>
              <li>Confirming accounts for a variety of services.</li>
              <li>Official coordination with Pursuit staff.</li>
              <li>Viewing and taking action on notifications from Canvas and GitHub.</li>
            </ul>
            <p>
              It's important to frequently view your Gmail account and respond quickly whenever appropriate.
            </p>
          </section>

          <section className="pursuit-email__section">
            <h2 className="pursuit-email__section-title">Accessing Your Email</h2>
            <p>Sign into Gmail to access your Pursuit Email:</p>
          </section>

          <section className="pursuit-email__section">
            <h2 className="pursuit-email__section-title">How to Access Your Email</h2>
            
            <div className="pursuit-email__step">
              <h3 className="pursuit-email__step-title">Step 1: Go to Gmail</h3>
              <p>Open your web browser and go to mail.google.com</p>
            </div>

            <div className="pursuit-email__step">
              <h3 className="pursuit-email__step-title">Step 2: Enter Your Email Address</h3>
              <p>Your email address follows this pattern: <strong>FirstName.LastName@pursuit.org</strong></p>
              <p><strong>Special cases for your name:</strong></p>
              <ul>
                <li><strong>Space or hyphen in first name?</strong> Combine them together
                  <ul>
                    <li>Example: Min Yi becomes minyi.lastname@pursuit.org</li>
                  </ul>
                </li>
                <li><strong>Space or hyphen in last name?</strong> Use the first letter of each part
                  <ul>
                    <li>Example: Rowe-Owen becomes firstname.ro@pursuit.org</li>
                  </ul>
                </li>
                <li><strong>Have Jr., Sr., II, III, etc.?</strong> Don't include these in your email</li>
                <li><strong>Worried about capital letters?</strong> Don't be! Emails aren't case sensitive, so JOHN.DOE and john.doe work the same way</li>
              </ul>
            </div>

            <div className="pursuit-email__step">
              <h3 className="pursuit-email__step-title">Step 3: Use the Temporary Password</h3>
              <p>When it asks for your password, type: <strong>Welcome!</strong></p>
            </div>

            <div className="pursuit-email__step">
              <h3 className="pursuit-email__step-title">Step 4: Create Your Own Password</h3>
              <p>You'll be asked to create a new password right away. Choose something secure and write it down somewhere safe!</p>
            </div>

            <div className="pursuit-email__step">
              <h3 className="pursuit-email__step-title">Step 5: Explore</h3>
              <p>
                Now that you've logged in, please explore the platform. As a Builder, you'll want to feel comfortable doing the following:
              </p>
              <ul>
                <li>Sending emails to individual recipients, as well as using the CC and BCC fields.</li>
                <li>Mark emails as read and unread.</li>
                <li>Archiving emails from your inbox to All Mail.</li>
                <li>Formatting emails with styled text, links, and attachments.</li>
              </ul>
              <p>
                Your google account gives you access to all apps within Google Drive (docs, sheets, calendar, etc.), which we will explore in future onboarding steps.
              </p>
            </div>
          </section>

          <section className="pursuit-email__section">
            <h2 className="pursuit-email__section-title">Need Help?</h2>
            <p>Having trouble? Message Victoria Mayo on Slack for help.</p>
          </section>
        </div>

        <div className="pursuit-email__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/slack');
            }}
            className="pursuit-email__nav-button pursuit-email__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/google-calendar');
            }}
            className="pursuit-email__nav-button pursuit-email__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PursuitEmail;


import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdditionalSystems.css';

const AdditionalSystems = () => {
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
      localStorage.setItem('onboarding-visited-task-9', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="additional-systems">
      <div className="additional-systems__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="additional-systems__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="additional-systems__content">
          <h1 className="additional-systems__title">Setting Up Chrome and Google Tools (Optional)</h1>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">What is a Browser?</h2>
            <p>
              A browser is the program you use to access the internet. Common browsers include Chrome, Firefox, Safari, and Edge. At Pursuit, we recommend using Google Chrome because it works seamlessly with all the Google tools you'll be using (Gmail, Calendar, Drive, etc.).
            </p>
          </section>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">Installing Chrome</h2>
            <p>If you don't have Chrome installed:</p>
            <ol>
              <li>Go to <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">google.com/chrome</a></li>
              <li>Click "Download Chrome"</li>
              <li>Follow the installation instructions for your computer</li>
              <li>Once installed, open Chrome</li>
            </ol>
            
            <div className="additional-systems__image-container">
              <img src="/chrome.png" alt="Chrome download page" className="additional-systems__image" />
            </div>
          </section>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">Signing In to Chrome</h2>
            <p>
              Signing in to Chrome syncs your bookmarks, passwords, and settings across all your devices. This is especially helpful if you use multiple computers.
            </p>
            <p><strong>To sign in:</strong></p>
            <ol>
              <li>Click the profile icon in the top-right corner of Chrome</li>
              <li>Click "Sign in to Chrome"</li>
              <li>Use your Pursuit email address and password</li>
              <li>Your settings will now sync across devices!</li>
            </ol>
            
            <div className="additional-systems__image-container">
              <img src="/syncchrome.png" alt="Signing in to Chrome" className="additional-systems__image" />
            </div>
          </section>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">Using Tabs</h2>
            <p>
              Tabs let you have multiple websites open at once. You can switch between them easily.
            </p>
            <p><strong>Tab Shortcuts:</strong></p>
            <ul>
              <li><strong>Open new tab:</strong> Ctrl+T (Windows) or Cmd+T (Mac)</li>
              <li><strong>Close tab:</strong> Ctrl+W (Windows) or Cmd+W (Mac)</li>
              <li><strong>Switch tabs:</strong> Ctrl+Tab (Windows) or Cmd+Option+Right Arrow (Mac)</li>
            </ul>
            
            <div className="additional-systems__image-container">
              <img src="/tabs.png" alt="Chrome tabs" className="additional-systems__image" />
            </div>
          </section>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">Pinning Tabs</h2>
            <p>
              Pinning tabs keeps your most important websites open and easy to access. Pinned tabs stay open even when you close and reopen Chrome.
            </p>
            <p><strong>To pin a tab:</strong></p>
            <ol>
              <li>Right-click on the tab you want to pin</li>
              <li>Select "Pin"</li>
              <li>The tab will shrink to show just the icon</li>
            </ol>
            <p><strong>Recommended tabs to pin:</strong></p>
            <ul>
              <li>Gmail (mail.google.com)</li>
              <li>Google Calendar (calendar.google.com)</li>
              <li>Slack (pursuit-core.slack.com)</li>
            </ul>
            
            <div className="additional-systems__image-container">
              <img src="/pintabs.png" alt="Pinned tabs in Chrome" className="additional-systems__image" />
            </div>
          </section>

          <section className="additional-systems__section">
            <h2 className="additional-systems__section-title">Google Drive</h2>
            <p>
              Google Drive is where you'll store and share files. It's part of your Google account, so you already have access! You can access it at <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer">drive.google.com</a>.
            </p>
            <p><strong>What you can do with Google Drive:</strong></p>
            <ul>
              <li>Store files in the cloud (accessible from any device)</li>
              <li>Share files and folders with others</li>
              <li>Create Google Docs, Sheets, and Slides</li>
              <li>Collaborate in real-time with teammates</li>
            </ul>
            <p>
              We'll explore Google Drive more in future onboarding steps, but feel free to explore on your own!
            </p>
          </section>
        </div>

        <div className="additional-systems__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/engage-tech-news');
            }}
            className="additional-systems__nav-button additional-systems__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding');
            }}
            className="additional-systems__nav-button additional-systems__nav-button--home"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdditionalSystems;


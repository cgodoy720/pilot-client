import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Kisi.css';

const Kisi = () => {
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
      localStorage.setItem('onboarding-visited-task-6', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="kisi">
      <div className="kisi__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="kisi__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="kisi__content">
          <h1 className="kisi__title">Introduction to Kisi & Accessing the Site</h1>

          <section className="kisi__section">
            <p>
              You may have noticed that the main doors to our office are now locked at all times. This allows us to better manage the guests that come in and out of our space and make sure the office is safe for everyone. Please refrain from propping the doors open and use discretion when holding the door or letting people into the office. If you ever have concerns, reach out to Victoria Mayo for assistance.
            </p>
          </section>

          <section className="kisi__section">
            <h2 className="kisi__section-title">Accessing The Office</h2>
            
            <div className="kisi__step">
              <h3 className="kisi__step-title">Download Kisi</h3>
              <p>Download Kisi on your mobile device</p>
              <p>Check your email inbox for a link from Kisi to finish setting up your account</p>
              <p><strong>BUILDERS:</strong> your account is likely tied to your Pursuit account. Please check that inbox first!</p>
            </div>

            <div className="kisi__step">
              <h3 className="kisi__step-title">Sign in</h3>
              <p>The home screen should look like this:</p>
              
              <div className="kisi__image-container">
                <img src="/homescreen.png" alt="Kisi home screen" className="kisi__image" />
              </div>

              <p>Click on Pursuit. You will see a screen that looks like this:</p>
              
              <div className="kisi__image-container">
                <img src="/kisi.png" alt="Kisi Pursuit screen" className="kisi__image" />
              </div>

              <ol>
                <li>Click on the door you'd like to unlock.</li>
                <li>The purple "locked" icon will briefly turn green and read "unlocked"</li>
                <li>Open the door and make sure it closes behind you :)</li>
              </ol>
            </div>
          </section>

          <section className="kisi__section">
            <h2 className="kisi__section-title">Main Entrance Doors</h2>
            <p>
              To access the main entrance door (located at 47-10 Austell), you may need to go to the keypad to the left of the door and enter <strong>5353#</strong>. The doors are usually set to be locked before 9 AM and after 7 PM daily. Additionally, the door code (above) may change occasionally. When this happens, please look out for a message on Slack and/or Email from Victoria@pursuit.org OR Slack Victoria directly for assistance.
            </p>
          </section>
        </div>

        <div className="kisi__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/google-calendar');
            }}
            className="kisi__nav-button kisi__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/building-in-public');
            }}
            className="kisi__nav-button kisi__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Kisi;


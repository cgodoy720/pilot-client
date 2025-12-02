import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuildingInPublic.css';

const BuildingInPublic = () => {
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
      localStorage.setItem('onboarding-visited-task-7', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="building-in-public">
      <div className="building-in-public__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="building-in-public__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="building-in-public__content">
          <h1 className="building-in-public__title">Building In Public</h1>

          <section className="building-in-public__section">
            <p>
              A big part of this pilot is for you to build and share your work and reflections publicly. Reflecting on your failures and growth, sharing what you're learning, and showcasing your progress and your actual product will create meaningful opportunities to connect with the tech community, industry leaders, and potential employers. This is one of the best ways for Builders to network, attract job opportunities, and get hired.
            </p>
          </section>

          <section className="building-in-public__section">
            <h2 className="building-in-public__section-title">Creating a LinkedIn Account</h2>
            <ol>
              <li>Head over to <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn.com</a></li>
              <li>Create an account.</li>
              <li><strong>Build out your user profile, including:</strong>
                <ul>
                  <li>Updating your professional/work history</li>
                  <li>Adding your educational background</li>
                  <li>Including your X account where you'll share your AI builds</li>
                </ul>
              </li>
              <li>Follow Pursuit on LinkedIn.</li>
            </ol>
          </section>

          <section className="building-in-public__section">
            <h2 className="building-in-public__section-title">Creating an X (Twitter) Account (optional)</h2>
            <ol>
              <li>Head over to <a href="https://x.com" target="_blank" rel="noopener noreferrer">X.com</a></li>
              <li>Create a user account</li>
              <li><strong>Follow These Accounts on X:</strong>
                <ul>
                  <li><a href="https://x.com/deepseek_ai" target="_blank" rel="noopener noreferrer">@deepseek_ai</a></li>
                  <li><a href="https://x.com/cursor_ai" target="_blank" rel="noopener noreferrer">@cursor_ai</a></li>
                  <li><a href="https://x.com/gdb" target="_blank" rel="noopener noreferrer">@gdb</a></li>
                  <li><a href="https://x.com/darioamodei" target="_blank" rel="noopener noreferrer">@darioamodei</a></li>
                  <li><a href="https://x.com/snowmaker" target="_blank" rel="noopener noreferrer">@snowmaker</a></li>
                  <li><a href="https://x.com/demishassabis" target="_blank" rel="noopener noreferrer">@demishassabis</a></li>
                  <li><a href="https://x.com/ban_Kawas" target="_blank" rel="noopener noreferrer">@ban_Kawas</a></li>
                  <li><a href="https://x.com/cognition_labs" target="_blank" rel="noopener noreferrer">@cognition_labs</a></li>
                </ul>
              </li>
            </ol>
          </section>
        </div>

        <div className="building-in-public__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/kisi');
            }}
            className="building-in-public__nav-button building-in-public__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/engage-tech-news');
            }}
            className="building-in-public__nav-button building-in-public__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingInPublic;


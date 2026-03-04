import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Slack.css';

const Slack = () => {
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
      localStorage.setItem('onboarding-visited-task-3', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="slack">
      <div className="slack__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="slack__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="slack__content">
          <h1 className="slack__title">Getting Started with Slack at Pursuit</h1>

          <section className="slack__section">
            <h2 className="slack__section-title">What is Slack?</h2>
            <p>
              Slack is a messaging app that most tech companies use for work communication. It's like texting, but for your job! You'll use Slack every day at Pursuit to talk with other Builders, staff, and mentors.
            </p>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">Getting Slack on Your Computer</h2>
            
            <div className="slack__step">
              <h3 className="slack__step-title">Step 1: Join Pursuit's Slack</h3>
              <p>Look in your Pursuit email for a message that says "You're invited to join Pursuit Fellowship on Slack."</p>
              <p>Can't find it? Email systems@pursuit.org for help.</p>
              <p><strong>To join:</strong></p>
              <ol>
                <li>Click the "Join Now" button in the email, OR go to pursuit-core.slack.com</li>
                <li>Choose "Sign in with Google"</li>
                <li>Use your Pursuit email to log in</li>
                <li>Google will connect your accounts and take you to Slack</li>
                <li>You're now in Slack!</li>
              </ol>
            </div>

            <div className="slack__step">
              <h3 className="slack__step-title">Step 2: Download the Desktop App</h3>
              <p>Most people use Slack as a desktop app instead of in a web browser. At Pursuit, you must download the desktop app.</p>
              <p><strong>To download:</strong></p>
              <ol>
                <li>Go to the App Store on your computer</li>
                <li>Search for "Slack"</li>
                <li>Download and install it</li>
                <li>Open the Slack app</li>
                <li>Log in again using your Pursuit email (same way as before)</li>
                <li>Done! Now you have Slack on your computer.</li>
              </ol>
            </div>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">How to Use Slack at Pursuit</h2>
            <p>
              You'll use Slack to communicate with other Builders, alumni, Pursuit staff, and your mentors. Along with email, it's one of the main ways we'll stay in touch.
            </p>
            
            <div className="slack__comparison">
              <div className="slack__comparison-box">
                <h3 className="slack__comparison-title">Slack vs. Email - When to Use Each</h3>
                <div className="slack__comparison-content">
                  <div>
                    <h4>Use Slack for:</h4>
                    <ul>
                      <li>Quick questions about assignments</li>
                      <li>Sharing interesting articles with your class</li>
                      <li>Group chats with teammates</li>
                      <li>Casual conversations with other Builders</li>
                      <li>Reaching out to Pursuit alumni</li>
                    </ul>
                  </div>
                  <div>
                    <h4>Use Email for:</h4>
                    <ul>
                      <li>Non-urgent questions</li>
                      <li>Formal requests (like asking for an extension)</li>
                      <li>Professional messages</li>
                      <li>Anything official you want to keep forever</li>
                    </ul>
                  </div>
                </div>
                <p className="slack__important-note">
                  <strong>Important:</strong> Slack messages don't last forever! If it's official or important, send it by email.
                </p>
              </div>
            </div>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">Understanding Slack's Main Features</h2>
            
            <div className="slack__feature">
              <h3 className="slack__feature-title">1. Channels (# symbol)</h3>
              <p>Channels are like group chat rooms. Each channel has a specific topic.</p>
              <p><strong>Examples:</strong></p>
              <ul>
                <li>#general - Announcements for everyone</li>
                <li>#jobs_tech - Job postings in technology</li>
                <li>Your class channel - Private chat just for your class</li>
              </ul>
              
              <div className="slack__image-container">
                <img src="/Coding.png" alt="Channels in Slack" className="slack__image" />
              </div>

              <p><strong>To find more channels:</strong></p>
              <ol>
                <li>Click the + next to "Channels"</li>
                <li>Click "Add channels"</li>
                <li>Click "Browse channels"</li>
                <li>Join any that interest you!</li>
              </ol>
              
              <div className="slack__image-container">
                <img src="/addchannels.png" alt="Adding channels in Slack" className="slack__image" />
              </div>
            </div>

            <div className="slack__feature">
              <h3 className="slack__feature-title">2. Direct Messages (DMs)</h3>
              <p>Direct messages are private conversations between you and one or more people. They're great for quick, casual chats.</p>
              <p><strong>To start a direct message:</strong></p>
              <ol>
                <li>Click the + next to "Direct messages"</li>
                <li>Search for the person's name</li>
                <li>Start typing!</li>
              </ol>
              <p>You can also message multiple people at once to create a group chat.</p>
              
              <div className="slack__image-container">
                <img src="/directmessages.png" alt="Direct messages in Slack" className="slack__image" />
              </div>

              <p><strong>Try it:</strong> Say hello to Slackbot! It's Slack's helpful robot. Send it a message and see if it responds!</p>
              
              <div className="slack__image-container">
                <img src="/slackbot.png" alt="Slackbot in Slack" className="slack__image" />
              </div>
            </div>

            <div className="slack__feature">
              <h3 className="slack__feature-title">3. Threads</h3>
              <p>Threads keep conversations organized, like email replies. They help you respond to specific messages without filling up the whole channel.</p>
              
              <div className="slack__image-container">
                <img src="/threads.png" alt="Threads in Slack" className="slack__image" />
              </div>

              <p><strong>To reply in a thread:</strong></p>
              <ol>
                <li>Hover over the message you want to reply to</li>
                <li>Click the speech bubble icon</li>
                <li>Type your response in the window that appears on the right</li>
              </ol>
              
              <div className="slack__image-container">
                <img src="/replythreads.png" alt="Replying in threads in Slack" className="slack__image" />
              </div>
            </div>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">Setting Up Your Profile</h2>
            <p>
              In the top-right corner of Slack, click the square that contains a single letter or a picture in it. Then, select "Edit profile." Update your name and insert your class number and preferred pronouns. Finally, upload an appropriate picture of yourself. Once you have your official Pursuit portrait, you should use that picture!
            </p>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">Customizing Your Settings</h2>
            <p>To open settings, click "Slack" at the top-left of your screen, then select "Preferences."</p>
            
            <div className="slack__feature">
              <h3 className="slack__feature-title">Notifications</h3>
              <p>
                With so many people in Pursuit's Slack, you'll get lots of messages! You might want to limit notifications so you only get alerted when someone mentions you directly.
              </p>
              <p><strong>To change notifications:</strong></p>
              <ol>
                <li>Go to the "Notifications" tab</li>
                <li>Select "Direct messages, mentions & keywords"</li>
                <li>Now you'll only be notified when someone specifically messages or mentions you!</li>
              </ol>
              
              <div className="slack__image-container">
                <img src="/notifications.png" alt="Notifications settings in Slack" className="slack__image" />
              </div>
            </div>

            <div className="slack__feature">
              <h3 className="slack__feature-title">Themes</h3>
              <p>Make Slack look the way you want! Under "Themes," you can:</p>
              <ul>
                <li>Choose Light or Dark mode</li>
                <li>Pick different colors</li>
                <li>Customize your experience</li>
              </ul>
            </div>
          </section>

          <section className="slack__section">
            <h2 className="slack__section-title">Reacting to Messages</h2>
            <p>Reactions are a quick way to respond without typing. You can add emoji reactions to any message!</p>
            <p><strong>To react:</strong></p>
            <ol>
              <li>Hover over a message</li>
              <li>Click the smiley face icon</li>
              <li>Choose an emoji</li>
            </ol>
            <p>You can also click on existing reactions to add the same one!</p>
            
            <div className="slack__image-container">
              <img src="/reacts.png" alt="Reacting to messages in Slack" className="slack__image" />
            </div>

            <p><strong>Try it:</strong> React to a message in one of your channels. Not sure where? Practice by adding reactions in your chat with Slackbot!</p>
          </section>
        </div>

        <div className="slack__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/attendance-policy');
            }}
            className="slack__nav-button slack__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/pursuit-email');
            }}
            className="slack__nav-button slack__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slack;


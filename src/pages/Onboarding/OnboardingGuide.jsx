import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OnboardingGuide.css';

const OnboardingGuide = () => {
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
      localStorage.setItem('onboarding-visited-program-details', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="onboarding-guide">
      <div className="onboarding-guide__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="onboarding-guide__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="onboarding-guide__content">
          <h1 className="onboarding-guide__title">Pursuit AI Program - Onboarding Guide</h1>

          <section className="onboarding-guide__section">
            <p>
              This resource is to remind you how the Pursuit AI Program works and to review the expectations and responsibilities of each Builder. Please review it carefully to make sure you are aligned with program operations.
            </p>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">I. Program Overview</h2>
            <p>
              The Pursuit AI Program teaches you how to use AI tools and build projects. You'll learn skills to help you get a good job in tech.
            </p>
            <p><strong>What makes this program special:</strong></p>
            <ul>
              <li><strong>AI-Powered Individual Learning:</strong> Utilizing AI tools for personalized learning pathways and skill development.</li>
              <li><strong>Self-Driven, Active Learning Through Building:</strong> Focusing on practical application and project-based learning.</li>
              <li><strong>Many-to-Many Learning and Teaching:</strong> Fostering a collaborative environment where Builders learn from and teach each other.</li>
              <li><strong>Industry Network-Integrated:</strong> Connecting Builders with industry professionals, mentors, and potential employers.</li>
              <li><strong>Adaptive Approach to Learning:</strong> Continuously adjusting the curriculum and approach based on real-time feedback and the evolving AI landscape.</li>
            </ul>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">II. Schedule & Calendar</h2>
            <p><strong>Program Starts:</strong> March 14, 2026</p>
            <p><strong>Program Length:</strong> Initial 2-month program.</p>
            <p className="onboarding-guide__note"><strong>Note:</strong> There will be a gap between the end of L1 and the start of L2. The L2 start date is still being finalized.</p>
            <p><strong>Weekly Schedule:</strong></p>
            <ul>
              <li><strong>Monday – Wednesday:</strong> 6:30 PM – 10:00 PM (In-person, Long Island City)</li>
              <li><strong>Saturday – Sunday:</strong> 10:00 AM – 4:00 PM (In-person, Long Island City)</li>
              <li>Plus time for learning and building projects on your own</li>
            </ul>
            <p><strong>What You'll Do Each Month:</strong></p>
            <ul>
              <li><strong>Months 1-2:</strong> Learn AI Basics
                <ul>
                  <li>Understand how AI works</li>
                  <li>Try different AI tools</li>
                  <li>Start planning your first project</li>
                </ul>
              </li>
              <li><strong>Months 3-4:</strong> Build with AI
                <p className="onboarding-guide__note"><strong>Note:</strong> Progressing to months 3-7 is contingent on admission. See Month 2 Review Guidelines below.</p>
                <ul>
                  <li>Create real AI projects</li>
                  <li>Work with mentors</li>
                  <li>Meet people in the tech industry</li>
                </ul>
              </li>
              <li><strong>Months 5-7:</strong> Show Your Work
                <ul>
                  <li>Build your portfolio</li>
                  <li>Share your projects</li>
                  <li>Practice interviews and find jobs</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">III. Payment Agreement & Moving Forward</h2>
            <p><strong>Before You Start:</strong></p>
            <ul>
              <li>Everyone must sign the Good Jobs Agreement before Level 1 starts</li>
              <li>You can leave the program anytime during Months 1-2 with no cost</li>
            </ul>
            <p><strong>Important Rules:</strong></p>
            <ul>
              <li>If you continue to Month 3 (Level 2), the payment agreement starts - even if you don't finish the program</li>
              <li>Payment Terms only go into effect if a Builder is offered and accepts a seat in L2.</li>
            </ul>
            <p><strong>Month 2 Review:</strong></p>
            <p>During Month 2, we'll check how you're doing based on:</p>
            <ul>
              <li>Completion and quality of weekly video submissions</li>
              <li>Demonstrated understanding of AI concepts</li>
              <li>Ability to clearly articulate ideas and present viable work</li>
              <li>Consistent attendance (80% or higher)</li>
              <li>Active community engagement and openness to feedback</li>
            </ul>
            <p>We'll choose who moves on to Months 3-7. If you don't move forward, you can't continue in this program, but you can check out other Pursuit programs.</p>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">IV. How the Payment Works</h2>
            <p><strong>The Good News:</strong></p>
            <ul>
              <li>No money needed to start</li>
              <li>Only pay if you get a high-paying job ($85,000 or more per year)</li>
              <li>If you don't get a job, you pay nothing</li>
              <li>If you lose your job, payments stop until you get a new one</li>
            </ul>
            <p><strong>Payment Details:</strong></p>
            <ul>
              <li><strong>Rate:</strong> 15% of what you earn each year</li>
              <li><strong>You stop paying when:</strong>
                <ul>
                  <li>You've paid for 36 months, OR</li>
                  <li>5 years have passed since you started, OR</li>
                  <li>You've paid $55,000 total</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">V. Laptops & Space</h2>
            <p><strong>Laptops:</strong></p>
            <ul>
              <li>Bring your own laptop if you have one</li>
              <li>Need to borrow one? <a href="https://docs.google.com/forms/d/e/1FAIpQLSfffn7wXk7wF35LuH-HwtioJbToYF7sRporUNNDat_0AqZTQg/viewform" target="_blank" rel="noopener noreferrer">Fill out this form</a> - we'll try to help, but we have limited laptops</li>
              <li>Borrowed laptops must stay at Pursuit - you can't take them home</li>
            </ul>
          </section>

          <section className="onboarding-guide__section">
            <h2 className="onboarding-guide__section-title">VI. Attendance</h2>
            <p>
              Coming to class is very important. Your group depends on you being there.
            </p>
            <p><strong>Rules:</strong></p>
            <ul>
              <li>You must come to all in-person classes</li>
              <li>We will track who shows up</li>
              <li>If you need to miss class, tell us ahead of time</li>
              <li>Being present helps you and helps everyone in your group succeed.</li>
            </ul>
          </section>
        </div>

        <div className="onboarding-guide__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/attendance-policy');
            }}
            className="onboarding-guide__nav-button onboarding-guide__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;


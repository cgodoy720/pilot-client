import { useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EngageTechNews.css';

const EngageTechNews = () => {
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
      localStorage.setItem('onboarding-visited-task-8', 'true');
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [navigate]);

  return (
    <div className="engage-tech-news">
      <div className="engage-tech-news__container">
        <button
          onClick={() => navigate('/onboarding')}
          className="engage-tech-news__back-button"
        >
          ← Back to Onboarding
        </button>

        <div className="engage-tech-news__content">
          <h1 className="engage-tech-news__title">Engage with Tech News</h1>

          <section className="engage-tech-news__section">
            <p>
              In this program, you're not only learning how to build with AI—you're learning how to be and thrive in tech. If tech and business are a culture, you have to learn the language, know the customs, and understand the underlying dynamics. Our goal is to make your tech and business fluent.
            </p>
            <p>
              To achieve this, you'll be actively engaging with industry-leading blogs, newsletters, and podcasts. This will help you:
            </p>
            <ul>
              <li>Develop a habit of continuous learning.</li>
              <li>Stay informed about trends, insights, and key players in tech and business.</li>
              <li>Cultivate critical thinking by analyzing and discussing industry ideas.</li>
              <li>Learn how to think like a tech professional.</li>
            </ul>
          </section>

          <section className="engage-tech-news__section">
            <h2 className="engage-tech-news__section-title">To get started, we suggest subscribing to the following:</h2>
            <ul>
              <li>
                <strong><a href="https://www.ycombinator.com/newsletters" target="_blank" rel="noopener noreferrer">Y Combinator Newsletter</a></strong>
                <br />
                YC is the most well-known startup accelerator. Their newsletter shares insights, success stories, and tech trends.
              </li>
              <li>
                <strong><a href="https://a16z.com/newsletters/" target="_blank" rel="noopener noreferrer">a16z Newsletter</a></strong>
                <br />
                Andreessen Horowitz (a16z) is one of the most influential venture capital firms in tech. Their content provides deep analysis on industry trends and emerging technologies.
              </li>
              <li>
                <strong><a href="https://www.allinpodcast.co/" target="_blank" rel="noopener noreferrer">All-In Podcast</a></strong>
                <br />
                A candid, unfiltered discussion by prominent tech investors and operators about business, tech, and global issues.
              </li>
              <li>
                <strong><a href="http://www.paulgraham.com/articles.html" target="_blank" rel="noopener noreferrer">Paul Graham's Essays</a></strong>
                <br />
                Paul Graham is a co-founder of Y Combinator and one of the most influential thinkers in startups. His essays provide deep insights into entrepreneurship, innovation, and work.
              </li>
            </ul>
          </section>

          <section className="engage-tech-news__section">
            <h2 className="engage-tech-news__section-title">Expectations for Engagement</h2>
            <p>
              Throughout the program, we'll actively discuss these articles, podcasts, and readings. Your participation will help you develop the habit of keeping up to date and continuously expanding your knowledge base.
            </p>
          </section>

          <section className="engage-tech-news__section">
            <h2 className="engage-tech-news__section-title">How to Engage:</h2>
            <ul>
              <li><strong>Read & Listen Regularly:</strong> Set aside time each week to engage with the recommended content.</li>
              <li><strong>Take Notes:</strong> Jot down key insights, questions, or ideas that stand out to you.</li>
              <li><strong>Discuss in Sessions:</strong> Be ready to share your thoughts, critique ideas, and ask questions during our discussions.</li>
              <li><strong>Apply What You Learn:</strong> Think about how the concepts relate to AI, startups, and your personal career goals.</li>
            </ul>
            <p>
              Becoming fluent in tech and business isn't about memorizing facts—it's about immersing yourself in the conversations, ideas, and debates shaping the industry. Approach this with curiosity, and over time, you'll develop a strong understanding of how the industry operates.
            </p>
            <p>
              <strong>Let's get started! 🚀</strong>
            </p>
          </section>
        </div>

        <div className="engage-tech-news__navigation">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/building-in-public');
            }}
            className="engage-tech-news__nav-button engage-tech-news__nav-button--prev"
          >
            ← Previous Section
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate('/onboarding/additional-systems');
            }}
            className="engage-tech-news__nav-button engage-tech-news__nav-button--next"
          >
            Next Section →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EngageTechNews;


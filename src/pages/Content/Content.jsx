import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSONGenerator from './JSONGenerator/JSONGenerator';
import SessionTester from './SessionTester/SessionTester';
import './Content.css';

const Content = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/content/session-tester')) {
      return 'session-tester';
    }
    return 'json-generator'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/content/${tab === 'json-generator' ? 'json-generator' : 'session-tester'}`);
  };

  return (
    <div className="content-generation">
      <div className="content-generation__header">
        <h1 className="content-generation__title">Content Generation Suite</h1>
        <p className="content-generation__subtitle">
          Create and test curriculum content with AI-powered tools
        </p>
      </div>

      <div className="content-generation__nav">
        <div className="content-generation__tabs">
          <button
            className={`content-generation__tab ${activeTab === 'json-generator' ? 'content-generation__tab--active' : ''}`}
            onClick={() => handleTabChange('json-generator')}
          >
            <span className="content-generation__tab-number">1</span>
            JSON Generator
          </button>
          <button
            className={`content-generation__tab ${activeTab === 'session-tester' ? 'content-generation__tab--active' : ''}`}
            onClick={() => handleTabChange('session-tester')}
          >
            <span className="content-generation__tab-number">2</span>
            Session Tester
          </button>
          <button
            className="content-generation__tab content-generation__tab--disabled"
            disabled
          >
            <span className="content-generation__tab-number">3</span>
            Enhancement Suite
            <span className="content-generation__tab-badge">Coming Soon</span>
          </button>
        </div>
      </div>

      <div className="content-generation__content">
        {activeTab === 'json-generator' && <JSONGenerator />}
        {activeTab === 'session-tester' && <SessionTester />}
      </div>
    </div>
  );
};

export default Content; 
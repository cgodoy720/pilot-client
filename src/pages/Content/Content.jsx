import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import JSONGenerator from './JSONGenerator/JSONGenerator';
import SessionTester from './SessionTester/SessionTester';
import FacilitatorNotesGenerator from './FacilitatorNotesGenerator/FacilitatorNotesGenerator';
import './Content.css';

const Content = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Shared state for data continuity between tabs
  const [sharedData, setSharedData] = useState({
    originalContent: '',
    generatedJSON: '',
    editedJSON: '',
    inputMethod: 'text',
    textInput: '',
    urlInput: '',
    fileInput: null
  });
  
  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    if (location.pathname.includes('/content/session-tester')) {
      return 'session-tester';
    } else if (location.pathname.includes('/content/facilitator-notes')) {
      return 'facilitator-notes';
    }
    return 'json-generator'; // default
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());

  // Load data from sessionStorage on mount
  useEffect(() => {
    const originalContent = sessionStorage.getItem('originalContent') || '';
    const generatedSessionData = sessionStorage.getItem('generatedSessionData') || '';
    
    setSharedData(prev => ({
      ...prev,
      originalContent,
      generatedJSON: generatedSessionData,
      editedJSON: generatedSessionData
    }));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without losing tab-specific routes
    if (tab === 'facilitator-notes') {
      navigate('/content/facilitator-notes');
    } else if (tab === 'session-tester') {
      navigate('/content/session-tester');
    } else {
      navigate('/content');
    }
  };

  // Callback functions for child components to update shared data
  const updateSharedData = (updates) => {
    setSharedData(prev => ({ ...prev, ...updates }));
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
            className={`content-generation__tab ${activeTab === 'facilitator-notes' ? 'content-generation__tab--active' : ''}`}
            onClick={() => handleTabChange('facilitator-notes')}
          >
            <span className="content-generation__tab-number">3</span>
            Facilitator Notes
          </button>
        </div>
      </div>

      <div className="content-generation__content">
        {activeTab === 'json-generator' && (
          <JSONGenerator 
            sharedData={sharedData}
            updateSharedData={updateSharedData}
          />
        )}
        {activeTab === 'session-tester' && (
          <SessionTester 
            sharedData={sharedData}
            updateSharedData={updateSharedData}
          />
        )}
        {activeTab === 'facilitator-notes' && (
          <FacilitatorNotesGenerator 
            sharedData={sharedData}
            updateSharedData={updateSharedData}
          />
        )}
      </div>
    </div>
  );
};

export default Content; 
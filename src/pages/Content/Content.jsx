import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import JSONGenerator from './JSONGenerator/JSONGenerator';
import SessionTester from './SessionTester/SessionTester';
import FacilitatorNotesGenerator from './FacilitatorNotesGenerator/FacilitatorNotesGenerator';
import CurriculumEditor from './CurriculumEditor';

const Content = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check if user has access to curriculum editor
  const canAccessCurriculumEditor = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'volunteer';
  
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
    } else if (location.pathname.includes('/content/curriculum-editor')) {
      return 'curriculum-editor';
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
    } else if (tab === 'curriculum-editor') {
      navigate('/content/curriculum-editor');
    } else if (tab === 'json-generator') {
      navigate('/content');
    }
  };

  // Callback functions for child components to update shared data
  const updateSharedData = (updates) => {
    setSharedData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
      <div className="max-w-[1400px] mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-white border border-[#C8C8C8] p-1 h-auto flex-wrap justify-start">
            <TabsTrigger 
              value="json-generator" 
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              JSON Generator
            </TabsTrigger>
            <TabsTrigger 
              value="session-tester"
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Session Tester
            </TabsTrigger>
            <TabsTrigger 
              value="facilitator-notes"
              className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
            >
              Facilitator Notes
            </TabsTrigger>
            {canAccessCurriculumEditor && (
              <TabsTrigger 
                value="curriculum-editor"
                className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
              >
                Curriculum Editor
              </TabsTrigger>
            )}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="json-generator" className="m-0">
              <JSONGenerator 
                sharedData={sharedData}
                updateSharedData={updateSharedData}
              />
            </TabsContent>

            <TabsContent value="session-tester" className="m-0">
              <SessionTester 
                sharedData={sharedData}
                updateSharedData={updateSharedData}
              />
            </TabsContent>

            <TabsContent value="facilitator-notes" className="m-0">
              <FacilitatorNotesGenerator 
                sharedData={sharedData}
                updateSharedData={updateSharedData}
              />
            </TabsContent>

            {canAccessCurriculumEditor && (
              <TabsContent value="curriculum-editor" className="m-0">
                <CurriculumEditor />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Content; 
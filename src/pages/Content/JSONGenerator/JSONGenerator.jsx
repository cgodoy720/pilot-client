import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaFileAlt, FaLink, FaPlay, FaDownload, FaCopy, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './JSONGenerator.css';

const JSONGenerator = ({ sharedData, updateSharedData }) => {
  const { token } = useAuth();
  const [inputMethod, setInputMethod] = useState(sharedData?.inputMethod || 'text');
  const [textInput, setTextInput] = useState(sharedData?.textInput || '');
  const [urlInput, setUrlInput] = useState(sharedData?.urlInput || '');
  const [fileInput, setFileInput] = useState(sharedData?.fileInput || null);
  const [generatedJSON, setGeneratedJSON] = useState(sharedData?.generatedJSON || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sync local state with shared state when shared data changes
  useEffect(() => {
    if (sharedData) {
      setInputMethod(sharedData.inputMethod || 'text');
      setTextInput(sharedData.textInput || '');
      setUrlInput(sharedData.urlInput || '');
      setFileInput(sharedData.fileInput || null);
      setGeneratedJSON(sharedData.generatedJSON || '');
    }
  }, [sharedData]);

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Sample session data template (same as SessionDataTester)
  const sampleSessionData = {
    "date": "2025-01-XX",
    "day_type": "Weekday",
    "cohort": "January 2025",
    "daily_goal": "Generated from content input",
    "day_number": 1,
    "learning_objectives": [
      "Learning objective 1",
      "Learning objective 2",
      "Learning objective 3"
    ],
    "time_blocks": [
      {
        "category": "Learning",
        "start_time": "18:45",
        "end_time": "19:45",
        "learning_type": "",
        "task": {
          "title": "Generated Task Title",
          "type": "individual",
          "description": "Task Description",
          "intro": "Task introduction and context...",
          "questions": [
            "Generated question 1?",
            "Generated question 2?",
            "Generated question 3?"
          ],
          "linked_resources": [
            {
              "title": "Resource Title",
              "type": "article",
              "url": "https://example.com",
              "description": "Resource description"
            }
          ],
          "conclusion": "Task conclusion and next steps..."
        }
      }
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileInput(file);
      setError('');
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setTextInput(content); // Store content in textInput for processing
        
        // Update shared data
        updateSharedData?.({
          fileInput: file,
          textInput: content
        });
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      let content = '';
      
      // Get content based on input method
      switch (inputMethod) {
        case 'text':
          content = textInput.trim();
          break;
        case 'url':
          // For now, we'll simulate URL processing
          // In a real implementation, this would call a backend service
          if (!urlInput.trim()) {
            throw new Error('Please enter a URL');
          }
          content = await fetchContentFromUrl(urlInput);
          break;
        case 'file':
          if (!fileInput) {
            throw new Error('Please select a file');
          }
          content = textInput; // File content is already loaded in textInput
          break;
        default:
          throw new Error('Invalid input method');
      }
      
      if (!content) {
        throw new Error('No content provided for generation');
      }
      
      // Store original content for Phase 3 (Facilitator Notes)
      sessionStorage.setItem('originalContent', content);
      
      // For now, generate a sample JSON structure
      // This will be replaced with actual AI processing later
      const generatedData = await generateJSONFromContent(content);
      const jsonString = JSON.stringify(generatedData, null, 2);
      setGeneratedJSON(jsonString);
      
      // Update shared data
      updateSharedData?.({
        originalContent: content,
        generatedJSON: jsonString
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchContentFromUrl = async (url) => {
    // This now calls the backend service which handles Google Docs and other URLs
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contentType: 'url',
          url: url,
          cohort: 'Generated Cohort',
          weekNumber: 1,
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content from URL');
      }

             const result = await response.json();
       return result.generatedContent;
     } catch (error) {
       console.error('Error fetching content from URL:', error);
       throw error;
     }
  };

  const generateJSONFromContent = async (content) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
                     'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           contentType: inputMethod === 'file' ? 'file' : 'text',
          content: content,
          cohort: 'Generated Cohort',
          weekNumber: 1,
          dayNumber: 1,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate JSON from content');
      }

               const result = await response.json();
         return result.generatedContent;
       } catch (error) {
         console.error('Error generating JSON from content:', error);
         throw error;
       }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(generatedJSON);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([generatedJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUseInTester = () => {
    try {
      const parsedData = JSON.parse(generatedJSON);
      
      if (Array.isArray(parsedData)) {
        // Multi-day data - send the entire array
        sessionStorage.setItem('generatedSessionData', generatedJSON);
        
        // Show user what's being tested
        alert(`Multi-day content detected! Testing all ${parsedData.length} days.\n\nYou can navigate between days in the Session Tester.`);
        
        window.dispatchEvent(new CustomEvent('switchToSessionTester', { 
          detail: { generatedJSON } 
        }));
      } else {
        // Single-day data
        sessionStorage.setItem('generatedSessionData', generatedJSON);
        window.dispatchEvent(new CustomEvent('switchToSessionTester', { 
          detail: { generatedJSON } 
        }));
      }
    } catch (error) {
      alert('Error parsing generated JSON. Please check the output format.');
    }
  };



  return (
    <div className="json-generator">
      <div className="json-generator__content">
        <div className="json-generator__input-section">
          <div className="json-generator__header">
            <h2>Content Input</h2>
            <p>Provide your curriculum content through one of the methods below</p>
          </div>

          {/* Input Method Selector */}
          <div className="json-generator__method-selector">
            <button
              className={`json-generator__method-btn ${inputMethod === 'text' ? 'active' : ''}`}
              onClick={() => setInputMethod('text')}
            >
              <FaFileAlt />
              Text Input
            </button>
            <button
              className={`json-generator__method-btn ${inputMethod === 'url' ? 'active' : ''}`}
              onClick={() => setInputMethod('url')}
            >
              <FaLink />
              Google Doc URL
            </button>
            <button
              className={`json-generator__method-btn ${inputMethod === 'file' ? 'active' : ''}`}
              onClick={() => setInputMethod('file')}
            >
              <FaUpload />
              File Upload
            </button>
          </div>

          {/* Input Forms */}
          <div className="json-generator__input-form">
            {inputMethod === 'text' && (
              <div className="json-generator__text-input">
                <label htmlFor="textContent">
                  Paste your curriculum content here:
                </label>
                <textarea
                  id="textContent"
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    updateSharedData?.({ textInput: e.target.value });
                  }}
                  placeholder="Enter your curriculum content, learning objectives, activities, etc..."
                  rows={12}
                />
              </div>
            )}

            {inputMethod === 'url' && (
              <div className="json-generator__url-input">
                <label htmlFor="urlContent">
                  Google Doc URL (make sure it's publicly accessible):
                </label>
                <input
                  id="urlContent"
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    updateSharedData?.({ urlInput: e.target.value });
                  }}
                  placeholder="https://docs.google.com/document/d/..."
                />
                <p className="json-generator__url-help">
                  Tip: Make sure your Google Doc is shared with "Anyone with the link can view"
                </p>
              </div>
            )}

            {inputMethod === 'file' && (
              <div className="json-generator__file-input">
                <label>Upload a content file (.txt, .md, .docx):</label>
                <div className="json-generator__file-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.docx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="json-generator__file-btn"
                  >
                    <FaUpload />
                    {fileInput ? fileInput.name : 'Choose File'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="json-generator__actions">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="json-generator__generate-btn"
            >
              {isGenerating ? (
                <>
                  <FaSpinner className="spinning" />
                  Generating...
                </>
              ) : (
                <>
                  <FaPlay />
                  Generate JSON
                </>
              )}
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/health`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                  const result = await response.json();
                  alert(`Service Status: ${result.status}\nGuidelines Loaded: ${result.guidelinesLoaded}\nOpenAI Configured: ${result.openaiConfigured}`);
                } catch (err) {
                  alert(`Health Check Failed: ${err.message}`);
                }
              }}
              className="json-generator__generate-btn"
              style={{ marginLeft: '10px', background: '#28a745' }}
            >
              Test Service
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="json-generator__error">
              {error}
            </div>
          )}
        </div>

        <div className="json-generator__output-section">
          <div className="json-generator__header">
            <h2>Generated Session Data</h2>
            <p>JSON structure ready for testing</p>
          </div>

          {generatedJSON && (
            <div className="json-generator__output">
              <div className="json-generator__output-info">
                {(() => {
                  try {
                    const parsedData = JSON.parse(generatedJSON);
                    if (Array.isArray(parsedData)) {
                      return (
                        <div className="json-generator__multi-day-info">
                          <div className="json-generator__multi-day-notice">
                            <strong>Multi-Day Content Generated:</strong> {parsedData.length} days of curriculum
                          </div>
                          <div className="json-generator__individual-days">
                            <p>Copy individual days:</p>
                            <div className="json-generator__day-buttons">
                              {parsedData.map((day, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    const dayJSON = JSON.stringify(day, null, 2);
                                    navigator.clipboard.writeText(dayJSON);
                                    alert(`Day ${day.day_number || index + 1} JSON copied to clipboard!`);
                                  }}
                                  className="json-generator__day-copy-btn"
                                  title={`Copy Day ${day.day_number || index + 1}: ${day.daily_goal || 'Untitled'}`}
                                >
                                  Day {day.day_number || index + 1}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="json-generator__single-day-notice">
                          <strong>Single Day Content Generated</strong>
                        </div>
                      );
                    }
                  } catch {
                    return null;
                  }
                })()}
              </div>
              
              <div className="json-generator__output-actions">
                <button
                  onClick={handleCopyJSON}
                  className="json-generator__action-btn"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadJSON}
                  className="json-generator__action-btn"
                >
                  <FaDownload />
                  Download
                </button>

                <button
                  onClick={handleUseInTester}
                  className="json-generator__action-btn json-generator__action-btn--primary"
                >
                  <FaPlay />
                  Test in Session Tester
                </button>
              </div>
              
              <pre className="json-generator__json-display">
                <code>{generatedJSON}</code>
              </pre>
            </div>
          )}

          {!generatedJSON && !isGenerating && (
            <div className="json-generator__empty-state">
              <FaFileAlt size={48} />
              <p>Your generated JSON will appear here</p>
              <p className="json-generator__empty-help">
                Enter content above and click "Generate JSON" to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JSONGenerator; 
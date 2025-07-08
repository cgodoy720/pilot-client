import React, { useState, useRef } from 'react';
import { FaUpload, FaEye, FaTrash, FaCheckCircle, FaUsers, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaExpand, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './SessionDataTester.css';

const SessionDataTester = () => {
  const [sessionData, setSessionData] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('learning'); // 'learning' or 'past-session'
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);

  // Sample JSON data for quick testing
  const sampleData = {
    "date": "2025-06-24",
    "day_type": "Weekday", 
    "cohort": "June 2025",
    "daily_goal": "Test Session Data Preview & Quality Assurance",
    "day_number": 9,
    "learning_objectives": [
      "Test how session data renders in the UI preview",
      "Practice iterative prompting to improve AI outputs",
      "Validate JSON structure for new cohorts and sessions"
    ],
    "time_blocks": [
      {
        "category": "Learning",
        "start_time": "18:45",
        "end_time": "19:45",
        "learning_type": "",
        "task": {
          "title": "Session Data Testing & AI Prompt Refinement",
          "type": "individual",
          "description": "Quality Assurance & Advanced AI Communication",
          "intro": "Welcome to today's session! Tonight we'll explore how session data appears to users and practice refining our AI communication. This preview shows exactly what learners will see when they interact with this task.",
          "questions": [
            "Upload a JSON file or paste session data in the left panel. How does the preview match your expectations?",
            "Try navigating between different tasks using the task list. What do you notice about how the interface updates?",
            "Look at how resources are displayed above the messages. Are they formatted clearly and accessibly?",
            "Consider the message flow from intro → questions → conclusion. Does this sequence feel natural for learning?",
            "What improvements would you make to the session data structure based on this preview?"
          ],
          "linked_resources": [
            {
              "title": "Session Data Structure Guide",
              "url": "https://docs.example.com/session-structure",
              "type": "link",
              "description": "Documentation on how to structure session JSON data"
            },
            {
              "title": "AI Prompting Best Practices",
              "url": "https://example.com/ai-prompting",
              "type": "article",
              "description": "Guidelines for creating effective AI prompts in educational contexts"
            }
          ],
          "conclusion": "Great work testing the session data preview! This tool helps ensure that new sessions will render correctly before they go live. You can use this to validate JSON structure, test different cohort configurations, and preview the user experience.",
          "deliverable": "Session testing notes",
          "deliverable_type": "text",
          "duration_minutes": 60,
          "should_analyze": true,
          "analyze_deliverable": false
        }
      },
      {
        "category": "Building",
        "start_time": "19:45",
        "end_time": "20:30",
        "learning_type": "Work Product",
        "task": {
          "title": "Document Your Testing Process",
          "type": "individual",
          "description": "Create documentation for the testing workflow",
          "intro": "Now that you've tested the session data preview, let's document your process and findings. This will help other team members understand how to use this tool effectively.",
          "questions": [
            "Create a document outlining the steps you took to test the session data preview.",
            "What key features did you discover during your testing?",
            "What potential issues or edge cases did you identify?",
            "How would you explain this tool to a new team member?"
          ],
          "linked_resources": [],
          "conclusion": "Excellent documentation! This will be valuable for onboarding new team members and ensuring consistent testing practices.",
          "deliverable": "Testing process documentation",
          "deliverable_type": "document",
          "duration_minutes": 45,
          "should_analyze": false,
          "analyze_deliverable": false
        }
      },
      {
        "category": "Reflection",
        "start_time": "20:30",
        "end_time": "21:00",
        "learning_type": "",
        "task": {
          "title": "Share Your Testing Video",
          "type": "individual",
          "description": "Record a brief walkthrough of the testing process",
          "intro": "Create a short video demonstrating how to use the Session Data Tester effectively. This will serve as a tutorial for future users.",
          "questions": [
            "Record a 3-5 minute walkthrough of the Session Data Tester.",
            "Show how to upload JSON data and navigate between tasks.",
            "Demonstrate the full-screen modal feature.",
            "Highlight any tips or best practices you discovered."
          ],
          "linked_resources": [
            {
              "title": "Screen Recording Guide",
              "url": "https://example.com/screen-recording",
              "type": "video",
              "description": "How to create effective screen recordings"
            }
          ],
          "conclusion": "Perfect! Your video tutorial will help others learn to use this tool quickly and effectively.",
          "deliverable": "Tutorial video",
          "deliverable_type": "video",
          "duration_minutes": 30,
          "should_analyze": false,
          "analyze_deliverable": false
        }
      }
    ]
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Get task icon based on type
  const getTaskIcon = (type, completed = false) => {
    if (completed) return <FaCheckCircle style={{ color: '#4caf50' }} />;
    
    switch (type) {
      case 'group':
        return <FaUsers />;
      case 'individual':
        return <FaBook />;
      default:
        return <FaBars />;
    }
  };

  // Process JSON data into tasks format
  const processSessionData = (data) => {
    try {
      const sessionArray = Array.isArray(data) ? data : [data];
      const session = sessionArray[0];
      
      if (!session || !session.time_blocks) {
        throw new Error('Invalid session data structure');
      }

      const allTasks = [];
      
      session.time_blocks.forEach((block, blockIndex) => {
        if (block.task) {
          // Handle linked_resources
          let resources = [];
          if (block.task.linked_resources) {
            if (Array.isArray(block.task.linked_resources)) {
              resources = block.task.linked_resources;
            } else if (typeof block.task.linked_resources === 'string') {
              try {
                resources = JSON.parse(block.task.linked_resources);
              } catch (e) {
                resources = [{
                  title: 'Resource Link',
                  url: block.task.linked_resources,
                  type: 'link'
                }];
              }
            }
          }

          allTasks.push({
            id: blockIndex + 1,
            title: block.task.title || `Task ${blockIndex + 1}`,
            description: block.task.description || '',
            type: block.task.type || 'individual',
            blockTitle: block.task.title,
            blockTime: formatTime(block.start_time),
            completed: false,
            resources: resources,
            deliverable: block.task.deliverable || '',
            deliverable_type: block.task.deliverable_type || 'none',
            should_analyze: block.task.should_analyze || false,
            analyze_deliverable: block.task.analyze_deliverable || false,
            intro: block.task.intro || '',
            questions: block.task.questions || [],
            conclusion: block.task.conclusion || ''
          });
        }
      });

      setTasks(allTasks);
      setCurrentDay({
        day_number: session.day_number,
        daily_goal: session.daily_goal,
        cohort: session.cohort,
        date: session.date,
        learning_objectives: session.learning_objectives || []
      });
      setCurrentTaskIndex(0);
      
      // Generate sample messages for the first task
      if (allTasks.length > 0) {
        generateSampleMessages(allTasks[0]);
      }
      
      setError('');
      return true;
    } catch (err) {
      setError(`Error processing session data: ${err.message}`);
      return false;
    }
  };

  // Generate realistic assistant messages for preview (exactly what users will see)
  const generateSampleMessages = (task) => {
    const messages = [];
    let messageId = 1;

    // 1. Intro message (if intro exists)
    if (task.intro && task.intro.trim()) {
      messages.push({
        id: messageId++,
        role: 'assistant',
        content: task.intro,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // 2. All questions in sequence (as the assistant would ask them)
    if (task.questions && task.questions.length > 0) {
      task.questions.forEach((question, index) => {
        messages.push({
          id: messageId++,
          role: 'assistant',
          content: question,
          timestamp: new Date().toLocaleTimeString()
        });
      });
    }

    // 3. Conclusion message (if conclusion exists)
    if (task.conclusion && task.conclusion.trim()) {
      messages.push({
        id: messageId++,
        role: 'assistant',
        content: task.conclusion,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    // If no intro, questions, or conclusion, show a default message
    if (messages.length === 0) {
      messages.push({
        id: 1,
        role: 'assistant',
        content: `This is "${task.title}". No intro, questions, or conclusion content found in the JSON data.`,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    setMessages(messages);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setJsonInput(JSON.stringify(data, null, 2));
        setSessionData(data);
        processSessionData(data);
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Handle JSON input change
  const handleJsonInputChange = (value) => {
    setJsonInput(value);
    try {
      if (value.trim()) {
        const data = JSON.parse(value);
        setSessionData(data);
        processSessionData(data);
      }
    } catch (err) {
      // Don't set error while typing, only when they try to process
    }
  };

  // Load sample data
  const loadSampleData = () => {
    const jsonString = JSON.stringify(sampleData, null, 2);
    setJsonInput(jsonString);
    setSessionData(sampleData);
    processSessionData(sampleData);
  };

  // Clear all data
  const clearData = () => {
    setSessionData(null);
    setJsonInput('');
    setTasks([]);
    setCurrentDay(null);
    setMessages([]);
    setCurrentTaskIndex(0);
    setError('');
  };

  // Navigate between tasks
  const navigateToTask = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentTaskIndex + 1, tasks.length - 1)
      : Math.max(currentTaskIndex - 1, 0);
      
    if (newIndex !== currentTaskIndex) {
      setCurrentTaskIndex(newIndex);
      generateSampleMessages(tasks[newIndex]);
    }
  };

  // Render task resources
  const renderTaskResources = (resources) => {
    if (!resources || resources.length === 0) return null;
    
    return (
      <div className="session-tester__task-resources">
        <h3>Resources</h3>
        <ul>
          {resources.map((resource, index) => (
            <li key={index} className="session-tester__resource-item">
              <div className="session-tester__resource-content">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                </a>
                {resource.description && (
                  <p className="resource-description">{resource.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Format message content exactly like the Learning page does
  const formatMessageContent = (content) => {
    if (!content) return null;
    
    // Check if content is an object and not a string
    if (typeof content === 'object') {
      // Convert the object to a readable string format
      try {
        return <pre className="system-message">System message: {JSON.stringify(content, null, 2)}</pre>;
      } catch (e) {
        console.error('Error stringifying content object:', e);
        return <p className="error-message">Error displaying message content</p>;
      }
    }
    
    // Split content by code blocks to handle them separately
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return (
      <>
        {parts.map((part, index) => {
          // Check if this part is a code block
          if (part.startsWith('```') && part.endsWith('```')) {
            // Extract language and code
            const match = part.match(/```(\w*)\n([\s\S]*?)```/);
            
            if (match) {
              const [, language, code] = match;
              
              return (
                <div key={index} className="code-block-wrapper">
                  <div className="code-block-header">
                    {language && <span className="code-language">{language}</span>}
                  </div>
                  <pre className="code-block">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }
          }
          
          // For non-code parts, preprocess to handle newlines properly
          // Convert single newlines to double newlines for proper markdown rendering
          const processedPart = part.replace(/\n(?!\n)/g, '\n\n');
          
          // Regular markdown for non-code parts
          return (
            <ReactMarkdown key={index}
              components={{
                p: ({node, children, ...props}) => (
                  <p className="markdown-paragraph" {...props}>{children}</p>
                ),
                h1: ({node, children, ...props}) => (
                  <h1 className="markdown-heading" {...props}>{children}</h1>
                ),
                h2: ({node, children, ...props}) => (
                  <h2 className="markdown-heading" {...props}>{children}</h2>
                ),
                h3: ({node, children, ...props}) => (
                  <h3 className="markdown-heading" {...props}>{children}</h3>
                ),
                ul: ({node, children, ...props}) => (
                  <ul className="markdown-list" {...props}>{children}</ul>
                ),
                ol: ({node, children, ...props}) => (
                  <ol className="markdown-list" {...props}>{children}</ol>
                ),
                li: ({node, children, ...props}) => (
                  <li className="markdown-list-item" {...props}>{children}</li>
                ),
                a: ({node, children, ...props}) => (
                  <a className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                ),
                strong: ({node, children, ...props}) => (
                  <strong {...props}>{children}</strong>
                ),
                em: ({node, children, ...props}) => (
                  <em {...props}>{children}</em>
                ),
                code: ({node, inline, className, children, ...props}) => {
                  if (inline) {
                    return <code className="inline-code" {...props}>{children}</code>;
                  }
                  return <code {...props}>{children}</code>;
                }
              }}
            >
              {processedPart}
            </ReactMarkdown>
          );
        })}
      </>
    );
  };

  const renderMessages = () => {
    return (
      <div className="session-tester__messages">
        {messages.map((message) => (
          <div key={message.id} className={`session-tester__message session-tester__message--${message.role}`}>
            <div className="session-tester__message-content">
              {formatMessageContent(message.content)}
            </div>
            {message.timestamp && (
              <div className="session-tester__message-timestamp">{message.timestamp}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPreviewContent = (isModal = false) => {
    return (
      <>
        <div className={`session-tester__learning-layout ${isModal ? 'session-tester__learning-layout--modal' : ''}`}>
          {/* Task Panel */}
          <div className="session-tester__task-panel">
            {/* Day Info moved here */}
            {currentDay && (
              <div className="session-tester__day-info">
                <h3>Day {currentDay.day_number} - {currentDay.cohort}</h3>
                <p><strong>Date:</strong> {currentDay.date}</p>
                <p><strong>Goal:</strong> {currentDay.daily_goal}</p>
                {currentDay.learning_objectives && currentDay.learning_objectives.length > 0 && (
                  <div>
                    <strong>Learning Objectives:</strong>
                    <div className="session-tester__learning-objectives">
                      {currentDay.learning_objectives.map((objective, index) => (
                        <div key={index} className="session-tester__objective-item">{objective}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="session-tester__task-header">
              <h3>Tasks</h3>
            </div>
            <div className="session-tester__tasks-list">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className={`session-tester__task-item ${index === currentTaskIndex ? 'current' : ''}`}
                  onClick={() => {
                    setCurrentTaskIndex(index);
                    generateSampleMessages(task);
                  }}
                >
                  <div className="session-tester__task-icon">
                    {getTaskIcon(task.type, task.completed)}
                  </div>
                  <div className="session-tester__task-content">
                    <h4 className="session-tester__task-title">{task.title}</h4>
                    <div className="session-tester__task-time">
                      {task.blockTime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="session-tester__chat-panel">
            {/* Resources */}
            {currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources && tasks[currentTaskIndex].resources.length > 0 && (
              <div className="session-tester__resources-container">
                {renderTaskResources(tasks[currentTaskIndex].resources)}
              </div>
            )}

            {/* Messages */}
            <div className="session-tester__messages-container">
              {renderMessages()}
            </div>

            {/* Task Navigation */}
            <div className="session-tester__task-navigation">
              <button 
                className="session-tester__nav-btn" 
                onClick={() => navigateToTask('prev')}
                disabled={currentTaskIndex === 0}
              >
                <FaArrowLeft /> Prev Task
              </button>
              
              <div className="session-tester__task-info">
                Task {currentTaskIndex + 1} of {tasks.length}
              </div>
              
              <button 
                className="session-tester__nav-btn" 
                onClick={() => navigateToTask('next')}
                disabled={currentTaskIndex === tasks.length - 1}
              >
                Next Task <FaArrowRight />
              </button>
            </div>

            {/* Sample Input */}
            <div className="session-tester__sample-input">
              <div className="session-tester__input-container">
                <textarea
                  placeholder="Sample message input (preview only)"
                  disabled
                  rows={2}
                />
                <div className="session-tester__input-actions">
                  {currentTaskIndex < tasks.length && 
                    (tasks[currentTaskIndex].deliverable_type === 'link' || 
                     tasks[currentTaskIndex].deliverable_type === 'document' ||
                     tasks[currentTaskIndex].deliverable_type === 'video') && (
                    <button 
                      type="button"
                      className="session-tester__deliverable-btn"
                      disabled
                      title={`Submit ${tasks[currentTaskIndex].deliverable || 'deliverable'} (preview only)`}
                    >
                      <FaLink />
                    </button>
                  )}
                </div>
              </div>
              <button className="session-tester__send-btn" disabled>
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderModal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="session-tester__modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="session-tester__modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="session-tester__modal-header">
            <div className="session-tester__modal-title">
              <h2>Session Preview - Full Screen</h2>
              <div className="session-tester__mode-toggle">
                <button 
                  className={`session-tester__mode-btn ${previewMode === 'learning' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('learning')}
                >
                  Learning Page Style
                </button>
                <button 
                  className={`session-tester__mode-btn ${previewMode === 'past-session' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('past-session')}
                >
                  Past Session Style
                </button>
              </div>
            </div>
            <button 
              className="session-tester__modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="session-tester__modal-body">
            {renderPreviewContent(true)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="session-tester">
      <div className="session-tester__header">
        <h1>Session Data Tester</h1>
        <p>Upload or paste JSON session data to preview how it will appear in Learning/PastSession pages</p>
      </div>

      <div className="session-tester__content">
        {/* Input Section */}
        <div className="session-tester__input-section">
          <div className="session-tester__controls">
            <button 
              className="session-tester__btn session-tester__btn--primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaUpload /> Upload JSON File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            <button 
              className="session-tester__btn session-tester__btn--secondary"
              onClick={loadSampleData}
            >
              Load Sample Data
            </button>
            
            <button 
              className="session-tester__btn session-tester__btn--danger"
              onClick={clearData}
            >
              <FaTrash /> Clear All
            </button>
          </div>

          <div className="session-tester__json-input">
            <label htmlFor="json-input">JSON Session Data:</label>
            <textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => handleJsonInputChange(e.target.value)}
              placeholder="Paste your JSON session data here..."
              rows={10}
            />
          </div>

          {error && (
            <div className="session-tester__error">
              {error}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {sessionData && tasks.length > 0 && (
          <div className="session-tester__preview-section">
            <div className="session-tester__preview-controls">
              <h2>Preview</h2>
              <div className="session-tester__preview-buttons">
                <div className="session-tester__mode-toggle">
                  <button 
                    className={`session-tester__mode-btn ${previewMode === 'learning' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('learning')}
                  >
                    Learning Page Style
                  </button>
                  <button 
                    className={`session-tester__mode-btn ${previewMode === 'past-session' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('past-session')}
                  >
                    Past Session Style
                  </button>
                </div>
                <button 
                  className="session-tester__btn session-tester__btn--primary session-tester__fullscreen-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  <FaExpand /> Full Screen
                </button>
              </div>
            </div>

            <div className="session-tester__preview-content">
              {renderPreviewContent()}
            </div>
          </div>
        )}
      </div>
      {renderModal()}
    </div>
  );
};

export default SessionDataTester; 
import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaEye, FaTrash, FaCheckCircle, FaUsers, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaExpand, FaTimes } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './SessionTester.css';

const SessionTester = () => {
  const [sessionData, setSessionData] = useState(null);
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState('learning'); // 'learning' or 'past-session'
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [allDays, setAllDays] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const fileInputRef = useRef(null);

  // Listen for generated JSON from JSON Generator
  useEffect(() => {
    const handleSwitchToSessionTester = (event) => {
      if (event.detail?.generatedJSON) {
        setJsonInput(event.detail.generatedJSON);
        handleLoadFromInput(event.detail.generatedJSON);
      }
    };

    // Check for pre-loaded JSON from sessionStorage
    const savedJSON = sessionStorage.getItem('generatedSessionData');
    if (savedJSON) {
      setJsonInput(savedJSON);
      handleLoadFromInput(savedJSON);
      sessionStorage.removeItem('generatedSessionData'); // Clean up
    }

    window.addEventListener('switchToSessionTester', handleSwitchToSessionTester);
    
    return () => {
      window.removeEventListener('switchToSessionTester', handleSwitchToSessionTester);
    };
  }, []);

  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

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
              "type": "article",
              "url": "https://example.com/session-structure",
              "description": "Understanding the JSON format for curriculum sessions"
            },
            {
              "title": "AI Prompt Engineering Best Practices",
              "type": "video",
              "url": "https://example.com/prompt-engineering",
              "description": "Techniques for creating effective AI prompts and responses"
            }
          ],
          "conclusion": "Great work testing the session data preview! This tool helps ensure that curriculum content displays correctly before learners see it. Remember that the goal is creating engaging, interactive learning experiences that guide students through meaningful exploration of concepts."
        }
      }
    ]
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          setJsonInput(content);
          handleLoadFromInput(content);
        } catch (error) {
          setError('Error reading file: ' + error.message);
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please select a valid JSON file');
    }
  };

  const handleLoadFromInput = (jsonString = jsonInput) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Check if data is an array of days or a single day
      let daysArray = [];
      let currentDayData = null;
      
      if (Array.isArray(data)) {
        // Multiple days from JSON Generator
        daysArray = data;
        currentDayData = data[0]; // Start with first day
        setCurrentDayIndex(0);
      } else {
        // Single day object
        daysArray = [data];
        currentDayData = data;
        setCurrentDayIndex(0);
      }
      
      setAllDays(daysArray);
      setSessionData(currentDayData);
      setCurrentDay(currentDayData);
      
      // Extract tasks from the current day's time_blocks
      const extractedTasks = [];
      if (currentDayData && currentDayData.time_blocks) {
        currentDayData.time_blocks.forEach((block, blockIndex) => {
          if (block.task) {
            extractedTasks.push({
              ...block.task,
              id: `task-${blockIndex}`,
              blockIndex,
              startTime: block.start_time,
              endTime: block.end_time,
              category: block.category
            });
          }
        });
      }
      
      setTasks(extractedTasks);
      setCurrentTaskIndex(0);
      setError('');
      
      // Initialize messages for the first task
      if (extractedTasks.length > 0) {
        initializeMessages(extractedTasks[0]);
      }
      
    } catch (err) {
      setError('Invalid JSON format: ' + err.message);
      setSessionData(null);
      setTasks([]);
      setAllDays([]);
      setCurrentDay(null);
    }
  };

  const initializeMessages = (task) => {
    const msgs = [];
    
    // Add intro message
    if (task.intro) {
      msgs.push({
        id: 'intro',
        role: 'assistant',
        content: task.intro,
        timestamp: new Date().toISOString()
      });
    }
    
    // Add questions as individual messages
    if (task.questions && task.questions.length > 0) {
      task.questions.forEach((question, index) => {
        msgs.push({
          id: `question-${index}`,
          role: 'assistant', 
          content: question,
          timestamp: new Date().toISOString()
        });
      });
    }
    
    // Add conclusion message
    if (task.conclusion) {
      msgs.push({
        id: 'conclusion',
        role: 'assistant',
        content: task.conclusion,
        timestamp: new Date().toISOString()
      });
    }
    
    setMessages(msgs);
  };

  const handleTaskChange = (taskIndex) => {
    setCurrentTaskIndex(taskIndex);
    if (tasks[taskIndex]) {
      initializeMessages(tasks[taskIndex]);
    }
  };

  const loadSampleData = () => {
    const sampleJSON = JSON.stringify(sampleData, null, 2);
    setJsonInput(sampleJSON);
    handleLoadFromInput(sampleJSON);
  };

  const clearData = () => {
    setSessionData(null);
    setJsonInput('');
    setTasks([]);
    setMessages([]);
    setError('');
    setCurrentTaskIndex(0);
    setAllDays([]);
    setCurrentDay(null);
    setCurrentDayIndex(0);
  };

  const handleDayChange = (dayIndex) => {
    if (allDays[dayIndex]) {
      setCurrentDayIndex(dayIndex);
      const dayData = allDays[dayIndex];
      setCurrentDay(dayData);
      setSessionData(dayData);
      
      // Extract tasks from the new day's time_blocks
      const extractedTasks = [];
      if (dayData.time_blocks) {
        dayData.time_blocks.forEach((block, blockIndex) => {
          if (block.task) {
            extractedTasks.push({
              ...block.task,
              id: `task-${blockIndex}`,
              blockIndex,
              startTime: block.start_time,
              endTime: block.end_time,
              category: block.category
            });
          }
        });
      }
      
      setTasks(extractedTasks);
      setCurrentTaskIndex(0);
      
      // Initialize messages for the first task of the new day
      if (extractedTasks.length > 0) {
        initializeMessages(extractedTasks[0]);
      } else {
        setMessages([]);
      }
    }
  };

  const currentTask = tasks[currentTaskIndex];

  const getTaskIcon = (type) => {
    switch (type) {
      case 'standup':
      case 'discussion':
        return <FaCheckCircle className="task-icon standup" />;
      case 'group':
        return <FaUsers className="task-icon group" />;
      case 'individual':
        return <FaUsers className="task-icon individual" />;
      case 'reflection':
        return <FaBook className="task-icon reflection" />;
      default:
        return <FaCheckCircle className="task-icon" />;
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <FaVideo className="resource-icon video" />;
      case 'article':
      case 'link':
        return <FaLink className="resource-icon article" />;
      default:
        return <FaFileAlt className="resource-icon" />;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1] || '00';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  return (
    <div className="session-data-tester">
      <div className="session-data-tester__content">
        {/* Input Panel */}
        <div className="session-data-tester__input-panel">
          <div className="session-data-tester__header">
            <h2>Session Data Input</h2>
            <p>Upload a JSON file or paste session data to preview</p>
          </div>

          <div className="session-data-tester__actions">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="session-data-tester__btn session-data-tester__btn--upload"
            >
              <FaUpload />
              Upload JSON
            </button>
            
            <button 
              onClick={loadSampleData}
              className="session-data-tester__btn session-data-tester__btn--sample"
            >
              <FaEye />
              Load Sample
            </button>
            
            <button 
              onClick={clearData}
              className="session-data-tester__btn session-data-tester__btn--clear"
            >
              <FaTrash />
              Clear
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          <div className="session-data-tester__input">
            <label htmlFor="jsonInput">Session JSON Data:</label>
            <textarea
              id="jsonInput"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your session JSON data here..."
              rows={20}
            />
          </div>

          <div className="session-data-tester__load-actions">
            <button 
              onClick={() => handleLoadFromInput()}
              className="session-data-tester__btn session-data-tester__btn--primary"
            >
              Load & Preview
            </button>
          </div>

          {error && (
            <div className="session-data-tester__error">
              {error}
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="session-data-tester__preview-panel">
          {sessionData ? (
            <>
              {/* Preview Header with Fullscreen Button */}
              <div className="session-data-tester__preview-header">
                <h2>Session Preview</h2>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="session-data-tester__btn session-data-tester__btn--fullscreen"
                  title="Open in fullscreen"
                  disabled={!sessionData}
                >
                  <FaExpand />
                  Fullscreen
                </button>
              </div>
              {/* Multi-Day Navigation */}
              {allDays.length > 1 && (
                <div className="session-data-tester__day-nav">
                  <h3>Days ({allDays.length})</h3>
                  <div className="session-data-tester__day-list">
                    {allDays.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => handleDayChange(index)}
                        className={`session-data-tester__day-item ${
                          index === currentDayIndex ? 'active' : ''
                        }`}
                      >
                        <div className="session-data-tester__day-info-nav">
                          <div className="session-data-tester__day-title">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__day-goal">
                            {day.daily_goal}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Info Header */}
              <div className="session-data-tester__day-info">
                <div className="session-data-tester__day-header">
                  <h2>
                    Day {currentDay?.day_number} - {currentDay?.daily_goal}
                  </h2>
                  <div className="session-data-tester__day-meta">
                    {currentDay?.date} • {currentDay?.cohort}
                  </div>
                </div>
                
                {currentDay?.learning_objectives && (
                  <div className="session-data-tester__objectives">
                    <h3>Learning Objectives</h3>
                    <ul>
                      {currentDay.learning_objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Task Navigation */}
              {tasks.length > 1 && (
                <div className="session-data-tester__task-nav">
                  <h3>Tasks ({tasks.length})</h3>
                  <div className="session-data-tester__task-list">
                    {tasks.map((task, index) => (
                      <button
                        key={task.id}
                        onClick={() => handleTaskChange(index)}
                        className={`session-data-tester__task-item ${
                          index === currentTaskIndex ? 'active' : ''
                        }`}
                      >
                        {getTaskIcon(task.type)}
                        <div className="session-data-tester__task-info">
                          <div className="session-data-tester__task-title">
                            {task.title}
                          </div>
                          <div className="session-data-tester__task-time">
                            {formatTime(task.startTime)} - {formatTime(task.endTime)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Task Preview */}
              {currentTask && (
                <div className="session-data-tester__task-preview">
                  <div className="session-data-tester__task-header">
                    <div className="session-data-tester__task-title-section">
                      {getTaskIcon(currentTask.type)}
                      <div>
                        <h3>{currentTask.title}</h3>
                        <p>{currentTask.description}</p>
                      </div>
                    </div>
                    
                    {currentTask.startTime && (
                      <div className="session-data-tester__task-time">
                        {formatTime(currentTask.startTime)} - {formatTime(currentTask.endTime)}
                      </div>
                    )}
                  </div>

                  {/* Resources */}
                  {currentTask.linked_resources && currentTask.linked_resources.length > 0 && (
                    <div className="session-data-tester__resources">
                      <h4>Resources</h4>
                      <div className="session-data-tester__resource-list">
                        {currentTask.linked_resources.map((resource, index) => (
                          <div key={index} className="session-data-tester__resource">
                            {getResourceIcon(resource.type)}
                            <div className="session-data-tester__resource-content">
                              <a 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="session-data-tester__resource-title"
                              >
                                {resource.title}
                                <FaExternalLinkAlt />
                              </a>
                              {resource.description && (
                                <p className="session-data-tester__resource-description">
                                  {resource.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages Preview */}
                  <div className="session-data-tester__messages">
                    <h4>Conversation Flow</h4>
                    <div className="session-data-tester__message-list">
                      {messages.map((message) => (
                        <div 
                          key={message.id}
                          className={`session-data-tester__message session-data-tester__message--${message.role}`}
                        >
                          <div className="session-data-tester__message-content">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="session-data-tester__empty-state">
              <FaFileAlt size={64} />
              <h3>No Session Data Loaded</h3>
              <p>Upload a JSON file or paste session data in the input panel to see the preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && sessionData && (
        <div 
          className="session-data-tester__modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="session-data-tester__modal">
            <div className="session-data-tester__modal-header">
              <div>
                <h1>Day {currentDay?.day_number}: {currentDay?.daily_goal}</h1>
                {currentTask && (
                  <p className="session-data-tester__modal-current-task">
                    Viewing Task: {currentTask.title}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="session-data-tester__modal-close"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="session-data-tester__modal-content">
              {/* Left Sidebar - Day Navigation */}
              <div className="session-data-tester__modal-sidebar">
                {allDays.length > 1 && (
                  <>
                    <h3>Days ({allDays.length})</h3>
                    <div className="session-data-tester__modal-day-list">
                      {allDays.map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDayChange(index)}
                          className={`session-data-tester__modal-day-item ${
                            index === currentDayIndex ? 'active' : ''
                          }`}
                        >
                          <div className="session-data-tester__modal-day-number">
                            Day {day.day_number}
                          </div>
                          <div className="session-data-tester__modal-day-date">
                            {day.date}
                          </div>
                          <div className="session-data-tester__modal-day-goal">
                            {day.daily_goal}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Task Navigation */}
                {tasks.length > 0 && (
                  <>
                    <h3>Tasks ({tasks.length})</h3>
                    <div className="session-data-tester__modal-task-list">
                      {tasks.map((task, index) => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskChange(index)}
                          className={`session-data-tester__modal-task-item ${
                            index === currentTaskIndex ? 'active' : ''
                          }`}
                        >
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-info">
                            <div className="session-data-tester__modal-task-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Content - Current Day/Task Content */}
              <div className="session-data-tester__modal-main">
                {/* Day Meta Info */}
                <div className="session-data-tester__modal-day-header">
                  <div className="session-data-tester__modal-day-meta">
                    {currentDay?.date} • {currentDay?.cohort}
                  </div>
                  
                  {currentDay?.learning_objectives && (
                    <div className="session-data-tester__modal-objectives">
                      <h4>Learning Objectives</h4>
                      <ul>
                        {currentDay.learning_objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Task Navigation Bar */}
                {tasks.length > 0 && (
                  <div className="session-data-tester__modal-task-nav">
                    <h4>Tasks for Day {currentDay?.day_number}</h4>
                    <div className="session-data-tester__modal-task-nav-list">
                      {tasks.map((task, index) => (
                        <button
                          key={task.id}
                          onClick={() => handleTaskChange(index)}
                          className={`session-data-tester__modal-task-nav-item ${
                            index === currentTaskIndex ? 'active' : ''
                          }`}
                        >
                          {getTaskIcon(task.type)}
                          <div className="session-data-tester__modal-task-nav-info">
                            <div className="session-data-tester__modal-task-nav-title">
                              {task.title}
                            </div>
                            <div className="session-data-tester__modal-task-nav-time">
                              {formatTime(task.startTime)} - {formatTime(task.endTime)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Current Task Preview */}
                {currentTask && (
                  <div className="session-data-tester__modal-task-preview">
                    <div className="session-data-tester__modal-task-header">
                      <div className="session-data-tester__modal-task-title-section">
                        {getTaskIcon(currentTask.type)}
                        <div>
                          <h3>{currentTask.title}</h3>
                          <p>{currentTask.description}</p>
                        </div>
                      </div>
                      
                      {currentTask.startTime && (
                        <div className="session-data-tester__modal-task-time">
                          {formatTime(currentTask.startTime)} - {formatTime(currentTask.endTime)}
                        </div>
                      )}
                    </div>

                    {/* Resources */}
                    {currentTask.linked_resources && currentTask.linked_resources.length > 0 && (
                      <div className="session-data-tester__modal-resources">
                        <h4>Resources</h4>
                        <div className="session-data-tester__modal-resource-list">
                          {currentTask.linked_resources.map((resource, index) => (
                            <div key={index} className="session-data-tester__modal-resource">
                              {getResourceIcon(resource.type)}
                              <div className="session-data-tester__modal-resource-content">
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="session-data-tester__modal-resource-title"
                                >
                                  {resource.title}
                                  <FaExternalLinkAlt />
                                </a>
                                {resource.description && (
                                  <p className="session-data-tester__modal-resource-description">
                                    {resource.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages Preview */}
                    <div className="session-data-tester__modal-messages">
                      <h4>Conversation Flow</h4>
                      <div className="session-data-tester__modal-message-list">
                        {messages.map((message) => (
                          <div 
                            key={message.id}
                            className={`session-data-tester__modal-message session-data-tester__modal-message--${message.role}`}
                          >
                            <div className="session-data-tester__modal-message-content">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTester; 
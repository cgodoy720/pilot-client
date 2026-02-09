import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaEye, FaTrash, FaCheckCircle, FaUsers, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight, FaBars, FaLink, FaExternalLinkAlt, FaFileAlt, FaVideo, FaExpand, FaTimes, FaEdit, FaPlus, FaSave, FaDownload, FaCheck } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './SessionTester.css';

const SessionTester = ({ sharedData, updateSharedData }) => {
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
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingTaskField, setEditingTaskField] = useState(null); // 'title', 'description', 'startTime', 'endTime'
  const [editingTaskValue, setEditingTaskValue] = useState('');
  const [editingResourceIndex, setEditingResourceIndex] = useState(null);
  const [editingResourceField, setEditingResourceField] = useState(null); // 'title', 'url', 'description'
  const [editingResourceValue, setEditingResourceValue] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdatingFromEdit, setIsUpdatingFromEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [schemaFields, setSchemaFields] = useState([]);
  const fileInputRef = useRef(null);

  // Listen for generated JSON from JSON Generator
  useEffect(() => {
    // Initialize with shared data first
    if (sharedData?.generatedJSON) {
      setJsonInput(sharedData.generatedJSON);
      handleLoadFromInput(sharedData.generatedJSON);
    }
    
    const handleSwitchToSessionTester = (event) => {
      if (event.detail?.generatedJSON) {
        setJsonInput(event.detail.generatedJSON);
        handleLoadFromInput(event.detail.generatedJSON);
      }
    };

    // Check for pre-loaded JSON from sessionStorage (fallback)
    const savedJSON = sessionStorage.getItem('generatedSessionData');
    if (savedJSON && !sharedData?.generatedJSON) {
      setJsonInput(savedJSON);
      handleLoadFromInput(savedJSON);
    }

    window.addEventListener('switchToSessionTester', handleSwitchToSessionTester);
    
    return () => {
      window.removeEventListener('switchToSessionTester', handleSwitchToSessionTester);
    };
  }, [sharedData]);

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

  // Auto-update preview when JSON input changes
  useEffect(() => {
    if (jsonInput.trim() && !isUpdatingFromEdit) {
      // Add a small delay to avoid excessive parsing while typing
      const timeoutId = setTimeout(() => {
        handleLoadFromInput(jsonInput);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [jsonInput, isUpdatingFromEdit]);



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

  // Update session data when changes are made
  const updateSessionData = (updatedAllDays) => {
    setIsUpdatingFromEdit(true);
    setAllDays(updatedAllDays);
    setCurrentDay(updatedAllDays[currentDayIndex]);
    setSessionData(updatedAllDays[currentDayIndex]);
    
    // Update JSON input to reflect changes
    const newJsonInput = JSON.stringify(updatedAllDays.length === 1 ? updatedAllDays[0] : updatedAllDays, null, 2);
    setJsonInput(newJsonInput);
    setHasUnsavedChanges(true);
    
    // Save to sessionStorage and update shared data
    sessionStorage.setItem('generatedSessionData', newJsonInput);
    updateSharedData?.({
      editedJSON: newJsonInput,
      generatedJSON: newJsonInput
    });
    
    // Clear the flag after a brief delay to allow state updates to complete
    setTimeout(() => setIsUpdatingFromEdit(false), 100);
  };

  // Update task checkbox values
  const updateTaskCheckbox = (field, value) => {
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    
    if (currentDayData.time_blocks[taskBlockIndex] && currentDayData.time_blocks[taskBlockIndex].task) {
      currentDayData.time_blocks[taskBlockIndex].task[field] = value;
      
      // If deliverable_type is changing to 'structured', initialize empty schema if needed
      if (field === 'deliverable_type' && value === 'structured') {
        if (!currentDayData.time_blocks[taskBlockIndex].task.deliverable_schema) {
          currentDayData.time_blocks[taskBlockIndex].task.deliverable_schema = {
            fields: []
          };
        }
      }
      
      // Update tasks array too
      const updatedTasks = [...tasks];
      updatedTasks[currentTaskIndex][field] = value;
      setTasks(updatedTasks);
      
      updateSessionData(updatedAllDays);
    }
  };

  // Open schema editor
  const openSchemaEditor = () => {
    const currentTaskData = tasks[currentTaskIndex];
    if (currentTaskData && currentTaskData.deliverable_schema && currentTaskData.deliverable_schema.fields) {
      setSchemaFields([...currentTaskData.deliverable_schema.fields]);
    } else {
      setSchemaFields([]);
    }
    setShowSchemaEditor(true);
  };

  // Close schema editor
  const closeSchemaEditor = () => {
    setShowSchemaEditor(false);
    setSchemaFields([]);
  };

  // Save schema changes
  const saveSchema = () => {
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    task.deliverable_schema = {
      fields: schemaFields
    };
    
    // Update tasks array
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex].deliverable_schema = task.deliverable_schema;
    setTasks(updatedTasks);
    
    updateSessionData(updatedAllDays);
    closeSchemaEditor();
  };

  // Add new schema field
  const addSchemaField = () => {
    setSchemaFields([...schemaFields, {
      name: 'new_field',
      label: 'New Field',
      type: 'text',
      placeholder: '',
      required: false,
      rows: 1
    }]);
  };

  // Update schema field
  const updateSchemaField = (index, field, value) => {
    const updated = [...schemaFields];
    updated[index][field] = value;
    setSchemaFields(updated);
  };

  // Delete schema field
  const deleteSchemaField = (index) => {
    const updated = [...schemaFields];
    updated.splice(index, 1);
    setSchemaFields(updated);
  };

  // Start editing a message
  const startEditingMessage = (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditingText(currentContent);
  };

  // Save edited message
  const saveEditedMessage = () => {
    if (!editingMessageId || !editingText.trim()) return;
    
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    if (editingMessageId === 'intro') {
      task.intro = editingText.trim();
    } else if (editingMessageId === 'conclusion') {
      task.conclusion = editingText.trim();
    } else if (editingMessageId.startsWith('question-')) {
      const questionIndex = parseInt(editingMessageId.split('-')[1]);
      if (task.questions && task.questions[questionIndex] !== undefined) {
        task.questions[questionIndex] = editingText.trim();
      }
    }
    
    // Update tasks array and reinitialize messages
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex] = { ...updatedTasks[currentTaskIndex], ...task };
    setTasks(updatedTasks);
    
    updateSessionData(updatedAllDays);
    initializeMessages(updatedTasks[currentTaskIndex]);
    
    setEditingMessageId(null);
    setEditingText('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  // Start editing task field
  const startEditingTaskField = (field, currentValue) => {
    setEditingTaskField(field);
    setEditingTaskValue(currentValue);
  };

  // Save edited task field
  const saveEditedTaskField = () => {
    if (!editingTaskField || !editingTaskValue.trim()) return;
    
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    const timeBlock = currentDayData.time_blocks[taskBlockIndex];
    
    if (editingTaskField === 'title') {
      task.title = editingTaskValue.trim();
    } else if (editingTaskField === 'description') {
      task.description = editingTaskValue.trim();
    } else if (editingTaskField === 'startTime' || editingTaskField === 'endTime') {
      // Parse time with AM/PM support
      const timeValue = editingTaskValue.trim();
      let convertedTime = timeValue;
      
      // Check for 12-hour format with AM/PM
      const twelveHourRegex = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s*(AM|PM|am|pm)$/i;
      const twentyFourHourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      
      if (twelveHourRegex.test(timeValue)) {
        const match = timeValue.match(twelveHourRegex);
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        
        // Convert to 24-hour format
        if (period === 'PM' && hours < 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        // Format as HH:MM for storage
        convertedTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
      } else if (!twentyFourHourRegex.test(timeValue)) {
        alert('Please enter time in format HH:MM AM/PM (e.g., 2:30 PM) or 24-hour format (e.g., 14:30)');
        return;
      }
      
      if (editingTaskField === 'startTime') {
        timeBlock.start_time = convertedTime;
      } else {
        timeBlock.end_time = convertedTime;
      }
    }
    
    // Update tasks array
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex] = {
      ...updatedTasks[currentTaskIndex],
      ...task,
      startTime: timeBlock.start_time,
      endTime: timeBlock.end_time
    };
    setTasks(updatedTasks);
    
    updateSessionData(updatedAllDays);
    
    setEditingTaskField(null);
    setEditingTaskValue('');
  };

  // Cancel editing task field
  const cancelEditingTaskField = () => {
    setEditingTaskField(null);
    setEditingTaskValue('');
  };

  // Add new question
  const addNewQuestion = () => {
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    if (!task.questions) {
      task.questions = [];
    }
    
    task.questions.push('New question - click to edit');
    
    // Update tasks array and reinitialize messages
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex] = { ...updatedTasks[currentTaskIndex], ...task };
    setTasks(updatedTasks);
    
    updateSessionData(updatedAllDays);
    initializeMessages(updatedTasks[currentTaskIndex]);
  };

  // Delete question
  const deleteQuestion = (questionIndex) => {
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    if (task.questions && task.questions[questionIndex] !== undefined) {
      task.questions.splice(questionIndex, 1);
      
      // Update tasks array and reinitialize messages
      const updatedTasks = [...tasks];
      updatedTasks[currentTaskIndex] = { ...updatedTasks[currentTaskIndex], ...task };
      setTasks(updatedTasks);
      
      updateSessionData(updatedAllDays);
      initializeMessages(updatedTasks[currentTaskIndex]);
    }
  };

  // Start editing a resource field
  const startEditingResource = (index, field, currentValue) => {
    setEditingResourceIndex(index);
    setEditingResourceField(field);
    setEditingResourceValue(currentValue || '');
  };

  // Save edited resource field
  const saveEditedResource = () => {
    if (editingResourceIndex === null || !editingResourceField || !editingResourceValue.trim()) return;
    
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    if (!task.linked_resources) {
      task.linked_resources = [];
    }
    
    // If this is a new resource being added
    if (editingResourceIndex === -1) {
      const newResource = {
        type: 'article', // Default type
        title: 'New Resource',
        url: '#',
        description: ''
      };
      newResource[editingResourceField] = editingResourceValue.trim();
      task.linked_resources.push(newResource);
    } else {
      // Update existing resource
      const resource = task.linked_resources[editingResourceIndex];
      resource[editingResourceField] = editingResourceValue.trim();
    }
    
    // Update tasks array
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex] = { ...updatedTasks[currentTaskIndex], ...task };
    setTasks(updatedTasks);
    
    updateSessionData(updatedAllDays);
    
    setEditingResourceIndex(null);
    setEditingResourceField(null);
    setEditingResourceValue('');
  };

  // Cancel editing resource
  const cancelEditingResource = () => {
    setEditingResourceIndex(null);
    setEditingResourceField(null);
    setEditingResourceValue('');
  };

  // Delete resource
  const deleteResource = (index) => {
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    const taskBlockIndex = tasks[currentTaskIndex].blockIndex;
    const task = currentDayData.time_blocks[taskBlockIndex].task;
    
    if (task.linked_resources && task.linked_resources[index] !== undefined) {
      task.linked_resources.splice(index, 1);
      
      // Update tasks array
      const updatedTasks = [...tasks];
      updatedTasks[currentTaskIndex] = { ...updatedTasks[currentTaskIndex], ...task };
      setTasks(updatedTasks);
      
      updateSessionData(updatedAllDays);
    }
  };

  // Add new resource
  const addNewResource = () => {
    setEditingResourceIndex(-1); // -1 indicates a new resource
    setEditingResourceField('title');
    setEditingResourceValue('New Resource - click to edit');
  };

  // Show delete confirmation modal
  const showDeleteTaskConfirmation = (taskIndex) => {
    setTaskToDelete(taskIndex);
    setShowDeleteConfirm(true);
  };

  // Cancel delete task
  const cancelDeleteTask = () => {
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Confirm delete task
  const confirmDeleteTask = () => {
    if (taskToDelete === null) return;
    
    const updatedAllDays = [...allDays];
    const currentDayData = updatedAllDays[currentDayIndex];
    
    // Remove the time block at the specified index
    if (currentDayData.time_blocks && currentDayData.time_blocks[taskToDelete]) {
      currentDayData.time_blocks.splice(taskToDelete, 1);
      
      // Update tasks array - rebuild from remaining time blocks
      const updatedTasks = [];
      currentDayData.time_blocks.forEach((block, blockIndex) => {
        if (block.task) {
          updatedTasks.push({
            ...block.task,
            id: `task-${blockIndex}`,
            blockIndex,
            startTime: block.start_time,
            endTime: block.end_time,
            category: block.category
          });
        }
      });
      
      setTasks(updatedTasks);
      
      // Adjust current task index if necessary
      let newTaskIndex = currentTaskIndex;
      if (taskToDelete <= currentTaskIndex && currentTaskIndex > 0) {
        newTaskIndex = currentTaskIndex - 1;
      } else if (taskToDelete < currentTaskIndex) {
        newTaskIndex = currentTaskIndex - 1;
      } else if (currentTaskIndex >= updatedTasks.length) {
        newTaskIndex = Math.max(0, updatedTasks.length - 1);
      }
      
      setCurrentTaskIndex(newTaskIndex);
      
      // Initialize messages for the new current task
      if (updatedTasks.length > 0 && updatedTasks[newTaskIndex]) {
        initializeMessages(updatedTasks[newTaskIndex]);
      } else {
        setMessages([]);
      }
      
      updateSessionData(updatedAllDays);
    }
    
    // Close confirmation modal
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Export edited JSON
  const exportEditedJSON = () => {
    const dataToExport = allDays.length === 1 ? allDays[0] : allDays;
    const jsonString = JSON.stringify(dataToExport, null, 2);
    
    // Generate filename based on content dates and cohort
    const generateFileName = () => {
      if (allDays.length === 0) {
        return `session-data-${new Date().toISOString().split('T')[0]}.json`;
      }
      
      const cohort = allDays[0]?.cohort || 'cohort';
      const cleanCohort = cohort.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      
      if (allDays.length === 1) {
        // Single day
        const day = allDays[0];
        const date = day.date || new Date().toISOString().split('T')[0];
        const dayNum = day.day_number || '';
        const dayPart = dayNum ? `-day${dayNum}` : '';
        return `${cleanCohort}${dayPart}-${date}.json`;
      } else {
        // Multiple days
        const dates = allDays.map(day => day.date).filter(Boolean);
        if (dates.length > 0) {
          const startDate = dates[0];
          const endDate = dates[dates.length - 1];
          const dayNums = allDays.map(day => day.day_number).filter(Boolean);
          const dayRange = dayNums.length > 0 ? `-days${dayNums[0]}-${dayNums[dayNums.length - 1]}` : '';
          
          if (startDate === endDate) {
            return `${cleanCohort}${dayRange}-${startDate}.json`;
          } else {
            return `${cleanCohort}${dayRange}-${startDate}_to_${endDate}.json`;
          }
        } else {
          return `${cleanCohort}-${new Date().toISOString().split('T')[0]}.json`;
        }
      }
    };
    
    // Create blob with explicit MIME type and charset
    const blob = new Blob([jsonString], { 
      type: 'application/json;charset=utf-8' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = generateFileName();
    
    // Set additional attributes to force download
    link.href = url;
    link.download = fileName;
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    
    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    
    // Clean up immediately after click
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
    
    setHasUnsavedChanges(false);
  };

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
    <div className="bg-white border border-[#C8C8C8] rounded-lg p-4 shadow-sm">
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
              placeholder="Paste your session JSON data here and the preview will update automatically..."
              rows={20}
            />
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
              {/* Preview Header with Action Buttons */}
              <div className="session-data-tester__preview-header">
                <div>
                  <h2>Session Preview & Editor</h2>
                  {hasUnsavedChanges && (
                    <p className="session-data-tester__unsaved-notice">
                      You have unsaved changes - click "Export JSON" to save
                    </p>
                  )}
                </div>
                <div className="session-data-tester__header-actions">
                  <button
                    onClick={exportEditedJSON}
                    className="session-data-tester__btn session-data-tester__btn--save"
                    disabled={!sessionData}
                    title="Export edited JSON"
                  >
                    <FaDownload />
                    Export JSON
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="session-data-tester__btn session-data-tester__btn--fullscreen"
                    title="Open in fullscreen editor"
                    disabled={!sessionData}
                  >
                    <FaExpand />
                    Fullscreen Editor
                  </button>
                </div>
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
              {tasks.length > 0 && (
                <div className="session-data-tester__task-nav">
                  <div className="session-data-tester__task-nav-header">
                    <h3>Tasks ({tasks.length})</h3>
                    {/* Add Question button moved below conclusion */}
                  </div>
                  {tasks.length > 1 && (
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
                  )}
                </div>
              )}

              {/* Current Task Preview */}
              {currentTask && (
                <div className="session-data-tester__task-preview">
                  <div className="session-data-tester__task-header">
                    <div className="session-data-tester__task-title-section">
                      <div className="session-data-tester__task-content">
                        {/* Editable Title */}
                        {editingTaskField === 'title' ? (
                          <div className="session-data-tester__task-field-editor">
                            <input
                              type="text"
                              value={editingTaskValue}
                              onChange={(e) => setEditingTaskValue(e.target.value)}
                              className="session-data-tester__task-input"
                              autoFocus
                            />
                            <div className="session-data-tester__task-field-actions">
                              <button
                                onClick={saveEditedTaskField}
                                className="session-data-tester__btn session-data-tester__btn--save-small"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={cancelEditingTaskField}
                                className="session-data-tester__btn session-data-tester__btn--cancel"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="session-data-tester__task-field-display">
                            <h3 onClick={() => startEditingTaskField('title', currentTask.title)}>
                              {currentTask.title}
                            </h3>
                            <button
                              onClick={() => startEditingTaskField('title', currentTask.title)}
                              className="session-data-tester__task-field-edit-btn"
                              title="Click to edit title"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        )}
                        
                        {/* Editable Time - moved under title */}
                        {currentTask.startTime && (
                          <div className="session-data-tester__task-time-section">
                            {editingTaskField === 'startTime' ? (
                              <div className="session-data-tester__task-time-editor">
                                <input
                                  type="text"
                                  value={editingTaskValue}
                                  onChange={(e) => setEditingTaskValue(e.target.value)}
                                  className="session-data-tester__task-time-input"
                                  placeholder="2:30 PM or 14:30"
                                  autoFocus
                                />
                                <div className="session-data-tester__task-field-actions">
                                  <button
                                    onClick={saveEditedTaskField}
                                    className="session-data-tester__btn session-data-tester__btn--save-small"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    onClick={cancelEditingTaskField}
                                    className="session-data-tester__btn session-data-tester__btn--cancel"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="session-data-tester__task-time-display">
                                <span 
                                  onClick={() => startEditingTaskField('startTime', currentTask.startTime)}
                                  className="session-data-tester__task-time-value"
                                >
                                  {formatTime(currentTask.startTime)}
                                </span>
                                <button
                                  onClick={() => startEditingTaskField('startTime', currentTask.startTime)}
                                  className="session-data-tester__task-field-edit-btn"
                                  title="Click to edit start time"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
                            
                            <span className="session-data-tester__task-time-separator">-</span>
                            
                            {editingTaskField === 'endTime' ? (
                              <div className="session-data-tester__task-time-editor">
                                <input
                                  type="text"
                                  value={editingTaskValue}
                                  onChange={(e) => setEditingTaskValue(e.target.value)}
                                  className="session-data-tester__task-time-input"
                                  placeholder="2:30 PM or 14:30"
                                  autoFocus
                                />
                                <div className="session-data-tester__task-field-actions">
                                  <button
                                    onClick={saveEditedTaskField}
                                    className="session-data-tester__btn session-data-tester__btn--save-small"
                                  >
                                    <FaCheck />
                                  </button>
                                  <button
                                    onClick={cancelEditingTaskField}
                                    className="session-data-tester__btn session-data-tester__btn--cancel"
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="session-data-tester__task-time-display">
                                <span 
                                  onClick={() => startEditingTaskField('endTime', currentTask.endTime)}
                                  className="session-data-tester__task-time-value"
                                >
                                  {formatTime(currentTask.endTime)}
                                </span>
                                <button
                                  onClick={() => startEditingTaskField('endTime', currentTask.endTime)}
                                  className="session-data-tester__task-field-edit-btn"
                                  title="Click to edit end time"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Editable Description */}
                        {editingTaskField === 'description' ? (
                          <div className="session-data-tester__task-field-editor">
                            <input
                              type="text"
                              value={editingTaskValue}
                              onChange={(e) => setEditingTaskValue(e.target.value)}
                              className="session-data-tester__task-input"
                              autoFocus
                            />
                            <div className="session-data-tester__task-field-actions">
                              <button
                                onClick={saveEditedTaskField}
                                className="session-data-tester__btn session-data-tester__btn--save-small"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={cancelEditingTaskField}
                                className="session-data-tester__btn session-data-tester__btn--cancel"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="session-data-tester__task-field-display">
                            <p onClick={() => startEditingTaskField('description', currentTask.description)}>
                              {currentTask.description}
                            </p>
                            <button
                              onClick={() => startEditingTaskField('description', currentTask.description)}
                              className="session-data-tester__task-field-edit-btn"
                              title="Click to edit description"
                            >
                              <FaEdit />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="session-data-tester__task-meta">
                      {/* Analysis Checkboxes - centered */}
                      <div className="session-data-tester__task-analysis">
                        <label className="session-data-tester__checkbox-label">
                          <input
                            type="checkbox"
                            checked={currentTask.should_analyze || false}
                            onChange={(e) => updateTaskCheckbox('should_analyze', e.target.checked)}
                            className="session-data-tester__checkbox"
                          />
                          <span className="session-data-tester__checkbox-text">Should Analyze</span>
                        </label>
                        
                        <label className="session-data-tester__checkbox-label">
                          <input
                            type="checkbox"
                            checked={currentTask.analyze_deliverable || false}
                            onChange={(e) => updateTaskCheckbox('analyze_deliverable', e.target.checked)}
                            className="session-data-tester__checkbox"
                          />
                          <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                        </label>
                      </div>
                      
                      {/* Add Resource & Add Question Buttons - right side */}
                      <div className="session-data-tester__task-actions">
                        <button
                          onClick={addNewResource}
                          className="session-data-tester__btn session-data-tester__btn--add-resource"
                          title="Add new resource to current task"
                        >
                          <FaPlus />
                          Add Resource
                        </button>
                        <button
                          onClick={addNewQuestion}
                          className="session-data-tester__btn session-data-tester__btn--add-question"
                          title="Add new question to current task"
                        >
                          <FaPlus />
                          Add Question
                        </button>
                      </div>
                    </div>
                    
                    {/* Smart Task Configuration Section */}
                    <div className="session-data-tester__smart-config">
                      <h4 className="session-data-tester__smart-config-title">Smart Task Configuration</h4>
                      <div className="session-data-tester__smart-config-grid">
                        <div className="session-data-tester__smart-config-item">
                          <label>Task Mode:</label>
                          <select
                            value={currentTask.task_mode || 'basic'}
                            onChange={(e) => updateTaskCheckbox('task_mode', e.target.value)}
                            className="session-data-tester__select"
                          >
                            <option value="basic">📝 Basic</option>
                            <option value="conversation">💬 Conversation</option>
                          </select>
                        </div>
                        
                        <div className="session-data-tester__smart-config-item">
                          <label>Deliverable Type:</label>
                          <div className="session-data-tester__deliverable-controls">
                            <select
                              value={currentTask.deliverable_type || ''}
                              onChange={(e) => updateTaskCheckbox('deliverable_type', e.target.value)}
                              className="session-data-tester__select"
                            >
                              <option value="">None</option>
                              <option value="text">📄 Text</option>
                              <option value="document">📃 Document</option>
                              <option value="video">🎥 Video</option>
                              <option value="link">🔗 Link</option>
                              <option value="structured">📋 Structured</option>
                            </select>
                            {currentTask.deliverable_type === 'structured' && (
                              <button
                                onClick={openSchemaEditor}
                                className="session-data-tester__btn session-data-tester__btn--schema"
                                title="Edit deliverable schema"
                              >
                                <FaEdit />
                                Edit Schema
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {currentTask.persona && (
                          <div className="session-data-tester__smart-config-item">
                            <label>Persona:</label>
                            <span className="session-data-tester__badge session-data-tester__badge--persona">
                              {currentTask.persona}
                            </span>
                          </div>
                        )}
                        
                        {currentTask.ai_helper_mode && (
                          <div className="session-data-tester__smart-config-item">
                            <label>AI Helper Mode:</label>
                            <span className="session-data-tester__badge session-data-tester__badge--helper">
                              {currentTask.ai_helper_mode.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                        
                        {currentTask.feedback_slot && (
                          <div className="session-data-tester__smart-config-item">
                            <label>Survey Type:</label>
                            <span className={`session-data-tester__badge session-data-tester__badge--survey session-data-tester__badge--survey-${currentTask.feedback_slot}`}>
                              📊 {currentTask.feedback_slot.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
                            <div className="session-data-tester__resource-actions">
                              <button
                                onClick={() => startEditingResource(index, 'title', resource.title)}
                                className="session-data-tester__btn session-data-tester__btn--edit-small"
                                title="Edit title"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => startEditingResource(index, 'url', resource.url)}
                                className="session-data-tester__btn session-data-tester__btn--edit-small"
                                title="Edit URL"
                              >
                                <FaLink />
                              </button>
                              <button
                                onClick={() => startEditingResource(index, 'description', resource.description)}
                                className="session-data-tester__btn session-data-tester__btn--edit-small"
                                title="Edit description"
                              >
                                <FaFileAlt />
                              </button>
                              <button
                                onClick={() => deleteResource(index)}
                                className="session-data-tester__btn session-data-tester__btn--delete-small"
                                title="Delete resource"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages Preview */}
                  <div className="session-data-tester__messages">
                    <h4>Conversation Flow (Click to Edit)</h4>
                    <div className="session-data-tester__message-list">
                      {messages.map((message, messageIndex) => (
                        <div 
                          key={message.id}
                          className={`session-data-tester__message session-data-tester__message--${message.role}`}
                        >
                          {message.id === 'intro' && <div className="session-data-tester__message-label">Introduction</div>}
                          {message.id === 'conclusion' && <div className="session-data-tester__message-label">Conclusion</div>}
                          {editingMessageId === message.id ? (
                            <div className="session-data-tester__message-editor">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="session-data-tester__message-textarea"
                                rows={5}
                                autoFocus
                              />
                              <div className="session-data-tester__message-actions">
                                <button
                                  onClick={saveEditedMessage}
                                  className="session-data-tester__btn session-data-tester__btn--save-small"
                                >
                                  <FaCheck />
                                  Save
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="session-data-tester__btn session-data-tester__btn--cancel"
                                >
                                  <FaTimes />
                                  Cancel
                                </button>
                                {message.id.startsWith('question-') && (
                                  <button
                                    onClick={() => {
                                      const questionIndex = parseInt(message.id.split('-')[1]);
                                      deleteQuestion(questionIndex);
                                      cancelEditing();
                                    }}
                                    className="session-data-tester__btn session-data-tester__btn--delete"
                                  >
                                    <FaTrash />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="session-data-tester__message-content">
                              <div className="session-data-tester__message-text">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                              <button
                                onClick={() => startEditingMessage(message.id, message.content)}
                                className="session-data-tester__message-edit-btn"
                                title="Click to edit"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          )}
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
                    Editing Task: {currentTask.title}
                  </p>
                )}
                {hasUnsavedChanges && (
                  <p className="session-data-tester__modal-unsaved-notice">
                    You have unsaved changes - click "Export JSON" to save
                  </p>
                )}
              </div>
              <div className="session-data-tester__modal-header-actions">
                <button
                  onClick={exportEditedJSON}
                  className="session-data-tester__btn session-data-tester__btn--save"
                  title="Export edited JSON"
                >
                  <FaDownload />
                  Export JSON
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="session-data-tester__modal-close"
                >
                  <FaTimes />
                </button>
              </div>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              showDeleteTaskConfirmation(index);
                            }}
                            className="session-data-tester__modal-task-delete-btn"
                            title="Delete this task"
                          >
                            <FaTrash />
                          </button>
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
                    <div className="session-data-tester__modal-task-nav-header">
                      {/* Task navigation header - button removed and moved to below conclusion */}
                    </div>
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
                        <div className="session-data-tester__modal-task-content">
                          {/* Editable Title */}
                          {editingTaskField === 'title' ? (
                            <div className="session-data-tester__modal-task-field-editor">
                              <input
                                type="text"
                                value={editingTaskValue}
                                onChange={(e) => setEditingTaskValue(e.target.value)}
                                className="session-data-tester__modal-task-input"
                                autoFocus
                              />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button
                                  onClick={saveEditedTaskField}
                                  className="session-data-tester__btn session-data-tester__btn--save-small"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={cancelEditingTaskField}
                                  className="session-data-tester__btn session-data-tester__btn--cancel"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="session-data-tester__modal-task-field-display">
                              <h3 onClick={() => startEditingTaskField('title', currentTask.title)}>
                                {currentTask.title}
                              </h3>
                              <button
                                onClick={() => startEditingTaskField('title', currentTask.title)}
                                className="session-data-tester__modal-task-field-edit-btn"
                                title="Click to edit title"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          )}
                          
                          {/* Editable Time - moved under title */}
                          {currentTask.startTime && (
                            <div className="session-data-tester__modal-task-time-section">
                              {editingTaskField === 'startTime' ? (
                                <div className="session-data-tester__modal-task-time-editor">
                                  <input
                                    type="text"
                                    value={editingTaskValue}
                                    onChange={(e) => setEditingTaskValue(e.target.value)}
                                    className="session-data-tester__modal-task-time-input"
                                    placeholder="2:30 PM or 14:30"
                                    autoFocus
                                  />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button
                                      onClick={saveEditedTaskField}
                                      className="session-data-tester__btn session-data-tester__btn--save-small"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      onClick={cancelEditingTaskField}
                                      className="session-data-tester__btn session-data-tester__btn--cancel"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="session-data-tester__modal-task-time-display">
                                  <span 
                                    onClick={() => startEditingTaskField('startTime', currentTask.startTime)}
                                    className="session-data-tester__modal-task-time-value"
                                  >
                                    {formatTime(currentTask.startTime)}
                                  </span>
                                  <button
                                    onClick={() => startEditingTaskField('startTime', currentTask.startTime)}
                                    className="session-data-tester__modal-task-field-edit-btn"
                                    title="Click to edit start time"
                                  >
                                    <FaEdit />
                                  </button>
                                </div>
                              )}
                              
                              <span className="session-data-tester__modal-task-time-separator">-</span>
                              
                              {editingTaskField === 'endTime' ? (
                                <div className="session-data-tester__modal-task-time-editor">
                                  <input
                                    type="text"
                                    value={editingTaskValue}
                                    onChange={(e) => setEditingTaskValue(e.target.value)}
                                    className="session-data-tester__modal-task-time-input"
                                    placeholder="2:30 PM or 14:30"
                                    autoFocus
                                  />
                                  <div className="session-data-tester__modal-task-field-actions">
                                    <button
                                      onClick={saveEditedTaskField}
                                      className="session-data-tester__btn session-data-tester__btn--save-small"
                                    >
                                      <FaCheck />
                                    </button>
                                    <button
                                      onClick={cancelEditingTaskField}
                                      className="session-data-tester__btn session-data-tester__btn--cancel"
                                    >
                                      <FaTimes />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="session-data-tester__modal-task-time-display">
                                  <span 
                                    onClick={() => startEditingTaskField('endTime', currentTask.endTime)}
                                    className="session-data-tester__modal-task-time-value"
                                  >
                                    {formatTime(currentTask.endTime)}
                                  </span>
                                  <button
                                    onClick={() => startEditingTaskField('endTime', currentTask.endTime)}
                                    className="session-data-tester__modal-task-field-edit-btn"
                                    title="Click to edit end time"
                                  >
                                    <FaEdit />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Editable Description */}
                          {editingTaskField === 'description' ? (
                            <div className="session-data-tester__modal-task-field-editor">
                              <input
                                type="text"
                                value={editingTaskValue}
                                onChange={(e) => setEditingTaskValue(e.target.value)}
                                className="session-data-tester__modal-task-input"
                                autoFocus
                              />
                              <div className="session-data-tester__modal-task-field-actions">
                                <button
                                  onClick={saveEditedTaskField}
                                  className="session-data-tester__btn session-data-tester__btn--save-small"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={cancelEditingTaskField}
                                  className="session-data-tester__btn session-data-tester__btn--cancel"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="session-data-tester__modal-task-field-display">
                              <p onClick={() => startEditingTaskField('description', currentTask.description)}>
                                {currentTask.description}
                              </p>
                              <button
                                onClick={() => startEditingTaskField('description', currentTask.description)}
                                className="session-data-tester__modal-task-field-edit-btn"
                                title="Click to edit description"
                              >
                                <FaEdit />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="session-data-tester__modal-task-meta">
                        {/* Analysis Checkboxes - centered */}
                        <div className="session-data-tester__modal-task-analysis">
                          <label className="session-data-tester__checkbox-label">
                            <input
                              type="checkbox"
                              checked={currentTask.should_analyze || false}
                              onChange={(e) => updateTaskCheckbox('should_analyze', e.target.checked)}
                              className="session-data-tester__checkbox"
                            />
                            <span className="session-data-tester__checkbox-text">Should Analyze</span>
                          </label>
                          
                          <label className="session-data-tester__checkbox-label">
                            <input
                              type="checkbox"
                              checked={currentTask.analyze_deliverable || false}
                              onChange={(e) => updateTaskCheckbox('analyze_deliverable', e.target.checked)}
                              className="session-data-tester__checkbox"
                            />
                            <span className="session-data-tester__checkbox-text">Analyze Deliverable</span>
                          </label>
                        </div>
                        
                        {/* Add Resource & Add Question Buttons - right side */}
                        <div className="session-data-tester__modal-task-actions">
                          <button
                            onClick={addNewResource}
                            className="session-data-tester__btn session-data-tester__btn--add-resource"
                            title="Add new resource to current task"
                          >
                            <FaPlus />
                            Add Resource
                          </button>
                          <button
                            onClick={addNewQuestion}
                            className="session-data-tester__btn session-data-tester__btn--add-question"
                            title="Add new question to current task"
                          >
                            <FaPlus />
                            Add Question
                          </button>
                        </div>
                      </div>
                      
                      {/* Smart Task Configuration Section */}
                      <div className="session-data-tester__smart-config session-data-tester__smart-config--modal">
                        <h4 className="session-data-tester__smart-config-title">Smart Task Configuration</h4>
                        <div className="session-data-tester__smart-config-grid">
                          <div className="session-data-tester__smart-config-item">
                            <label>Task Mode:</label>
                            <select
                              value={currentTask.task_mode || 'basic'}
                              onChange={(e) => updateTaskCheckbox('task_mode', e.target.value)}
                              className="session-data-tester__select"
                            >
                              <option value="basic">📝 Basic</option>
                              <option value="conversation">💬 Conversation</option>
                            </select>
                          </div>
                          
                          <div className="session-data-tester__smart-config-item">
                            <label>Deliverable Type:</label>
                            <div className="session-data-tester__deliverable-controls">
                              <select
                                value={currentTask.deliverable_type || ''}
                                onChange={(e) => updateTaskCheckbox('deliverable_type', e.target.value)}
                                className="session-data-tester__select"
                              >
                                <option value="">None</option>
                                <option value="text">📄 Text</option>
                                <option value="document">📃 Document</option>
                                <option value="video">🎥 Video</option>
                                <option value="link">🔗 Link</option>
                                <option value="structured">📋 Structured</option>
                              </select>
                              {currentTask.deliverable_type === 'structured' && (
                                <button
                                  onClick={openSchemaEditor}
                                  className="session-data-tester__btn session-data-tester__btn--schema"
                                  title="Edit deliverable schema"
                                >
                                  <FaEdit />
                                  Edit Schema
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {currentTask.persona && (
                            <div className="session-data-tester__smart-config-item">
                              <label>Persona:</label>
                              <span className="session-data-tester__badge session-data-tester__badge--persona">
                                {currentTask.persona}
                              </span>
                            </div>
                          )}
                          
                          {currentTask.ai_helper_mode && (
                            <div className="session-data-tester__smart-config-item">
                              <label>AI Helper Mode:</label>
                              <span className="session-data-tester__badge session-data-tester__badge--helper">
                                {currentTask.ai_helper_mode.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          
                          {currentTask.feedback_slot && (
                            <div className="session-data-tester__smart-config-item">
                              <label>Survey Type:</label>
                              <span className={`session-data-tester__badge session-data-tester__badge--survey session-data-tester__badge--survey-${currentTask.feedback_slot}`}>
                                📊 {currentTask.feedback_slot.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
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
                              <div className="session-data-tester__modal-resource-actions">
                                <button
                                  onClick={() => startEditingResource(index, 'title', resource.title)}
                                  className="session-data-tester__btn session-data-tester__btn--edit-small"
                                  title="Edit title"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => startEditingResource(index, 'url', resource.url)}
                                  className="session-data-tester__btn session-data-tester__btn--edit-small"
                                  title="Edit URL"
                                >
                                  <FaLink />
                                </button>
                                <button
                                  onClick={() => startEditingResource(index, 'description', resource.description)}
                                  className="session-data-tester__btn session-data-tester__btn--edit-small"
                                  title="Edit description"
                                >
                                  <FaFileAlt />
                                </button>
                                <button
                                  onClick={() => deleteResource(index)}
                                  className="session-data-tester__btn session-data-tester__btn--delete-small"
                                  title="Delete resource"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Messages Preview */}
                    <div className="session-data-tester__modal-messages">
                      <h4>Conversation Flow (Click to Edit)</h4>
                      <div className="session-data-tester__modal-message-list">
                        {messages.map((message, messageIndex) => (
                          <div 
                            key={message.id}
                            className={`session-data-tester__modal-message session-data-tester__modal-message--${message.role}`}
                          >
                            {message.id === 'intro' && <div className="session-data-tester__modal-message-label">Introduction</div>}
                            {message.id === 'conclusion' && <div className="session-data-tester__modal-message-label">Conclusion</div>}
                            {editingMessageId === message.id ? (
                              <div className="session-data-tester__modal-message-editor">
                                <textarea
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="session-data-tester__modal-message-textarea"
                                  rows={5}
                                  autoFocus
                                />
                                <div className="session-data-tester__modal-message-actions">
                                  <button
                                    onClick={saveEditedMessage}
                                    className="session-data-tester__btn session-data-tester__btn--save-small"
                                  >
                                    <FaCheck />
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="session-data-tester__btn session-data-tester__btn--cancel"
                                  >
                                    <FaTimes />
                                    Cancel
                                  </button>
                                  {message.id.startsWith('question-') && (
                                    <button
                                      onClick={() => {
                                        const questionIndex = parseInt(message.id.split('-')[1]);
                                        deleteQuestion(questionIndex);
                                        cancelEditing();
                                      }}
                                      className="session-data-tester__btn session-data-tester__btn--delete"
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="session-data-tester__modal-message-content">
                                <div className="session-data-tester__modal-message-text">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                                <button
                                  onClick={() => startEditingMessage(message.id, message.content)}
                                  className="session-data-tester__modal-message-edit-btn"
                                  title="Click to edit"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            )}
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

      {/* Delete Task Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="session-data-tester__delete-confirm-overlay">
          <div className="session-data-tester__delete-confirm-modal">
            <div className="session-data-tester__delete-confirm-header">
              <h3>Delete Task</h3>
              <button
                onClick={cancelDeleteTask}
                className="session-data-tester__delete-confirm-close"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="session-data-tester__delete-confirm-content">
              <div className="session-data-tester__delete-confirm-icon">
                <FaTrash />
              </div>
              <div className="session-data-tester__delete-confirm-text">
                <p>Are you sure you want to delete this task?</p>
                {taskToDelete !== null && tasks[taskToDelete] && (
                  <div className="session-data-tester__delete-confirm-task-info">
                    <strong>{tasks[taskToDelete].title}</strong>
                    <span>{formatTime(tasks[taskToDelete].startTime)} - {formatTime(tasks[taskToDelete].endTime)}</span>
                  </div>
                )}
                <p className="session-data-tester__delete-confirm-warning">
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            
            <div className="session-data-tester__delete-confirm-actions">
              <button
                onClick={cancelDeleteTask}
                className="session-data-tester__btn session-data-tester__btn--cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTask}
                className="session-data-tester__btn session-data-tester__btn--delete"
              >
                <FaTrash />
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Editing Modal */}
      {editingResourceIndex !== null && (
        <div className="session-data-tester__resource-editor-overlay">
          <div className="session-data-tester__resource-editor">
            <h3>{editingResourceIndex === -1 ? 'Add New Resource' : 'Edit Resource'}</h3>
            
            <div className="session-data-tester__resource-field">
              <label>
                {editingResourceField === 'title' && 'Resource Title:'}
                {editingResourceField === 'url' && 'Resource URL:'}
                {editingResourceField === 'description' && 'Resource Description:'}
              </label>
              {editingResourceField === 'description' ? (
                <textarea
                  value={editingResourceValue}
                  onChange={(e) => setEditingResourceValue(e.target.value)}
                  className="session-data-tester__resource-textarea"
                  placeholder="Enter resource description"
                  rows={3}
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={editingResourceValue}
                  onChange={(e) => setEditingResourceValue(e.target.value)}
                  className="session-data-tester__resource-input"
                  placeholder={
                    editingResourceField === 'title' ? 'Enter resource title' : 
                    editingResourceField === 'url' ? 'Enter resource URL' : 
                    'Enter value'
                  }
                  autoFocus
                />
              )}
            </div>
            
            <div className="session-data-tester__resource-editor-actions">
              <button
                onClick={saveEditedResource}
                className="session-data-tester__btn session-data-tester__btn--save-small"
              >
                <FaCheck />
                Save
              </button>
              <button
                onClick={cancelEditingResource}
                className="session-data-tester__btn session-data-tester__btn--cancel"
              >
                <FaTimes />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Editor Modal */}
      {showSchemaEditor && (
        <div className="session-data-tester__schema-editor-overlay">
          <div className="session-data-tester__schema-editor">
            <div className="session-data-tester__schema-editor-header">
              <h2>Edit Deliverable Schema</h2>
              <button
                onClick={closeSchemaEditor}
                className="session-data-tester__schema-editor-close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="session-data-tester__schema-editor-content">
              <p className="session-data-tester__schema-editor-help">
                Define the structure of the deliverable form that users will fill out. Each field represents one input in the form.
              </p>

              {schemaFields.length === 0 ? (
                <div className="session-data-tester__schema-empty">
                  <p>No fields defined yet. Click "Add Field" to create your first form field.</p>
                </div>
              ) : (
                <div className="session-data-tester__schema-fields">
                  {schemaFields.map((field, index) => (
                    <div key={index} className="session-data-tester__schema-field">
                      <div className="session-data-tester__schema-field-header">
                        <h4>Field {index + 1}</h4>
                        <button
                          onClick={() => deleteSchemaField(index)}
                          className="session-data-tester__btn session-data-tester__btn--delete-small"
                          title="Delete field"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="session-data-tester__schema-field-grid">
                        <div className="session-data-tester__schema-field-row">
                          <label>Field Name (key):</label>
                          <input
                            type="text"
                            value={field.name || ''}
                            onChange={(e) => updateSchemaField(index, 'name', e.target.value)}
                            placeholder="field_name"
                            className="session-data-tester__schema-input"
                          />
                        </div>
                        
                        <div className="session-data-tester__schema-field-row">
                          <label>Label (display):</label>
                          <input
                            type="text"
                            value={field.label || ''}
                            onChange={(e) => updateSchemaField(index, 'label', e.target.value)}
                            placeholder="Field Label"
                            className="session-data-tester__schema-input"
                          />
                        </div>
                        
                        <div className="session-data-tester__schema-field-row">
                          <label>Field Type:</label>
                          <select
                            value={field.type || 'text'}
                            onChange={(e) => updateSchemaField(index, 'type', e.target.value)}
                            className="session-data-tester__select"
                          >
                            <option value="text">Text</option>
                            <option value="textarea">Textarea</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="url">URL</option>
                            <option value="date">Date</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                        
                        <div className="session-data-tester__schema-field-row">
                          <label>Placeholder:</label>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateSchemaField(index, 'placeholder', e.target.value)}
                            placeholder="Enter placeholder text..."
                            className="session-data-tester__schema-input"
                          />
                        </div>
                        
                        {field.type === 'textarea' && (
                          <div className="session-data-tester__schema-field-row">
                            <label>Rows:</label>
                            <input
                              type="number"
                              value={field.rows || 3}
                              onChange={(e) => updateSchemaField(index, 'rows', parseInt(e.target.value) || 3)}
                              min="1"
                              max="20"
                              className="session-data-tester__schema-input session-data-tester__schema-input--small"
                            />
                          </div>
                        )}
                        
                        <div className="session-data-tester__schema-field-row">
                          <label>Help Text:</label>
                          <input
                            type="text"
                            value={field.help || ''}
                            onChange={(e) => updateSchemaField(index, 'help', e.target.value)}
                            placeholder="Optional help text"
                            className="session-data-tester__schema-input"
                          />
                        </div>
                        
                        <div className="session-data-tester__schema-field-row">
                          <label className="session-data-tester__checkbox-label">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateSchemaField(index, 'required', e.target.checked)}
                              className="session-data-tester__checkbox"
                            />
                            <span className="session-data-tester__checkbox-text">Required Field</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addSchemaField}
                className="session-data-tester__btn session-data-tester__btn--add"
              >
                <FaPlus />
                Add Field
              </button>
            </div>

            <div className="session-data-tester__schema-editor-actions">
              <button
                onClick={closeSchemaEditor}
                className="session-data-tester__btn session-data-tester__btn--cancel"
              >
                <FaTimes />
                Cancel
              </button>
              <button
                onClick={saveSchema}
                className="session-data-tester__btn session-data-tester__btn--save"
              >
                <FaSave />
                Save Schema
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SessionTester; 
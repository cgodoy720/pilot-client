import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import './Learning.css';

function Learning() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  
  // Current day and task data
  const [currentDay, setCurrentDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // If the timeString includes seconds (HH:MM:SS), remove the seconds
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${formattedHours}:${minutes} ${period}`;
  };
  
  // Fetch messages for the current task
  const fetchTaskMessages = async (taskId) => {
    if (!taskId) return;
    
    setIsMessagesLoading(true);
    setError('');
    
    // Only show loading indicator if we're switching to a different task
    const isSameTask = tasks.find(t => t.id === taskId)?.id === tasks[currentTaskIndex]?.id;
    
    if (!isSameTask) {
      // When switching tasks, keep the previous messages visible but show a subtle loading indicator
      setMessages(prevMessages => {
        // If we already have messages, keep them visible with a loading state
        // This prevents the UI from flashing empty content
        if (prevMessages.length > 0) {
          return prevMessages;
        }
        
        // Only show loading message if we have no messages yet
        return [{
          id: 'loading-indicator',
          role: 'assistant',
          content: 'Loading task information...'
        }];
      });
    }
    
    try {
      // Fetch existing messages for this task
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/task-messages/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch task messages');
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
        // Format messages for display
        const formattedMessages = data.map(msg => ({
          id: msg.message_id,
          role: msg.message_role,
          content: msg.content
        }));
        
        setMessages(formattedMessages);
      } else {
        // No existing messages, send the initial 'start' message
        const currentTask = tasks.find(task => task.id === taskId);
        const hasResources = currentTask && currentTask.resources && currentTask.resources.length > 0;
        
        // Only update messages if we're not already showing a loading message
        if (!isSameTask) {
          setMessages([
            {
              id: Date.now(),
              role: 'assistant',
              content: `Loading task: **${currentTask?.title || 'New Task'}**...`
            }
          ]);
        }
        
        const initialMessageResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: 'start',
            message_role: 'system',
            taskId: taskId
          })
        });
        
        if (initialMessageResponse.ok) {
          const initialMessageData = await initialMessageResponse.json();
          
          // Add a note about resources if they exist
          let messageContent = initialMessageData.content;
          if (hasResources) {
            messageContent = `Let's work on: **${currentTask.title}**\n\n**Please review the resources above before we begin.** They contain important information for this task.\n\n${initialMessageData.content.replace(/^Let's work on: \*\*.*?\*\*\n\n/i, '')}`;
          }
          
          setMessages([
            {
              id: initialMessageData.message_id || Date.now(),
              role: 'assistant',
              content: messageContent
            }
          ]);
        } else {
          // Fallback if API call fails
          const currentTask = tasks.find(task => task.id === taskId);
          const hasResources = currentTask && currentTask.resources && currentTask.resources.length > 0;
          
          let messageContent = `Let's work on: **${currentTask.title}**\n\n${currentTask.description}`;
          if (hasResources) {
            messageContent = `Let's work on: **${currentTask.title}**\n\n**Please review the resources above before we begin.** They contain important information for this task.\n\n${currentTask.description}`;
          }
          
          setMessages([
            {
              id: Date.now(),
              role: 'assistant',
              content: messageContent
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching task messages:', err);
      setError('Failed to load task messages. Please try again.');
      
      // Fallback to a default message
      const currentTask = tasks.find(task => task.id === taskId);
      if (currentTask) {
        const hasResources = currentTask && currentTask.resources && currentTask.resources.length > 0;
        
        let messageContent = `Let's work on: **${currentTask.title}**\n\n${currentTask.description}`;
        if (hasResources) {
          messageContent = `Let's work on: **${currentTask.title}**\n\n**Please review the resources above before we begin.** They contain important information for this task.\n\n${currentTask.description}`;
        }
        
        setMessages([
          {
            id: Date.now(),
            role: 'assistant',
            content: messageContent
          }
        ]);
      }
    } finally {
      setIsMessagesLoading(false);
    }
  };
  
  // Fetch current day data and tasks
  useEffect(() => {
    const fetchCurrentDayData = async () => {
      setIsPageLoading(true);
      setError('');
      
      try {
        // Fetch current day's schedule and progress
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/current-day`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch learning data');
        }
        
        const data = await response.json();
        
        if (data.message === 'No schedule for today') {
          setError('No learning schedule available for today.');
          setIsPageLoading(false);
          return;
        }
        
        // Process the data
        const dayData = data.day;
        
        // Extract tasks from all time blocks
        const allTasks = [];
        
        data.timeBlocks.forEach(block => {
          // Add tasks with their completion status
          block.tasks.forEach(task => {
            const taskProgress = data.taskProgress.find(
              progress => progress.task_id === task.task_id
            );
            
            allTasks.push({
              id: task.task_id,
              title: task.task_title,
              description: task.task_description,
              type: task.task_type,
              blockTitle: block.block_title,
              blockTime: formatTime(block.start_time),
              completed: taskProgress ? taskProgress.status === 'completed' : false,
              resources: task.resources || []
            });
          });
        });
        
        // Find the first incomplete task to start with
        const firstIncompleteIndex = allTasks.findIndex(task => !task.completed);
        const initialTaskIndex = firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
        
        // Batch update state to reduce renders
        setCurrentDay(dayData);
        setTasks(allTasks);
        setCurrentTaskIndex(initialTaskIndex);
        
        // Fetch messages for the initial task
        if (allTasks.length > 0) {
          const initialTaskId = allTasks[initialTaskIndex].id;
          await fetchTaskMessages(initialTaskId);
        }
        
      } catch (err) {
        console.error('Error fetching learning data:', err);
        setError('Failed to load learning data. Please try again later.');
        
        // Set some mock data for development
        const mockTasks = [
          { 
            id: 1, 
            title: 'Share a learning tool', 
            description: 'Think about a digital tool you\'ve used to learn something new (YouTube, Duolingo, Coursera, etc.). Share one tool and how it helped you learn.',
            completed: false,
            type: 'share',
            blockTitle: 'Discussion on Digital Learning',
            blockTime: '1:00 PM'
          },
          { 
            id: 2, 
            title: 'Discuss features', 
            description: 'What specific features of the tool did you find most useful for your learning style?',
            completed: false,
            type: 'discuss',
            blockTitle: 'Discussion on Digital Learning',
            blockTime: '1:15 PM'
          },
          { 
            id: 3, 
            title: 'Reflect on effectiveness', 
            description: 'How effective do you think this approach was compared to traditional learning methods you\'ve tried?',
            completed: false,
            type: 'reflect',
            blockTitle: 'Reflection',
            blockTime: '1:30 PM'
          }
        ];
        
        // Batch update state to reduce renders
        setTasks(mockTasks);
        setCurrentTaskIndex(0);
        
        // Set initial message based on the mock current task
        setMessages([
          {
            id: 1,
            role: 'assistant',
            content: `Let's work on: **${mockTasks[0].title}**\n\n${mockTasks[0].description}`
          }
        ]);
      } finally {
        setIsPageLoading(false);
      }
    };
    
    fetchCurrentDayData();
  }, [token]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    const messageToSend = newMessage;
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    setIsAiThinking(true);
    
    try {
      // Get the current task ID
      const currentTaskId = tasks[currentTaskIndex]?.id;
      
      // Send message to learning API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageToSend,
          message_role: 'user',
          taskId: currentTaskId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Get AI response
      const aiResponseData = await response.json();
      
      // Check if we should move to the next task based on message count
      const shouldAdvanceTask = messages.length >= 3 && currentTaskIndex < tasks.length - 1;
      
      if (shouldAdvanceTask) {
        // Mark current task as completed using the new endpoint
        await fetch(`${import.meta.env.VITE_API_URL}/api/learning/complete-task/${currentTaskId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            notes: ''
          })
        });
        
        // Move to next task
        const nextTaskIndex = currentTaskIndex + 1;
        setCurrentTaskIndex(nextTaskIndex);
        
        // Add a transition message from the AI
        const nextTask = tasks[nextTaskIndex];
        const aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Great job completing that task! Let's move on to the next one:\n\n**${nextTask.title}**\n\n${nextTask.description}`
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Regular AI response
        let aiResponse;
        
        if (aiResponseData && aiResponseData.content) {
          // Use the actual AI response from the API
          aiResponse = {
            id: aiResponseData.message_id || Date.now() + 1,
            role: 'assistant',
            content: aiResponseData.content
          };
        } else {
          // Fallback response if API doesn't return expected format
          aiResponse = {
            id: Date.now() + 1,
            role: 'assistant',
            content: "I'm processing your message. Could you provide more details or clarify your thoughts?"
          };
        }
        
        setMessages(prev => [...prev, aiResponse]);
      }
    } catch (err) {
      console.error('Error sending/receiving message:', err);
      setError('Failed to communicate with the learning assistant. Please try again.');
      
      // Fallback AI response for development
      let aiResponse;
      
      // Check if we should move to the next task based on message count
      if (messages.length >= 3 && currentTaskIndex < tasks.length - 1) {
        // Move to next task
        const nextTaskIndex = currentTaskIndex + 1;
        setCurrentTaskIndex(nextTaskIndex);
        
        // Add a transition message from the AI
        const nextTask = tasks[nextTaskIndex];
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Great job completing that task! Let's move on to the next one:\n\n**${nextTask.title}**\n\n${nextTask.description}`
        };
      } else {
        // Regular AI response based on current task
        const responseOptions = [
          "That's a great example! Could you tell me more about specific features you found helpful?",
          "Interesting perspective! How do you think this compares to traditional learning methods?",
          "Thank you for sharing your experience! Your insights will help us design better learning experiences."
        ];
        
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: responseOptions[Math.min(messages.length - 1, responseOptions.length - 1)]
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };
  
  // Mark a task as completed
  const markTaskAsCompleted = async (taskId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/learning/complete-task/${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          notes: ''
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
      
      // Automatically transition to the next task if available
      const nextTaskIndex = currentTaskIndex + 1;
      if (nextTaskIndex < tasks.length) {
        // Add a transition message
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: Date.now(),
            role: 'assistant',
            content: "Great job completing this task! Let's move on to the next one.",
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Wait a moment before transitioning
        setTimeout(() => {
          setCurrentTaskIndex(nextTaskIndex);
          fetchTaskMessages(tasks[nextTaskIndex].id);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Error marking task as completed:', err);
      // Still update the UI even if the API call fails
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
    }
  };
  
  // Handle quick reply
  const handleQuickReply = (reply) => {
    if (isSending) return;
    
    setNewMessage(reply);
    // Optional: automatically send the quick reply
    // setTimeout(() => {
    //   handleSendMessage({ preventDefault: () => {} });
    // }, 500);
  };
  
  // Helper function to get task icon based on type
  const getTaskIcon = (type, completed) => {
    if (completed) {
      return <FaCheckCircle className="task-icon completed" />;
    }
    
    switch (type) {
      case 'share':
      case 'discussion':
        return <FaCheckCircle className="task-icon share" />;
      case 'discuss':
      case 'group':
        return <FaUsers className="task-icon discuss" />;
      case 'reflect':
      case 'individual':
        return <FaBook className="task-icon reflect" />;
      default:
        return <FaCheckCircle className="task-icon" />;
    }
  };
  
  // Add this function to render resources
  const renderTaskResources = (resources) => {
    if (!resources || resources.length === 0) return null;
    
    // Group resources by type
    const groupedResources = resources.reduce((acc, resource) => {
      const type = resource.resource_type || 'other';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(resource);
      return acc;
    }, {});
    
    return (
      <div className="learning__task-resources">
        <h4 className="learning__task-resources-title">Task Resources</h4>
        <p className="learning__task-resources-intro">Please review these materials before continuing:</p>
        <ul className="learning__task-resources-list">
          {Object.entries(groupedResources).map(([type, typeResources]) => (
            <div key={type} className="learning__task-resources-group">
              {typeResources.map((resource) => (
                <li key={resource.resource_id} className="learning__task-resources-item">
                  <a 
                    href={resource.resource_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="learning__task-resources-link"
                  >
                    {resource.resource_title}
                    <span className="learning__task-resources-type">{type}</span>
                  </a>
                </li>
              ))}
            </div>
          ))}
        </ul>
      </div>
    );
  };
  
  // Update the formatMessageContent function to NOT include resources for every message
  const formatMessageContent = (content) => {
    if (!content) return null;
    
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
              {part}
            </ReactMarkdown>
          );
        })}
      </>
    );
  };

  // Handle textarea auto-resize
  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Add this function to handle task navigation
  const navigateToTask = (direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentTaskIndex + 1, tasks.length - 1)
      : Math.max(currentTaskIndex - 1, 0);
      
    if (newIndex !== currentTaskIndex) {
      // Update the current task index first
      setCurrentTaskIndex(newIndex);
      
      // Then fetch the messages for the new task
      fetchTaskMessages(tasks[newIndex].id);
    }
  };

  if (isPageLoading) {
    return <div className="learning loading">Loading learning session...</div>;
  }

  return (
    <div className="learning">
      <div className="learning__content">
        <div className="learning__task-panel">
          <div className="learning__task-header">
            <h2>Today's Tasks</h2>
          </div>
          <div className="learning__tasks-list">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''} ${task.completed ? 'completed' : ''}`}
                onClick={() => {
                  if (index !== currentTaskIndex) {
                    setCurrentTaskIndex(index);
                    fetchTaskMessages(task.id);
                  }
                }}
              >
                <div className="learning__task-icon">
                  {getTaskIcon(task.type, task.completed)}
                </div>
                <div className="learning__task-content">
                  <h3 className="learning__task-title">{task.title}</h3>
                  <div className="learning__task-block">
                    {task.blockTitle} • {task.blockTime}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="learning__chat-container">
          <div className="learning__chat-panel">
            {/* Display resources at the top of the chat panel */}
            {currentTaskIndex < tasks.length && tasks[currentTaskIndex].resources && tasks[currentTaskIndex].resources.length > 0 && (
              <div className="learning__task-resources-container">
                {renderTaskResources(tasks[currentTaskIndex].resources)}
              </div>
            )}
            
            <div className={`learning__messages ${isMessagesLoading ? 'loading' : ''}`}>
              {messages.map(message => (
                <div key={message.id} className={`learning__message learning__message--${message.role}`}>
                  <div className={`learning__message-content ${isMessagesLoading && message === messages[messages.length - 1] ? 'learning__message-content--loading' : ''}`}>
                    {formatMessageContent(message.content)}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="learning__message learning__message--assistant">
                  <div className="learning__message-content learning__message-content--thinking">
                    <div className="learning__typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="learning__task-navigation">
              <button 
                className="learning__task-nav-button" 
                onClick={() => navigateToTask('prev')}
                disabled={currentTaskIndex === 0}
              >
                <FaArrowLeft /> Previous Task
              </button>
              <button 
                className="learning__task-nav-button" 
                onClick={() => navigateToTask('next')}
                disabled={currentTaskIndex === tasks.length - 1}
              >
                Next Task <FaArrowRight />
              </button>
            </div>
            
            <form className="learning__input-form" onSubmit={handleSendMessage}>
              <textarea
                ref={textareaRef}
                className="learning__input"
                value={newMessage}
                onChange={handleTextareaChange}
                placeholder={isSending ? "Sending..." : "Type your message..."}
                disabled={isSending || isAiThinking}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
              />
              <button 
                className="learning__send-btn" 
                type="submit" 
                disabled={!newMessage.trim() || isSending || isAiThinking}
              >
                {isSending ? "Sending..." : <FaPaperPlane />}
              </button>
            </form>
            
            {error && <div className="learning__error">{error}</div>}
            
            {currentTaskIndex < tasks.length && tasks[currentTaskIndex].type === 'reflect' && (
              <div className="learning__quick-replies">
                <h4 className="learning__quick-replies-title">Quick Replies</h4>
                <div className="learning__quick-replies-list">
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("I've used Khan Academy for math and found the interactive exercises helped me understand concepts better than textbooks.")}
                    disabled={isSending || isAiThinking}
                  >
                    I've used Khan Academy
                  </button>
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("Interactive exercises helped me learn faster because I could immediately apply what I was learning.")}
                    disabled={isSending || isAiThinking}
                  >
                    Interactive exercises helped
                  </button>
                  <button 
                    className="learning__quick-reply-btn"
                    onClick={() => handleQuickReply("I found digital tools more effective than traditional textbooks because they provided immediate feedback.")}
                    disabled={isSending || isAiThinking}
                  >
                    More effective than textbooks
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Learning; 
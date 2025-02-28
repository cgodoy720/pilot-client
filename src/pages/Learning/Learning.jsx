import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane } from 'react-icons/fa';
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Current day and task data
  const [currentDay, setCurrentDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  
  // Time tracking
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(300); // 5 minutes in seconds
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Fetch current day data and tasks
  useEffect(() => {
    const fetchCurrentDayData = async () => {
      setIsLoading(true);
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
          setIsLoading(false);
          return;
        }
        
        // Process the data
        setCurrentDay(data.day);
        
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
              blockTime: block.start_time,
              completed: taskProgress ? taskProgress.status === 'completed' : false
            });
          });
        });
        
        setTasks(allTasks);
        
        // Find the first incomplete task to start with
        const firstIncompleteIndex = allTasks.findIndex(task => !task.completed);
        setCurrentTaskIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
        
        // Set initial message based on the current task
        if (allTasks.length > 0) {
          const currentTask = allTasks[firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0];
          setMessages([
            {
              id: 1,
              role: 'assistant',
              content: `Let's work on: **${currentTask.title}**\n\n${currentTask.description}`
            }
          ]);
        }
        
        // Set total time based on the current task duration (if available)
        if (allTasks.length > 0) {
          const currentTask = allTasks[firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0];
          // Assuming duration is stored in minutes, convert to seconds
          if (currentTask.duration) {
            setTotalTime(currentTask.duration * 60);
          }
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
        setIsLoading(false);
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
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        if (prev < totalTime) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [totalTime]);
  
  // Format time as mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
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
      // Send message to conversation API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: messageToSend,
          message_role: 'user'
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
        // Mark current task as completed
        await markTaskAsCompleted(tasks[currentTaskIndex].id);
        
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/progress/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed',
          user_notes: ''
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
  
  // Format message content with markdown
  const formatMessageContent = (content) => {
    return (
      <ReactMarkdown
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
          blockquote: ({node, children, ...props}) => (
            <blockquote className="markdown-blockquote" {...props}>{children}</blockquote>
          ),
          code: ({node, inline, className, children, ...props}) => {
            if (inline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
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

  if (isLoading) {
    return <div className="learning loading">Loading learning session...</div>;
  }

  return (
    <div className="learning">
      <div className="learning__content">
        {/* Task Panel */}
        <div className="learning__task-panel">
          <div className="learning__task-header">
            <h2>Today's Tasks</h2>
            <div className="learning__timer">
              Time: {formatTime(elapsedTime)} / {formatTime(totalTime)}
            </div>
          </div>
          
          <div className="learning__tasks-list">
            {tasks.map((task, index) => (
              <div 
                key={task.id} 
                className={`learning__task-item ${index === currentTaskIndex ? 'current' : ''} ${task.completed ? 'completed' : ''}`}
                onClick={() => setCurrentTaskIndex(index)}
              >
                <div className="learning__task-icon">
                  {getTaskIcon(task.type, task.completed)}
                </div>
                <div className="learning__task-content">
                  <div className="learning__task-title">{task.title}</div>
                  <div className="learning__task-block">{task.blockTitle} • {task.blockTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="learning__chat-container">
          {/* Chat Window */}
          <div className="learning__chat-panel">
            <div className="learning__messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`learning__message ${message.role === 'user' ? 'learning__message--user' : 'learning__message--assistant'}`}
                >
                  <div className="learning__message-content">
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
            
            {/* Message Input */}
            <form className="learning__input-form" onSubmit={handleSendMessage}>
              {error && <div className="learning__error">{error}</div>}
              <textarea
                ref={textareaRef}
                className="learning__input"
                placeholder={isSending ? "Sending..." : "Type your message..."}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                disabled={isSending}
                rows={1}
              />
              <button 
                type="submit" 
                className="learning__send-btn"
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? "Sending..." : <FaPaperPlane />}
              </button>
            </form>
            
            {/* Quick Replies */}
            <div className="learning__quick-replies">
              <div className="learning__quick-replies-title">Quick Replies</div>
              <div className="learning__quick-replies-list">
                <button 
                  className="learning__quick-reply-btn"
                  onClick={() => handleQuickReply("I've used Khan Academy for learning math concepts.")}
                >
                  I've used Khan Academy
                </button>
                <button 
                  className="learning__quick-reply-btn"
                  onClick={() => handleQuickReply("The interactive exercises helped me understand the concepts better.")}
                >
                  Interactive exercises helped
                </button>
                <button 
                  className="learning__quick-reply-btn"
                  onClick={() => handleQuickReply("It was more effective than traditional textbooks because of the immediate feedback.")}
                >
                  More effective than textbooks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Learning; 
import React, { useState, useRef, useEffect } from 'react';
import { FaCheckCircle, FaUsers, FaUserAlt, FaBook, FaPaperPlane } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import './Learning.css';

function Learning() {
  const { token } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Think about a digital tool you\'ve used to learn something new (YouTube, Duolingo, Coursera, etc.). Share one tool and how it helped you learn.'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  
  // Sample tasks data - in a real app, this would come from an API
  const [tasks] = useState([
    { 
      id: 1, 
      title: 'Share a learning tool', 
      completed: false,
      type: 'share'
    },
    { 
      id: 2, 
      title: 'Discuss features', 
      completed: false,
      type: 'discuss'
    },
    { 
      id: 3, 
      title: 'Reflect on effectiveness', 
      completed: false,
      type: 'reflect'
    }
  ]);
  
  // Time tracking
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime] = useState(300); // 5 minutes in seconds
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
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
  const handleSendMessage = (e) => {
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
    
    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      let aiResponse;
      
      // Check which task to complete based on message count
      if (messages.length === 1) {
        // After first user message, mark first task as complete
        const updatedTasks = [...tasks];
        updatedTasks[0].completed = true;
        
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Great example! What specific feature of Khan Academy did you find most useful for your learning style? This will help us understand how to personalize your experience.'
        };
      } else if (messages.length === 3) {
        // After second user message, mark second task as complete
        const updatedTasks = [...tasks];
        updatedTasks[1].completed = true;
        
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'That\'s really insightful! Interactive exercises can definitely help with retention. How effective do you think this approach was compared to traditional learning methods you\'ve tried?'
        };
      } else {
        // After third user message, mark third task as complete
        const updatedTasks = [...tasks];
        updatedTasks[2].completed = true;
        
        aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Thank you for sharing your experience! Your insights will help us design better learning experiences. Would you like to continue to the next module or review what we\'ve covered so far?'
        };
      }
      
      setMessages(prev => [...prev, aiResponse]);
      setIsSending(false);
      setIsAiThinking(false);
    }, 1500);
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
        return <FaCheckCircle className="task-icon share" />;
      case 'discuss':
        return <FaUsers className="task-icon discuss" />;
      case 'reflect':
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

  return (
    <div className="learning">
      <div className="learning__content">
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
            <form className="learning__input-form" onSubmit={handleSendMessage}>
              <textarea
                ref={textareaRef}
                rows="1"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={isSending ? "Sending..." : "Type your response..."}
                disabled={isSending}
                className="learning__input"
              />
              <button 
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="learning__send-btn"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
          
          {/* Task Breakdown Panel */}
          <div className="learning__task-panel">
            <div className="learning__task-breakdown">
              <h2 className="panel-title">Task Breakdown</h2>
              <div className="task-list">
                {tasks.map((task, index) => (
                  <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className="task-number">{index + 1}.</div>
                    <div className="task-title">
                      {getTaskIcon(task.type, task.completed)}
                      <span>{task.title}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="task-timer">
                <div className="timer-label">Time:</div>
                <div className="timer-value">{formatTime(elapsedTime)}/{formatTime(totalTime)}</div>
              </div>
            </div>
            
            <div className="learning__quick-replies">
              <h3 className="quick-replies-title">Quick Replies</h3>
              <div className="quick-replies-list">
                <button 
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply("I've used Khan Academy to improve my math skills. The interactive exercises helped me learn at my own pace.")}
                  disabled={isSending}
                >
                  Example answer
                </button>
                <button 
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply("Could you explain more about what you're looking for?")}
                  disabled={isSending}
                >
                  Ask question
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
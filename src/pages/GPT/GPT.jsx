import React, { useState, useRef, useEffect } from 'react';
import './GPT.css';
import { FaPlus, FaChevronLeft } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { getThreads, getThreadMessages, createThread, sendMessageToGPT } from '../../utils/api';

function GPT() {
  const { token } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch threads on component mount
  useEffect(() => {
    if (token) {
      fetchThreads();
    }
  }, [token]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThread && token) {
      fetchMessages(activeThread);
    } else {
      setMessages([]);
    }
  }, [activeThread, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchThreads = async () => {
    try {
      setIsLoading(true);
      const data = await getThreads(token);
      
      // Check the structure of the response and adapt accordingly
      const threadsArray = Array.isArray(data) ? data : 
                          data.threads ? data.threads : 
                          data.data ? data.data : [];
      
      setThreads(threadsArray);
      
      // Set active thread to the first thread if available and none is selected
      if (threadsArray.length > 0 && !activeThread) {
        // Adapt to your API's thread ID field name (thread_id or id)
        const threadIdField = threadsArray[0].thread_id ? 'thread_id' : 'id';
        setActiveThread(threadsArray[0][threadIdField]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      setIsLoading(true);
      const data = await getThreadMessages(threadId, token);
      
      // The API returns an array of messages directly
      let messagesArray = Array.isArray(data) ? data : 
                         data.messages ? data.messages : 
                         data.data ? data.data : [];
      
      // Sort messages by created_at timestamp if available
      if (messagesArray.length > 0 && messagesArray[0].created_at) {
        messagesArray = [...messagesArray].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      }
      
      // Add message_id if not present (using timestamp or index as fallback)
      messagesArray = messagesArray.map((message, index) => {
        if (!message.message_id && !message.id) {
          return {
            ...message,
            message_id: message.created_at ? new Date(message.created_at).getTime() : Date.now() + index
          };
        }
        return message;
      });
      
      setMessages(messagesArray);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadClick = (threadId) => {
    setActiveThread(threadId);
  };

  const handleCreateThread = async () => {
    try {
      setIsLoading(true);
      const data = await createThread(null, token);
      
      // Adapt to your API's response structure
      const newThread = data.thread || data.data || data;
      
      if (newThread) {
        // Adapt to your API's thread ID field name
        const threadIdField = newThread.thread_id ? 'thread_id' : 'id';
        
        setThreads(prev => [newThread, ...prev]);
        setActiveThread(newThread[threadIdField]);
        setMessages([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create new conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeThread || isSending) return;

    const messageToSend = newMessage;
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Add user message to UI immediately
    const tempUserMessageId = Date.now();
    const tempUserMessage = {
      message_id: tempUserMessageId,
      content: messageToSend,
      message_role: 'user',
      created_at: new Date().toISOString()
    };
    
    setMessages(prevMessages => [...prevMessages, tempUserMessage]);
    setNewMessage('');
    setIsSending(true);
    setIsAiThinking(true);

    try {
      // Check if this is the first message in the thread
      const isFirstMessage = messages.length === 0;
      
      // Send message to API
      const response = await sendMessageToGPT(messageToSend, activeThread, token);
      
      // If this is the first message, refresh threads to get updated titles
      if (isFirstMessage) {
        setTimeout(() => {
          fetchThreads();
        }, 1000);
      }
      
      // The API returns a single reply message in the 'reply' field
      if (response && response.reply) {
        // Add the assistant's reply to the messages
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => msg.message_id !== tempUserMessageId),
          // Add the confirmed user message from the server if available, otherwise keep the temp one
          tempUserMessage,
          // Add the assistant's reply
          response.reply
        ]);
      } else {
        // If the response doesn't contain a reply, fetch all messages to ensure we have the latest state
        await fetchMessages(activeThread);
      }
      
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary user message if there was an error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id !== tempUserMessageId)
      );
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };

  const formatMessageContent = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Extract language and code
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || '';
        
        return (
          <pre key={index} className="code-block">
            {language && <div className="code-language">{language}</div>}
            <code>{code}</code>
          </pre>
        );
      }
      return (
        <ReactMarkdown 
          key={index}
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
            table: ({node, children, ...props}) => (
              <table className="markdown-table" {...props}>{children}</table>
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
          {part}
        </ReactMarkdown>
      );
    });
  };

  // Helper function to get thread title
  const getThreadTitle = (thread) => {
    // Adapt to your API's title field name
    return thread.title || thread.name || 'New Conversation';
  };

  // Helper function to get thread ID
  const getThreadId = (thread) => {
    // Adapt to your API's thread ID field name
    return thread.thread_id || thread.id;
  };

  // Helper function to get message ID
  const getMessageId = (message) => {
    // Adapt to your API's message ID field name
    return message.message_id || message.id || message.created_at;
  };

  // Helper function to get message role
  const getMessageRole = (message) => {
    // Adapt to your API's role field name
    return message.message_role || message.role;
  };

  return (
    <div className="gpt">
      <div className="gpt__content">
        <div className="gpt__chat-container">
          <div className={`gpt__sidebar ${!sidebarVisible ? 'gpt__sidebar--collapsed' : ''}`}>
            <div className="gpt__sidebar-header">
              <h3 className="gpt__sidebar-title">Conversations</h3>
              <div className="gpt__sidebar-actions">
                <button 
                  className="gpt__new-thread-btn"
                  onClick={handleCreateThread}
                  title="New Conversation"
                  disabled={isLoading}
                >
                  <FaPlus size={14} />
                </button>
                <button
                  className="gpt__toggle-sidebar-btn"
                  onClick={() => setSidebarVisible(!sidebarVisible)}
                  title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
                >
                  <FaChevronLeft size={14} />
                </button>
              </div>
            </div>
            
            {error && <div className="gpt__error">{error}</div>}
            
            <div className="gpt__threads-list">
              {isLoading && threads.length === 0 ? (
                <div className="gpt__loading">Loading conversations...</div>
              ) : threads.length === 0 ? (
                <div className="gpt__empty-threads">No conversations yet</div>
              ) : (
                threads.map((thread) => (
                  <div 
                    key={getThreadId(thread)}
                    className={`gpt__thread-item ${activeThread === getThreadId(thread) ? 'gpt__thread-item--active' : ''}`}
                    onClick={() => handleThreadClick(getThreadId(thread))}
                  >
                    {getThreadTitle(thread)}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="gpt__chat-panel">
            {!activeThread ? (
              <div className="gpt__empty-state">
                <h3 className="gpt__empty-state-title">Start a New Conversation</h3>
                <p className="gpt__empty-state-text">Create a new thread to start chatting with GPT-4-TURBO</p>
                <button 
                  className="gpt__empty-state-btn" 
                  onClick={handleCreateThread}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'New Conversation'}
                </button>
              </div>
            ) : (
              <>
                <div className="gpt__messages">
                  {isLoading && messages.length === 0 ? (
                    <div className="gpt__loading-messages">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="gpt__empty-messages">
                      <p>No messages yet. Start the conversation by sending a message below.</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={getMessageId(message)} 
                        className={`gpt__message ${getMessageRole(message) === 'user' ? 'gpt__message--user' : 'gpt__message--assistant'}`}
                      >
                        <div className="gpt__message-content">
                          {formatMessageContent(message.content)}
                        </div>
                      </div>
                    ))
                  )}
                  {isAiThinking && (
                    <div className="gpt__message gpt__message--assistant">
                      <div className="gpt__message-content gpt__message-content--thinking">
                        <div className="gpt__typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form className="gpt__input-form" onSubmit={handleSendMessage}>
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
                    placeholder={isSending ? "Sending..." : "Type your message..."}
                    disabled={!activeThread || isSending || isLoading}
                    className="gpt__input"
                  />
                  <button 
                    type="submit"
                    disabled={!activeThread || !newMessage.trim() || isSending || isLoading}
                    className="gpt__send-btn"
                  >
                    {isSending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPT; 
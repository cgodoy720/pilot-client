import React, { useState, useRef, useEffect } from 'react';
import './GPT.css';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getThreads, getThreadMessages, createThread, sendMessageToGPT } from '../../utils/api';
import SummaryModal from '../../components/SummaryModal/SummaryModal';

// New Components
import GPTTopBar from './components/GPTTopBar';
import ChatTray from './components/ChatTray';
import MessageBubble from './components/MessageBubble';
import ProcessingOverlay from './components/ProcessingOverlay';

function GPT() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Summary-related state
  const [currentThreadSummary, setCurrentThreadSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryThreadId, setSummaryThreadId] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [modalSummaryData, setModalSummaryData] = useState(null);
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4.5');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showThreadDropdown, setShowThreadDropdown] = useState(false);
  
  // Enhanced content management state
  const [contentSources, setContentSources] = useState({});
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [processingFileName, setProcessingFileName] = useState('');
  const [processingUrl, setProcessingUrl] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Check if user is inactive (in historical access mode)
  const isInactiveUser = user && user.active === false;

  // Get threadId and summary data from URL parameters
  const threadIdFromUrl = searchParams.get('threadId');
  const summaryUrl = searchParams.get('summaryUrl');
  const summaryTitle = searchParams.get('summaryTitle'); 
  const summaryData = searchParams.get('summaryData');

  // Fetch threads on component mount
  useEffect(() => {
    if (token) {
      fetchThreads();
    }
  }, [token]);

  // Handle summary data from URL parameters
  useEffect(() => {
    if (summaryUrl && summaryTitle && summaryData) {
      try {
        const parsedSummaryData = JSON.parse(decodeURIComponent(summaryData));
        setCurrentThreadSummary({
          url: summaryUrl,
          title: summaryTitle,
          ...parsedSummaryData
        });
        
        if (threadIdFromUrl) {
          setSummaryThreadId(threadIdFromUrl);
        }
        
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('summaryUrl');
        newSearchParams.delete('summaryTitle');
        newSearchParams.delete('summaryData');
        setSearchParams(newSearchParams, { replace: true });
      } catch (error) {
        console.error('Error parsing summary data from URL:', error);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('summaryUrl');
        newSearchParams.delete('summaryTitle');
        newSearchParams.delete('summaryData');
        setSearchParams(newSearchParams, { replace: true });
      }
    }
  }, [summaryUrl, summaryTitle, summaryData, searchParams, setSearchParams, threadIdFromUrl]);

  // Handle threadId URL parameter
  useEffect(() => {
    if (threadIdFromUrl && threads.length > 0) {
      const targetThread = threads.find(thread => 
        String(getThreadId(thread)) === String(threadIdFromUrl)
      );
      
      if (targetThread) {
        setActiveThread(getThreadId(targetThread));
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('threadId');
        setSearchParams(newSearchParams, { replace: true });
        
        if (currentThreadSummary && !summaryThreadId) {
          setSummaryThreadId(getThreadId(targetThread));
        }
      } else {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('threadId');
        setSearchParams(newSearchParams, { replace: true });
        setError('Thread not found or access denied.');
      }
    }
  }, [threadIdFromUrl, threads, searchParams, setSearchParams]);

  // Fetch messages when active thread changes
  useEffect(() => {
    if (activeThread && token) {
      fetchMessages(activeThread);
    } else {
      setMessages([]);
    }
  }, [activeThread, token]);

  // Clear summary data when switching to a thread without summary
  useEffect(() => {
    if (activeThread && summaryThreadId && String(activeThread) !== String(summaryThreadId)) {
      setCurrentThreadSummary(null);
      setSummaryThreadId(null);
    }
    setModalSummaryData(null);
  }, [activeThread, summaryThreadId]);

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
      
      const threadsArray = Array.isArray(data) ? data : 
                          data.threads ? data.threads : 
                          data.data ? data.data : [];
      
      setThreads(threadsArray);
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
      
      let messagesArray = Array.isArray(data) ? data : 
                         data.messages ? data.messages : 
                         data.data ? data.data : [];
      
      if (messagesArray.length > 0 && messagesArray[0].created_at) {
        messagesArray = [...messagesArray].sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        );
      }
      
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

  const handleThreadSelect = (threadId) => {
    setActiveThread(threadId);
  };

  const handleCreateThread = async () => {
    if (isInactiveUser) {
      setError('You are in historical access mode and cannot create new conversations.');
      return;
    }

    try {
      setIsLoading(true);
      const data = await createThread(null, token);
      const newThread = data.thread || data.data || data;
      
      if (newThread) {
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
    if (!newMessage.trim() || isSending) return;

    if (isInactiveUser) {
      setError('You are in historical access mode and cannot send new messages.');
      return;
    }

    // If no active thread, create one first
    if (!activeThread) {
      try {
        setIsLoading(true);
        const data = await createThread(null, token);
        const newThread = data.thread || data.data || data;
        
        if (newThread) {
          const threadIdField = newThread.thread_id ? 'thread_id' : 'id';
          const newThreadId = newThread[threadIdField];
          setThreads(prev => [newThread, ...prev]);
          setActiveThread(newThreadId);
          setMessages([]);
          
          // Now send the message to the new thread
          await sendMessageToNewThread(newThreadId);
        }
        setError('');
      } catch (err) {
        console.error('Error creating thread:', err);
        setError('Failed to create new conversation. Please try again.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Send to existing thread
    await sendMessageToExistingThread();
  };

  const sendMessageToNewThread = async (threadId) => {
    const messageToSend = newMessage;
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
      const response = await sendMessageToGPT(messageToSend, threadId, token, selectedModel);
      
      setTimeout(() => {
        fetchThreads();
      }, 1000);
      
      if (response && response.reply) {
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => msg.message_id !== tempUserMessageId),
          tempUserMessage,
          response.reply
        ]);
      } else {
        await fetchMessages(threadId);
      }
      
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id !== tempUserMessageId)
      );
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };

  const sendMessageToExistingThread = async () => {
    const messageToSend = newMessage;
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
      const isFirstMessage = messages.length === 0;
      const response = await sendMessageToGPT(messageToSend, activeThread, token, selectedModel);
      
      if (isFirstMessage) {
        setTimeout(() => {
          fetchThreads();
        }, 1000);
      }
      
      if (response && response.reply) {
        setMessages(prevMessages => [
          ...prevMessages.filter(msg => msg.message_id !== tempUserMessageId),
          tempUserMessage,
          response.reply
        ]);
      } else {
        await fetchMessages(activeThread);
      }
      
      setError('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id !== tempUserMessageId)
      );
    } finally {
      setIsSending(false);
      setIsAiThinking(false);
    }
  };

  // Helper functions
  const getThreadId = (thread) => thread.thread_id || thread.id;
  const getThreadTitle = (thread) => thread.title || thread.name || 'New Conversation';
  const getMessageId = (message) => message.message_id || message.id || message.created_at;
  const getMessageRole = (message) => message.message_role || message.role;

  // Upload handling functions
  const handleFileUpload = async (file) => {
    if (!user?.active) {
      setError('You have historical access only and cannot upload files.');
      return;
    }

    if (!activeThread) {
      setError('Please select or create a conversation thread first.');
      return;
    }

    const maxFileSize = 50 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setError(`File size too large. Please upload files smaller than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    setIsProcessingUpload(true);
    setProcessingFileName(file.name);
    setProcessingStep('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `${file.name} Summary`);

      setProcessingStep('Processing content...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process file';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`;
        } catch (parseError) {
          if (response.status === 500) {
            errorMessage = file.size > 10 * 1024 * 1024 
              ? `File too large or complex to process. Try uploading a smaller file or splitting large documents into sections.`
              : `Server error while processing file. The file might be corrupted or in an unsupported format.`;
          } else if (response.status === 413) {
            errorMessage = `File too large. Please upload files smaller than 50MB.`;
          } else if (response.status === 415) {
            errorMessage = `Unsupported file type. Please upload PDF, TXT, MD, or DOCX files.`;
          } else {
            errorMessage = `Server error (${response.status}). Please try again or contact support if the problem persists.`;
          }
        }
        throw new Error(errorMessage);
      }

      setProcessingStep('Generating summary...');
      const summaryData = await response.json();

      setProcessingStep('Finalizing...');
      
      const hiddenSummaryMessage = `File uploaded: ${file.name}\nSummary: ${summaryData.summary}`;
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: hiddenSummaryMessage,
            threadId: activeThread,
            messageType: 'system_content_summary'
          })
        });
      } catch (err) {
        console.warn('Failed to send system message, continuing anyway:', err);
      }

      const contentSourceMessage = {
        message_id: Date.now(),
        content: null,
        message_role: 'content_source',
        created_at: new Date().toISOString(),
        contentSource: {
          id: Date.now(),
          type: 'file',
          title: summaryData.title,
          summary: summaryData.summary,
          fileName: file.name,
          contentType: summaryData.contentType || 'document',
          processedAt: summaryData.created_at
        }
      };

      setMessages(prevMessages => [...prevMessages, contentSourceMessage]);
      setContentSources(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), contentSourceMessage.contentSource]
      }));

      setTimeout(() => {
        fetchThreads();
      }, 1000);

    } catch (error) {
      console.error('Error processing file:', error);
      setError(`Failed to process file: ${error.message}`);
    } finally {
      setIsProcessingUpload(false);
      setProcessingFileName('');
      setProcessingStep('');
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    if (!user?.active) {
      setError('You have historical access only and cannot process URLs.');
      return;
    }

    if (!activeThread) {
      setError('Please select or create a conversation thread first.');
      return;
    }

    setIsProcessingUpload(true);
    setProcessingUrl(urlInput);
    setProcessingStep('Analyzing URL...');
    setShowUrlInput(false);

    try {
      setProcessingStep('Extracting content...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: urlInput })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to process URL';
        try {
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`;
        } catch (parseError) {
          if (response.status === 500) {
            errorMessage = `Server error while processing URL. The content might be too large, restricted, or in an unsupported format.`;
          } else if (response.status === 404) {
            errorMessage = `URL not found or inaccessible. Please check the URL and try again.`;
          } else if (response.status === 403) {
            errorMessage = `Access denied. The content might be behind a paywall or login required.`;
          } else {
            errorMessage = `Server error (${response.status}). Please try again or contact support if the problem persists.`;
          }
        }
        throw new Error(errorMessage);
      }

      setProcessingStep('Generating summary...');
      const summaryData = await response.json();

      setProcessingStep('Finalizing...');
      
      const isVideo = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const type = isVideo ? 'Video' : 'Article';
      const hiddenSummaryMessage = `${type} processed: ${summaryData.title}\nURL: ${urlInput}\nSummary: ${summaryData.summary}`;
      
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/chat/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content: hiddenSummaryMessage,
            threadId: activeThread,
            messageType: 'system_content_summary'
          })
        });
      } catch (err) {
        console.warn('Failed to send system message, continuing anyway:', err);
      }

      const contentSourceMessage = {
        message_id: Date.now(),
        content: null,
        message_role: 'content_source',
        created_at: new Date().toISOString(),
        contentSource: {
          id: Date.now(),
          type: 'url',
          title: summaryData.title,
          summary: summaryData.summary,
          url: urlInput,
          contentType: isVideo ? 'video' : 'article',
          processedAt: summaryData.created_at,
          cached: summaryData.cached
        }
      };

      setMessages(prevMessages => [...prevMessages, contentSourceMessage]);
      setContentSources(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), contentSourceMessage.contentSource]
      }));

      setUrlInput('');

      setTimeout(() => {
        fetchThreads();
      }, 1000);

    } catch (error) {
      console.error('Error processing URL:', error);
      setError(`Failed to process URL: ${error.message}`);
    } finally {
      setIsProcessingUpload(false);
      setProcessingUrl('');
      setProcessingStep('');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = '';
  };

  const showContentSummary = (source) => {
    setModalSummaryData({
      title: source.type === 'file' ? `File Summary: ${source.fileName}` : source.title,
      summary: source.summary,
      url: source.url,
      contentType: source.contentType,
      isAnalysis: false
    });
    setShowSummaryModal(true);
  };

  const closeSummaryModal = () => {
    setShowSummaryModal(false);
    setModalSummaryData(null);
  };

  // Filter threads based on search query
  const filteredThreads = threads.filter(thread => {
    const title = getThreadTitle(thread).toLowerCase();
    const query = searchQuery.toLowerCase();
    return title.includes(query);
  });

  return (
    <div className="h-screen bg-bg-light flex flex-col">
      {/* Historical Access Banner */}
      {isInactiveUser && (
        <div className="bg-carbon-black/80 text-gray-300 py-3 px-4 text-center text-sm font-proxima">
          Historical access mode: View past conversations only.
        </div>
      )}

      {/* Top Bar with Search */}
      <div className="h-[52px] bg-bg-light border-b border-divider flex items-center px-[25px]">
        <div className="relative">
          <div className="flex items-center justify-center bg-white rounded-lg h-[32px] w-[664px] px-[10px] py-1">
            <div className="flex items-center justify-between w-full px-[7px]">
              <input
                type="text"
                placeholder="Browse chat history or search by keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowThreadDropdown(true)}
                className="flex-1 text-[18px] leading-[26px] font-proxima font-normal text-carbon-black bg-transparent border-none outline-none placeholder:text-divider"
              />
              <button
                onClick={handleCreateThread}
                disabled={isInactiveUser || isLoading}
                className="ml-2 text-pursuit-purple hover:text-pursuit-purple/80 disabled:opacity-50"
                title="New conversation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <svg className="w-6 h-6 text-carbon-black ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="1" />
                <path d="M21 21l-4.35-4.35" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          
          {/* Thread Dropdown */}
          {showThreadDropdown && (searchQuery || threads.length > 0) && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => {
                  setShowThreadDropdown(false);
                  setSearchQuery('');
                }}
              />
              <div className="absolute top-full left-0 mt-1 w-[664px] max-h-[400px] bg-white rounded-lg shadow-lg overflow-y-auto z-40">
                {searchQuery && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-divider">
                    {filteredThreads.length === 0 ? 'No results found' : 
                     filteredThreads.length === 1 ? '1 result' : 
                     `${filteredThreads.length} results`}
                  </div>
                )}
                {!searchQuery && (
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700 border-b border-divider">
                    All Chats
                  </div>
                )}
                {(searchQuery ? filteredThreads : threads).map((thread) => {
                  const threadId = getThreadId(thread);
                  const isActive = activeThread === threadId;
                  return (
                    <button
                      key={threadId}
                      onClick={() => {
                        handleThreadSelect(threadId);
                        setShowThreadDropdown(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                        isActive ? 'bg-pursuit-purple text-white hover:bg-pursuit-purple' : 'text-carbon-black'
                      }`}
                    >
                      <div className="font-proxima text-base truncate">
                        {getThreadTitle(thread)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Empty State or Messages Area */}
          <div className="flex-1 overflow-y-auto py-8 px-6" style={{ paddingBottom: '180px' }}>
            {!activeThread ? (
              <div className="flex flex-col items-center justify-start min-h-full pt-[50px]">
                <div className="max-w-[660px] text-center">
                  <h2 className="text-[18px] leading-[26px] font-proxima font-normal text-black mb-6">
                    What can we build together?
                  </h2>
                  <img 
                    src="/preloader-still.gif" 
                    alt="Pursuit" 
                    className="w-[60px] h-[60px] mx-auto"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-[664px] mx-auto">
                {isLoading && messages.length === 0 ? (
                  <div className="text-center text-gray-500 font-proxima">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-500 font-proxima">
                      {isInactiveUser 
                        ? 'This conversation has no messages.'
                        : 'No messages yet. Start the conversation below.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble
                        key={getMessageId(message)}
                        message={message}
                        onContentSummary={showContentSummary}
                        getMessageRole={getMessageRole}
                        getMessageId={getMessageId}
                      />
                    ))}
                    
                    {isAiThinking && (
                      <div className="mb-6">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chat Input - Absolute positioned at bottom of chat interface */}
          <div className="absolute bottom-6 left-0 right-0 px-6 z-10 pointer-events-none">
            <div className="pointer-events-auto max-w-[664px] mx-auto">
              {/* Chat Tray */}
              <div className="bg-stardust rounded-[20px] p-[10px_15px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] flex flex-col gap-[10px]">
                {/* Input Area */}
                <div className="flex flex-col gap-2">
                  {/* Text Input */}
                  <div className="bg-white rounded-lg px-[11px] py-1 flex items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask me anything..."
                      disabled={isInactiveUser || isSending || isLoading}
                      className="flex-1 text-[18px] leading-[26px] font-proxima font-normal text-black bg-transparent border-none outline-none placeholder:text-black disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    {/* Left side - Hidden buttons */}
                    <div className="w-[82px]" />
                    
                    {/* Right side - LLM dropdown, Upload, Send */}
                    <div className="flex items-center gap-[6px]">
                      {/* LLM Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          disabled={isInactiveUser}
                          className="appearance-none bg-bg-light rounded-lg px-[7px] py-[5px] pr-[20px] text-[12px] leading-[14px] font-proxima font-normal text-carbon-black cursor-pointer disabled:opacity-50 border-none outline-none h-[30px]"
                        >
                          <option value="anthropic/claude-sonnet-4.5">Auto</option>
                          <option value="openai/gpt-4o">GPT 4o</option>
                          <option value="anthropic/claude-sonnet-3.5">Claude 3.5</option>
                        </select>
                        {/* Chevron Icon */}
                        <div className="absolute right-[7px] top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-[9px] h-[4.5px] text-carbon-black rotate-90" fill="none" stroke="currentColor" viewBox="0 0 9 4.5">
                            <path d="M1 0.75L4.5 4.25L8 0.75" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Upload Button */}
                      <button
                        onClick={() => {
                          if (!activeThread) {
                            handleCreateThread();
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                        disabled={isInactiveUser || isProcessingUpload}
                        className="w-[30px] h-[30px] bg-bg-light rounded-lg flex items-center justify-center disabled:opacity-50"
                      >
                        <svg className="w-[14px] h-[14px] text-carbon-black" fill="none" stroke="currentColor" viewBox="0 0 14 14">
                          <path d="M7 11V3M7 3L4 6M7 3L10 6M1 13H13" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      
                      {/* Send Button */}
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isInactiveUser || isSending || isLoading}
                        className="w-[30px] h-[30px] bg-pursuit-purple rounded-lg flex items-center justify-center disabled:opacity-50 transition-opacity"
                      >
                        <svg className="w-[14px] h-[14px] text-bg-light" fill="none" stroke="currentColor" viewBox="0 0 14 14">
                          <path d="M7 4L10 7L7 10M3 7H10" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.md,.docx"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay
        isProcessing={isProcessingUpload}
        processingStep={processingStep}
        processingFileName={processingFileName}
        processingUrl={processingUrl}
      />

      {/* Summary Modal */}
      {modalSummaryData && (
        <SummaryModal
          isOpen={showSummaryModal}
          onClose={closeSummaryModal}
          summary={modalSummaryData.summary}
          title={modalSummaryData.title}
          url={modalSummaryData.url}
          cached={modalSummaryData.cached}
          loading={summaryLoading}
          error={null}
          sourceInfo={modalSummaryData.sourceInfo}
          contentType={modalSummaryData.contentType}
          isAnalysis={modalSummaryData.isAnalysis || false}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md z-50">
          <p className="font-proxima text-sm">{error}</p>
          <button
            onClick={() => setError('')}
            className="absolute top-1 right-1 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {/* URL Input Modal */}
      {showUrlInput && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40" onClick={() => setShowUrlInput(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-proxima font-semibold text-carbon-black mb-4">Add URL</h3>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL (Google Docs, article, video...)"
              className="w-full px-3 py-2 border border-divider rounded-md font-proxima text-base mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUrlSubmit();
                } else if (e.key === 'Escape') {
                  setShowUrlInput(false);
                  setUrlInput('');
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlInput('');
                }}
                className="px-4 py-2 border border-divider rounded-md font-proxima text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isProcessingUpload}
                className="px-4 py-2 bg-pursuit-purple text-white rounded-md font-proxima text-sm hover:bg-pursuit-purple/90 disabled:opacity-50"
              >
                Summarize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GPT;

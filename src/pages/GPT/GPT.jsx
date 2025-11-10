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
    if (!newMessage.trim() || !activeThread || isSending) return;

    if (isInactiveUser) {
      setError('You are in historical access mode and cannot send new messages.');
      return;
    }

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

  return (
    <div className="h-screen bg-bg-light flex flex-col">
      {/* Historical Access Banner */}
      {isInactiveUser && (
        <div className="bg-carbon-black/80 text-gray-300 py-3 px-4 text-center text-sm font-proxima">
          Historical access mode: View past conversations only.
        </div>
      )}

      {/* Top Bar */}
      <GPTTopBar
        threads={threads}
        activeThread={activeThread}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleCreateThread}
      />

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Interface */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Empty State or Messages Area - Scrollable with proper spacing */}
          <div className="flex-1 overflow-y-auto py-8 px-6" style={{ paddingBottom: '180px' }}>
            {!activeThread ? (
              <div className="flex flex-col items-center justify-center min-h-full">
                <div className="max-w-[660px] text-center">
                  <h2 className="text-[18px] font-proxima font-normal text-carbon-black mb-6">
                    What can we build together?
                  </h2>
                  <img src="/logo-icon.png" alt="Pursuit" className="w-16 h-16 mx-auto mb-8 opacity-80" />
                  {!isInactiveUser && (
                    <button
                      onClick={handleCreateThread}
                      disabled={isLoading}
                      className="px-6 py-3 bg-pursuit-purple hover:bg-pursuit-purple/90 text-white rounded-lg font-proxima text-base transition-colors disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Start New Conversation'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
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
            {activeThread && (
              <div className="pointer-events-auto">
                <ChatTray
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  onSend={handleSendMessage}
                  onFileUpload={() => fileInputRef.current?.click()}
                  onUrlInput={() => setShowUrlInput(true)}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  isSending={isSending}
                  isLoading={isLoading}
                  isProcessingUpload={isProcessingUpload}
                  disabled={isInactiveUser}
                  fileInputRef={fileInputRef}
                />
              </div>
            )}
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

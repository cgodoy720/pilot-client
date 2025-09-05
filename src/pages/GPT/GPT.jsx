import React, { useState, useRef, useEffect } from 'react';
import './GPT.css';
import { FaPlus, FaChevronLeft, FaFileAlt, FaVideo, FaLink, FaTimes, FaCog } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getThreads, getThreadMessages, createThread, sendMessageToGPT } from '../../utils/api';
import SummaryModal from '../../components/SummaryModal/SummaryModal';

function GPT() {
  const { token, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null); // Start with no active thread
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Summary-related state
  const [currentThreadSummary, setCurrentThreadSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryThreadId, setSummaryThreadId] = useState(null); // Track which thread the summary belongs to
  const [summaryLoading, setSummaryLoading] = useState(false); // Track if we're fetching summary
  const [modalSummaryData, setModalSummaryData] = useState(null); // Summary data for the modal
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.7-sonnet');
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Enhanced content management state
  const [contentSources, setContentSources] = useState({}); // Store multiple content sources per thread
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [processingFileName, setProcessingFileName] = useState(''); // Track what's being processed
  const [processingUrl, setProcessingUrl] = useState(''); // Track URL being processed
  const [processingStep, setProcessingStep] = useState(''); // Track current processing step
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadDropdownRef = useRef(null);
  const modelSelectorRef = useRef(null);

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
        // Parse the summary data from URL parameter
        const parsedSummaryData = JSON.parse(decodeURIComponent(summaryData));
        
        // Set up the summary for the current thread
        setCurrentThreadSummary({
          url: summaryUrl,
          title: summaryTitle,
          ...parsedSummaryData
        });
        
        // Wait for threadIdFromUrl to be processed, then set the summary thread ID
        if (threadIdFromUrl) {
          setSummaryThreadId(threadIdFromUrl);
        }
        
        // Clean up URL parameters
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('summaryUrl');
        newSearchParams.delete('summaryTitle');
        newSearchParams.delete('summaryData');
        setSearchParams(newSearchParams, { replace: true });
        
      } catch (error) {
        console.error('Error parsing summary data from URL:', error);
        // Clean up invalid parameters
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
      // Check if the thread exists in our threads list
      const targetThread = threads.find(thread => 
        String(getThreadId(thread)) === String(threadIdFromUrl)
      );
      
      if (targetThread) {
        setActiveThread(getThreadId(targetThread));
        // Remove the threadId from URL after loading
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('threadId');
        setSearchParams(newSearchParams, { replace: true });
        
        // If we have summary data waiting, associate it with this thread
        if (currentThreadSummary && !summaryThreadId) {
          setSummaryThreadId(getThreadId(targetThread));
        }
      } else {
        // Thread not found, clear the parameter
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
      // User switched to a different thread, clear summary data
      setCurrentThreadSummary(null);
      setSummaryThreadId(null);
    }
    
    // Clear modal summary data when switching threads
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
      
      // Check the structure of the response and adapt accordingly
      const threadsArray = Array.isArray(data) ? data : 
                          data.threads ? data.threads : 
                          data.data ? data.data : [];
      
      setThreads(threadsArray);
      
      // Remove the automatic selection of the first thread
      // Only set active thread if we're refreshing threads after creating a new one
      // This will be handled by the handleCreateThread function instead
      
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
    // Prevent inactive users from creating new threads
    if (isInactiveUser) {
      setError('You are in historical access mode and cannot create new conversations.');
      return;
    }

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

    // Prevent inactive users from sending messages
    if (isInactiveUser) {
      setError('You are in historical access mode and cannot send new messages.');
      return;
    }

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
      
      // Send message to API with selected model
      const response = await sendMessageToGPT(messageToSend, activeThread, token, selectedModel);
      
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

  // Helper function to check if current thread is an article discussion
  const isArticleDiscussionThread = () => {
    if (!activeThread || !threads.length) return false;
    
    const currentThread = threads.find(thread => getThreadId(thread) === activeThread);
    if (!currentThread) return false;
    
    // Check if thread title indicates it's an article discussion
    const threadTitle = getThreadTitle(currentThread);
    return threadTitle && threadTitle.startsWith('Discussion: ');
  };

  // Helper function to extract article info from thread messages
  const getArticleInfoFromThread = () => {
    if (!messages.length) return null;
    
    // Look for the assistant's welcome message that contains article info
    const welcomeMessage = messages.find(msg => 
      getMessageRole(msg) === 'assistant' && 
      msg.content && 
      msg.content.includes('**Article:**') &&
      msg.content.includes('**URL:**')
    );
    
    if (welcomeMessage) {
      // Extract URL and title from the welcome message
      const urlMatch = welcomeMessage.content.match(/\*\*URL:\*\* (.+)/);
      const titleMatch = welcomeMessage.content.match(/\*\*Article:\*\* (.+)/);
      
      if (urlMatch && titleMatch) {
        return {
          url: urlMatch[1].trim(),
          title: titleMatch[1].trim()
        };
      }
    }
    
    return null;
  };

  // Helper function to check if we should show summary button
  const shouldShowSummaryButton = () => {
    // Show if we have summary data for current thread
    if (currentThreadSummary && String(activeThread) === String(summaryThreadId)) {
      return true;
    }
    
    // Show if current thread is an article discussion (even without summary data)
    if (isArticleDiscussionThread() && getArticleInfoFromThread()) {
      return true;
    }
    
    return false;
  };

  // Helper function to get current article info (from summary or thread)
  const getCurrentArticleInfo = () => {
    // First check if we have summary data
    if (currentThreadSummary && String(activeThread) === String(summaryThreadId)) {
      return currentThreadSummary;
    }
    
    // Otherwise try to extract from thread messages
    return getArticleInfoFromThread();
  };

  // Helper function to get summary data for modal (prioritizes modal-specific data)
  const getSummaryDataForModal = () => {
    // First check if we have modal-specific summary data
    if (modalSummaryData) {
      return modalSummaryData;
    }
    
    // Fall back to current article info
    return getCurrentArticleInfo();
  };

  // Helper function to check if the summary is for a YouTube video
  const isYouTubeVideo = (url) => {
    if (!url) return false;
    return url.includes('youtube.com/watch') || 
           url.includes('youtu.be/') || 
           url.includes('youtube.com/embed') ||
           url.includes('youtube.com/v/');
  };

  // Helper function to open full summary modal
  const openSummaryModal = async () => {
    const articleInfo = getCurrentArticleInfo();
    if (!articleInfo) return;
    
    // If we already have summary data, just show the modal
    if (articleInfo.summary) {
      setModalSummaryData(articleInfo);
      setShowSummaryModal(true);
      return;
    }
    
    // If we don't have summary data, try to fetch it
    if (articleInfo.url && articleInfo.title) {
      // Check if user is active
      if (!user?.active) {
        setError('You have historical access only and cannot generate summaries.');
        return;
      }
      
      setSummaryLoading(true);
      setShowSummaryModal(true); // Show modal with loading state
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            url: articleInfo.url, 
            title: articleInfo.title 
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to generate summary');
        }
        
        const summaryData = await response.json();
        
        // Set modal summary data for display
        setModalSummaryData({
          url: articleInfo.url,
          title: articleInfo.title,
          summary: summaryData.summary,
          cached: summaryData.cached
        });
        
        // Also update the current thread summary if this is from URL parameters
        if (String(activeThread) === String(summaryThreadId)) {
          setCurrentThreadSummary({
            ...currentThreadSummary,
            summary: summaryData.summary,
            cached: summaryData.cached
          });
        }
        
      } catch (error) {
        console.error('Error fetching summary:', error);
        setError(`Failed to load summary: ${error.message}`);
      } finally {
        setSummaryLoading(false);
      }
    } else {
      // Just show modal even without summary data
      setShowSummaryModal(true);
    }
  };

  // Helper function to close summary modal
  const closeSummaryModal = () => {
    setShowSummaryModal(false);
    setModalSummaryData(null); // Clear modal-specific data
  };

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

    // Add file size validation (50MB limit)
    const maxFileSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxFileSize) {
      setError(`File size too large. Please upload files smaller than 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    setIsProcessingUpload(true);
    setProcessingFileName(file.name);
    setProcessingStep('Uploading file...');
    setShowUploadDropdown(false);

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
          // Try to parse as JSON first
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`;
        } catch (parseError) {
          // If JSON parsing fails, it might be an HTML error page
          const textResponse = await response.text();
          
          if (response.status === 500) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
              errorMessage = `File too large or complex to process. Try uploading a smaller file or splitting large documents into sections.`;
            } else {
              errorMessage = `Server error while processing file. The file might be corrupted or in an unsupported format.`;
            }
          } else if (response.status === 413) {
            errorMessage = `File too large. Please upload files smaller than 50MB.`;
          } else if (response.status === 415) {
            errorMessage = `Unsupported file type. Please upload PDF, TXT, MD, or DOCX files.`;
          } else {
            errorMessage = `Server error (${response.status}). Please try again or contact support if the problem persists.`;
          }
          
          console.error('Server returned non-JSON response:', textResponse.substring(0, 200));
        }
        
        throw new Error(errorMessage);
      }

      setProcessingStep('Generating summary...');
      const summaryData = await response.json();

      setProcessingStep('Finalizing...');
      
      // Add a hidden system message for AI context (not visible to user)
      const hiddenSummaryMessage = `File uploaded: ${file.name}\nSummary: ${summaryData.summary}`;
      
      // Send the summary to the backend as a system message for AI context
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
            messageType: 'system_content_summary' // Special type for system messages
          })
        });
      } catch (err) {
        console.warn('Failed to send system message, continuing anyway:', err);
      }

      // Add content source as a special message-like component (UI only, not stored as message)
      const contentSourceMessage = {
        message_id: Date.now(),
        content: null, // No content, this is a special component
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

      // Store the file summary in content sources for reference
      setContentSources(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), contentSourceMessage.contentSource]
      }));

      // Refresh threads to update title (especially for new threads)
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
    setShowUploadDropdown(false);

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
          // Try to parse as JSON first
          const errorData = await response.json();
          errorMessage = errorData.details || errorData.error || `Server error: ${response.status}`;
        } catch (parseError) {
          // If JSON parsing fails, it might be an HTML error page
          const textResponse = await response.text();
          
          if (response.status === 500) {
            errorMessage = `Server error while processing URL. The content might be too large, restricted, or in an unsupported format.`;
          } else if (response.status === 404) {
            errorMessage = `URL not found or inaccessible. Please check the URL and try again.`;
          } else if (response.status === 403) {
            errorMessage = `Access denied. The content might be behind a paywall or login required.`;
          } else {
            errorMessage = `Server error (${response.status}). Please try again or contact support if the problem persists.`;
          }
          
          console.error('Server returned non-JSON response:', textResponse.substring(0, 200));
        }
        
        throw new Error(errorMessage);
      }

      setProcessingStep('Generating summary...');
      const summaryData = await response.json();

      setProcessingStep('Finalizing...');
      
      // Add a hidden system message for AI context
      const isVideo = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
      const type = isVideo ? 'Video' : 'Article';
      const hiddenSummaryMessage = `${type} processed: ${summaryData.title}\nURL: ${urlInput}\nSummary: ${summaryData.summary}`;
      
      // Send the summary to the backend as a system message for AI context
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

      // Add content source as a special message-like component
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

      // Store the URL summary in content sources for reference
      setContentSources(prev => ({
        ...prev,
        [activeThread]: [...(prev[activeThread] || []), contentSourceMessage.contentSource]
      }));

      setUrlInput('');

      // Refresh threads to update title (especially for new threads)
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
    // Reset file input
    e.target.value = '';
  };

  const toggleUploadDropdown = () => {
    setShowUploadDropdown(!showUploadDropdown);
    setShowUrlInput(false);
  };

  const openFileDialog = () => {
    setShowUploadDropdown(false);
    fileInputRef.current?.click();
  };

  const openUrlInput = () => {
    setShowUrlInput(true);
    setShowUploadDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadDropdownRef.current && !uploadDropdownRef.current.contains(event.target)) {
        setShowUploadDropdown(false);
        setShowUrlInput(false);
      }
      
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target)) {
        setShowModelSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to get current content sources for active thread
  const getCurrentContentSources = () => {
    return contentSources[activeThread] || [];
  };

  // Function to show summary for a specific content source
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

  return (
    <div className="gpt">
      {isInactiveUser && (
        <div className="historical-access-banner">
          <p>Historical access mode: View past conversations only.</p>
        </div>
      )}
      <div className="gpt__content">
        <div className="gpt__chat-container">
          <div className={`gpt__sidebar ${!sidebarVisible ? 'gpt__sidebar--collapsed' : ''}`}>
            <div className="gpt__sidebar-header">
              <h3 className="gpt__sidebar-title">Conversations</h3>
              <div className="gpt__sidebar-actions">
                <button 
                  className="gpt__new-thread-btn"
                  onClick={handleCreateThread}
                  title={isInactiveUser ? "Cannot create new conversations in historical access mode" : "New Conversation"}
                  disabled={isLoading || isInactiveUser}
                >
                  <FaPlus size={14} />
                </button>
                {sidebarVisible && (
                  <button
                    className="gpt__toggle-sidebar-btn"
                    onClick={() => setSidebarVisible(false)}
                    title="Hide sidebar"
                  >
                    <FaChevronLeft size={14} />
                  </button>
                )}
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
            {!sidebarVisible && (
              <button
                className="gpt__toggle-sidebar-btn"
                onClick={() => setSidebarVisible(true)}
                title="Show sidebar"
              >
                <FaChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
            
            {/* Summary button for article discussions */}
            {shouldShowSummaryButton() && (
              <div className="gpt__chat-header">
                <div className="gpt__summary-controls">
                  <button
                    className="gpt__summary-btn"
                    onClick={openSummaryModal}
                    title="View article/video summary"
                  >
                    {isYouTubeVideo(getCurrentArticleInfo()?.url) ? <FaVideo /> : <FaFileAlt />}
                    <span>
                      View {isYouTubeVideo(getCurrentArticleInfo()?.url) ? 'Video' : 'Article'} Summary
                    </span>
                  </button>
                </div>
              </div>
            )}
            
            {!activeThread ? (
              <div className="gpt__empty-state">
                <h3 className="gpt__empty-state-title">Welcome!</h3>
                <p className="gpt__empty-state-text">
                  {isInactiveUser 
                    ? "You can view your past conversations, but cannot create new ones in historical access mode." 
                    : "Start a new conversation or select an existing thread from the sidebar"}
                </p>
                {!isInactiveUser && (
                  <button 
                    className="gpt__empty-state-btn" 
                    onClick={handleCreateThread}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'New Conversation'}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Processing Overlay - moved outside message conditional to always show when processing */}
                {isProcessingUpload && (
                  <div className="gpt__processing-overlay">
                    <div className="gpt__processing-content">
                      <div className="gpt__processing-spinner">
                        <div className="gpt__spinner"></div>
                      </div>
                      <div className="gpt__processing-text">
                        <h4>Processing Content</h4>
                        <p className="gpt__processing-step">{processingStep}</p>
                        {processingFileName && (
                          <p className="gpt__processing-file">File: {processingFileName}</p>
                        )}
                        {processingUrl && (
                          <p className="gpt__processing-url">URL: {processingUrl}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="gpt__messages">
                  {isLoading && messages.length === 0 ? (
                    <div className="gpt__loading-messages">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="gpt__empty-messages">
                      <p>
                        {isInactiveUser 
                          ? "This conversation has no messages."
                          : "No messages yet. Start the conversation by sending a message below."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Regular messages */}
                      {messages.map((message) => {
                        // Handle system_content_summary messages to recreate content source cards
                        if (getMessageRole(message) === 'system_content_summary') {
                          const content = message.content;
                          
                          // Parse the content to extract info
                          let source = {};
                          
                          if (content.startsWith('File uploaded:')) {
                            // Parse file format: "File uploaded: filename\nSummary: summary"
                            const lines = content.split('\n');
                            const fileName = lines[0].replace('File uploaded: ', '');
                            const summary = lines.slice(1).join('\n').replace('Summary: ', '');
                            
                            source = {
                              id: getMessageId(message),
                              type: 'file',
                              fileName: fileName,
                              title: `${fileName} Summary`,
                              summary: summary,
                              contentType: 'document',
                              processedAt: message.created_at
                            };
                          } else if (content.includes(' processed:')) {
                            // Parse URL format: "Video/Article processed: title\nURL: url\nSummary: summary"
                            const lines = content.split('\n');
                            const firstLine = lines[0];
                            const isVideo = firstLine.startsWith('Video processed:');
                            const title = firstLine.replace(/^(Video|Article) processed: /, '');
                            const url = lines.find(line => line.startsWith('URL: '))?.replace('URL: ', '');
                            const summary = lines.slice(lines.findIndex(line => line.startsWith('Summary: '))).join('\n').replace('Summary: ', '');
                            
                            source = {
                              id: getMessageId(message),
                              type: 'url',
                              title: title,
                              summary: summary,
                              url: url,
                              contentType: isVideo ? 'video' : 'article',
                              processedAt: message.created_at
                            };
                          }
                          
                          // Only render if we successfully parsed the content
                          if (source.summary) {
                            const isVideo = source.contentType === 'video';
                            const icon = source.type === 'file' ? '📄' : (isVideo ? '🎥' : '📰');
                            
                            return (
                              <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                                <div className="gpt__content-source-card">
                                  <div className="gpt__content-source-header">
                                    <span className="gpt__content-source-icon-large">{icon}</span>
                                    <div className="gpt__content-source-info">
                                      <div className="gpt__content-source-type-title">
                                        <span className="gpt__content-source-type">{source.contentType}</span>
                                        <h4 className="gpt__content-source-title">
                                          {source.type === 'file' ? source.fileName : source.title}
                                        </h4>
                                      </div>
                                      {source.url && (
                                        <a 
                                          href={source.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="gpt__content-source-link"
                                        >
                                          View original →
                                        </a>
                                      )}
                                    </div>
                                    <button
                                      className="gpt__view-summary-btn"
                                      onClick={() => showContentSummary(source)}
                                      title="View summary"
                                    >
                                      View Summary
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          
                          // If parsing failed, don't render anything (hide the system message)
                          return null;
                        }
                        
                        // Handle content source messages specially (keep existing logic for new uploads)
                        if (getMessageRole(message) === 'content_source' && message.contentSource) {
                          const source = message.contentSource;
                          const isVideo = source.contentType === 'video';
                          const icon = source.type === 'file' ? '📄' : (isVideo ? '🎥' : '📰');
                          
                          return (
                            <div key={getMessageId(message)} className="gpt__message gpt__message--content-source">
                              <div className="gpt__content-source-card">
                                <div className="gpt__content-source-header">
                                  <span className="gpt__content-source-icon-large">{icon}</span>
                                  <div className="gpt__content-source-info">
                                    <div className="gpt__content-source-type-title">
                                      <span className="gpt__content-source-type">{source.contentType}</span>
                                      <h4 className="gpt__content-source-title">
                                        {source.type === 'file' ? source.fileName : source.title}
                                      </h4>
                                    </div>
                                    {source.url && (
                                      <a 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="gpt__content-source-link"
                                      >
                                        View original →
                                      </a>
                                    )}
                                  </div>
                                  <button
                                    className="gpt__view-summary-btn"
                                    onClick={() => showContentSummary(source)}
                                    title="View summary"
                                  >
                                    View Summary
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        
                        // Regular messages
                        return (
                          <div 
                            key={getMessageId(message)} 
                            className={`gpt__message ${getMessageRole(message) === 'user' ? 'gpt__message--user' : 'gpt__message--assistant'}`}
                          >
                            <div className="gpt__message-content">
                              {formatMessageContent(message.content)}
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
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
                    </>
                  )}
                </div>
                
                <form className="gpt__input-form" onSubmit={handleSendMessage}>
                  {/* Model Selector */}
                  <div className="gpt__model-selector-container" ref={modelSelectorRef}>
                    <button
                      type="button"
                      className={`gpt__model-selector-btn ${showModelSelector ? 'gpt__model-selector-btn--active' : ''}`}
                      onClick={() => setShowModelSelector(!showModelSelector)}
                      disabled={!activeThread || isProcessingUpload || isLoading || isInactiveUser}
                      title={isInactiveUser ? "Cannot change model in historical access mode" : "Select AI model"}
                    >
                      <FaCog size={16} />
                    </button>
                    
                    {/* Model Dropdown */}
                    {showModelSelector && (
                      <div className="gpt__model-dropdown">
                        <div className="gpt__model-dropdown-header">Select AI Model</div>
                        <div className="gpt__model-options">
                          <button
                            type="button"
                            className={`gpt__model-option ${selectedModel === 'anthropic/claude-3.7-sonnet' ? 'gpt__model-option--selected' : ''}`}
                            onClick={() => {
                              setSelectedModel('anthropic/claude-3.7-sonnet');
                              setShowModelSelector(false);
                            }}
                          >
                            Claude 3.7 Sonnet (Default)
                          </button>
                          <button
                            type="button"
                            className={`gpt__model-option ${selectedModel === 'anthropic/claude-3.5-sonnet' ? 'gpt__model-option--selected' : ''}`}
                            onClick={() => {
                              setSelectedModel('anthropic/claude-3.5-sonnet');
                              setShowModelSelector(false);
                            }}
                          >
                            Claude 3.5 Sonnet
                          </button>
                          <button
                            type="button"
                            className={`gpt__model-option ${selectedModel === 'openai/gpt-4o' ? 'gpt__model-option--selected' : ''}`}
                            onClick={() => {
                              setSelectedModel('openai/gpt-4o');
                              setShowModelSelector(false);
                            }}
                          >
                            GPT-4o
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Controls */}
                  <div className="gpt__upload-container" ref={uploadDropdownRef}>
                    <button
                      type="button"
                      className={`gpt__upload-btn ${showUploadDropdown ? 'gpt__upload-btn--active' : ''}`}
                      onClick={toggleUploadDropdown}
                      disabled={!activeThread || isProcessingUpload || isLoading || isInactiveUser}
                      title={isInactiveUser ? "Cannot upload in historical access mode" : "Upload file or add URL for AI to summarize and discuss"}
                    >
                      <FaPlus size={16} />
                    </button>
                    
                    {/* Upload Dropdown */}
                    {showUploadDropdown && (
                      <div className="gpt__upload-dropdown">
                        <button
                          type="button"
                          className="gpt__upload-option"
                          onClick={openFileDialog}
                          disabled={isProcessingUpload}
                        >
                          <FaFileAlt size={14} />
                          <span>Upload File</span>
                          <small>PDF, TXT, MD, DOCX</small>
                        </button>
                        <button
                          type="button"
                          className="gpt__upload-option"
                          onClick={openUrlInput}
                          disabled={isProcessingUpload}
                        >
                          <FaLink size={14} />
                          <span>Add URL</span>
                          <small>Google Docs, Articles, YouTube Videos</small>
                        </button>
                      </div>
                    )}
                    
                    {/* URL Input */}
                    {showUrlInput && (
                      <div className="gpt__url-input-container">
                        <input
                          type="url"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          placeholder="Enter URL (Google Docs, article, video...)"
                          className="gpt__url-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleUrlSubmit();
                            } else if (e.key === 'Escape') {
                              setShowUrlInput(false);
                              setUrlInput('');
                            }
                          }}
                          autoFocus
                        />
                        <div className="gpt__url-actions">
                          <button
                            type="button"
                            className="gpt__url-submit"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim() || isProcessingUpload}
                          >
                            Summarize
                          </button>
                          <button
                            type="button"
                            className="gpt__url-cancel"
                            onClick={() => {
                              setShowUrlInput(false);
                              setUrlInput('');
                            }}
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.docx"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                  />
                  
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
                    placeholder={isInactiveUser ? "Historical access mode - cannot send messages" : isSending ? "Sending..." : "Type your message..."}
                    disabled={!activeThread || isSending || isLoading || isInactiveUser}
                    className={`gpt__input ${isInactiveUser ? 'gpt__input--disabled' : ''}`}
                  />
                  <button 
                    type="submit"
                    disabled={!activeThread || !newMessage.trim() || isSending || isLoading || isInactiveUser}
                    className={`gpt__send-btn ${isInactiveUser ? 'gpt__send-btn--disabled' : ''}`}
                  >
                    {isInactiveUser ? "Historical" : isSending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Summary Modal */}
      {(getCurrentArticleInfo() || modalSummaryData) && (
        <SummaryModal
          isOpen={showSummaryModal}
          onClose={closeSummaryModal}
          summary={getSummaryDataForModal()?.summary}
          title={getSummaryDataForModal()?.title}
          url={getSummaryDataForModal()?.url}
          cached={getSummaryDataForModal()?.cached}
          loading={summaryLoading}
          error={null}
          sourceInfo={getSummaryDataForModal()?.sourceInfo}
          contentType={getSummaryDataForModal()?.contentType}
          isAnalysis={getSummaryDataForModal()?.isAnalysis || false}
        />
      )}
    </div>
  );
}

export default GPT; 
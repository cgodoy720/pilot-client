import React, { useState, useRef, useEffect } from 'react';
import './GPT.css';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getThreads, getThreadMessages, createThread, sendMessageToGPT } from '../../utils/api';
import SummaryModal from '../../components/SummaryModal/SummaryModal';
import ReactMarkdown from 'react-markdown';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';

// New Components
import GPTTopBar from './components/GPTTopBar';
import ChatTray from './components/ChatTray';
import MessageBubble from './components/MessageBubble';
import ProcessingOverlay from './components/ProcessingOverlay';

// Shadcn UI Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Summary-related state
  const [currentThreadSummary, setCurrentThreadSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryThreadId, setSummaryThreadId] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [modalSummaryData, setModalSummaryData] = useState(null);
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-sonnet-4.5');
  
  // Available LLM models - matches Learning page
  const LLM_MODELS = [
    { value: 'anthropic/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', description: 'Advanced reasoning' },
    { value: 'anthropic/claude-haiku-4.5', label: 'Claude Haiku 4.5', description: 'Fast & efficient' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini', description: 'Quick responses' },
    { value: 'google/gemini-2.5-flash-lite', label: 'Gemini Flash 2.5 Lite', description: 'Fast & efficient' },
    { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', description: 'Code specialist' },
    { value: 'x-ai/grok-4-fast', label: 'Grok 4 Fast', description: 'Fast reasoning' }
  ];
  
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
  const abortControllerRef = useRef(null);
  const fetchThreadsAbortControllerRef = useRef(null);
  const fetchMessagesAbortControllerRef = useRef(null);
  const textareaRef = useRef(null);

  // Check if user is inactive (in historical access mode)
  const isInactiveUser = user && user.active === false;

  // Get threadId and summary data from URL parameters
  const threadIdFromUrl = searchParams.get('threadId');
  const summaryUrl = searchParams.get('summaryUrl');
  const summaryTitle = searchParams.get('summaryTitle'); 
  const summaryData = searchParams.get('summaryData');
  const waitingForResponse = searchParams.get('waitingForResponse') === 'true';

  // Cleanup: abort any pending requests when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchThreadsAbortControllerRef.current) {
        fetchThreadsAbortControllerRef.current.abort();
      }
      if (fetchMessagesAbortControllerRef.current) {
        fetchMessagesAbortControllerRef.current.abort();
      }
    };
  }, []);

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

  // Handle waitingForResponse parameter - show preloader immediately
  useEffect(() => {
    if (waitingForResponse) {
      setIsAiThinking(true);
      // Clear the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('waitingForResponse');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [waitingForResponse, searchParams, setSearchParams]);

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

  // Poll for new messages when waiting for AI response
  useEffect(() => {
    if (!isAiThinking || !activeThread || !token) return;

    let pollCount = 0;
    const maxPolls = 30; // Stop polling after 60 seconds (30 * 2s)

    const pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        setIsAiThinking(false); // Stop showing preloader after timeout
        return;
      }
      
      // Fetch messages to check if AI has responded (pass isPolling=true to prevent clearing messages)
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchMessages(activeThread, true);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [isAiThinking, activeThread, token]);

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

  // Auto-resize textarea based on content
  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      
      // Calculate new height (min 1 row, max 5 rows)
      const lineHeight = 26; // matches text-[18px] leading-[26px]
      const minHeight = lineHeight; // 1 row minimum
      const maxHeight = lineHeight * 5; // 5 rows maximum
      
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Initial resize on mount
  useEffect(() => {
    handleTextareaResize();
  }, []);

  const fetchThreads = async () => {
    // Abort any pending fetch threads request
    if (fetchThreadsAbortControllerRef.current) {
      fetchThreadsAbortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    fetchThreadsAbortControllerRef.current = abortController;
    
    try {
      setIsLoading(true);
      const data = await getThreads(token, abortController.signal);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      const threadsArray = Array.isArray(data) ? data : 
                          data.threads ? data.threads : 
                          data.data ? data.data : [];
      
      setThreads(threadsArray);
      setError('');
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching threads:', err);
      setError('Failed to load conversations. Please try again.');
    } finally {
      // Only update loading state if not aborted
      if (!abortController.signal.aborted) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
  };

  const fetchMessages = async (threadId, isPolling = false) => {
    // Abort any pending fetch messages request
    if (fetchMessagesAbortControllerRef.current) {
      fetchMessagesAbortControllerRef.current.abort();
    }
    
    // CRITICAL: Also abort any pending send message request when switching threads
    if (abortControllerRef.current && !isPolling) {
      abortControllerRef.current.abort();
    }
    
    // Only reset AI thinking state when switching threads (not when polling)
    if (!isPolling) {
    setIsAiThinking(false);
    setIsSending(false);
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    fetchMessagesAbortControllerRef.current = abortController;
    
    // Only clear messages when switching threads, not when polling
    if (!isPolling) {
    setMessages([]);
    }
    
    try {
      setIsLoading(true);
      const data = await getThreadMessages(threadId, token, abortController.signal);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
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
      
      // When polling, only update messages if they've actually changed (to prevent flashing)
      if (isPolling) {
        // Compare message count and last message ID to avoid unnecessary updates
        const currentLastMessageId = messages.length > 0 ? getMessageId(messages[messages.length - 1]) : null;
        const newLastMessageId = messagesArray.length > 0 ? getMessageId(messagesArray[messagesArray.length - 1]) : null;
        
        // Only update if messages actually changed
        if (currentLastMessageId !== newLastMessageId || messages.length !== messagesArray.length) {
          setMessages(messagesArray);
          
          // Update isAiThinking based on last message role
          if (messagesArray.length > 0) {
            const lastMessage = messagesArray[messagesArray.length - 1];
            const lastMessageRole = getMessageRole(lastMessage);
            setIsAiThinking(lastMessageRole === 'user');
          }
        }
      } else {
      setMessages(messagesArray);
      setError('');
        
        // Check if we're waiting for an AI response (last message is from user)
        if (messagesArray.length > 0) {
          const lastMessage = messagesArray[messagesArray.length - 1];
          const lastMessageRole = getMessageRole(lastMessage);
          setIsAiThinking(lastMessageRole === 'user');
        }
      }
      
      if (!isPolling) {
        setError('');
      }
    } catch (err) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      // Only update loading state if not aborted
      if (!abortController.signal.aborted) {
      setIsLoading(false);
      }
    }
  };

  const handleThreadSelect = (threadId) => {
    // Abort any ongoing operations when switching threads
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (fetchMessagesAbortControllerRef.current) {
      fetchMessagesAbortControllerRef.current.abort();
    }
    
    // Reset states
    setIsAiThinking(false);
    setIsSending(false);
    setError('');
    
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
          // Don't set activeThread yet - we'll do it after sending the message
          // This prevents the useEffect from trying to fetch messages while we're sending
          setMessages([]);
          
          // Now send the message to the new thread
          await sendMessageToNewThread(newThreadId);
          
          // Now set the active thread after message is sent
          setActiveThread(newThreadId);
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
    // Abort any pending send message request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
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
    handleTextareaResize(); // Reset height after clearing
    setIsSending(true);
    setIsAiThinking(true);

    try {
      const response = await sendMessageToGPT(messageToSend, threadId, token, selectedModel, abortController.signal);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
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
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id !== tempUserMessageId)
      );
    } finally {
      // Only update state if not aborted
      if (!abortController.signal.aborted) {
      setIsSending(false);
      setIsAiThinking(false);
      }
    }
  };

  const sendMessageToExistingThread = async () => {
    // Abort any pending send message request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
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
    handleTextareaResize(); // Reset height after clearing
    setIsSending(true);
    setIsAiThinking(true);

    try {
      const isFirstMessage = messages.length === 0;
      const response = await sendMessageToGPT(messageToSend, activeThread, token, selectedModel, abortController.signal);
      
      // Check if this request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
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
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id !== tempUserMessageId)
      );
    } finally {
      // Only update state if not aborted
      if (!abortController.signal.aborted) {
      setIsSending(false);
      setIsAiThinking(false);
      }
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
    <div className="gpt h-screen bg-bg-light flex flex-col">
      {/* Historical Access Banner */}
      {isInactiveUser && (
        <div className="bg-carbon-black/80 text-gray-300 py-3 px-4 text-center text-sm font-proxima">
          Historical access mode: View past conversations only.
        </div>
      )}

      {/* Top Bar with Search */}
      <div className="h-[45px] bg-bg-light border-b border-divider flex items-center justify-center px-[25px]">
        <div className="relative">
          <div className="flex items-center justify-center bg-white rounded-lg h-[32px] w-[672px] px-[10px] py-1">
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
              <div className="absolute top-full left-0 mt-1 w-[672px] max-h-[400px] bg-white rounded-lg shadow-lg overflow-y-auto z-40">
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
            {!activeThread && messages.length === 0 ? (
              <div className="max-w-2xl mx-auto pt-[50px]">
                <h2 className="text-[18px] leading-[26px] font-proxima font-normal text-black mb-6">
                  What can we build together?
                </h2>
                <img 
                  src="/preloader-still.gif" 
                  alt="Pursuit" 
                  className="w-[60px] h-[60px]"
                />
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                {messages.length === 0 ? (
                  <div className="text-center">
                    <p className="text-gray-500 font-proxima">
                      {isInactiveUser 
                        ? 'This conversation has no messages.'
                        : 'No messages yet. Start the conversation below.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const role = getMessageRole(message);
                      
                      // Handle content source messages with MessageBubble component
                      if (role === 'content_source' || role === 'system_content_summary') {
                        return (
                      <MessageBubble
                        key={getMessageId(message)}
                        message={message}
                        onContentSummary={showContentSummary}
                        getMessageRole={getMessageRole}
                        getMessageId={getMessageId}
                      />
                        );
                      }
                      
                      return (
                        <div key={getMessageId(message) || index} className="mb-6">
                          {role === 'user' ? (
                            // User message with avatar inside - matches Learning page
                            <div className="bg-stardust rounded-lg px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                                  <span className="text-pursuit-purple text-sm font-proxima font-semibold">
                                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 text-carbon-black leading-relaxed text-base font-proxima">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // AI/System message (no avatar) - matches Learning page
                            <div className="text-carbon-black leading-relaxed text-base">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, children, ...props }) => (
                                    <p className="mb-4" {...props}>{children}</p>
                                  ),
                                  h1: ({ node, children, ...props }) => (
                                    <h1 className="text-xl font-semibold mt-6 mb-4 first:mt-0 text-carbon-black" {...props}>{children}</h1>
                                  ),
                                  h2: ({ node, children, ...props }) => (
                                    <h2 className="text-lg font-semibold mt-5 mb-3 first:mt-0 text-carbon-black" {...props}>{children}</h2>
                                  ),
                                  h3: ({ node, children, ...props }) => (
                                    <h3 className="text-base font-semibold mt-4 mb-2 first:mt-0 text-carbon-black" {...props}>{children}</h3>
                                  ),
                                  ul: ({ node, children, ...props }) => (
                                    <ul className="list-disc pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ul>
                                  ),
                                  ol: ({ node, children, ...props }) => (
                                    <ol className="list-decimal pl-6 my-4 space-y-1 text-carbon-black" {...props}>{children}</ol>
                                  ),
                                  li: ({ node, children, ...props }) => (
                                    <li className="text-carbon-black" {...props}>{children}</li>
                                  ),
                                  a: ({ node, children, ...props }) => (
                                    <a className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                                  ),
                                  code: ({ node, inline, className, children, ...props }) => {
                                    if (inline) {
                                      return (
                                        <code
                                          className="px-1.5 py-0.5 rounded text-sm font-mono bg-gray-200 text-carbon-black"
                                          {...props}
                                        >
                                          {children}
                                        </code>
                                      );
                                    }
                                    return (
                                      <code className="block" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  pre: ({ node, children, ...props }) => (
                                    <pre
                                      className="p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono bg-gray-100 text-carbon-black"
                                      {...props}
                                    >
                                      {children}
                                    </pre>
                                  ),
                                  blockquote: ({ node, children, ...props }) => (
                                    <blockquote
                                      className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700"
                                      {...props}
                                    >
                                      {children}
                                    </blockquote>
                                  ),
                                  strong: ({ node, children, ...props }) => (
                                    <strong className="font-semibold text-carbon-black" {...props}>{children}</strong>
                                  ),
                                  em: ({ node, children, ...props }) => (
                                    <em className="italic text-carbon-black" {...props}>{children}</em>
                                  ),
                                }}
                              >
                                {(() => {
                                  // Preprocess content to convert bullet points and URLs to markdown
                                  let processedContent = message.content;
                                  
                                  // Step 0: Strip all ** (bold markdown) from the content BEFORE processing
                                  // This prevents ** from appearing in link text or anywhere else
                                  processedContent = processedContent.replace(/\*\*/g, '');
                                  
                                  // Step 1: Convert URLs to markdown links FIRST (before any text manipulation)
                                  // Pattern: "Title (Type): Description URL" - structured resource links
                                  processedContent = processedContent.replace(
                                    /([A-Z][^\n(]+?)\s+\(([^)]+)\):\s+([^\n]+?)\s+(https?:\/\/[^\s\n]+)/g,
                                    '[$1 ($2)]($4): $3'
                                  );
                                  
                                  // Fallback: Convert any remaining bare URLs to clickable links
                                  processedContent = processedContent.replace(
                                    /(?<!\()(?<!]\()https?:\/\/[^\s)]+/g,
                                    (url) => `[${url}](${url})`
                                  );
                                  
                                  // Step 2: Handle inline "Resources:" section - convert to proper bulleted list
                                  // Match "Resources: - Item1 - Item2" pattern and split into list
                                  processedContent = processedContent.replace(
                                    /Resources:\s*-\s*(.+?)(?=\n\n|$)/gis,
                                    (match, resourcesText) => {
                                      // Split by " - " pattern that precedes a markdown link [
                                      const items = resourcesText.split(/\s+-\s+(?=\[)/);
                                      
                                      // Format each item as a bullet
                                      const formattedItems = items
                                        .map(item => item.trim())
                                        .filter(item => item.length > 0)
                                        .map(item => `- ${item}`)
                                        .join('\n');
                                      
                                      return `**Resources:**\n\n${formattedItems}`;
                                    }
                                  );
                                  
                                  // Step 3: Convert bullet points to markdown (preserves links)
                                  processedContent = processedContent.replace(/^•\s+/gm, '- ');
                                  processedContent = processedContent.replace(/\n•\s+/g, '\n- ');
                                  
                                  // Step 4: Convert numbered lists
                                  processedContent = processedContent.replace(/^(\d+)\.\s+/gm, '$1. ');
                                  
                                  // Step 5: Format section headers (exclude Resources: which is already bold)
                                  processedContent = processedContent.replace(
                                    /\n\n(?!\*\*Resources:\*\*)([A-Z][^:\n]+:)(?!\s*\n\n-)/g,
                                    '\n\n## $1'
                                  );
                                  
                                  return processedContent;
                                })()}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {isAiThinking && (
                      <div className="mb-6">
                        <img 
                          src="/preloader.gif" 
                          alt="Loading..." 
                          className="w-8 h-8"
                        />
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
            <div className="pointer-events-auto max-w-2xl mx-auto">
              {/* Chat Tray */}
              <div className="bg-stardust rounded-[20px] p-[10px_15px] shadow-[4px_4px_10px_rgba(0,0,0,0.15)] flex flex-col gap-[10px]">
                {/* Input Area */}
                <div className="flex flex-col gap-2">
                  {/* Text Input */}
                  <div className="bg-white rounded-lg px-[11px] py-1 flex items-center">
                    <textarea
                      ref={textareaRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onInput={handleTextareaResize}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask me anything..."
                      disabled={isInactiveUser || isSending || isLoading}
                      className="flex-1 text-[18px] leading-[26px] font-proxima font-normal text-black bg-transparent border-none outline-none placeholder:text-black disabled:opacity-50 resize-none overflow-hidden"
                      style={{ height: 'auto', minHeight: '26px' }}
                    />
                  </div>
                  
                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    {/* Left side - Hidden buttons */}
                    <div className="w-[82px]" />
                    
                    {/* Right side - LLM dropdown, Upload, Send */}
                    <div className="flex items-center gap-[6px]">
                      {/* LLM Dropdown - matches Learning page styling */}
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-bg-light border-0 rounded-md px-3 py-1.5 text-xs h-auto w-auto font-proxima focus:ring-0 focus:ring-offset-0">
                          <SelectValue>
                            {LLM_MODELS.find(model => model.value === selectedModel)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {LLM_MODELS.map(model => (
                            <SelectItem key={model.value} value={model.value} className="text-xs font-proxima">
                              <div className="flex flex-col">
                                <span>{model.label}</span>
                                <span className="text-xs text-gray-500">{model.description}</span>
                        </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Upload Button with Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                      <button
                        onClick={() => {
                          if (!activeThread) {
                            handleCreateThread();
                          }
                        }}
                        disabled={isInactiveUser || isProcessingUpload}
                        className="w-[30px] h-[30px] bg-bg-light rounded-lg flex items-center justify-center disabled:opacity-50"
                      >
                        <svg className="w-[14px] h-[14px] text-carbon-black" fill="none" stroke="currentColor" viewBox="0 0 14 14">
                          <path d="M7 11V3M7 3L4 6M7 3L10 6M1 13H13" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side="top" className="w-48">
                          <DropdownMenuItem 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Upload File</span>
                            <span className="text-xs text-gray-500 ml-auto">PDF, TXT, MD, DOCX</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setShowUrlInput(true)}
                            className="flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span>Add URL</span>
                            <span className="text-xs text-gray-500 ml-auto">Article, YouTube, etc.</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
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

      {/* URL Input Dialog */}
      <Dialog open={showUrlInput} onOpenChange={setShowUrlInput}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add URL</DialogTitle>
            <DialogDescription>
              Enter a URL to analyze and summarize content from articles, YouTube videos, Google Docs, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url-input">URL</Label>
              <Input
                id="url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/article"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && urlInput.trim() && !isProcessingUpload) {
                  handleUrlSubmit();
                }
              }}
              autoFocus
            />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button
                onClick={() => setUrlInput('')}
                className="px-4 py-2 border border-divider rounded-md font-proxima text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
            </DialogClose>
              <button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || isProcessingUpload}
                className="px-4 py-2 bg-pursuit-purple text-white rounded-md font-proxima text-sm hover:bg-pursuit-purple/90 disabled:opacity-50"
              >
                Summarize
              </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Loading Curtain */}
      <LoadingCurtain isLoading={isInitialLoad} />
    </div>
  );
}

export default GPT;

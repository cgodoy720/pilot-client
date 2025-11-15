// API utility functions

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth headers
const getAuthHeaders = (token) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Generic fetch function with authentication
export const fetchWithAuth = async (endpoint, options = {}, token) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' };
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Chat API functions
export const sendMessageToGPT = async (message, threadId, token, model = 'anthropic/claude-sonnet-4.5', signal = null) => {
  return fetchWithAuth('/api/chat/messages', {
    method: 'POST',
    body: JSON.stringify({
      content: message,
      threadId: threadId,
      model: model
    }),
    signal
  }, token);
};

export const getThreads = async (token, signal = null) => {
  return fetchWithAuth('/api/chat/threads', {
    method: 'GET',
    signal
  }, token);
};

export const createThread = async (title, token, signal = null) => {
  return fetchWithAuth('/api/chat/threads', {
    method: 'POST',
    body: JSON.stringify({
      title: title || 'New Conversation'
    }),
    signal
  }, token);
};

export const getThreadMessages = async (threadId, token, signal = null) => {
  return fetchWithAuth(`/api/chat/messages/${threadId}`, {
    method: 'GET',
    signal
  }, token);
}; 
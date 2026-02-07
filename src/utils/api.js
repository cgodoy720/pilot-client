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

/**
 * Stream a message to the GPT API and receive SSE events
 * @param {string} message - The message content to send
 * @param {number} threadId - The thread ID
 * @param {string} token - Auth token
 * @param {string} model - The model to use
 * @param {function} onChunk - Callback for each chunk: { type: 'text' | 'done' | 'error', content?: string, message?: object, error?: string }
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 * @returns {Promise<void>}
 */
export const streamMessageToGPT = async (message, threadId, token, model = 'anthropic/claude-sonnet-4.5', onChunk, signal = null) => {
  const url = `${API_URL}/api/chat/messages/stream`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: message,
        threadId: threadId,
        model: model
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Process complete SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onChunk(data);
          } catch (parseError) {
            console.error('Failed to parse SSE data:', line, parseError);
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6));
        onChunk(data);
      } catch (parseError) {
        console.error('Failed to parse final SSE data:', buffer, parseError);
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // Request was cancelled - don't treat as error
      return;
    }
    console.error('Stream request failed:', error);
    onChunk({ type: 'error', error: error.message || 'Stream failed' });
    throw error;
  }
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
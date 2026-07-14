const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

const headers = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

const handleResponse = async (res) => {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${res.status}`);
    }
    return res.json();
};

// Assignments
export const fetchAssignments = (token, myOnly = false) =>
    fetch(`${API_URL}/api/coaching/assignments${myOnly ? '?myOnly=true' : ''}`, { headers: headers(token) }).then(handleResponse);

export const createAssignment = (token, data) =>
    fetch(`${API_URL}/api/coaching/assignments`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const updateAssignment = (token, id, data) =>
    fetch(`${API_URL}/api/coaching/assignments/${id}`, {
        method: 'PUT', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteAssignment = (token, id) =>
    fetch(`${API_URL}/api/coaching/assignments/${id}`, {
        method: 'DELETE', headers: headers(token)
    }).then(handleResponse);

// Sessions
export const createSession = (token, data) =>
    fetch(`${API_URL}/api/coaching/sessions`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const fetchSession = (token, sessionId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}`, { headers: headers(token) }).then(handleResponse);

export const fetchSessionsByAssignment = (token, assignmentId, limit = 20, offset = 0) =>
    fetch(`${API_URL}/api/coaching/sessions?assignmentId=${assignmentId}&limit=${limit}&offset=${offset}`, {
        headers: headers(token)
    }).then(handleResponse);

export const updateSessionStatus = (token, sessionId, status) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/status`, {
        method: 'PUT', headers: headers(token), body: JSON.stringify({ status })
    }).then(handleResponse);

export const updateSession = (token, sessionId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}`, {
        method: 'PUT', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteSession = (token, sessionId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}`, {
        method: 'DELETE', headers: headers(token)
    }).then(handleResponse);

// Pre-session inputs
export const submitPreInputs = (token, sessionId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/pre-inputs`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

// Engine prep
export const generatePrep = (token, sessionId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/generate-prep`, {
        method: 'POST', headers: headers(token)
    }).then(handleResponse);

export const fetchPrep = (token, sessionId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/prep`, { headers: headers(token) }).then(handleResponse);

// Notes
export const createNote = (token, sessionId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/notes`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const updateNote = (token, sessionId, noteId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/notes/${noteId}`, {
        method: 'PUT', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const deleteNote = (token, sessionId, noteId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/notes/${noteId}`, {
        method: 'DELETE', headers: headers(token)
    }).then(handleResponse);

// Transcripts
export const uploadTranscript = (token, sessionId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/transcript`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

export const syncTranscriptFromFireflies = (token, sessionId) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/sync-transcript`, {
        method: 'POST', headers: headers(token)
    }).then(handleResponse);

// Feedback
export const submitFeedback = (token, sessionId, data) =>
    fetch(`${API_URL}/api/coaching/sessions/${sessionId}/feedback`, {
        method: 'POST', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

// Assignment stats (average NPS, etc.)
export const fetchAssignmentStats = (token, assignmentId) =>
    fetch(`${API_URL}/api/coaching/assignments/${assignmentId}/stats`, { headers: headers(token) }).then(handleResponse);

// Dashboard
export const fetchDashboard = (token) =>
    fetch(`${API_URL}/api/coaching/dashboard`, { headers: headers(token) }).then(handleResponse);

// Integrations (Fireflies key stored server-side — GET never returns the key itself)
export const fetchIntegrations = (token) =>
    fetch(`${API_URL}/api/profile/integrations`, { headers: headers(token) }).then(handleResponse);

export const saveIntegrations = (token, data) =>
    fetch(`${API_URL}/api/profile/integrations`, {
        method: 'PUT', headers: headers(token), body: JSON.stringify(data)
    }).then(handleResponse);

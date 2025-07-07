// UUID utility functions for the admissions tool

// Generate a proper UUID v4
export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback UUID generation for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Validate UUID format
export const isValidUUID = (uuid) => {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

// Get or create user ID
export const getUserId = () => {
    let userId = localStorage.getItem('userId');
    
    // Check if existing userId is valid
    if (userId && isValidUUID(userId)) {
        return userId;
    }
    
    // Generate new UUID if none exists or if existing one is invalid
    userId = generateUUID();
    localStorage.setItem('userId', userId);
    
    console.log('Generated new user ID:', userId);
    return userId;
};

// Clear invalid user ID and generate new one
export const resetUserId = () => {
    localStorage.removeItem('userId');
    return getUserId();
};

// Clear all cached data and reset user ID
export const clearUserData = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('infoSessionStatus');
    localStorage.removeItem('infoSessionDetails');
    localStorage.removeItem('workshopStatus');
    localStorage.removeItem('workshopDetails');
    console.log('Cleared all user data from localStorage');
    return getUserId();
}; 
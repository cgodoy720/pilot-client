import { fetchWithAuth } from './api';

/**
 * Get user's profile photo with fallback hierarchy
 * Priority: lookbook_profiles.photo_url > users.github_avatar_url > default avatar
 * 
 * @param {number} userId - The user ID
 * @param {string} token - Auth token
 * @returns {Promise<string>} - URL of the user's photo
 */
export const getUserProfilePhoto = async (userId, token) => {
  try {
    // 1. Try lookbook_profiles.photo_url first
    const lookbookResponse = await fetchWithAuth(`/api/performance/users/${userId}/lookbook-profile`, { method: 'GET' }, token);
    if (lookbookResponse.success && lookbookResponse.data.photo_url) {
      return lookbookResponse.data.photo_url;
    }
    
    // 2. Fallback to users.github_avatar_url
    const githubResponse = await fetchWithAuth(`/api/performance/users/${userId}/github-data`, { method: 'GET' }, token);
    if (githubResponse.success && githubResponse.data.github_avatar_url) {
      return githubResponse.data.github_avatar_url;
    }
    
    // 3. Default avatar
    return '/assets/default-avatar.png';
  } catch (error) {
    console.error('Error fetching user photo:', error);
    return '/assets/default-avatar.png';
  }
};

/**
 * Get multiple users' profile photos in batch
 * 
 * @param {number[]} userIds - Array of user IDs
 * @returns {Promise<Object>} - Object mapping userId to photo URL
 */
export const getUserProfilePhotos = async (userIds) => {
  try {
    const photoPromises = userIds.map(async (userId) => {
      const photoUrl = await getUserProfilePhoto(userId);
      return { userId, photoUrl };
    });
    
    const results = await Promise.all(photoPromises);
    
    // Convert array to object mapping
    return results.reduce((acc, { userId, photoUrl }) => {
      acc[userId] = photoUrl;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user photos in batch:', error);
    // Return default photos for all users
    return userIds.reduce((acc, userId) => {
      acc[userId] = '/assets/default-avatar.png';
      return acc;
    }, {});
  }
};

/**
 * Check if a user has a professional lookbook profile photo
 * 
 * @param {number} userId - The user ID
 * @returns {Promise<boolean>} - True if user has a lookbook photo
 */
export const hasLookbookPhoto = async (userId) => {
  try {
    const lookbookResponse = await fetchWithAuth(`/api/users/${userId}/lookbook-profile`);
    return !!(lookbookResponse.photo_url);
  } catch (error) {
    console.error('Error checking lookbook photo:', error);
    return false;
  }
};

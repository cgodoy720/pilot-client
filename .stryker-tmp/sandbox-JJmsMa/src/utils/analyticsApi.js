// @ts-nocheck
import { fetchWithAuth } from './api';

/**
 * Fetch sentiment analysis data for the current user
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to sentiment analysis data
 */
export const fetchSentimentAnalysis = async (token) => {
  return fetchWithAuth('/api/analytics/sentiment', { method: 'GET' }, token);
};

/**
 * Fetch user activity metrics
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to user activity data
 */
export const fetchUserActivity = async (token) => {
  return fetchWithAuth('/api/analytics/activity', { method: 'GET' }, token);
};

/**
 * Fetch combined dashboard analytics data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to dashboard analytics data
 */
export const fetchDashboardAnalytics = async (token) => {
  return fetchWithAuth('/api/analytics/dashboard', { method: 'GET' }, token);
}; 
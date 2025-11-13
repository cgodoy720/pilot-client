/**
 * API service for communicating with the FastAPI backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // In production, add authentication token here
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Health checks
  healthCheck: () => api.get('/health'),
  servicesHealth: () => api.get('/health/services'),

  // Salesforce - Opportunities
  getOpportunities: (params?: { stage?: string; limit?: number }) =>
    api.get('/api/salesforce/opportunities', { params }),
  
  createOpportunity: (data: any) =>
    api.post('/api/salesforce/opportunities', data),
  
  updateOpportunity: (opportunityId: string, updates: any) =>
    api.put(`/api/salesforce/opportunities/${opportunityId}`, {
      opportunity_id: opportunityId,
      updates,
      user_id: 'current_user', // In production, get from auth
      reason: 'Updated via Financial Forecasting Dashboard'
    }),

  // Salesforce - Accounts
  getAccounts: (params?: { limit?: number }) =>
    api.get('/api/salesforce/accounts', { params }),
  
  createAccount: (data: {
    Name: string;
    Type?: string;
    Website?: string;
    Phone?: string;
  }) => api.post('/api/salesforce/accounts', data),

  // Salesforce - Contacts
  getContacts: (params?: { account_id?: string; limit?: number }) =>
    api.get('/api/salesforce/contacts', { params }),
  
  createContact: (data: {
    FirstName?: string;
    LastName: string;
    AccountId: string;
    Title?: string;
    Email?: string;
    Phone?: string;
    Primary_Affiliation__c?: string;
  }) => api.post('/api/salesforce/contacts', data),

  // Salesforce - Users
  getUsers: (params?: { limit?: number }) =>
    api.get('/api/salesforce/users', { params }),

  // Sage Intacct - Invoices
  getInvoices: (params?: { customer_id?: string; limit?: number }) =>
    api.get('/api/intacct/invoices', { params }),
  
  createInvoice: (invoiceData: {
    opportunity_id: string;
    customer_id: string;
    amount: number;
    due_date: string;
    line_items: any[];
    notes?: string;
  }) => api.post('/api/intacct/invoices', invoiceData),

  // Sage Intacct - Payments
  getPayments: (params?: { customer_id?: string; limit?: number }) =>
    api.get('/api/intacct/payments', { params }),

  // Forecasting
  getDashboard: (params?: { date_range_days?: number; scenario?: string }) =>
    api.get('/api/forecasting/dashboard', { params }),
  
  getPaymentForecast: (params?: { days_ahead?: number; min_probability?: number }) =>
    api.get('/api/forecasting/payment-forecast', { params }),
  
  getCashFlow: (params?: { months_ahead?: number }) =>
    api.get('/api/forecasting/cash-flow', { params }),
  
  getMetrics: () =>
    api.get('/api/forecasting/metrics'),
  
  generateReport: (params?: { period_days?: number }) =>
    api.post('/api/forecasting/generate-report', null, { params }),

  // Data Sync
  triggerSync: (syncType: 'all' | 'salesforce' | 'intacct' = 'all') =>
    api.post(`/api/sync/trigger?sync_type=${syncType}`),

  // Invoice Matching
  getGrantInvoices: () =>
    api.get('/api/matching/grant-invoices'),
  
  getInvoiceMatches: () =>
    api.get('/api/matching/matches'),
  
  searchOpportunities: (searchTerm: string, limit?: number) =>
    api.get('/api/matching/search-opportunities', { params: { q: searchTerm, limit: limit || 20 } }),
  
  saveInvoiceMatch: (matchData: {
    invoice_id: string;
    opportunity_id: string;
    confidence?: string;
    notes?: string;
    customer_name?: string;
    invoice_amount?: number;
    invoice_date?: string;
  }) => api.post('/api/matching/save-match', matchData),
  
  deleteInvoiceMatch: (invoiceId: string) =>
    api.delete(`/api/matching/delete-match/${invoiceId}`),

  // Slack Integration
  getAccountSlackActivity: (accountName: string, limit: number = 50) =>
    api.get(`/api/slack/account-activity/${encodeURIComponent(accountName)}`, { params: { limit } }),
  
  slackHealthCheck: () =>
    api.get('/api/slack/health'),

  // Fireflies Integration
  getAccountFirefliesMeetings: (accountName: string, limit: number = 20) =>
    api.get(`/api/fireflies/account-meetings/${encodeURIComponent(accountName)}`, { params: { limit } }),
  
  firefliesHealthCheck: () =>
    api.get('/api/fireflies/health'),

  // Authentication
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Export axios instance for custom requests
export default api;

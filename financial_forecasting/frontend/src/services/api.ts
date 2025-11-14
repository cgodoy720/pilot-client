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

  // Sage Intacct Master Data
  getSageCustomers: () =>
    api.get('/api/sage/customers'),

  getSageGLAccounts: () =>
    api.get('/api/sage/gl-accounts'),
  
  getSagePayments: (params?: { limit?: number }) =>
    api.get('/api/sage/payments', { params }),
  
  getSageInvoices: (params?: { limit?: number }) =>
    api.get('/api/sage/invoices', { params }),
  
  getSageExpenses: (params?: { limit?: number }) =>
    api.get('/api/sage/expenses', { params }),

  getSageDepartments: () =>
    api.get('/api/sage/departments'),

  getSageClasses: () =>
    api.get('/api/sage/classes'),

  getSageLocations: () =>
    api.get('/api/sage/locations'),
  
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
  
  // Cash Flow
  getCashFlowSummary: () =>
    api.get('/api/cashflow/summary'),

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
  
  searchOpportunities: (searchTerm: string, limit?: number, invoiceData?: {
    customer_name?: string;
    invoice_amount?: number;
    invoice_date?: string;
  }) =>
    api.get('/api/matching/search-opportunities', { 
      params: { 
        q: searchTerm, 
        limit: limit || 50,
        customer_name: invoiceData?.customer_name || '',
        invoice_amount: invoiceData?.invoice_amount || 0,
        invoice_date: invoiceData?.invoice_date || ''
      } 
    }),
  
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

  // Payment Schedule Management
  parsePaymentSchedule: (opportunityId: string, data: {
    natural_language_text: string;
    opportunity_amount: number;
  }) =>
    api.post(`/api/opportunities/${opportunityId}/payment-schedule/parse`, data),

  getPaymentSchedule: (opportunityId: string) =>
    api.get(`/api/opportunities/${opportunityId}/payment-schedule`),

  createPaymentSchedule: (opportunityId: string, data: {
    payments: Array<{
      payment_date: string;
      amount: number;
      status: string;
    }>;
  }) =>
    api.post(`/api/opportunities/${opportunityId}/payment-schedule`, data),

  updatePayment: (opportunityId: string, paymentId: string, data: {
    payment_date?: string;
    amount?: number;
    paid?: boolean;
    payment_method?: string;
    received_date?: string;
    notes?: string;
  }) =>
    api.put(`/api/opportunities/${opportunityId}/payment-schedule/${paymentId}`, data),

  deletePayment: (opportunityId: string, paymentId: string) =>
    api.delete(`/api/opportunities/${opportunityId}/payment-schedule/${paymentId}`),

  // Finance Dashboard
  getAwaitingInvoices: () =>
    api.get('/api/finance/awaiting-invoices'),

  getActiveCollections: () =>
    api.get('/api/finance/active-collections'),

  getCompletedGrants: () =>
    api.get('/api/finance/completed'),

  getUnsentInvoices: () =>
    api.get('/api/finance/unsent-invoices'),

  createSageInvoice: (paymentId: string, sendEmail: boolean = false) =>
    api.post('/api/finance/create-invoice', { 
      payment_id: paymentId,
      send_email: sendEmail 
    }),

  sendInvoiceEmail: (salesforceInvoiceId: string) =>
    api.post('/api/finance/send-invoice-email', { 
      salesforce_invoice_id: salesforceInvoiceId 
    }),

  syncInvoiceStatus: () =>
    api.post('/api/finance/sync-invoice-status'),

  // Opportunity Stage Management
  validateStageChange: (opportunityId: string, newStage: string) =>
    api.post('/api/opportunities/validate-stage-change', {
      opportunity_id: opportunityId,
      new_stage: newStage
    }),

  updateOpportunityStage: (opportunityId: string, newStage: string) =>
    api.post('/api/opportunities/update-stage', {
      opportunity_id: opportunityId,
      new_stage: newStage
    }),

  savePaymentSchedule: (opportunityId: string, payments: Array<{amount: number, scheduled_date: string}>) =>
    api.post('/api/opportunities/create-payment-schedule', {
      opportunity_id: opportunityId,
      payments: payments,
      delete_existing: true
    }),

  // Authentication
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Export axios instance for custom requests
export default api;

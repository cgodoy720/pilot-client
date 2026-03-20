/**
 * API service for communicating with the FastAPI backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { OpportunityCreatePayload, OpportunityUpdatePayload } from '../types/api';

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
  getOpportunities: (params?: { stage?: string; stages?: readonly string[]; limit?: number; record_type?: string; opp_type?: string; active_only?: boolean }) =>
    api.get('/api/salesforce/opportunities', {
      params,
      paramsSerializer: (p: Record<string, string | string[] | number | boolean | undefined | null>) => {
        const sp = new URLSearchParams();
        Object.entries(p).forEach(([k, v]) => {
          if (Array.isArray(v)) v.forEach(i => sp.append(k, i));
          else if (v !== undefined && v !== null) sp.append(k, String(v));
        });
        return sp.toString();
      },
    }),
  
  getStageHistory: (days: number = 30) =>
    api.get('/api/salesforce/opportunities/stage-history', { params: { days } }),

  analyzePipeline: (days: number = 30) =>
    api.post('/api/ai/pipeline-analysis', { days }),

  createOpportunity: (data: OpportunityCreatePayload) =>
    api.post('/api/salesforce/opportunities', data),

  updateOpportunity: (opportunityId: string, updates: Record<string, string | number | boolean | null>) =>
    api.put(`/api/salesforce/opportunities/${opportunityId}`, {
      opportunity_id: opportunityId,
      updates,
      reason: 'Updated via Revenue Hub'
    } satisfies OpportunityUpdatePayload),

  bulkUpdateOpportunities: (opportunityIds: string[], updates: Record<string, string | number | boolean | null>) =>
    api.put('/api/salesforce/opportunities/bulk-update', {
      opportunity_ids: opportunityIds,
      updates
    }),

  // Salesforce - Tasks (linked to Opportunities)
  getOpportunityTasks: (opportunityId: string) =>
    api.get(`/api/salesforce/opportunities/${opportunityId}/tasks`),
  
  createTask: (opportunityId: string, taskData: {
    Subject: string;
    Status?: string;
    Priority?: string;
    ActivityDate?: string;
    Description?: string;
    OwnerId?: string;
  }) => api.post(`/api/salesforce/opportunities/${opportunityId}/tasks`, taskData),
  
  updateTask: (taskId: string, updates: {
    Subject?: string;
    Status?: string;
    Priority?: string;
    ActivityDate?: string;
    Description?: string;
    OwnerId?: string;
  }) => api.put(`/api/salesforce/tasks/${taskId}`, updates),
  
  deleteTask: (taskId: string) =>
    api.delete(`/api/salesforce/tasks/${taskId}`),

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

  getSageUnpaidBills: (params?: { limit?: number }) =>
    api.get('/api/sage/unpaid-bills', { params }),

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

  // Gmail Integration
  getAccountGmailActivity: (accountName: string, limit: number = 20) =>
    api.get(`/api/gmail/account-activity/${encodeURIComponent(accountName)}`, { params: { limit } }),

  gmailHealthCheck: () =>
    api.get('/api/gmail/health'),

  // Google Calendar Integration
  getAccountCalendarActivity: (accountName: string, limit: number = 20) =>
    api.get(`/api/calendar/account-activity/${encodeURIComponent(accountName)}`, { params: { limit } }),

  calendarHealthCheck: () =>
    api.get('/api/calendar/health'),

  // My Priorities — tasks and calendar
  getMyTasks: (start?: string, end?: string) =>
    api.get('/api/salesforce/my-tasks', { params: { start, end } }),

  getMyCalendarEvents: (start?: string, end?: string, limit: number = 100, calendar_id?: string) =>
    api.get('/api/calendar/my-events', { params: { start, end, limit, calendar_id } }),

  // Automation Review
  getPendingReviews: () =>
    api.get('/api/automation-review/pending'),

  getAllReviews: () =>
    api.get('/api/automation-review/all'),

  approveReview: (id: string, edits?: any) =>
    api.post(`/api/automation-review/${id}/approve`, edits || {}),

  rejectReview: (id: string, reason?: string) =>
    api.post(`/api/automation-review/${id}/reject`, { reason }),

  submitSlackWebhook: (text: string, channel?: string) =>
    api.post('/api/slack/webhook', { text, channel: channel || 'manual', user_name: 'Bedrock User' }),

  getSlackChannelMessages: (channelName: string, limit: number = 50) =>
    api.get(`/api/slack/channel-messages/${encodeURIComponent(channelName)}`, { params: { limit } }),

  getSlackPipelineUpdates: (limit: number = 50) =>
    api.get('/api/slack/pipeline-updates', { params: { limit } }),

  ingestPipelineUpdates: (limit: number = 20) =>
    api.post('/api/automation-review/ingest-pipeline', null, { params: { limit } }),

  getCalendarConfig: () =>
    api.get('/api/calendar/config'),

  // Google Drive Integration
  getAccountDriveActivity: (accountName: string, limit: number = 20, opportunityName?: string) =>
    api.get(`/api/drive/account-activity/${encodeURIComponent(accountName)}`, {
      params: { limit, ...(opportunityName ? { opportunity_name: opportunityName } : {}) }
    }),

  driveHealthCheck: () =>
    api.get('/api/drive/health'),

  // AI-Powered Activity Intelligence (unified)
  getActivityIntelligence: (accountName: string, forceRefresh: boolean = false, opportunityName?: string) =>
    api.get(`/api/activity-intelligence/${encodeURIComponent(accountName)}`, {
      timeout: 120000,
      params: {
        ...(forceRefresh ? { force_refresh: true } : {}),
        ...(opportunityName ? { opportunity_name: opportunityName } : {}),
      },
    }),

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

  // Projects (PostgreSQL-backed)
  getProjects: () =>
    api.get('/api/projects'),

  getProject: (projectId: string) =>
    api.get(`/api/projects/${projectId}`),

  createWorkstream: (projectId: string, data: { name: string; description?: string; sort_order?: number }) =>
    api.post(`/api/projects/${projectId}/workstreams`, data),

  updateWorkstream: (workstreamId: string, data: { name?: string; description?: string; sort_order?: number }) =>
    api.put(`/api/workstreams/${workstreamId}`, data),

  deleteWorkstream: (workstreamId: string) =>
    api.delete(`/api/workstreams/${workstreamId}`),

  createMilestone: (workstreamId: string, data: { title: string; status?: string; priority?: string; owner?: string; description?: string }) =>
    api.post(`/api/workstreams/${workstreamId}/milestones`, data),

  updateMilestone: (milestoneId: string, data: { title?: string; status?: string; priority?: string; owner?: string; description?: string }) =>
    api.put(`/api/milestones/${milestoneId}`, data),

  deleteMilestone: (milestoneId: string) =>
    api.delete(`/api/milestones/${milestoneId}`),

  createProjectTask: (milestoneId: string, data: { title: string; status?: string; owner?: string; deadline?: string; start_date?: string; description?: string }) =>
    api.post(`/api/milestones/${milestoneId}/tasks`, data),

  updateProjectTask: (taskId: string, data: { title?: string; status?: string; owner?: string; deadline?: string; start_date?: string; description?: string; updates?: string }) =>
    api.put(`/api/project-tasks/${taskId}`, data),

  deleteProjectTask: (taskId: string) =>
    api.delete(`/api/project-tasks/${taskId}`),

  // Cache Management
  clearCache: () =>
    api.post('/api/cache/clear'),

  // Authentication
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),

  // Salesforce OAuth
  getSalesforceStatus: () =>
    api.get('/auth/salesforce/status'),
  
  disconnectSalesforce: () =>
    api.post('/auth/salesforce/disconnect'),

  // Prospect Import
  prospectImportPreview: (csvText: string) =>
    api.post('/api/prospect-import/preview', { csv_text: csvText }),

  prospectImportParse: (csvText: string, columnMapping: Record<string, string | string[] | undefined>, filename?: string) =>
    api.post('/api/prospect-import/parse', {
      csv_text: csvText,
      column_mapping: columnMapping,
      filename: filename || 'import.csv',
    }),

  prospectImportGetPersons: (sessionId?: string) =>
    api.get('/api/prospect-import/persons', { params: sessionId ? { session_id: sessionId } : {} }),

  prospectImportWriteToCrm: (sessionId?: string) =>
    api.post('/api/prospect-import/write-to-crm', { session_id: sessionId }),
};

// Export axios instance for custom requests
export default api;

// Database service for connecting to Cloud SQL PostgreSQL via backend API

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

class DatabaseService {
  constructor() {
    this.currentApplicant = null;
    this.currentApplication = null;
  }

  // Get authorization headers with JWT token
  getAuthHeaders() {
    const token = localStorage.getItem('applicantToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Authentication methods
  async signup(firstName, lastName, email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Store token and applicant data
      localStorage.setItem('applicantToken', data.token);
      this.currentApplicant = data.applicant;
      
      return data;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/unified-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      // Only handle applicant logins in this service
      if (data.userType === 'applicant') {
        // Store token and applicant data
        localStorage.setItem('applicantToken', data.token);
        this.currentApplicant = data.user;
        
        return {
          success: true,
          userType: data.userType,
          redirectTo: data.redirectTo,
          user: data.user
        };
      } else {
        throw new Error('This login is for builders only. Please use the main login page.');
      }
    } catch (error) {
      console.error('Error during applicant login:', error);
      throw error;
    }
  }

  async resetPassword(email, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('applicantToken');
    this.currentApplicant = null;
    this.currentApplication = null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('applicantToken');
  }

  // Get current applicant from token
  getCurrentApplicant() {
    const token = localStorage.getItem('applicantToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          applicant_id: payload.applicantId,
          first_name: payload.firstName,
          last_name: payload.lastName,
          email: payload.email
        };
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
        return null;
      }
    }
    return null;
  }

  // Fetch all sections and questions from database via API
  async fetchApplicationQuestions() {
    try {
      // Add cache-busting parameter to ensure fresh data
      const cacheBuster = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/applications/questions?t=${cacheBuster}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const questions = await response.json();
      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  // Create or get applicant
  async createOrGetApplicant(email, firstName, lastName) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/applicant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, firstName, lastName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.currentApplicant = await response.json();
      return this.currentApplicant;
    } catch (error) {
      console.error('Error creating/getting applicant:', error);
      throw error;
    }
  }

  // Create application
  async createApplication(cohortId = null) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('You must be logged in to create an application');
      }
      const url = `${API_BASE_URL}/applications/application`;
      const body = { cohortId };

      console.log('Creating application with:', { url, body });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.currentApplication = await response.json();
      console.log('Application created:', this.currentApplication);
      return this.currentApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Save user response to database
  async saveResponse(applicationId, questionId, responseValue) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('You must be logged in to save application responses');
      }
      const url = `${API_BASE_URL}/applications/response`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          applicationId,
          questionId,
          responseValue
        }),
      });

      if (!response.ok) {
        // Surface the server's actual error message (e.g., "Application
        // cannot be edited once a decision is final") so the form can
        // display it in its auto-save banner. The previous `HTTP error!
        // status: 400` swallowed every meaningful reason from the user.
        const body = await response.json().catch(() => ({}));
        const message =
          body?.error ||
          body?.message ||
          `Save failed (HTTP ${response.status})`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving response:', error);
      throw error;
    }
  }

  // Submit application
  async submitApplication(applicationId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('You must be logged in to submit an application');
      }
      const url = `${API_BASE_URL}/applications/${applicationId}/submit`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Same pattern as saveResponse: read the server's error body so
        // the submit confirmation dialog can show the real reason instead
        // of a generic "Submission Failed".
        const body = await response.json().catch(() => ({}));
        const message =
          body?.error ||
          body?.message ||
          `Submit failed (HTTP ${response.status})`;
        const err = new Error(message);
        err.status = response.status;
        throw err;
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  async reopenSubmittedApplication(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/reopen`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reopening submitted application:', error);
      throw error;
    }
  }

  // Get application by applicant ID
  async getApplicationByApplicantId(applicantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/applicant/${applicantId}/application`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No application found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application by applicant ID:', error);
      throw error;
    }
  }

  // Get latest application by applicant ID (all statuses, for dashboard)
  async getLatestApplicationByApplicantId(applicantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/applicant/${applicantId}/latest-application`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No application found
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching latest application by applicant ID:', error);
      throw error;
    }
  }

  // Get all responses for an application
  async getApplicationResponses(applicationId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('You must be logged in to load application responses');
      }
      const url = `${API_BASE_URL}/applications/${applicationId}/responses`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application responses:', error);
      throw error;
    }
  }

  // Load form data (transform responses back to form data format)
  async loadFormData(applicationId) {
    try {
      const responses = await this.getApplicationResponses(applicationId);
      const formData = {};
      
      responses.forEach(response => {
        try {
          // Try to parse as JSON first (for arrays/objects)
          formData[response.question_id] = JSON.parse(response.response_value);
        } catch (e) {
          // If not JSON, use as string
          formData[response.question_id] = response.response_value;
        }
      });
      
      return formData;
    } catch (error) {
      console.error('Error loading form data:', error);
      return {}; // Return empty object on error
    }
  }

  // Initialize application session (get or create applicant and application)
  async initializeApplication(email, firstName, lastName) {
    try {
      // Get or create applicant
      const applicant = await this.createOrGetApplicant(email, firstName, lastName);
      
      // Create new application for this session
      const application = await this.createApplication();
      
      return {
        applicant,
        application
      };
    } catch (error) {
      console.error('Error initializing application:', error);
      throw error;
    }
  }

  // Get current session info
  getCurrentSession() {
    return {
      applicant: this.getCurrentApplicant(),
      application: this.currentApplication
    };
  }

  // Check eligibility
  async checkEligibility(formData, applicantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/check-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData, applicantId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }
  }

  // Reset eligibility status to allow editing
  async resetEligibility(applicantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/reset-eligibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicantId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error resetting eligibility:', error);
      throw error;
    }
  }

}

export default new DatabaseService(); 
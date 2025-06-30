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
      const response = await fetch(`${API_BASE_URL}/applications/login`, {
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
      
      // Store token and applicant data
      localStorage.setItem('applicantToken', data.token);
      this.currentApplicant = data.applicant;
      
      return data;
    } catch (error) {
      console.error('Error during login:', error);
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
      const response = await fetch(`${API_BASE_URL}/applications/questions`);
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
      const response = await fetch(`${API_BASE_URL}/applications/application`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ cohortId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.currentApplication = await response.json();
      return this.currentApplication;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  }

  // Save user response to database
  async saveResponse(applicationId, questionId, responseValue) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/response`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ applicationId, questionId, responseValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/submit`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  // Get all responses for an application
  async getApplicationResponses(applicationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/responses`, {
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
}

export default new DatabaseService(); 
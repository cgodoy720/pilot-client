// Database service for connecting to Cloud SQL PostgreSQL via backend API
// This replaces the static applicationQuestions.js

const API_BASE_URL = 'http://localhost:7001/api'; // Backend API URL

class DatabaseService {
  constructor() {
    this.currentApplicant = null;
    this.currentApplication = null;
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
      // Fallback to local storage or static questions if API fails
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

  // Get existing application for applicant (if any)
  async getExistingApplication(applicantId) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/applicant/${applicantId}/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        // No existing application found
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting existing application:', error);
      // Don't throw error - just return null to create new application
      return null;
    }
  }

  // Create application
  async createApplication(applicantId, cohortId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/applications/application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicantId, cohortId }),
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
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/responses`);
      
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
      
      // Check for existing in-progress application
      let application = await this.getExistingApplication(applicant.applicant_id);
      
      if (!application) {
        // Create new application if none exists
        application = await this.createApplication(applicant.applicant_id);
      }
      
      this.currentApplication = application;
      
      return {
        applicant,
        application
      };
    } catch (error) {
      console.error('Error initializing application:', error);
      throw error;
    }
  }

  // Load form data from existing responses
  async loadFormData(applicationId) {
    try {
      const responses = await this.getApplicationResponses(applicationId);
      const formData = {};
      
      responses.forEach(response => {
        try {
          // Try to parse JSON responses (for arrays, objects)
          formData[response.question_id] = JSON.parse(response.response_value);
        } catch (e) {
          // If not JSON, store as string
          formData[response.question_id] = response.response_value;
        }
      });
      
      return formData;
    } catch (error) {
      console.error('Error loading form data:', error);
      return {};
    }
  }

  // Get current session info
  getCurrentSession() {
    return {
      applicant: this.currentApplicant,
      application: this.currentApplication
    };
  }
}

export default new DatabaseService(); 
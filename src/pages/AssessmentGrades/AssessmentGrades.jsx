import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Tabs, Tab, Box } from '@mui/material';
import Swal from 'sweetalert2';
import './AssessmentGrades.css';

const AssessmentGrades = () => {
  const { user, token: authToken } = useAuth();
  const [assessmentGrades, setAssessmentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Editing states for Overview tab
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editingStrengths, setEditingStrengths] = useState('');
  const [editingGrowthAreas, setEditingGrowthAreas] = useState('');
  const [savingOverview, setSavingOverview] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    cohort: '',
    date: '',
    startDate: '',
    endDate: '',
    assessmentType: ''
  });
  const [availableCohorts, setAvailableCohorts] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  // Check if user has admin access
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      setError('Access denied. Admin or staff privileges required.');
      setLoading(false);
      return;
    }
    
    fetchInitialData();
  }, [user, authToken]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchAvailableCohorts(),
        fetchAssessmentGrades(true)
      ]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCohorts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/cohorts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cohorts');
      }

      const data = await response.json();
      setAvailableCohorts(data.cohorts || []);
    } catch (err) {
      console.error('Error fetching cohorts:', err);
    }
  };

  const fetchAssessmentGrades = async (resetOffset = false) => {
    try {
      setLoading(true);
      const currentOffset = resetOffset ? 0 : pagination.offset;
      
      const queryParams = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: currentOffset.toString()
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment grades');
      }

      const data = await response.json();
      
      if (resetOffset) {
        setAssessmentGrades(data.data || []);
        setPagination(prev => ({ ...prev, offset: 0, ...data.pagination }));
      } else {
        setAssessmentGrades(prev => [...prev, ...(data.data || [])]);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
      
    } catch (err) {
      console.error('Error fetching assessment grades:', err);
      setError('Failed to fetch assessment grades');
    } finally {
      setLoading(false);
    }
  };

  // Statistics function removed

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setSelectedUsers(new Set());
    fetchAssessmentGrades(true);
  };

  const clearFilters = () => {
    setFilters({
      cohort: '',
      date: '',
      startDate: '',
      endDate: '',
      assessmentType: ''
    });
    setSelectedUsers(new Set());
    fetchAssessmentGrades(true);
  };

  const handleUserSelection = (userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === assessmentGrades.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(assessmentGrades.map(grade => grade.user_id)));
    }
  };

  const viewGrade = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleSendEmails = () => {
    if (selectedUsers.size === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Users Selected',
        text: 'Please select at least one user to send emails to.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    setShowEmailModal(true);
  };

  const exportData = async (format = 'csv') => {
    try {
      const queryParams = new URLSearchParams({ format });
      
      // Add current filters to export
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `assessment-grades-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `assessment-grades-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      Swal.fire({
        icon: 'error',
        title: 'Export Failed',
        text: 'Failed to export data. Please try again.',
        confirmButtonColor: '#d33'
      });
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchAssessmentGrades(false);
    }
  };

  // Overview editing functions
  const handleStartEditing = (grade) => {
    setIsEditingOverview(true);
    setEditingStrengths(grade.strengths_summary || '');
    setEditingGrowthAreas(grade.growth_areas_summary || '');
  };

  const handleCancelEditing = () => {
    setIsEditingOverview(false);
    setEditingStrengths('');
    setEditingGrowthAreas('');
  };

  const handleSaveOverview = async (userId) => {
    try {
      setSavingOverview(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/update-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          strengths_summary: editingStrengths,
          growth_areas_summary: editingGrowthAreas
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      const result = await response.json();
      
      // Update the local state
      setAssessmentGrades(prev => prev.map(grade => 
        grade.user_id === userId 
          ? { ...grade, strengths_summary: editingStrengths, growth_areas_summary: editingGrowthAreas }
          : grade
      ));

      // Update selectedGrade if it's the same user
      if (selectedGrade && selectedGrade.user_id === userId) {
        setSelectedGrade(prev => ({
          ...prev,
          strengths_summary: editingStrengths,
          growth_areas_summary: editingGrowthAreas
        }));
      }

      setIsEditingOverview(false);
      setEditingStrengths('');
      setEditingGrowthAreas('');
      
      Swal.fire({
        icon: 'success',
        title: 'Feedback Updated!',
        text: 'The feedback has been successfully updated in the database.',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Failed to update feedback. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSavingOverview(false);
    }
  };

  if (error) {
    return (
      <div className="assessment-grades">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assessment-grades">
      <div className="assessment-grades__content">

      {/* Filters */}
      <div className="assessment-grades__filters">
        <div className="filters-row">
          <div className="filter-group">
            <label htmlFor="cohort">Cohort:</label>
            <select
              id="cohort"
              value={filters.cohort}
              onChange={(e) => handleFilterChange('cohort', e.target.value)}
            >
              <option value="">All Cohorts</option>
              {availableCohorts.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="date">Specific Date:</label>
            <input
              type="date"
              id="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Date Range:</label>
            <div className="date-range">
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start Date"
              />
              <span>to</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="assessmentType">Assessment Type:</label>
            <select
              id="assessmentType"
              value={filters.assessmentType}
              onChange={(e) => handleFilterChange('assessmentType', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="technical">Technical</option>
              <option value="business">Business</option>
              <option value="professional">Professional</option>
              <option value="self">Self Assessment</option>
            </select>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn btn-primary" onClick={applyFilters}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="assessment-grades__actions">
        <div className="actions-left">
          <button
            className="btn btn-outline"
            onClick={handleSelectAll}
          >
            {selectedUsers.size === assessmentGrades.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="selection-count">
            {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="actions-right">
          <button
            className="btn btn-success"
            onClick={handleSendEmails}
            disabled={selectedUsers.size === 0}
          >
            Send Mass Email
          </button>
          <button
            className="btn btn-outline"
            onClick={() => exportData('csv')}
          >
            Export CSV
          </button>
          <button
            className="btn btn-outline"
            onClick={() => exportData('json')}
          >
            Export JSON
          </button>
          <button
            className="btn btn-outline"
            onClick={() => fetchAssessmentGrades(true)}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Assessment Grades Table */}
      <div className="assessment-grades__table">
        {loading && assessmentGrades.length === 0 ? (
          <div className="loading">Loading assessment grades...</div>
        ) : assessmentGrades.length === 0 ? (
          <div className="no-data">No assessment grades found with current filters.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === assessmentGrades.length && assessmentGrades.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Cohort</th>
                <th>Assessment Type</th>
                <th>Date Graded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessmentGrades.map((grade, index) => (
                <tr key={grade.user_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(grade.user_id)}
                      onChange={(e) => handleUserSelection(grade.user_id, e.target.checked)}
                    />
                  </td>
                  <td>{grade.user_first_name} {grade.user_last_name}</td>
                  <td>{grade.user_email}</td>
                  <td>{grade.cohort}</td>
                  <td className="assessment-type">
                    <span className={`type-badge type-holistic`}>
                      holistic
                    </span>
                  </td>
                  <td>{new Date(grade.created_at?.value || grade.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => viewGrade(grade)}
                    >
                      View Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Load More Button */}
        {pagination.hasMore && (
          <div className="load-more">
            <button
              className="btn btn-outline"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Grade View Modal */}
      {showGradeModal && selectedGrade && (
        <GradeViewModal
          grade={selectedGrade}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedGrade(null);
          }}
          isEditingOverview={isEditingOverview}
          editingStrengths={editingStrengths}
          editingGrowthAreas={editingGrowthAreas}
          savingOverview={savingOverview}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveOverview={handleSaveOverview}
          setEditingStrengths={setEditingStrengths}
          setEditingGrowthAreas={setEditingGrowthAreas}
        />
      )}

      {/* Mass Email Modal */}
      {showEmailModal && (
        <MassEmailModal
          selectedUsers={Array.from(selectedUsers)}
          assessmentGrades={assessmentGrades.filter(grade => selectedUsers.has(grade.user_id))}
          authToken={authToken}
          onClose={() => setShowEmailModal(false)}
          onEmailSent={() => {
            setShowEmailModal(false);
            setSelectedUsers(new Set());
          }}
        />
      )}
      </div>
    </div>
  );
};

// Grade View Modal Component
const GradeViewModal = ({ 
  grade, 
  onClose,
  isEditingOverview,
  editingStrengths,
  editingGrowthAreas,
  savingOverview,
  onStartEditing,
  onCancelEditing,
  onSaveOverview,
  setEditingStrengths,
  setEditingGrowthAreas
}) => {
  const { token: authToken } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assessment types mapping from BigQuery to our display names
  const assessmentTypeMapping = {
    'quiz': 'self',
    'project': 'technical', 
    'problem_solution': 'business',
    'video': 'professional'
  };
  
  const assessmentTypes = ['technical', 'business', 'professional', 'self'];
  
  // Helper function to determine file language for syntax highlighting
  const getFileLanguage = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'html': 'html',
      'css': 'css',
      'py': 'python',
      'txt': 'text',
      'md': 'markdown'
    };
    return languageMap[ext] || 'text';
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user submissions (keep for overview)
        const submissionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/user-submissions/${grade.user_id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          setUserSubmissions(submissionsData.submissions || []);
        }
        
        // Fetch comprehensive analysis data
        const analysisResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/comprehensive-analysis/${grade.user_id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          setComprehensiveAnalysis(analysisData.analysis || []);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [grade.user_id, authToken]);
  
  const handleTabChange = (event, newValue) => {
    console.log('Tab clicked:', newValue, 'Type:', availableTabs[newValue]);
    setTabValue(newValue);
  };
  
  // Group comprehensive analysis by our assessment types
  const analysisByType = comprehensiveAnalysis.reduce((acc, analysis) => {
    const mappedType = assessmentTypeMapping[analysis.assessment_type] || analysis.assessment_type;
    if (!acc[mappedType]) {
      acc[mappedType] = [];
    }
    acc[mappedType].push(analysis);
    return acc;
  }, {});
  
  // Group submissions by assessment type (for overview)
  const submissionsByType = userSubmissions.reduce((acc, submission) => {
    const type = submission.assessment_type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(submission);
    return acc;
  }, {});
  
  // Create tabs: Overview + individual assessment types (show all types even if no data)
  const availableTabs = ['overview', ...assessmentTypes];
  
  // Get the current tab's data
  const currentTabType = availableTabs[tabValue] || 'overview';
  const currentAnalysis = analysisByType[currentTabType] || [];
  const currentSubmissions = submissionsByType[currentTabType] || [];
  
  console.log('Current tab:', currentTabType, 'Analysis:', currentAnalysis.length, 'Submissions:', currentSubmissions.length);
  
  // Function to render user submission content for individual tabs
  const renderUserSubmissionContent = (currentTabType) => {
    // Find the actual submission data for this assessment type
    const submission = userSubmissions.find(sub => {
      const mappedType = assessmentTypeMapping[sub.assessment_type] || sub.assessment_type;
      return mappedType === currentTabType;
    });
    
    if (!submission) {
      return (
        <div className="no-submission">
          <p>No submission found for {currentTabType} assessment.</p>
          <p>This student may not have completed this assessment type yet.</p>
        </div>
      );
    }
    
    const submissionData = submission.submission_data || {};
    const conversationData = submission.llm_conversation_data || {};
    
    if (currentTabType === 'technical') {
      return (
        <div className="user-submission-content">
          <div className="submission-display-content">
            {/* AI Conversation */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                💬 AI Conversation
              </div>
              <div className="submission-display-value submission-display-value--conversation">
                {submissionData.conversationText || 'No conversation provided'}
              </div>
            </div>
            
            {/* GitHub/Deployed Link */}
            {submissionData.githubUrl && (
              <div className="submission-display-item">
                <div className="submission-display-label">
                  🔗 GitHub/Deployed Link
                </div>
                <div className="submission-display-value">
                  <a 
                    href={submissionData.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="submission-display-link"
                  >
                    {submissionData.githubUrl}
                  </a>
                </div>
              </div>
            )}
            
            {/* Uploaded Files */}
            {submissionData.files && submissionData.files.length > 0 && (
              <div className="submission-display-item">
                <div className="submission-display-label">
                  📁 Uploaded Files ({submissionData.files.length} files)
                </div>
                <div className="submission-display-value">
                  <div className="file-contents-container">
                    {submissionData.files.map((file, index) => (
                      <div key={index} className="file-content-item">
                        <div className="file-header">
                          <div className="file-info">
                            <strong className="file-name">{file.name}</strong>
                            <span className="file-metadata">
                              {file.size && `${Math.round(file.size / 1024)}KB`}
                              {file.type && ` • ${file.type}`}
                              {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleString()}`}
                            </span>
                          </div>
                        </div>
                        
                        {file.content ? (
                          <div className="file-content-display">
                            <pre className={`file-content file-content--${getFileLanguage(file.name)}`}>
                              <code>{file.content}</code>
                            </pre>
                          </div>
                        ) : (
                          <div className="file-content-missing">
                            <p>⚠️ File content not available (uploaded before content capture was implemented)</p>
                            <p>Only metadata was stored: {file.name} ({Math.round(file.size / 1024)}KB)</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (currentTabType === 'business') {
      return (
        <div className="user-submission-content">
          <div className="submission-display-content">
            {/* Problem Statement */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                📄 Problem Statement
              </div>
              <div className="submission-display-value user-content">
                {submissionData.problemStatement || submissionData.deliverables?.problem_statement?.content || 'No problem statement provided'}
              </div>
            </div>
            
            {/* Proposed Solution */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                💡 Proposed Solution
              </div>
              <div className="submission-display-value user-content">
                {submissionData.proposedSolution || submissionData.deliverables?.proposed_solution?.content || 'No solution provided'}
              </div>
            </div>
            
            {/* Show conversation if available */}
            {conversationData.messages && conversationData.messages.length > 0 && (
              <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map((message, i) => (
                      <div key={i} className={`message-item ${message.role}`}>
                        <strong>{message.role === 'user' ? 'Student' : 'AI'}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (currentTabType === 'professional') {
      const loomUrl = submissionData.loomUrl || submissionData.deliverables?.video_url?.content || submissionData.deliverables?.video_url?.value;
      
      return (
        <div className="user-submission-content">
          <div className="submission-display-content">
            {/* Video Presentation */}
            <div className="submission-display-item">
              <div className="submission-display-label">
                🎥 Video Presentation
              </div>
              <div className="submission-display-value">
                {loomUrl ? (
                  <div className="video-submission-container">
                    <a 
                      href={loomUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="video-link-button"
                    >
                      🎬 Watch Video on Loom
                    </a>
                    
                    {/* Video Preview/Embed */}
                    <div className="video-preview-container">
                      {loomUrl.includes('loom.com') ? (
                        <iframe
                          src={loomUrl.replace('/share/', '/embed/')}
                          frameBorder="0"
                          webkitallowfullscreen
                          mozallowfullscreen
                          allowFullScreen
                          className="loom-embed"
                          title="Student Video Presentation"
                        />
                      ) : (
                        <div className="video-placeholder">
                          <p>🎥 Video Preview</p>
                          <p><em>Click the link above to watch the presentation</em></p>
                        </div>
                      )}
                    </div>
                    
                    <div className="video-url-display">
                      <strong>Video URL:</strong> {loomUrl}
                    </div>
                  </div>
                ) : (
                  <p>No video URL provided</p>
                )}
              </div>
            </div>
            
            {/* Show conversation if available */}
            {conversationData.messages && conversationData.messages.length > 0 && (
              <div className="submission-display-item">
                <div className="submission-display-label">
                  💬 AI Discussion ({conversationData.messages.length} messages)
                </div>
                <div className="submission-display-value">
                  <div className="conversation-messages">
                    {conversationData.messages.map((message, i) => (
                      <div key={i} className={`message-item ${message.role}`}>
                        <strong>{message.role === 'user' ? 'Student' : 'AI'}:</strong>
                        <div className="message-content">
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (currentTabType === 'self') {
      return (
        <div className="user-submission-content">
          <div className="self-assessment-responses">
            {/* Show actual responses */}
            {submissionData.responses && (
              <div className="responses-list">
                <h5>Student's Self-Assessment Responses</h5>
                {Object.entries(submissionData.responses).map(([qNum, response]) => (
                  <div key={qNum} className="self-response-item">
                    <div className="response-text">
                      <strong>Question {qNum}:</strong> {response}/5
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show timing information if available */}
            {submissionData.completionTime && (
              <div className="assessment-stats">
                <h5>Assessment Statistics</h5>
                <p><strong>Completion Time:</strong> {new Date(submissionData.completionTime).toLocaleTimeString()}</p>
                <p><strong>Start Time:</strong> {new Date(submissionData.startTime).toLocaleTimeString()}</p>
                {submissionData.questionTimes && (
                  <p><strong>Questions Completed:</strong> {Object.keys(submissionData.questionTimes).length}</p>
                )}
              </div>
            )}
            
            {/* Show section times if available */}
            {submissionData.sectionTimes && (
              <div className="section-times">
                <h5>Time Per Section</h5>
                {Object.entries(submissionData.sectionTimes).map(([section, time]) => (
                  <div key={section} className="section-time-item">
                    <strong>Section {section}:</strong> {Math.round(time)} seconds
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return <p>No submission content available for this assessment type</p>;
  };
  
  // Function to render feedback content
  const renderAnalysisFeedback = (analysis) => {
    if (!analysis) return <p>No feedback available for this assessment type</p>;
    
    return (
      <div className="analysis-feedback">
        <div className="feedback-score">
          <h4>Overall Score: {(analysis.overall_score * 100).toFixed(1)}%</h4>
        </div>
        
        <div className="detailed-feedback">
          <h4>Detailed Feedback</h4>
          <div className="grade-text">{analysis.feedback}</div>
        </div>
        
        {/* Show strengths and growth areas if available */}
        {(analysis.strengths_summary || analysis.growth_areas_summary) && (
          <div className="strengths-improvements">
            {analysis.strengths_summary && (
              <div className="strengths-section">
                <h4>Strengths</h4>
                <div className="grade-text">{analysis.strengths_summary}</div>
              </div>
            )}
            
            {analysis.growth_areas_summary && (
              <div className="improvements-section">
                <h4>Areas for Growth</h4>
                <div className="grade-text">{analysis.growth_areas_summary}</div>
              </div>
            )}
          </div>
        )}

        {/* Show type-specific insights */}
        {(() => {
          try {
            const typeSpecificData = JSON.parse(analysis.type_specific_data || '{}');
            
            if (typeSpecificData.key_insights) {
              return (
                <div className="key-insights">
                  <h4>Key Insights</h4>
                  <ul>
                    {typeSpecificData.key_insights.map((insight, i) => (
                      <li key={i}>{insight}</li>
                    ))}
                  </ul>
                </div>
              );
            }
            
            if (typeSpecificData.strengths && typeSpecificData.improvements) {
              return (
                <div className="strengths-improvements">
                  <div className="strengths-section">
                    <h4>Strengths</h4>
                    <ul>
                      {typeSpecificData.strengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="improvements-section">
                    <h4>Areas for Improvement</h4>
                    <ul>
                      {typeSpecificData.improvements.map((improvement, i) => (
                        <li key={i}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            }
            
            return null;
          } catch (parseError) {
            console.warn('Failed to parse type_specific_data for analysis:', parseError);
            return null;
          }
        })()}
      </div>
    );
  };
  
  // Render feedback content
  const renderFeedbackContent = (feedback) => {
    if (!feedback) return <p>No feedback available for this assessment type</p>;
    
    return (
      <div className="feedback-content">
        {feedback.strengths_summary && (
          <div className="strengths-section">
            <h4>Strengths</h4>
            <div className="grade-text">{feedback.strengths_summary}</div>
          </div>
        )}
        
        {feedback.growth_areas_summary && (
          <div className="growth-areas-section">
            <h4>Growth Areas</h4>
            <div className="grade-text">{feedback.growth_areas_summary}</div>
          </div>
        )}
        
        {feedback.technical_feedback && (
          <div className="specific-feedback">
            <h4>Technical Feedback</h4>
            <div className="grade-text">{feedback.technical_feedback}</div>
          </div>
        )}
        
        {feedback.business_feedback && (
          <div className="specific-feedback">
            <h4>Business Feedback</h4>
            <div className="grade-text">{feedback.business_feedback}</div>
          </div>
        )}
        
        {feedback.professional_feedback && (
          <div className="specific-feedback">
            <h4>Professional Feedback</h4>
            <div className="grade-text">{feedback.professional_feedback}</div>
          </div>
        )}
        
        {feedback.self_assessment_feedback && (
          <div className="specific-feedback">
            <h4>Self Assessment Feedback</h4>
            <div className="grade-text">{feedback.self_assessment_feedback}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content grade-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="student-header-info-compact">
            <h2>{grade.user_first_name} {grade.user_last_name}</h2>
            <span className="header-separator">•</span>
            <span><strong>Email:</strong> {grade.user_email}</span>
            <span className="header-separator">•</span>
            <span><strong>Cohort:</strong> {grade.cohort}</span>
            <span className="header-separator">•</span>
            <span><strong>Analysis:</strong> {new Date(grade.created_at?.value || grade.created_at).toLocaleDateString()}</span>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          
          <div className="grade-details">
            <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', maxWidth: 'none' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                aria-label="assessment tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ width: '100%', maxWidth: 'none' }}
              >
                {availableTabs.map((type, index) => (
                  <Tab 
                    key={type} 
                    label={type === 'overview' ? 'Overview' : type.charAt(0).toUpperCase() + type.slice(1)} 
                    id={`tab-${index}`}
                    aria-controls={`tabpanel-${index}`}
                  />
                ))}
              </Tabs>
            </Box>
            
            <div className="tab-content">
              {loading ? (
                <div className="loading">Loading assessment data...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : currentTabType === 'overview' ? (
                <div className="overview-content">
                  <div className="content-grid">
                    <div className="submissions-overview">
                      {/* Detailed Feedback Section */}
                      <div className="detailed-feedback-overview">
                        <h3>Detailed Feedback by Assessment</h3>
                        {comprehensiveAnalysis.length > 0 ? (
                          <div className="feedback-by-type">
                            {Object.entries(analysisByType).map(([type, analyses]) => {
                              const latestAnalysis = analyses[0]; // Get the most recent analysis for this type
                              return (
                                <div key={type} className="assessment-feedback-section">
                                  <h4>
                                    {type.charAt(0).toUpperCase() + type.slice(1)} Assessment
                                    {latestAnalysis && (
                                      <span className="feedback-score">
                                        <strong>Score: {(latestAnalysis.overall_score * 100).toFixed(1)}%</strong>
                                      </span>
                                    )}
                                  </h4>
                                  {latestAnalysis ? (
                                    <div className="feedback-content">
                                      <div className="detailed-feedback">
                                        <h5>Detailed Feedback</h5>
                                        <div className="grade-text">{latestAnalysis.feedback}</div>
                                      </div>
                                      {(() => {
                                        try {
                                          const typeSpecificData = JSON.parse(latestAnalysis.type_specific_data || '{}');
                                          if (typeSpecificData.key_insights) {
                                            return (
                                              <div className="key-insights">
                                                <h5>Key Insights</h5>
                                                <ul>
                                                  {typeSpecificData.key_insights.map((insight, i) => (
                                                    <li key={i}>{insight}</li>
                                                  ))}
                                                </ul>
                                              </div>
                                            );
                                          }
                                          return null;
                                        } catch (parseError) {
                                          console.warn('Failed to parse type_specific_data for', type, ':', parseError);
                                          return null;
                                        }
                                      })()}
                                    </div>
                                  ) : (
                                    <p>No detailed feedback available</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p>No detailed feedback available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="feedback-overview">
                      <div className="overview-header">
                        <h3>Overall Feedback</h3>
                        {!isEditingOverview && (
                          <button 
                            className="edit-feedback-btn"
                            onClick={() => onStartEditing(grade)}
                            title="Edit feedback"
                          >
                            ✏️ Edit
                          </button>
                        )}
                      </div>

                      {isEditingOverview ? (
                        <div className="editing-feedback">
                          <div className="editing-section">
                            <h4>Strengths Summary</h4>
                            <textarea
                              value={editingStrengths}
                              onChange={(e) => setEditingStrengths(e.target.value)}
                              className="feedback-textarea"
                              rows="4"
                              placeholder="Enter strengths summary..."
                            />
                          </div>

                          <div className="editing-section">
                            <h4>Growth Areas Summary</h4>
                            <textarea
                              value={editingGrowthAreas}
                              onChange={(e) => setEditingGrowthAreas(e.target.value)}
                              className="feedback-textarea"
                              rows="4"
                              placeholder="Enter growth areas summary..."
                            />
                          </div>

                          <div className="editing-actions">
                            <button 
                              className="save-btn"
                              onClick={() => onSaveOverview(grade.user_id)}
                              disabled={savingOverview}
                            >
                              {savingOverview ? 'Saving...' : '💾 Save'}
                            </button>
                            <button 
                              className="cancel-btn"
                              onClick={onCancelEditing}
                              disabled={savingOverview}
                            >
                              ❌ Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="readonly-feedback">
                          <div className="strengths-section">
                            <h4>Strengths Summary</h4>
                            <div className="grade-text">
                              {grade.strengths_summary || 'No strengths summary available'}
                            </div>
                          </div>

                          <div className="growth-areas-section">
                            <h4>Growth Areas Summary</h4>
                            <div className="grade-text">
                              {grade.growth_areas_summary || 'No growth areas summary available'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="assessment-content">
                  <div className="content-grid">
                    <div className="student-submission-content">
                      {renderUserSubmissionContent(currentTabType)}
                    </div>
                    
                    <div className="feedback-panel">
                      <h3>AI Analysis & Feedback</h3>
                      {currentAnalysis.length > 0 ? (
                        renderAnalysisFeedback(currentAnalysis[0])
                      ) : (
                        <div className="no-feedback">
                          <p>No specific feedback available for {currentTabType} assessment.</p>
                          <div className="fallback-feedback">
                            <h4>Overall Feedback</h4>
                            <div className="strengths-section">
                              <h5>Strengths</h5>
                              <div className="grade-text">{grade.strengths_summary || 'No strengths summary available'}</div>
                            </div>
                            <div className="growth-areas-section">
                              <h5>Growth Areas</h5>
                              <div className="grade-text">{grade.growth_areas_summary || 'No growth areas summary available'}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mass Email Modal Component
const MassEmailModal = ({ selectedUsers, assessmentGrades, authToken, onClose, onEmailSent }) => {
  const [emailSubject, setEmailSubject] = useState('Your L1 Assessment Feedback - Great Work, [Builder Name]!');
  const [emailTemplate, setEmailTemplate] = useState('pursuit_feedback');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);
  const [showPreviews, setShowPreviews] = useState(false);

  const handlePreviewEmails = async () => {
    try {
      setLoadingPreviews(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email-preview`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          subject: emailSubject,
          emailTemplate: emailTemplate,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate previews');
      }

      const result = await response.json();
      setPreviews(result.previews);
      setShowPreviews(true);
    } catch (err) {
      console.error('Error generating previews:', err);
      Swal.fire({
        icon: 'error',
        title: 'Preview Generation Failed',
        text: 'Failed to generate email previews. Please try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoadingPreviews(false);
    }
  };

  const handleSendEmails = async () => {
    try {
      setSending(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          subject: emailSubject,
          emailTemplate: emailTemplate,
          customMessage: customMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Emails Sent Successfully!',
        text: `Successfully processed ${result.results.length} emails`,
        confirmButtonColor: '#10b981',
        timer: 4000,
        timerProgressBar: true
      });
      onEmailSent();
    } catch (err) {
      console.error('Error sending emails:', err);
      Swal.fire({
        icon: 'error',
        title: 'Email Sending Failed',
        text: 'Failed to send emails. Please check your connection and try again.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendTestEmail = async () => {
    const { value: testEmail } = await Swal.fire({
      title: 'Send Test Email',
      text: 'Enter your email address for the test:',
      input: 'email',
      inputPlaceholder: 'your.email@example.com',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Send Test Email',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter an email address!'
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address!'
        }
      }
    });
    
    if (!testEmail) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/test-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientEmail: testEmail,
          testData: {
            subject: emailSubject,
            customMessage: customMessage
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Test Email Sent!',
        html: `✅ Test email sent successfully to <strong>${testEmail}</strong><br><small>Message ID: ${result.messageId}</small>`,
        confirmButtonColor: '#10b981',
        timer: 5000,
        timerProgressBar: true
      });
    } catch (err) {
      console.error('Error sending test email:', err);
      Swal.fire({
        icon: 'error',
        title: 'Test Email Failed',
        text: 'Failed to send test email. Check console for details.',
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="assessment-grades-email-modal-overlay" onClick={onClose}>
      <div className="assessment-grades-email-modal" onClick={(e) => e.stopPropagation()}>
        <div className="assessment-grades-email-modal__header">
          <h2 className="assessment-grades-email-modal__title">Send Mass Email</h2>
          <button className="assessment-grades-email-modal__close" onClick={onClose}>×</button>
        </div>
        
        <div className="assessment-grades-email-modal__body">
          <div className="assessment-grades-email-modal__form">
            <div className="assessment-grades-email-modal__field">
              <label htmlFor="recipients" className="assessment-grades-email-modal__label">Recipients ({selectedUsers.length} users):</label>
              <div className="assessment-grades-email-modal__recipients">
                {assessmentGrades.slice(0, 5).map(grade => (
                  <div key={grade.user_id} className="assessment-grades-email-modal__recipient">
                    {grade.user_first_name} {grade.user_last_name} ({grade.user_email})
                  </div>
                ))}
                {assessmentGrades.length > 5 && (
                  <div className="assessment-grades-email-modal__recipient assessment-grades-email-modal__recipient--more">... and {assessmentGrades.length - 5} more</div>
                )}
              </div>
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="subject" className="assessment-grades-email-modal__label">Subject:</label>
              <input
                type="text"
                id="subject"
                className="assessment-grades-email-modal__input"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="template" className="assessment-grades-email-modal__label">Email Template:</label>
              <select
                id="template"
                className="assessment-grades-email-modal__select"
                value={emailTemplate}
                onChange={(e) => setEmailTemplate(e.target.value)}
              >
                <option value="pursuit_feedback">Pursuit Assessment Feedback</option>
                <option value="detailed">Detailed Feedback</option>
                <option value="encouragement">Encouragement Focus</option>
              </select>
            </div>

            <div className="assessment-grades-email-modal__field">
              <label htmlFor="customMessage" className="assessment-grades-email-modal__label">Custom Message (optional):</label>
              <textarea
                id="customMessage"
                className="assessment-grades-email-modal__textarea"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message that will be included in all emails..."
                rows="4"
              />
            </div>

            <div className="assessment-grades-email-modal__preview-section">
              <div className="assessment-grades-email-modal__preview-actions">
                <button 
                  className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--outline assessment-grades-email-modal__btn--preview"
                  onClick={handlePreviewEmails}
                  disabled={loadingPreviews || selectedUsers.length === 0}
                >
                  {loadingPreviews ? 'Generating Previews...' : `Preview Emails (${Math.min(selectedUsers.length, 3)})`}
                </button>
                {showPreviews && (
                  <button 
                    className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--secondary"
                    onClick={() => setShowPreviews(false)}
                  >
                    Hide Previews
                  </button>
                )}
              </div>

              {showPreviews && previews.length > 0 && (
                <div className="assessment-grades-email-modal__previews">
                  <h4 className="assessment-grades-email-modal__previews-title">Email Previews ({previews.length} of {selectedUsers.length} selected):</h4>
                  {previews.map((preview, index) => (
                    <div key={preview.user_id} className="assessment-grades-email-modal__preview-item">
                      <div className="assessment-grades-email-modal__preview-header">
                        <h5 className="assessment-grades-email-modal__preview-name">📧 {preview.name} ({preview.email})</h5>
                        <span className={`assessment-grades-email-modal__preview-status assessment-grades-email-modal__preview-status--${preview.status}`}>
                          {preview.status === 'preview_ready' ? '✅ Ready' : 
                           preview.status === 'no_feedback' ? '⚠️ No Feedback' : 
                           '❌ Error'}
                        </span>
                      </div>
                      
                      {preview.status === 'preview_ready' && preview.preview && (
                        <div className="assessment-grades-email-modal__preview-content">
                          <div className="assessment-grades-email-modal__preview-subject">
                            <strong>Subject:</strong> {preview.preview.subject}
                          </div>
                          <div className="assessment-grades-email-modal__preview-body">
                            <div 
                              className="assessment-grades-email-modal__preview-html"
                              dangerouslySetInnerHTML={{ __html: preview.preview.html }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {preview.status === 'no_feedback' && (
                        <div className="assessment-grades-email-modal__preview-warning">
                          <p>⚠️ No assessment feedback found for this user. Email will be skipped.</p>
                        </div>
                      )}
                      
                      {preview.status === 'preview_error' && (
                        <div className="assessment-grades-email-modal__preview-error">
                          <p>❌ Error generating preview for this user.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="assessment-grades-email-modal__footer">
          <button 
            className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--outline assessment-grades-email-modal__btn--test" 
            onClick={handleSendTestEmail}
            disabled={sending || loadingPreviews}
          >
            📧 Send Test Email
          </button>
          <div className="assessment-grades-email-modal__footer-actions">
            <button className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--secondary" onClick={onClose} disabled={sending}>
              Cancel
            </button>
            <button 
              className="assessment-grades-email-modal__btn assessment-grades-email-modal__btn--success" 
              onClick={handleSendEmails}
              disabled={sending || !emailSubject || selectedUsers.length === 0}
            >
              {sending ? 'Sending...' : `Send to ${selectedUsers.length} Users`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentGrades;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import confetti from 'canvas-confetti';
import './PathfinderProjects.css';

function PathfinderProjects() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Launch celebration state
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchedProject, setLaunchedProject] = useState(null);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    stage: 'ideation',
    targetDate: format(new Date(), 'yyyy-MM-dd'),
    prdLink: '',
    notes: '',
    linkedJobId: null, // Link to job application
    launchChecklist: {
      app_deployed: false,
      demoed_to_class: false,
      lookbook_short_description: false,
      lookbook_long_description: false,
      lookbook_skills_tech: false,
      lookbook_screenshot: false,
      lookbook_video: false
    },
    deploymentUrl: '',
    demoDate: '',
    lookbookShortDesc: '',
    lookbookLongDesc: '',
    lookbookSkillsTech: [],
    lookbookScreenshotUrl: '',
    lookbookVideoUrl: ''
  });

  // Job search state
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [availableJobs, setAvailableJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  // Drag and drop state
  const [draggedProject, setDraggedProject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mouseDownPos, setMouseDownPos] = useState(null);
  const [mouseDownTime, setMouseDownTime] = useState(null);

  // Collapsed columns state
  const [collapsedColumns, setCollapsedColumns] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchAvailableJobs();
  }, [token]);

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showForm) {
        resetForm();
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showForm]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(''); // Clear any previous errors
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch projects:', response.status, errorData);
        setError(errorData.error || `Failed to fetch projects (${response.status})`);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(`Error loading projects: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Filter jobs based on search query
  useEffect(() => {
    if (!jobSearchQuery) {
      setFilteredJobs([]);
      setShowJobDropdown(false);
      return;
    }

    const query = jobSearchQuery.toLowerCase();
    const filtered = availableJobs.filter(job =>
      job.company_name.toLowerCase().includes(query) ||
      job.role_title.toLowerCase().includes(query)
    );
    setFilteredJobs(filtered);
    setShowJobDropdown(filtered.length > 0 && !selectedJob);
  }, [jobSearchQuery, availableJobs, selectedJob]);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setFormData(prev => ({ ...prev, linkedJobId: job.job_application_id }));
    setJobSearchQuery(`${job.role_title} at ${job.company_name}`);
    setShowJobDropdown(false);
  };

  const handleJobSearchClear = () => {
    setJobSearchQuery('');
    setSelectedJob(null);
    setFormData(prev => ({ ...prev, linkedJobId: null }));
    setShowJobDropdown(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (item) => {
    setFormData(prev => ({
      ...prev,
      launchChecklist: {
        ...prev.launchChecklist,
        [item]: !prev.launchChecklist[item]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${currentProject.project_id}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/projects`;

      const method = isEditing ? 'PUT' : 'POST';

      // Prepare the payload with all form data
      const payload = {
        projectName: formData.projectName,
        stage: formData.stage,
        targetDate: formData.targetDate,
        prdLink: formData.prdLink,
        notes: formData.notes,
        linkedJobId: formData.linkedJobId, // Add linked job
        // Launch checklist data
        launchChecklist: formData.launchChecklist,
        deploymentUrl: formData.deploymentUrl,
        demoDate: formData.demoDate,
        lookbookShortDesc: formData.lookbookShortDesc,
        lookbookLongDesc: formData.lookbookLongDesc,
        lookbookSkillsTech: formData.lookbookSkillsTech,
        lookbookScreenshotUrl: formData.lookbookScreenshotUrl,
        lookbookVideoUrl: formData.lookbookVideoUrl
      };

      console.log('Saving project with payload:', payload);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isEditing ? 'Project updated!' : 'Project added!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        resetForm();
        fetchProjects();
      } else {
        const data = await response.json();
        console.error('Server error:', data);
        setError(data.error || 'Failed to save project');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Error saving project');
    }
  };

  const handleEdit = (project) => {
    setCurrentProject(project);
    setIsEditing(true);
    
    // Format date to yyyy-MM-dd for the date input
    let formattedDate = project.target_date;
    if (formattedDate) {
      formattedDate = formattedDate.split('T')[0];
    }
    
    // Format demo date if exists
    let formattedDemoDate = project.demo_date || '';
    if (formattedDemoDate) {
      formattedDemoDate = formattedDemoDate.split('T')[0];
    }
    
    setFormData({
      id: project.project_id,
      projectName: project.project_name,
      stage: project.stage,
      targetDate: formattedDate,
      prdLink: project.prd_link || '',
      notes: project.notes || '',
      linkedJobId: project.linked_job_id || null,
      // Approval fields
      prdSubmitted: project.prd_submitted || false,
      prdSubmittedAt: project.prd_submitted_at || null,
      prdApproved: project.prd_approved || false,
      prdApprovedBy: project.prd_approved_by || null,
      prdApprovedAt: project.prd_approved_at || null,
      prdApprovalNotes: project.prd_approval_notes || null,
      approverFirstName: project.approver_first_name || null,
      approverLastName: project.approver_last_name || null,
      // Launch checklist fields
      launchChecklist: project.launch_checklist || {
        app_deployed: false,
        demoed_to_class: false,
        lookbook_short_description: false,
        lookbook_long_description: false,
        lookbook_skills_tech: false,
        lookbook_screenshot: false,
        lookbook_video: false
      },
      deploymentUrl: project.deployment_url || '',
      demoDate: formattedDemoDate,
      lookbookShortDesc: project.lookbook_short_desc || '',
      lookbookLongDesc: project.lookbook_long_desc || '',
      lookbookSkillsTech: project.lookbook_skills_tech || [],
      lookbookScreenshotUrl: project.lookbook_screenshot_url || '',
      lookbookVideoUrl: project.lookbook_video_url || ''
    });

    // If there's a linked job, set up the search field
    if (project.linked_job_id && project.linked_job_company && project.linked_job_role) {
      setJobSearchQuery(`${project.linked_job_role} at ${project.linked_job_company}`);
      setSelectedJob({
        job_application_id: project.linked_job_id,
        company_name: project.linked_job_company,
        role_title: project.linked_job_role
      });
    } else {
      setJobSearchQuery('');
      setSelectedJob(null);
    }
    
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Project deleted!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        fetchProjects();
      } else {
        setError('Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Error deleting project');
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: '',
      stage: 'ideation',
      targetDate: format(new Date(), 'yyyy-MM-dd'),
      prdLink: '',
      notes: '',
      linkedJobId: null,
      launchChecklist: {
        app_deployed: false,
        demoed_to_class: false,
        lookbook_short_description: false,
        lookbook_long_description: false,
        lookbook_skills_tech: false,
        lookbook_screenshot: false,
        lookbook_video: false
      },
      deploymentUrl: '',
      demoDate: '',
      lookbookShortDesc: '',
      lookbookLongDesc: '',
      lookbookSkillsTech: [],
      lookbookScreenshotUrl: '',
      lookbookVideoUrl: ''
    });
    setJobSearchQuery('');
    setSelectedJob(null);
    setShowForm(false);
    setIsEditing(false);
    setCurrentProject(null);
    setError('');
  };

  // Mouse and drag handlers
  const handleCardMouseDown = (e, project) => {
    if (e.target.closest('.pathfinder-projects__kanban-card-btn')) {
      return;
    }
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setMouseDownTime(Date.now());
  };

  const handleCardMouseUp = (e, project) => {
    if (!mouseDownPos || !mouseDownTime) {
      return;
    }

    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPos.x, 2) + 
      Math.pow(e.clientY - mouseDownPos.y, 2)
    );
    const duration = Date.now() - mouseDownTime;

    if (moveDistance < 10 && duration < 300) {
      handleEdit(project);
    }

    setMouseDownPos(null);
    setMouseDownTime(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e, project) => {
    setDraggedProject(project);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedProject || draggedProject.stage === newStage) {
      setDraggedProject(null);
      setIsDragging(false);
      return;
    }

    // Check if trying to move to development without PRD approval
    if (newStage === 'development') {
      // Require that a PRD exists and is approved
      if (!draggedProject.prd_link) {
        Swal.fire({
          icon: 'warning',
          title: 'PRD Required',
          text: 'You must add a PRD link before moving to development. Click on the project to add a PRD.',
          confirmButtonColor: '#4242ea'
        });
        setDraggedProject(null);
        setIsDragging(false);
        return;
      }
      
      if (!draggedProject.prd_approved) {
        Swal.fire({
          icon: 'warning',
          title: 'PRD Approval Required',
          text: 'This project has a PRD that must be approved before moving to development. Please submit it for approval first.',
          confirmButtonColor: '#4242ea'
        });
        setDraggedProject(null);
        setIsDragging(false);
        return;
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${draggedProject.project_id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ stage: newStage })
        }
      );

      if (response.ok) {
        // Check if project was moved to Launch stage
        if (newStage === 'launch') {
          // Trigger launch celebration!
          triggerLaunchCelebration();
          setLaunchedProject(draggedProject);
          setShowLaunchModal(true);
        } else {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Moved to ${getStageLabel(newStage)}!`,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        }
        fetchProjects();
      } else {
        const errorData = await response.json();
        if (errorData.requiresApproval) {
          Swal.fire({
            icon: 'warning',
            title: 'PRD Approval Required',
            text: errorData.error || 'PRD must be approved before moving to development',
            confirmButtonColor: '#4242ea'
          });
        } else if (errorData.requiresChecklist) {
          const itemsList = errorData.incompleteItems.join(', ');
          Swal.fire({
            icon: 'warning',
            title: 'Launch Checklist Incomplete',
            html: `<p>${errorData.error}</p><p><strong>Missing items:</strong> ${itemsList}</p><p>Click on the project to complete the checklist.</p>`,
            confirmButtonColor: '#4242ea'
          });
        } else {
          setError('Failed to update project stage');
        }
      }
    } catch (err) {
      console.error('Error updating project stage:', err);
      setError('Error updating project stage');
    } finally {
      setDraggedProject(null);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
    setIsDragging(false);
  };

  const toggleColumnCollapse = (stage) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  };

  const getStageLabel = (stage) => {
    const labels = {
      ideation: 'Ideation',
      planning: 'Planning & Design',
      development: 'Development',
      testing: 'Testing',
      launch: 'Launch'
    };
    return labels[stage] || stage;
  };

  const getInitialColor = (projectName) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    const charCode = projectName ? projectName.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  const getProjectInitial = (projectName) => {
    return projectName ? projectName.charAt(0).toUpperCase() : '?';
  };

  // Trigger launch celebration with confetti
  const triggerLaunchCelebration = () => {
    const count = 300;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        colors: ['#FFD700', '#FFA500', '#FF6347', '#4242ea', '#22c55e']
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  // Calculate days until target date
  const getDaysUntilTarget = (targetDate) => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Handle PRD submission for approval
  const handleSubmitPRD = async (projectId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${projectId}/submit-prd`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'PRD submitted for approval!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        fetchProjects();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: errorData.error || 'Failed to submit PRD for approval',
          confirmButtonColor: '#4242ea'
        });
      }
    } catch (err) {
      console.error('Error submitting PRD:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit PRD for approval',
        confirmButtonColor: '#4242ea'
      });
    }
  };

  const handleUnsubmitPRD = async (projectId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${projectId}/unsubmit-prd`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'PRD unsubmitted successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        await fetchProjects();
        resetForm(); // Close the modal
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Unsubmit Failed',
          text: errorData.error || 'Failed to unsubmit PRD',
          confirmButtonColor: '#4242ea'
        });
      }
    } catch (err) {
      console.error('Error unsubmitting PRD:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to unsubmit PRD',
        confirmButtonColor: '#4242ea'
      });
    }
  };

  if (isLoading) {
    return <div className="pathfinder-projects__loading">Loading projects...</div>;
  }

  return (
    <div className="pathfinder-projects">
      <div className="pathfinder-projects__container">
        <div className="pathfinder-projects__header">
          <button 
            className="pathfinder-projects__add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Project'}
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="pathfinder-projects__modal-overlay" onClick={resetForm}>
            <div className="pathfinder-projects__modal" onClick={(e) => e.stopPropagation()}>
              <div className="pathfinder-projects__modal-header">
                <h2>{isEditing ? 'Edit Project' : 'Add New Project'}</h2>
                <button type="button" className="pathfinder-projects__modal-close" onClick={resetForm}>
                  ×
                </button>
              </div>

              <div className="pathfinder-projects__modal-content">
                {/* Two-column layout when editing with feedback OR launch checklist */}
                <div className={`pathfinder-projects__modal-body ${
                  (isEditing && formData.prdApproved && formData.prdApprovalNotes) || 
                  (isEditing && (formData.stage === 'testing' || formData.stage === 'launch'))
                    ? 'pathfinder-projects__modal-body--two-column' 
                    : ''
                }`}>
                  {/* Left Panel - Form */}
                  <div className="pathfinder-projects__form-panel">
                    <form onSubmit={handleSubmit} className="pathfinder-projects__form">
                      {error && (
                        <div className="pathfinder-projects__error">
                          {error}
                        </div>
                      )}

                      <div className="pathfinder-projects__form-group">
                        <label>Project Name *</label>
                        <input
                          type="text"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleInputChange}
                          required
                          placeholder="e.g., Portfolio Website, E-commerce App"
                        />
                      </div>

                      <div className="pathfinder-projects__form-row">
                        <div className="pathfinder-projects__form-group">
                          <label>Stage *</label>
                          <select
                            name="stage"
                            value={formData.stage}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="ideation">Ideation</option>
                            <option value="planning">Planning & Design</option>
                            <option value="development">Development</option>
                            <option value="testing">Testing</option>
                            <option value="launch">Launch</option>
                          </select>
                        </div>
                        <div className="pathfinder-projects__form-group">
                          <label>Target Completion *</label>
                          <input
                            type="date"
                            name="targetDate"
                            value={formData.targetDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="pathfinder-projects__form-group">
                        <label>PRD Link (Google Docs, etc.)</label>
                        <input
                          type="url"
                          name="prdLink"
                          value={formData.prdLink}
                          onChange={handleInputChange}
                          placeholder="https://docs.google.com/document/d/..."
                        />
                      </div>

                      {/* Link to Job Application */}
                      <div className="pathfinder-projects__form-group">
                        <label>Link to Job Application (Optional)</label>
                        <div className="pathfinder-projects__job-search-container">
                          <div className="pathfinder-projects__job-search-input-wrapper">
                            <input
                              type="text"
                              value={jobSearchQuery}
                              onChange={(e) => {
                                setJobSearchQuery(e.target.value);
                                if (selectedJob && e.target.value !== `${selectedJob.role_title} at ${selectedJob.company_name}`) {
                                  setSelectedJob(null);
                                  setFormData(prev => ({ ...prev, linkedJobId: null }));
                                }
                              }}
                              onFocus={() => {
                                if (!selectedJob && jobSearchQuery) {
                                  setShowJobDropdown(true);
                                }
                              }}
                              placeholder="Search for a job application..."
                              className="pathfinder-projects__job-search-input"
                            />
                            {selectedJob && (
                              <button
                                type="button"
                                onClick={handleJobSearchClear}
                                className="pathfinder-projects__job-clear-btn"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {showJobDropdown && filteredJobs.length > 0 && (
                            <div className="pathfinder-projects__job-dropdown">
                              {filteredJobs.map((job) => (
                                <div
                                  key={job.job_application_id}
                                  className="pathfinder-projects__job-option"
                                  onClick={() => handleJobSelect(job)}
                                >
                                  <div className="pathfinder-projects__job-option-company">
                                    {job.company_name}
                                  </div>
                                  <div className="pathfinder-projects__job-option-role">
                                    {job.role_title}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pathfinder-projects__form-group">
                        <label>Notes</label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Add any notes about the project..."
                        />
                      </div>

                      {/* PRD Approval Status (if no feedback, show inline) */}
                      {isEditing && formData.prdLink && !formData.prdApprovalNotes && (
                        <div className="pathfinder-projects__approval-section">
                          <h3 className="pathfinder-projects__approval-section-title">PRD Approval Status</h3>
                          {formData.prdApproved ? (
                            <div className="pathfinder-projects__approval-status pathfinder-projects__approval-status--approved">
                              <span className="pathfinder-projects__approval-icon">✓</span>
                              <div className="pathfinder-projects__approval-details">
                                <div className="pathfinder-projects__approval-text">
                                  <strong>Approved</strong>
                                  {formData.approverFirstName && (
                                    <span> by {formData.approverFirstName} {formData.approverLastName}</span>
                                  )}
                                </div>
                                {formData.prdApprovedAt && (
                                  <div className="pathfinder-projects__approval-date">
                                    {new Date(formData.prdApprovedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : formData.prdSubmitted ? (
                            <div className="pathfinder-projects__approval-status pathfinder-projects__approval-status--pending">
                              <span className="pathfinder-projects__approval-icon">⏳</span>
                              <div className="pathfinder-projects__approval-details">
                                <div className="pathfinder-projects__approval-text">
                                  <strong>Pending Approval</strong>
                                </div>
                                {formData.prdSubmittedAt && (
                                  <div className="pathfinder-projects__approval-date">
                                    Submitted {new Date(formData.prdSubmittedAt).toLocaleDateString()}
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className="pathfinder-projects__unsubmit-btn"
                                  onClick={() => handleUnsubmitPRD(formData.id)}
                                >
                                  Unsubmit PRD
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pathfinder-projects__approval-status pathfinder-projects__approval-status--not-submitted">
                              <span className="pathfinder-projects__approval-icon">📋</span>
                              <div className="pathfinder-projects__approval-text">
                                Not yet submitted for approval
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pathfinder-projects__form-actions">
                        <button type="submit" className="pathfinder-projects__submit-btn">
                          {isEditing ? 'Update Project' : 'Add Project'}
                        </button>
                        <button 
                          type="button" 
                          className="pathfinder-projects__cancel-btn"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Panel - Feedback (only when approved with notes) */}
                  {isEditing && formData.prdApproved && formData.prdApprovalNotes && (
                    <div className="pathfinder-projects__feedback-sidebar">
                      <div className="pathfinder-projects__feedback-sidebar-header">
                        <h3>PRD Approval</h3>
                      </div>
                      <div className="pathfinder-projects__feedback-sidebar-content">
                        <div className="pathfinder-projects__approval-status pathfinder-projects__approval-status--approved">
                          <span className="pathfinder-projects__approval-icon">✓</span>
                          <div className="pathfinder-projects__approval-details">
                            <div className="pathfinder-projects__approval-text">
                              <strong>Approved</strong>
                              {formData.approverFirstName && (
                                <span> by {formData.approverFirstName} {formData.approverLastName}</span>
                              )}
                            </div>
                            {formData.prdApprovedAt && (
                              <div className="pathfinder-projects__approval-date">
                                {new Date(formData.prdApprovedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="pathfinder-projects__feedback-content">
                          <div className="pathfinder-projects__approval-feedback-label">
                            💬 Feedback from Reviewer:
                          </div>
                          <div className="pathfinder-projects__approval-feedback-text">
                            {formData.prdApprovalNotes}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Panel - Launch Checklist */}
                  {isEditing && (formData.stage === 'testing' || formData.stage === 'launch') && !formData.prdApprovalNotes && (
                    <div className="pathfinder-projects__feedback-sidebar">
                      <div className="pathfinder-projects__feedback-sidebar-header">
                        <h3>Launch Checklist</h3>
                        <p className="pathfinder-projects__checklist-desc">
                          Complete all items before moving to Launch
                        </p>
                      </div>
                      
                      <div className="pathfinder-projects__feedback-sidebar-content">
                        {/* Main Checklist Items */}
                        <div className="pathfinder-projects__checklist-items">
                          {/* 1. App Deployed */}
                          <div className="pathfinder-projects__checklist-item">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.deploymentUrl}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                App Deployed
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <input
                                type="url"
                                name="deploymentUrl"
                                value={formData.deploymentUrl}
                                onChange={handleInputChange}
                                placeholder="Deployment URL (e.g., https://myapp.netlify.app)"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* 2. Demoed to Class */}
                          <div className="pathfinder-projects__checklist-item">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.demoDate}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Demoed to Class
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <input
                                type="date"
                                name="demoDate"
                                value={formData.demoDate}
                                onChange={handleInputChange}
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* Lookbook Preparation Header */}
                          <div className="pathfinder-projects__checklist-group-header">
                            Lookbook Preparation:
                          </div>

                          {/* 3. Short Description */}
                          <div className="pathfinder-projects__checklist-item pathfinder-projects__checklist-item--nested">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.lookbookShortDesc && formData.lookbookShortDesc.trim().length > 0}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Short Description
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <textarea
                                name="lookbookShortDesc"
                                value={formData.lookbookShortDesc}
                                onChange={handleInputChange}
                                placeholder="1-2 sentences describing your project"
                                rows="2"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* 4. Long Description */}
                          <div className="pathfinder-projects__checklist-item pathfinder-projects__checklist-item--nested">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.lookbookLongDesc && formData.lookbookLongDesc.trim().length > 0}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Long Description
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <textarea
                                name="lookbookLongDesc"
                                value={formData.lookbookLongDesc}
                                onChange={handleInputChange}
                                placeholder="Detailed project overview (features, purpose, impact)"
                                rows="4"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* 5. Skills & Tech */}
                          <div className="pathfinder-projects__checklist-item pathfinder-projects__checklist-item--nested">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={formData.lookbookSkillsTech && formData.lookbookSkillsTech.length > 0}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Skills & Technologies
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <input
                                type="text"
                                name="lookbookSkillsTech"
                                value={formData.lookbookSkillsTech.join(', ')}
                                onChange={(e) => setFormData(prev => ({ 
                                  ...prev, 
                                  lookbookSkillsTech: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                }))}
                                placeholder="React, Node.js, PostgreSQL, AWS (comma-separated)"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* 6. Screenshot */}
                          <div className="pathfinder-projects__checklist-item pathfinder-projects__checklist-item--nested">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.lookbookScreenshotUrl}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Screenshot Uploaded
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <input
                                type="url"
                                name="lookbookScreenshotUrl"
                                value={formData.lookbookScreenshotUrl}
                                onChange={handleInputChange}
                                placeholder="Screenshot URL"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>

                          {/* 7. Video */}
                          <div className="pathfinder-projects__checklist-item pathfinder-projects__checklist-item--nested">
                            <label className="pathfinder-projects__checkbox-label">
                              <input
                                type="checkbox"
                                checked={!!formData.lookbookVideoUrl}
                                readOnly
                                style={{ cursor: 'not-allowed' }}
                              />
                              <span className="pathfinder-projects__checkbox-text">
                                Video Demo Uploaded
                              </span>
                            </label>
                            <div className="pathfinder-projects__checklist-detail">
                              <input
                                type="url"
                                name="lookbookVideoUrl"
                                value={formData.lookbookVideoUrl}
                                onChange={handleInputChange}
                                placeholder="Video URL (YouTube, Loom, etc.)"
                                className="pathfinder-projects__checklist-input"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Completion Status */}
                        <div className="pathfinder-projects__checklist-progress">
                          {[
                            !!formData.deploymentUrl,
                            !!formData.demoDate,
                            !!formData.lookbookShortDesc && formData.lookbookShortDesc.trim().length > 0,
                            !!formData.lookbookLongDesc && formData.lookbookLongDesc.trim().length > 0,
                            formData.lookbookSkillsTech && formData.lookbookSkillsTech.length > 0,
                            !!formData.lookbookScreenshotUrl,
                            !!formData.lookbookVideoUrl
                          ].filter(Boolean).length} of 7 items completed
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="pathfinder-projects__kanban">
          {projects.length === 0 ? (
            <div className="pathfinder-projects__empty">
              <p>No projects yet. Click "+ Add Project" to start tracking your builds!</p>
            </div>
          ) : (
            <div className="pathfinder-projects__kanban-board">
              {['ideation', 'planning', 'development', 'testing', 'launch'].map(stage => {
                const stageProjects = projects.filter(proj => proj.stage === stage);
                
                return (
                  <div 
                    key={stage} 
                    className={`pathfinder-projects__kanban-column ${collapsedColumns[stage] ? 'pathfinder-projects__kanban-column--collapsed' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    <div className="pathfinder-projects__kanban-header">
                      <h3>{getStageLabel(stage)}</h3>
                      <div className="pathfinder-projects__kanban-header-right">
                        <span className="pathfinder-projects__kanban-count">{stageProjects.length}</span>
                        <button
                          className="pathfinder-projects__kanban-collapse-btn"
                          onClick={() => toggleColumnCollapse(stage)}
                          title={collapsedColumns[stage] ? "Expand column" : "Collapse column"}
                        >
                          {collapsedColumns[stage] ? '→' : '←'}
                        </button>
                      </div>
                    </div>
                    {!collapsedColumns[stage] && (
                      <div className="pathfinder-projects__kanban-cards">
                      {stageProjects.map(project => {
                        const daysUntil = getDaysUntilTarget(project.target_date);
                        const isOverdue = daysUntil < 0;
                        const isDueSoon = daysUntil >= 0 && daysUntil <= 7;

                        return (
                          <div 
                            key={project.project_id} 
                            className={`pathfinder-projects__kanban-card ${draggedProject?.project_id === project.project_id ? 'pathfinder-projects__kanban-card--dragging' : ''}`}
                            draggable
                            onMouseDown={(e) => handleCardMouseDown(e, project)}
                            onMouseUp={(e) => handleCardMouseUp(e, project)}
                            onDragStart={(e) => handleDragStart(e, project)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="pathfinder-projects__kanban-card-actions">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(project.project_id);
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                draggable={false}
                                className="pathfinder-projects__kanban-card-btn pathfinder-projects__kanban-card-btn--delete"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                            
                            <div className="pathfinder-projects__kanban-card-content">
                              <div className="pathfinder-projects__kanban-card-header">
                                <div className="pathfinder-projects__project-initial" style={{
                                  backgroundColor: 'white',
                                  border: project.stage === 'launch' ? '2px solid #FFD700' : '1px solid #d0d0d0',
                                  fontSize: project.stage === 'launch' ? '1.25rem' : '0.875rem'
                                }}>
                                  {project.stage === 'launch' ? '🤖' : getProjectInitial(project.project_name)}
                                </div>
                                <h4>{project.project_name}</h4>
                              </div>
                              
                              <div className="pathfinder-projects__kanban-card-meta">
                                <div className="pathfinder-projects__target-date">
                                  <span className="pathfinder-projects__meta-label">Target:</span>
                                  <span className="pathfinder-projects__meta-value">
                                    {new Date(project.target_date).toLocaleDateString()}
                                  </span>
                                  {isOverdue && (
                                    <span className="pathfinder-projects__overdue-badge">
                                      Overdue
                                    </span>
                                  )}
                                  {isDueSoon && !isOverdue && (
                                    <span className="pathfinder-projects__due-soon-badge">
                                      Due Soon
                                    </span>
                                  )}
                                </div>
                                
                                {/* Linked Job */}
                                {project.linked_job_id && project.linked_job_company && (
                                  <div className="pathfinder-projects__linked-job">
                                    <span className="pathfinder-projects__meta-label">For Job:</span>
                                    <a 
                                      href={`/pathfinder/applications?job=${project.linked_job_id}`}
                                      className="pathfinder-projects__job-link"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {project.linked_job_company} - {project.linked_job_role}
                                    </a>
                                  </div>
                                )}
                                
                                {/* Launch Checklist Progress - Only show in Testing stage */}
                                {project.stage === 'testing' && (
                                  <div className="pathfinder-projects__checklist-progress-card">
                                    <span className="pathfinder-projects__meta-label">Launch Checklist:</span>
                                    <span className="pathfinder-projects__meta-value">
                                      {(() => {
                                        const checklist = typeof project.launch_checklist === 'string' 
                                          ? JSON.parse(project.launch_checklist) 
                                          : project.launch_checklist;
                                        const count = checklist ? Object.values(checklist).filter(Boolean).length : 0;
                                        return count;
                                      })()} of 7 completed
                                    </span>
                                  </div>
                                )}
                                
                                {project.prd_link && (
                                  <div className="pathfinder-projects__prd-link">
                                    <a 
                                      href={project.prd_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="pathfinder-projects__link"
                                    >
                                      View PRD
                                    </a>
                                    
                                    {/* PRD Approval Status - Inline with View PRD */}
                                    {project.prd_approved && project.approver_first_name ? (
                                      <div className="pathfinder-projects__prd-status pathfinder-projects__prd-status--approved">
                                        <span className="pathfinder-projects__status-icon">✓</span>
                                        <span className="pathfinder-projects__status-text">
                                          Approved by {project.approver_first_name} {project.approver_last_name.charAt(0)}.
                                        </span>
                                      </div>
                                    ) : project.prd_submitted ? (
                                      <div className="pathfinder-projects__prd-status pathfinder-projects__prd-status--pending">
                                        <span className="pathfinder-projects__status-icon">○</span>
                                        <span className="pathfinder-projects__status-text">
                                          Pending Approval
                                        </span>
                                      </div>
                                    ) : (
                                      <button
                                        className="pathfinder-projects__prd-status pathfinder-projects__submit-prd-btn"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSubmitPRD(project.project_id);
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        draggable={false}
                                        title="Submit PRD for approval"
                                      >
                                        <span className="pathfinder-projects__status-icon">→</span>
                                        <span className="pathfinder-projects__status-text">
                                          Submit for Approval
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                )}
                                
                                {/* No PRD indicator for Planning stage */}
                                {!project.prd_link && project.stage === 'planning' && (
                                  <div className="pathfinder-projects__prd-link">
                                    <div className="pathfinder-projects__prd-status pathfinder-projects__prd-status--missing">
                                      <span className="pathfinder-projects__status-icon">✕</span>
                                      <span className="pathfinder-projects__status-text">
                                        No PRD yet
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Launch Celebration Modal */}
      {showLaunchModal && launchedProject && (
        <div className="pathfinder-projects__launch-modal-overlay" onClick={() => setShowLaunchModal(false)}>
          <div className="pathfinder-projects__launch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pathfinder-projects__launch-modal-content">
              <div className="pathfinder-projects__launch-icon">🚀</div>
              <h1 className="pathfinder-projects__launch-title">Project Launched!</h1>
              <h2 className="pathfinder-projects__launch-project-name">{launchedProject.project_name}</h2>
              
              <div className="pathfinder-projects__launch-message">
                <p>Congratulations on completing your build! 🎉</p>
                <p>Your hard work from ideation to launch is now live!</p>
              </div>

              <div className="pathfinder-projects__launch-stats">
                <div className="pathfinder-projects__launch-stat">
                  <span className="pathfinder-projects__launch-stat-icon">📅</span>
                  <span className="pathfinder-projects__launch-stat-label">Completed</span>
                  <span className="pathfinder-projects__launch-stat-value">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="pathfinder-projects__launch-stat">
                  <span className="pathfinder-projects__launch-stat-icon">🏅</span>
                  <span className="pathfinder-projects__launch-stat-label">Status</span>
                  <span className="pathfinder-projects__launch-stat-value">Live & Shipped!</span>
                </div>
              </div>

              <div className="pathfinder-projects__launch-actions">
                <button
                  className="pathfinder-projects__launch-close-btn"
                  onClick={() => setShowLaunchModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PathfinderProjects;


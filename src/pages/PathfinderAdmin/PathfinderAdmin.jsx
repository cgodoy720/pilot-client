import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import './PathfinderAdmin.css';

function PathfinderAdmin() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvedPRDs, setApprovedPRDs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsOverview, setProjectsOverview] = useState(null);
  const [cohortStats, setCohortStats] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [builderDetails, setBuilderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cohortFilter, setCohortFilter] = useState('');
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last week, etc.
  const [view, setView] = useState('overview'); // overview, builders, companies, prd-approvals, approved-archive, build-projects

  // Extract unique cohorts from builders data
  useEffect(() => {
    if (builders.length > 0) {
      const uniqueCohorts = [...new Set(builders.map(b => b.cohort).filter(Boolean))].sort();
      setAvailableCohorts(uniqueCohorts);
    }
  }, [builders]);

  useEffect(() => {
    if (user.role === 'staff' || user.role === 'admin') {
      fetchOverview();
      fetchBuilders();
      fetchCompanies();
      fetchPendingApprovals();
      fetchApprovedPRDs();
      fetchProjects();
      fetchProjectsOverview();
      fetchCohortStats();
    }
  }, [token, cohortFilter, weekOffset]);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      let url = `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/overview?weekOffset=${weekOffset}`;
      if (cohortFilter) {
        url += `&cohort=${encodeURIComponent(cohortFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOverview(data);
      } else {
        setError('Failed to fetch overview');
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Error loading overview');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate week date range for display
  const getWeekDateRange = (offset) => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday of current week
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + (offset * 7)); // Apply offset
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const options = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}`;
  };

  const fetchBuilders = async () => {
    try {
      const url = cohortFilter
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBuilders(data);
      }
    } catch (err) {
      console.error('Error fetching builders:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const url = cohortFilter
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/companies`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  const fetchBuilderDetails = async (builderId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/builders/${builderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBuilderDetails(data);
      }
    } catch (err) {
      console.error('Error fetching builder details:', err);
    }
  };

  const handleBuilderClick = (builder) => {
    setSelectedBuilder(builder);
    fetchBuilderDetails(builder.builder_id);
  };

  const handleExport = () => {
    const url = cohortFilter
      ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export?cohort=${encodeURIComponent(cohortFilter)}`
      : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export`;

    window.open(url, '_blank');
  };

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/pending-approvals`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingApprovals(data);
      } else {
        console.error('Failed to fetch pending approvals');
      }
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
    }
  };

  const fetchApprovedPRDs = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/approved-prds`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApprovedPRDs(data);
      } else {
        console.error('Failed to fetch approved PRDs');
      }
    } catch (err) {
      console.error('Error fetching approved PRDs:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const url = cohortFilter
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchProjectsOverview = async () => {
    try {
      const url = cohortFilter
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/overview?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/overview`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProjectsOverview(data);
      } else {
        console.error('Failed to fetch projects overview');
      }
    } catch (err) {
      console.error('Error fetching projects overview:', err);
    }
  };

  const fetchCohortStats = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/projects/by-cohort`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCohortStats(data);
      } else {
        console.error('Failed to fetch cohort stats');
      }
    } catch (err) {
      console.error('Error fetching cohort stats:', err);
    }
  };

  const handleApprovePRD = async (projectId, projectName) => {
    const { value: notes } = await Swal.fire({
      title: `Approve PRD for ${projectName}?`,
      html: `
        <div style="text-align: left; padding: 0 8px;">
          <p style="font-size: 15px; color: #666; margin-bottom: 16px; line-height: 1.5;">
            You are approving this project's PRD. The builder will be able to move the project to the development stage.
          </p>
          <div style="margin-bottom: 12px;">
            <label style="display: block; margin-bottom: 8px; color: #1a1a1a; font-weight: 500; font-size: 14px;">
              Approval Notes (optional)
            </label>
            <textarea 
              id="swal-notes" 
              placeholder="Enter any feedback or notes for the builder..."
              rows="4"
              style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; resize: vertical; line-height: 1.5;"
            ></textarea>
            <small style="color: #666; font-size: 13px; display: block; margin-top: 6px;">
              Any notes will be visible to the builder
            </small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve PRD',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#666',
      width: '500px',
      preConfirm: () => {
        const textarea = document.getElementById('swal-notes');
        return textarea ? textarea.value : '';
      }
    });

    if (notes !== undefined) { // User clicked Approve (notes can be empty string)
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pathfinder/projects/${projectId}/approve-prd`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ notes })
          }
        );

        if (response.ok) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'PRD approved!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          });
          fetchPendingApprovals(); // Refresh the pending list
          fetchApprovedPRDs(); // Refresh the approved list
        } else {
          const errorData = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Approval Failed',
            text: errorData.error || 'Failed to approve PRD',
            confirmButtonColor: '#4242ea'
          });
        }
      } catch (err) {
        console.error('Error approving PRD:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to approve PRD',
          confirmButtonColor: '#4242ea'
        });
      }
    }
  };

  if (user.role !== 'staff' && user.role !== 'admin') {
    return (
      <div className="pathfinder-admin">
        <div className="pathfinder-admin__access-denied">
          <h2>Access Denied</h2>
          <p>You must be staff or admin to view this dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pathfinder-admin">
        <div className="pathfinder-admin__loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="pathfinder-admin">
      <div className="pathfinder-admin__container">
        <div className="pathfinder-admin__header">
          <h1 className="pathfinder-admin__title">Pathfinder Admin Dashboard</h1>
          <button 
            className="pathfinder-admin__export-btn"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>

        {error && (
          <div className="pathfinder-admin__message pathfinder-admin__message--error">
            {error}
          </div>
        )}

        {/* Tabs and Filter Row */}
        <div className="pathfinder-admin__tabs-row">
          {/* View Tabs */}
          <div className="pathfinder-admin__tabs">
            <button
              className={`pathfinder-admin__tab ${view === 'overview' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('overview')}
            >
              Overview
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'builders' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('builders')}
            >
              Builders
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'companies' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('companies')}
            >
              Companies
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'build-projects' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('build-projects')}
            >
              Build Projects
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'prd-approvals' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('prd-approvals')}
            >
              PRD Approvals
              {pendingApprovals.length > 0 && (
                <span className="pathfinder-admin__tab-badge">{pendingApprovals.length}</span>
              )}
            </button>
            <button
              className={`pathfinder-admin__tab ${view === 'approved-archive' ? 'pathfinder-admin__tab--active' : ''}`}
              onClick={() => setView('approved-archive')}
            >
              Approved PRDs
            </button>
          </div>

          {/* Filter */}
          <div className="pathfinder-admin__filter-group">
            <label>Filter by Cohort:</label>
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              className="pathfinder-admin__filter-select"
            >
              <option value="">All Cohorts</option>
              {availableCohorts.map(cohort => (
                <option key={cohort} value={cohort}>{cohort}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Overview View */}
        {view === 'overview' && overview && (
          <div className="pathfinder-admin__overview">
            {/* This Week Stats */}
            <div className="pathfinder-admin__section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2>{weekOffset === 0 ? 'This Week' : `Week of ${getWeekDateRange(weekOffset)}`}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  title="Previous week"
                >
                  ←
                </button>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  disabled={weekOffset >= 0}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    background: weekOffset >= 0 ? '#f5f5f5' : '#ffffff',
                    cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer',
                    opacity: weekOffset >= 0 ? 0.5 : 1,
                    fontSize: '1rem'
                  }}
                  title="Next week"
                >
                  →
                </button>
                {weekOffset !== 0 && (
                  <button
                    onClick={() => setWeekOffset(0)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      border: '1px solid #4242ea',
                      borderRadius: '6px',
                      background: '#4242ea',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      marginLeft: '0.5rem'
                    }}
                  >
                    Back to This Week
                  </button>
                )}
              </div>
            </div>
            <div className="pathfinder-admin__stats-grid">
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_applications || 0}</div>
                <div className="pathfinder-admin__stat-label">Applications</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_interviews || 0}</div>
                <div className="pathfinder-admin__stat-label">Interviews</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_offers || 0}</div>
                <div className="pathfinder-admin__stat-label">Offers</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_networking || 0}</div>
                <div className="pathfinder-admin__stat-label">Hustles</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_active_builders || 0}</div>
                <div className="pathfinder-admin__stat-label">Active Builders</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.weekly_rejections || 0}</div>
                <div className="pathfinder-admin__stat-label">Rejections</div>
              </div>
            </div>

            {/* All Time Stats */}
            <div className="pathfinder-admin__section-header" style={{ marginTop: '2rem' }}>
              <h2>All Time</h2>
            </div>
            <div className="pathfinder-admin__stats-grid">
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.total_applications || 0}</div>
                <div className="pathfinder-admin__stat-label">Total Applications</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.total_interviews || 0}</div>
                <div className="pathfinder-admin__stat-label">Total Interviews</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.total_offers || 0}</div>
                <div className="pathfinder-admin__stat-label">Total Offers</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.total_networking || 0}</div>
                <div className="pathfinder-admin__stat-label">Total Hustles</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.active_builders || 0}</div>
                <div className="pathfinder-admin__stat-label">Active Builders</div>
              </div>
              <div className="pathfinder-admin__stat-card">
                <div className="pathfinder-admin__stat-value">{overview.total_rejections || 0}</div>
                <div className="pathfinder-admin__stat-label">Total Rejections</div>
              </div>
            </div>
          </div>
        )}

        {/* Builders View */}
        {view === 'builders' && (
          <div className="pathfinder-admin__builders">
            <div className="pathfinder-admin__table-container">
              {builders.length === 0 ? (
                <div className="pathfinder-admin__empty">
                  <p>No builders found</p>
                </div>
              ) : (
                <table className="pathfinder-admin__table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Cohort</th>
                      <th>Applications</th>
                      <th>Interviews</th>
                      <th>Offers</th>
                      <th>Networking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {builders.map(builder => (
                      <tr key={builder.builder_id}>
                        <td>{builder.first_name} {builder.last_name}</td>
                        <td>{builder.email}</td>
                        <td>{builder.cohort || '—'}</td>
                        <td>{builder.application_count || 0}</td>
                        <td>{builder.interview_count || 0}</td>
                        <td>{builder.offer_count || 0}</td>
                        <td>{builder.networking_count || 0}</td>
                        <td>
                          <button
                            className="pathfinder-admin__view-btn"
                            onClick={() => handleBuilderClick(builder)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Companies View */}
        {view === 'companies' && (
          <div className="pathfinder-admin__companies">
            <div className="pathfinder-admin__table-container">
              {companies.length === 0 ? (
                <div className="pathfinder-admin__empty">
                  <p>No companies found</p>
                </div>
              ) : (
                <table className="pathfinder-admin__table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Total Applications</th>
                      <th>Interviews</th>
                      <th>Offers</th>
                      <th>Rejections</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company, index) => (
                      <tr key={index}>
                        <td>{company.company_name}</td>
                        <td>{company.application_count || 0}</td>
                        <td>{company.interview_count || 0}</td>
                        <td>{company.offer_count || 0}</td>
                        <td>{company.rejected_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PRD Approvals View */}
        {view === 'prd-approvals' && (
          <div className="pathfinder-admin__prd-approvals">
            <div className="pathfinder-admin__section-header">
              <h2>Pending PRD Approvals</h2>
              <p>Review and approve builder project PRDs before they can move to development.</p>
            </div>
            <div className="pathfinder-admin__table-container">
              {pendingApprovals.length === 0 ? (
                <div className="pathfinder-admin__empty">
                  <p>🎉 No pending PRD approvals!</p>
                </div>
              ) : (
                <table className="pathfinder-admin__table">
                  <thead>
                    <tr>
                      <th>Builder</th>
                      <th>Project Name</th>
                      <th>Stage</th>
                      <th>Target Date</th>
                      <th>Submitted</th>
                      <th>PRD Link</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((project) => (
                      <tr key={project.project_id}>
                        <td>
                          <div className="pathfinder-admin__builder-info">
                            <strong>{project.first_name} {project.last_name}</strong>
                            <span className="pathfinder-admin__builder-email">{project.email}</span>
                          </div>
                        </td>
                        <td><strong>{project.project_name}</strong></td>
                        <td>
                          <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                            {project.stage}
                          </span>
                        </td>
                        <td>{new Date(project.target_date).toLocaleDateString()}</td>
                        <td>{new Date(project.prd_submitted_at).toLocaleDateString()}</td>
                        <td>
                          {project.prd_link ? (
                            <a
                              href={project.prd_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pathfinder-admin__prd-link"
                            >
                              📄 View PRD
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <button
                            className="pathfinder-admin__approve-btn"
                            onClick={() => handleApprovePRD(project.project_id, project.project_name)}
                          >
                            ✓ Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Approved PRDs Archive */}
        {view === 'approved-archive' && (
          <div className="pathfinder-admin__prd-approvals">
            <div className="pathfinder-admin__section-header">
              <h2>Approved PRDs Archive</h2>
              <p>View all previously approved project PRDs.</p>
            </div>
            <div className="pathfinder-admin__table-container">
              {approvedPRDs.length === 0 ? (
                <div className="pathfinder-admin__empty">
                  <p>No approved PRDs yet.</p>
                </div>
              ) : (
                <table className="pathfinder-admin__table">
                  <thead>
                    <tr>
                      <th>Builder</th>
                      <th>Project Name</th>
                      <th>Stage</th>
                      <th>Target Date</th>
                      <th>Approved By</th>
                      <th>Approved On</th>
                      <th>PRD Link</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedPRDs.map((project) => (
                      <tr key={project.project_id}>
                        <td>
                          <div className="pathfinder-admin__builder-info">
                            <strong>{project.builder_first_name} {project.builder_last_name}</strong>
                            <span className="pathfinder-admin__builder-email">{project.builder_email}</span>
                          </div>
                        </td>
                        <td><strong>{project.project_name}</strong></td>
                        <td>
                          <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                            {project.stage}
                          </span>
                        </td>
                        <td>{new Date(project.target_date).toLocaleDateString()}</td>
                        <td>
                          {project.approver_first_name && project.approver_last_name
                            ? `${project.approver_first_name} ${project.approver_last_name}`
                            : '—'
                          }
                        </td>
                        <td>{new Date(project.prd_approved_at).toLocaleDateString()}</td>
                        <td>
                          {project.prd_link ? (
                            <a
                              href={project.prd_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pathfinder-admin__prd-link"
                            >
                              📄 View PRD
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {project.prd_approval_notes ? (
                            <button
                              className="pathfinder-admin__view-notes-btn"
                              onClick={() => {
                                Swal.fire({
                                  title: 'Approval Notes',
                                  html: `
                                    <div style="text-align: left; padding: 8px;">
                                      <p style="font-size: 14px; color: #666; margin-bottom: 12px;">
                                        <strong>Project:</strong> ${project.project_name}
                                      </p>
                                      <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px;">
                                        ${project.prd_approval_notes}
                                      </div>
                                    </div>
                                  `,
                                  confirmButtonColor: '#4242ea',
                                  width: '600px'
                                });
                              }}
                            >
                              View Notes
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Build Projects View */}
        {view === 'build-projects' && (
          <div className="pathfinder-admin__build-projects">
            <div className="pathfinder-admin__section-header">
              <h2>Build Projects Tracker</h2>
              <p>Track builder projects individually and by cohort.</p>
            </div>

            {/* Projects Overview Stats */}
            {projectsOverview && (
              <div className="pathfinder-admin__stats-grid pathfinder-admin__stats-grid--compact">
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.total_projects || 0}</div>
                  <div className="pathfinder-admin__stat-label">Total Projects</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.builders_with_projects || 0}</div>
                  <div className="pathfinder-admin__stat-label">Builders with Projects</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.ideation_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Ideation</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.planning_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Planning</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.development_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Development</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.testing_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Testing</div>
                </div>
                <div className="pathfinder-admin__stat-card">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.launch_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Launched</div>
                </div>
                <div className="pathfinder-admin__stat-card pathfinder-admin__stat-card--warning">
                  <div className="pathfinder-admin__stat-value">{projectsOverview.overdue_count || 0}</div>
                  <div className="pathfinder-admin__stat-label">Overdue</div>
                </div>
              </div>
            )}

            {/* Cohort Statistics */}
            {!cohortFilter && cohortStats.length > 0 && (
              <div className="pathfinder-admin__cohort-section">
                <h3>Projects by Cohort</h3>
                <div className="pathfinder-admin__table-container">
                  <table className="pathfinder-admin__table">
                    <thead>
                      <tr>
                        <th>Cohort</th>
                        <th>Total Projects</th>
                        <th>Builders</th>
                        <th>Ideation</th>
                        <th>Planning</th>
                        <th>Development</th>
                        <th>Testing</th>
                        <th>Launched</th>
                        <th>Approved PRDs</th>
                        <th>Avg Days to Launch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortStats.map((cohort, index) => (
                        <tr key={index}>
                          <td><strong>{cohort.cohort}</strong></td>
                          <td>{cohort.total_projects || 0}</td>
                          <td>{cohort.builders_with_projects || 0}</td>
                          <td>{cohort.ideation_count || 0}</td>
                          <td>{cohort.planning_count || 0}</td>
                          <td>{cohort.development_count || 0}</td>
                          <td>{cohort.testing_count || 0}</td>
                          <td>{cohort.launch_count || 0}</td>
                          <td>{cohort.approved_count || 0}</td>
                          <td>
                            {cohort.avg_days_to_launch 
                              ? Math.round(cohort.avg_days_to_launch) + ' days'
                              : '—'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* All Projects Table */}
            <div className="pathfinder-admin__projects-section">
              <h3>All Projects {cohortFilter && `(${cohortFilter})`}</h3>
              <div className="pathfinder-admin__table-container">
                {projects.length === 0 ? (
                  <div className="pathfinder-admin__empty">
                    <p>No projects found</p>
                  </div>
                ) : (
                  <table className="pathfinder-admin__table">
                    <thead>
                      <tr>
                        <th>Builder</th>
                        <th>Cohort</th>
                        <th>Project Name</th>
                        <th>Stage</th>
                        <th>Target Date</th>
                        <th>PRD Status</th>
                        <th>Linked Job</th>
                        <th>Created</th>
                        <th>Links</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project) => (
                        <tr key={project.project_id}>
                          <td>
                            <div className="pathfinder-admin__builder-info">
                              <strong>{project.builder_first_name} {project.builder_last_name}</strong>
                              <span className="pathfinder-admin__builder-email">{project.builder_email}</span>
                            </div>
                          </td>
                          <td>{project.builder_cohort || '—'}</td>
                          <td><strong>{project.project_name}</strong></td>
                          <td>
                            <span className={`pathfinder-admin__stage-badge pathfinder-admin__stage-badge--${project.stage}`}>
                              {project.stage}
                            </span>
                          </td>
                          <td>
                            {new Date(project.target_date).toLocaleDateString()}
                            {new Date(project.target_date) < new Date() && project.stage !== 'launch' && (
                              <span className="pathfinder-admin__overdue-badge">⚠️ Overdue</span>
                            )}
                          </td>
                          <td>
                            {project.prd_approved ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--approved">
                                ✓ Approved
                              </span>
                            ) : project.prd_submitted ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--pending">
                                ⏳ Pending
                              </span>
                            ) : project.prd_link ? (
                              <span className="pathfinder-admin__prd-status pathfinder-admin__prd-status--draft">
                                📝 Draft
                              </span>
                            ) : (
                              <span className="pathfinder-admin__prd-status">—</span>
                            )}
                          </td>
                          <td>
                            {project.linked_job_company ? (
                              <div className="pathfinder-admin__linked-job">
                                <strong>{project.linked_job_company}</strong>
                                <span>{project.linked_job_role}</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{new Date(project.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="pathfinder-admin__project-links">
                              {project.prd_link && (
                                <a
                                  href={project.prd_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__project-link"
                                  title="View PRD"
                                >
                                  📄
                                </a>
                              )}
                              {project.deployment_url && (
                                <a
                                  href={project.deployment_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pathfinder-admin__project-link"
                                  title="View Deployment"
                                >
                                  🚀
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Builder Details Modal */}
        {selectedBuilder && builderDetails && (
          <div className="pathfinder-admin__modal-overlay" onClick={() => setSelectedBuilder(null)}>
            <div className="pathfinder-admin__modal" onClick={(e) => e.stopPropagation()}>
              <div className="pathfinder-admin__modal-header">
                <h2>{selectedBuilder.first_name} {selectedBuilder.last_name}'s Activity</h2>
                <button 
                  className="pathfinder-admin__modal-close"
                  onClick={() => setSelectedBuilder(null)}
                >
                  ×
                </button>
              </div>
              <div className="pathfinder-admin__modal-content">
                <div className="pathfinder-admin__modal-stats">
                  <div className="pathfinder-admin__modal-stat">
                    <strong>Applications:</strong> {builderDetails.applications?.length || 0}
                  </div>
                  <div className="pathfinder-admin__modal-stat">
                    <strong>Networking:</strong> {builderDetails.networking?.length || 0}
                  </div>
                </div>

                {builderDetails.applications && builderDetails.applications.length > 0 && (
                  <div className="pathfinder-admin__modal-section">
                    <h3>Recent Applications</h3>
                    <div className="pathfinder-admin__modal-list">
                      {builderDetails.applications.slice(0, 10).map(app => (
                        <div key={app.application_id} className="pathfinder-admin__modal-item">
                          <div className="pathfinder-admin__modal-item-title">
                            {app.company_name} - {app.role_title}
                          </div>
                          <div className="pathfinder-admin__modal-item-meta">
                            <span className={`pathfinder-admin__modal-badge pathfinder-admin__modal-badge--${app.stage}`}>
                              {app.stage}
                            </span>
                            <span>{new Date(app.date_applied).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {builderDetails.networking && builderDetails.networking.length > 0 && (
                  <div className="pathfinder-admin__modal-section">
                    <h3>Recent Networking</h3>
                    <div className="pathfinder-admin__modal-list">
                      {builderDetails.networking.slice(0, 10).map(activity => (
                        <div key={activity.networking_activity_id} className="pathfinder-admin__modal-item">
                          <div className="pathfinder-admin__modal-item-title">
                            {activity.type.replace(/_/g, ' ')}
                          </div>
                          <div className="pathfinder-admin__modal-item-meta">
                            <span>{activity.company || 'No company'}</span>
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PathfinderAdmin;


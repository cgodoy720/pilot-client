import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PathfinderDashboard.css';

function PathfinderDashboard() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState(null);
  const [builders, setBuilders] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [builderDetails, setBuilderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state
  const [cohortFilter, setCohortFilter] = useState('');
  const [view, setView] = useState('overview'); // overview, builders, companies
  const [companiesViewMode, setCompaniesViewMode] = useState('table'); // table or cards

  useEffect(() => {
    if (user.role === 'staff' || user.role === 'admin') {
      fetchOverview();
      fetchBuilders();
      fetchCompanies();
    }
  }, [token, cohortFilter]);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const url = cohortFilter
        ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/overview?cohort=${encodeURIComponent(cohortFilter)}`
        : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/overview`;

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

  const getCompanyInitial = (companyName) => {
    return companyName ? companyName.charAt(0).toUpperCase() : '?';
  };

  const getInitialColor = (companyName) => {
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    const charCode = companyName ? companyName.charCodeAt(0) : 0;
    return colors[charCode % colors.length];
  };

  const handleExport = () => {
    const url = cohortFilter
      ? `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export?cohort=${encodeURIComponent(cohortFilter)}`
      : `${import.meta.env.VITE_API_URL}/api/pathfinder/admin/export`;

    window.open(url, '_blank');
  };

  if (user.role !== 'staff' && user.role !== 'admin') {
    return (
      <div className="pathfinder-dashboard__access-denied">
        <h2>Access Denied</h2>
        <p>You must be staff or admin to view this dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="pathfinder-dashboard__loading">Loading dashboard...</div>;
  }

  return (
    <div className="pathfinder-dashboard">
      <div className="pathfinder-dashboard__container">
        <div className="pathfinder-dashboard__header">
          <h1 className="pathfinder-dashboard__title">Pathfinder Admin Dashboard</h1>
          <button 
            className="pathfinder-dashboard__export-btn"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>

        {error && (
          <div className="pathfinder-dashboard__message pathfinder-dashboard__message--error">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="pathfinder-dashboard__filters">
          <div className="pathfinder-dashboard__filter-group">
            <label>Cohort:</label>
            <input
              type="text"
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              placeholder="Filter by cohort..."
            />
          </div>
        </div>

        {/* View Tabs */}
        <div className="pathfinder-dashboard__tabs">
          <button
            className={view === 'overview' ? 'active' : ''}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button
            className={view === 'builders' ? 'active' : ''}
            onClick={() => setView('builders')}
          >
            Builders
          </button>
          <button
            className={view === 'companies' ? 'active' : ''}
            onClick={() => setView('companies')}
          >
            Companies
          </button>
        </div>

        {/* Overview View */}
        {view === 'overview' && overview && (
          <div className="pathfinder-dashboard__overview">
            <div className="pathfinder-dashboard__stats">
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">{overview.active_builders}</div>
                <div className="pathfinder-dashboard__stat-label">Active Builders</div>
              </div>
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">{overview.total_applications}</div>
                <div className="pathfinder-dashboard__stat-label">Total Applications</div>
              </div>
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">{overview.total_interviews}</div>
                <div className="pathfinder-dashboard__stat-label">Total Interviews</div>
              </div>
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">{overview.total_networking_activities}</div>
                <div className="pathfinder-dashboard__stat-label">Networking Activities</div>
              </div>
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">{overview.total_offers}</div>
                <div className="pathfinder-dashboard__stat-label">Offers</div>
              </div>
              <div className="pathfinder-dashboard__stat-card">
                <div className="pathfinder-dashboard__stat-value">
                  {overview.avg_applications_per_builder 
                    ? parseFloat(overview.avg_applications_per_builder).toFixed(1) 
                    : '0'}
                </div>
                <div className="pathfinder-dashboard__stat-label">Avg Apps per Builder</div>
              </div>
            </div>
          </div>
        )}

        {/* Builders View */}
        {view === 'builders' && (
          <div className="pathfinder-dashboard__builders">
            <div className="pathfinder-dashboard__builders-list">
              <table className="pathfinder-dashboard__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cohort</th>
                    <th>Applications</th>
                    <th>Interviews</th>
                    <th>Networking</th>
                    <th>Offers</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {builders.map(builder => (
                    <tr 
                      key={builder.builder_id}
                      onClick={() => handleBuilderClick(builder)}
                      className="pathfinder-dashboard__table-row"
                    >
                      <td>{builder.first_name} {builder.last_name}</td>
                      <td>{builder.cohort || 'N/A'}</td>
                      <td>{builder.application_count}</td>
                      <td>{builder.interview_count}</td>
                      <td>{builder.networking_count}</td>
                      <td>{builder.offer_count}</td>
                      <td>
                        {builder.last_application_date 
                          ? new Date(builder.last_application_date).toLocaleDateString()
                          : builder.last_networking_date
                          ? new Date(builder.last_networking_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Builder Details Modal */}
            {selectedBuilder && builderDetails && (
              <div className="pathfinder-dashboard__modal-overlay" onClick={() => setSelectedBuilder(null)}>
                <div className="pathfinder-dashboard__modal" onClick={(e) => e.stopPropagation()}>
                  <div className="pathfinder-dashboard__modal-header">
                    <h2>{selectedBuilder.first_name} {selectedBuilder.last_name}</h2>
                    <button onClick={() => setSelectedBuilder(null)}>×</button>
                  </div>
                  <div className="pathfinder-dashboard__modal-body">
                    <div className="pathfinder-dashboard__modal-stats">
                      <div>
                        <strong>Applications:</strong> {builderDetails.stats.total_applications}
                      </div>
                      <div>
                        <strong>Interviews:</strong> {builderDetails.stats.total_interviews}
                      </div>
                      <div>
                        <strong>Networking:</strong> {builderDetails.stats.total_networking}
                      </div>
                      <div>
                        <strong>Offers:</strong> {builderDetails.stats.offers}
                      </div>
                      <div>
                        <strong>Rejections:</strong> {builderDetails.stats.rejections}
                      </div>
                    </div>

                    <h3>Recent Applications</h3>
                    <div className="pathfinder-dashboard__modal-list">
                      {builderDetails.applications.slice(0, 5).map(app => (
                        <div key={app.job_application_id} className="pathfinder-dashboard__modal-item">
                          <strong>{app.company_name}</strong> - {app.role_title}
                          <br />
                          <span className="pathfinder-dashboard__modal-meta">
                            Stage: {app.stage} | Applied: {new Date(app.date_applied).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <h3>Recent Networking</h3>
                    <div className="pathfinder-dashboard__modal-list">
                      {builderDetails.networking.slice(0, 5).map(activity => (
                        <div key={activity.networking_activity_id} className="pathfinder-dashboard__modal-item">
                          <strong>{activity.type}</strong>
                          {activity.company && ` at ${activity.company}`}
                          <br />
                          <span className="pathfinder-dashboard__modal-meta">
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Companies View */}
        {view === 'companies' && (
          <div className="pathfinder-dashboard__companies">
            {/* View Mode Toggle */}
            <div className="pathfinder-dashboard__view-toggle">
              <button
                className={companiesViewMode === 'table' ? 'active' : ''}
                onClick={() => setCompaniesViewMode('table')}
                title="Table View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="3" y1="15" x2="21" y2="15"/>
                </svg>
                Table
              </button>
              <button
                className={companiesViewMode === 'cards' ? 'active' : ''}
                onClick={() => setCompaniesViewMode('cards')}
                title="Card View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
                Cards
              </button>
            </div>

            {/* Table View */}
            {companiesViewMode === 'table' && (
              <table className="pathfinder-dashboard__table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Applications</th>
                    <th>Unique Builders</th>
                    <th>Interviews</th>
                    <th>Offers</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <tr key={index}>
                      <td><strong>{company.company_name}</strong></td>
                      <td>{company.application_count}</td>
                      <td>{company.builder_count}</td>
                      <td>{company.interview_count}</td>
                      <td>{company.offer_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Card Grid View */}
            {companiesViewMode === 'cards' && (
              <div className="pathfinder-dashboard__cards-grid">
                {companies.map((company, index) => (
                  <div key={index} className="pathfinder-dashboard__company-card">
                    <div className="pathfinder-dashboard__company-card-header">
                      <div className="pathfinder-dashboard__company-card-title-wrapper">
                        {company.company_logo ? (
                          <img 
                            src={company.company_logo} 
                            alt={company.company_name}
                            className="pathfinder-dashboard__company-card-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="pathfinder-dashboard__company-card-logo-initial"
                          style={{ 
                            backgroundColor: getInitialColor(company.company_name),
                            display: company.company_logo ? 'none' : 'flex'
                          }}
                        >
                          {getCompanyInitial(company.company_name)}
                        </div>
                        <h3 className="pathfinder-dashboard__company-card-title">{company.company_name}</h3>
                      </div>
                    </div>
                    <div className="pathfinder-dashboard__company-card-stats">
                      <div className="pathfinder-dashboard__company-card-stat">
                        <div className="pathfinder-dashboard__company-card-stat-value">
                          {company.application_count}
                        </div>
                        <div className="pathfinder-dashboard__company-card-stat-label">Applications</div>
                      </div>
                      <div className="pathfinder-dashboard__company-card-stat">
                        <div className="pathfinder-dashboard__company-card-stat-value">
                          {company.builder_count}
                        </div>
                        <div className="pathfinder-dashboard__company-card-stat-label">Builders</div>
                      </div>
                      <div className="pathfinder-dashboard__company-card-stat">
                        <div className="pathfinder-dashboard__company-card-stat-value">
                          {company.interview_count}
                        </div>
                        <div className="pathfinder-dashboard__company-card-stat-label">Interviews</div>
                      </div>
                      <div className="pathfinder-dashboard__company-card-stat">
                        <div className="pathfinder-dashboard__company-card-stat-value">
                          {company.offer_count}
                        </div>
                        <div className="pathfinder-dashboard__company-card-stat-label">Offers</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PathfinderDashboard;



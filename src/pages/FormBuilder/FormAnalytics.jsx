import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormById, getFormAnalytics, getCompletionStats } from '../../services/formService';
import Swal from 'sweetalert2';
import './FormAnalytics.css';

const FormAnalytics = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [completionStats, setCompletionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [formId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [formData, analyticsData, statsData] = await Promise.all([
        getFormById(formId),
        getFormAnalytics(formId),
        getCompletionStats(formId)
      ]);
      setForm(formData);
      setAnalytics(analyticsData);
      setCompletionStats(statsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Swal.fire('Error', 'Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="form-analytics__loading">
        <div className="form-analytics__spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="form-analytics">
      <div className="form-analytics__header">
        <button 
          className="form-analytics__back-btn"
          onClick={() => navigate('/dashboard/forms')}
        >
          ← Back to Forms
        </button>
        <div className="form-analytics__header-content">
          <h1 className="form-analytics__title">{form?.title}</h1>
          <p className="form-analytics__subtitle">Form Analytics</p>
        </div>
      </div>

      <div className="form-analytics__stats-grid">
        <div className="form-analytics__stat-card">
          <div className="form-analytics__stat-icon">📊</div>
          <div className="form-analytics__stat-content">
            <div className="form-analytics__stat-value">
              {analytics?.total_submissions || 0}
            </div>
            <div className="form-analytics__stat-label">Total Submissions</div>
          </div>
        </div>

        <div className="form-analytics__stat-card">
          <div className="form-analytics__stat-icon">⏱️</div>
          <div className="form-analytics__stat-content">
            <div className="form-analytics__stat-value">
              {formatTime(analytics?.avg_completion_time)}
            </div>
            <div className="form-analytics__stat-label">Avg. Completion Time</div>
          </div>
        </div>

        <div className="form-analytics__stat-card">
          <div className="form-analytics__stat-icon">👥</div>
          <div className="form-analytics__stat-content">
            <div className="form-analytics__stat-value">
              {analytics?.unique_respondents || 0}
            </div>
            <div className="form-analytics__stat-label">Unique Respondents</div>
          </div>
        </div>

        <div className="form-analytics__stat-card">
          <div className="form-analytics__stat-icon">📅</div>
          <div className="form-analytics__stat-content">
            <div className="form-analytics__stat-value">
              {analytics?.first_submission 
                ? new Date(analytics.first_submission).toLocaleDateString()
                : 'N/A'}
            </div>
            <div className="form-analytics__stat-label">First Submission</div>
          </div>
        </div>
      </div>

      <div className="form-analytics__section">
        <h2 className="form-analytics__section-title">Submissions Over Time</h2>
        {completionStats.length === 0 ? (
          <div className="form-analytics__empty">
            <p>No submission data available yet</p>
          </div>
        ) : (
          <div className="form-analytics__chart">
            <table className="form-analytics__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Submissions</th>
                  <th>Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {completionStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{new Date(stat.date).toLocaleDateString()}</td>
                    <td>{stat.submissions}</td>
                    <td>{formatTime(stat.avg_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="form-analytics__section">
        <h2 className="form-analytics__section-title">Form Details</h2>
        <div className="form-analytics__details">
          <div className="form-analytics__detail-item">
            <strong>Status:</strong> 
            <span className={`form-analytics__status-badge form-analytics__status-badge--${form?.status}`}>
              {form?.status}
            </span>
          </div>
          <div className="form-analytics__detail-item">
            <strong>Questions:</strong> {form?.questions?.length || 0}
          </div>
          <div className="form-analytics__detail-item">
            <strong>Created:</strong> {new Date(form?.created_at).toLocaleDateString()}
          </div>
          {form?.expires_at && (
            <div className="form-analytics__detail-item">
              <strong>Expires:</strong> {new Date(form.expires_at).toLocaleDateString()}
            </div>
          )}
          {form?.submission_limit && (
            <div className="form-analytics__detail-item">
              <strong>Submission Limit:</strong> {form.submission_count} / {form.submission_limit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormAnalytics;


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllForms, deleteForm, duplicateForm, updateFormStatus } from '../../services/formService';
import Swal from 'sweetalert2';
import './FormBuilderDashboard.css';

const FormBuilderDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    loadForms();
  }, [filters]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await getAllForms(filters);
      setForms(data);
    } catch (error) {
      console.error('Error loading forms:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load forms'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = () => {
    navigate('/dashboard/forms/new');
  };

  const handleEditForm = (formId) => {
    navigate(`/dashboard/forms/${formId}/edit`);
  };

  const handleViewSubmissions = (formId) => {
    navigate(`/dashboard/forms/${formId}/submissions`);
  };

  const handleViewAnalytics = (formId) => {
    navigate(`/dashboard/forms/${formId}/analytics`);
  };

  const handleDuplicateForm = async (formId, formTitle) => {
    try {
      const result = await Swal.fire({
        title: 'Duplicate Form?',
        text: `This will create a copy of "${formTitle}"`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, duplicate it',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await duplicateForm(formId);
        Swal.fire('Success!', 'Form duplicated successfully', 'success');
        loadForms();
      }
    } catch (error) {
      console.error('Error duplicating form:', error);
      Swal.fire('Error', 'Failed to duplicate form', 'error');
    }
  };

  const handleDeleteForm = async (formId, formTitle) => {
    try {
      const result = await Swal.fire({
        title: 'Archive Form?',
        text: `This will archive "${formTitle}". Submissions will be preserved.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, archive it',
        confirmButtonColor: '#d33',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        await deleteForm(formId);
        Swal.fire('Archived!', 'Form has been archived', 'success');
        loadForms();
      }
    } catch (error) {
      console.error('Error archiving form:', error);
      Swal.fire('Error', 'Failed to archive form', 'error');
    }
  };

  const handleStatusChange = async (formId, currentStatus) => {
    const statuses = [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
      { value: 'archived', label: 'Archived' }
    ];

    const { value: newStatus } = await Swal.fire({
      title: 'Change Form Status',
      input: 'select',
      inputOptions: Object.fromEntries(statuses.map(s => [s.value, s.label])),
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Update',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status';
        }
      }
    });

    if (newStatus && newStatus !== currentStatus) {
      try {
        await updateFormStatus(formId, newStatus);
        Swal.fire('Success!', 'Form status updated', 'success');
        loadForms();
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  const copyFormUrl = (slug) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    Swal.fire({
      icon: 'success',
      title: 'URL Copied!',
      text: url,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'form-builder-dashboard__status-badge--active';
      case 'draft': return 'form-builder-dashboard__status-badge--draft';
      case 'closed': return 'form-builder-dashboard__status-badge--closed';
      case 'archived': return 'form-builder-dashboard__status-badge--archived';
      default: return '';
    }
  };

  return (
    <div className="form-builder-dashboard">
      <div className="form-builder-dashboard__header">
        <div className="form-builder-dashboard__header-content">
          <h1 className="form-builder-dashboard__title">Form Builder</h1>
          <p className="form-builder-dashboard__subtitle">
            Create and manage custom forms with unique shareable URLs
          </p>
        </div>
        <button 
          className="form-builder-dashboard__create-btn"
          onClick={handleCreateForm}
        >
          + Create New Form
        </button>
      </div>

      <div className="form-builder-dashboard__filters">
        <input
          type="text"
          className="form-builder-dashboard__search"
          placeholder="Search forms..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="form-builder-dashboard__filter-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <div className="form-builder-dashboard__loading">
          <div className="form-builder-dashboard__spinner"></div>
          <p>Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        <div className="form-builder-dashboard__empty">
          <div className="form-builder-dashboard__empty-icon">📋</div>
          <h2>No forms yet</h2>
          <p>Create your first form to get started</p>
          <button 
            className="form-builder-dashboard__create-btn"
            onClick={handleCreateForm}
          >
            Create New Form
          </button>
        </div>
      ) : (
        <div className="form-builder-dashboard__grid">
          {forms.map((form) => (
            <div key={form.form_id} className="form-builder-dashboard__card">
              <div className="form-builder-dashboard__card-header">
                <h3 className="form-builder-dashboard__card-title">{form.title}</h3>
                <span className={`form-builder-dashboard__status-badge ${getStatusBadgeClass(form.status)}`}>
                  {form.status}
                </span>
              </div>

              {form.description && (
                <p className="form-builder-dashboard__card-description">
                  {form.description.substring(0, 100)}
                  {form.description.length > 100 ? '...' : ''}
                </p>
              )}

              <div className="form-builder-dashboard__card-stats">
                <div className="form-builder-dashboard__stat">
                  <span className="form-builder-dashboard__stat-label">Submissions</span>
                  <span className="form-builder-dashboard__stat-value">{form.submission_count || 0}</span>
                </div>
                <div className="form-builder-dashboard__stat">
                  <span className="form-builder-dashboard__stat-label">Questions</span>
                  <span className="form-builder-dashboard__stat-value">{form.questions?.length || 0}</span>
                </div>
                <div className="form-builder-dashboard__stat">
                  <span className="form-builder-dashboard__stat-label">Created</span>
                  <span className="form-builder-dashboard__stat-value">
                    {new Date(form.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="form-builder-dashboard__card-url">
                <input
                  type="text"
                  readOnly
                  value={`/form/${form.slug}`}
                  className="form-builder-dashboard__url-input"
                  onClick={() => copyFormUrl(form.slug)}
                />
                <button
                  className="form-builder-dashboard__copy-btn"
                  onClick={() => copyFormUrl(form.slug)}
                  title="Copy URL"
                >
                  📋
                </button>
              </div>

              <div className="form-builder-dashboard__card-actions">
                <button
                  className="form-builder-dashboard__action-btn form-builder-dashboard__action-btn--primary"
                  onClick={() => handleEditForm(form.form_id)}
                >
                  Edit
                </button>
                <button
                  className="form-builder-dashboard__action-btn"
                  onClick={() => handleViewSubmissions(form.form_id)}
                >
                  Submissions
                </button>
                <button
                  className="form-builder-dashboard__action-btn"
                  onClick={() => handleViewAnalytics(form.form_id)}
                >
                  Analytics
                </button>
                <div className="form-builder-dashboard__dropdown">
                  <button className="form-builder-dashboard__action-btn">⋮</button>
                  <div className="form-builder-dashboard__dropdown-menu">
                    <button onClick={() => handleStatusChange(form.form_id, form.status)}>
                      Change Status
                    </button>
                    <button onClick={() => handleDuplicateForm(form.form_id, form.title)}>
                      Duplicate
                    </button>
                    <button 
                      onClick={() => handleDeleteForm(form.form_id, form.title)}
                      className="form-builder-dashboard__dropdown-delete"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormBuilderDashboard;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getFormById, 
  getFormSubmissions, 
  updateSubmission, 
  deleteSubmission,
  exportFormCSV,
  exportFormJSON 
} from '../../services/formService';
import Swal from 'sweetalert2';
import './FormSubmissions.css';

const FormSubmissions = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
    flagged: false
  });

  useEffect(() => {
    loadFormAndSubmissions();
  }, [formId, filters]);

  const loadFormAndSubmissions = async () => {
    try {
      setLoading(true);
      const [formData, submissionsData] = await Promise.all([
        getFormById(formId),
        getFormSubmissions(formId, filters)
      ]);
      setForm(formData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
      Swal.fire('Error', 'Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlag = async (submission) => {
    try {
      await updateSubmission(formId, submission.submission_id, {
        flagged: !submission.flagged
      });
      loadFormAndSubmissions();
    } catch (error) {
      console.error('Error updating submission:', error);
      Swal.fire('Error', 'Failed to update submission', 'error');
    }
  };

  const handleAddNote = async (submission) => {
    const { value: note } = await Swal.fire({
      title: 'Add Note',
      input: 'textarea',
      inputValue: submission.notes || '',
      inputPlaceholder: 'Enter your note...',
      showCancelButton: true,
      confirmButtonText: 'Save'
    });

    if (note !== undefined) {
      try {
        await updateSubmission(formId, submission.submission_id, { notes: note });
        loadFormAndSubmissions();
        Swal.fire('Success', 'Note saved', 'success');
      } catch (error) {
        console.error('Error saving note:', error);
        Swal.fire('Error', 'Failed to save note', 'error');
      }
    }
  };

  const handleDeleteSubmission = async (submission) => {
    const result = await Swal.fire({
      title: 'Delete Submission?',
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
      try {
        await deleteSubmission(formId, submission.submission_id);
        Swal.fire('Deleted!', 'Submission deleted', 'success');
        loadFormAndSubmissions();
        setSelectedSubmission(null);
      } catch (error) {
        console.error('Error deleting submission:', error);
        Swal.fire('Error', 'Failed to delete submission', 'error');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      await exportFormCSV(formId, filters);
      Swal.fire('Success', 'CSV exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Swal.fire('Error', 'Failed to export CSV', 'error');
    }
  };

  const handleExportJSON = async () => {
    try {
      await exportFormJSON(formId, filters);
      Swal.fire('Success', 'JSON exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting JSON:', error);
      Swal.fire('Error', 'Failed to export JSON', 'error');
    }
  };

  const renderResponseValue = (response) => {
    if (Array.isArray(response.answer)) {
      return response.answer.join(', ');
    }
    return response.answer?.toString() || 'N/A';
  };

  if (loading) {
    return (
      <div className="form-submissions__loading">
        <div className="form-submissions__spinner"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="form-submissions">
      <div className="form-submissions__header">
        <button 
          className="form-submissions__back-btn"
          onClick={() => navigate('/dashboard/forms')}
        >
          ← Back to Forms
        </button>
        <div className="form-submissions__header-content">
          <h1 className="form-submissions__title">{form?.title}</h1>
          <p className="form-submissions__subtitle">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="form-submissions__header-actions">
          <button 
            className="form-submissions__export-btn"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
          <button 
            className="form-submissions__export-btn"
            onClick={handleExportJSON}
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="form-submissions__filters">
        <input
          type="text"
          className="form-submissions__search"
          placeholder="Search submissions..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          type="date"
          className="form-submissions__date-filter"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          placeholder="Start date"
        />
        <input
          type="date"
          className="form-submissions__date-filter"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          placeholder="End date"
        />
        <label className="form-submissions__checkbox-filter">
          <input
            type="checkbox"
            checked={filters.flagged}
            onChange={(e) => setFilters({ ...filters, flagged: e.target.checked })}
          />
          <span>Flagged only</span>
        </label>
      </div>

      <div className="form-submissions__content">
        {submissions.length === 0 ? (
          <div className="form-submissions__empty">
            <div className="form-submissions__empty-icon">📝</div>
            <h2>No submissions yet</h2>
            <p>Submissions will appear here once people start filling out your form</p>
          </div>
        ) : (
          <div className="form-submissions__layout">
            <div className="form-submissions__list">
              {submissions.map((submission) => (
                <div
                  key={submission.submission_id}
                  className={`form-submissions__item ${selectedSubmission?.submission_id === submission.submission_id ? 'form-submissions__item--selected' : ''}`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="form-submissions__item-header">
                    <div className="form-submissions__item-date">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                      <span className="form-submissions__item-time">
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {submission.flagged && (
                      <span className="form-submissions__flag-badge">🚩</span>
                    )}
                  </div>
                  <div className="form-submissions__item-email">
                    {submission.respondent_email || 'Anonymous'}
                  </div>
                  {submission.notes && (
                    <div className="form-submissions__item-note">
                      📝 Has note
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedSubmission && (
              <div className="form-submissions__detail">
                <div className="form-submissions__detail-header">
                  <h2>Submission Details</h2>
                  <div className="form-submissions__detail-actions">
                    <button
                      className={`form-submissions__flag-btn ${selectedSubmission.flagged ? 'form-submissions__flag-btn--flagged' : ''}`}
                      onClick={() => handleToggleFlag(selectedSubmission)}
                      title={selectedSubmission.flagged ? 'Remove flag' : 'Flag submission'}
                    >
                      🚩
                    </button>
                    <button
                      className="form-submissions__note-btn"
                      onClick={() => handleAddNote(selectedSubmission)}
                      title="Add/edit note"
                    >
                      📝
                    </button>
                    <button
                      className="form-submissions__delete-btn"
                      onClick={() => handleDeleteSubmission(selectedSubmission)}
                      title="Delete submission"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="form-submissions__detail-meta">
                  <div className="form-submissions__meta-item">
                    <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </div>
                  <div className="form-submissions__meta-item">
                    <strong>Email:</strong> {selectedSubmission.respondent_email || 'Not provided'}
                  </div>
                  {selectedSubmission.completion_time_seconds && (
                    <div className="form-submissions__meta-item">
                      <strong>Completion Time:</strong> {Math.floor(selectedSubmission.completion_time_seconds / 60)}m {selectedSubmission.completion_time_seconds % 60}s
                    </div>
                  )}
                </div>

                {selectedSubmission.notes && (
                  <div className="form-submissions__notes">
                    <strong>Notes:</strong>
                    <p>{selectedSubmission.notes}</p>
                  </div>
                )}

                <div className="form-submissions__responses">
                  <h3>Responses</h3>
                  {Object.entries(selectedSubmission.responses || {}).map(([questionId, response]) => (
                    <div key={questionId} className="form-submissions__response">
                      <div className="form-submissions__response-question">
                        {response.question_text}
                      </div>
                      <div className="form-submissions__response-answer">
                        {renderResponseValue(response)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSubmissions;


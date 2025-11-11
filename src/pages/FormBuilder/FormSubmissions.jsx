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
import { Download, FileJson, Flag, MessageSquare, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

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
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4242ea] rounded-full animate-spin mb-4"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full mx-auto overflow-x-hidden box-border bg-[#f5f5f5] min-h-screen text-[#1a1a1a]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-16 py-6 shadow-sm">
        <button 
          onClick={() => navigate('/forms')}
          className="px-4 py-2 bg-transparent text-[#4242ea] border-none text-sm font-medium cursor-pointer transition-all duration-200 mb-4 inline-flex items-center gap-2 hover:text-[#3333d1]"
        >
          ← Back to Forms
        </button>
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2">{form?.title}</h1>
          <p className="text-gray-600">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Export Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
          >
            <FileJson className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-16 py-6 bg-white border-b border-gray-200">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            className="flex-1 min-w-[250px] px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            placeholder="Search submissions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          />
          <input
            type="date"
            className="px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          />
          <label className="flex items-center gap-2 px-4 py-3 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.flagged}
              onChange={(e) => setFilters({ ...filters, flagged: e.target.checked })}
              className="w-4 h-4 accent-[#4242ea] cursor-pointer"
            />
            <span className="text-sm text-gray-700">Flagged only</span>
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {submissions.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl text-gray-800 mb-2">No submissions yet</h2>
            <p className="text-gray-600">Submissions will appear here once users start filling out the form</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submissions List */}
            <div className="flex flex-col gap-3">
              {submissions.map((submission) => (
                <div
                  key={submission.submission_id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`p-4 bg-white border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedSubmission?.submission_id === submission.submission_id
                      ? 'border-[#4242ea] shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-800">
                        {submission.respondent_email || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </div>
                    </div>
                    {submission.flagged && (
                      <Flag className="w-4 h-4 text-red-500 fill-red-500" />
                    )}
                  </div>
                  {submission.notes && (
                    <div className="text-xs text-gray-600 italic mt-2 p-2 bg-yellow-50 rounded border-l-2 border-yellow-400">
                      {submission.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submission Detail */}
            <div className="sticky top-4 h-fit">
              {selectedSubmission ? (
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {selectedSubmission.respondent_email || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(selectedSubmission.submitted_at).toLocaleString()}
                        </p>
                        {selectedSubmission.completion_time_seconds && (
                          <p className="text-sm text-gray-500">
                            Completed in: {Math.floor(selectedSubmission.completion_time_seconds / 60)}m {selectedSubmission.completion_time_seconds % 60}s
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedSubmission(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleFlag(selectedSubmission)}
                        className={`px-3 py-2 border rounded-md text-xs cursor-pointer transition-all duration-200 inline-flex items-center gap-2 ${
                          selectedSubmission.flagged
                            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        {selectedSubmission.flagged ? 'Unflag' : 'Flag'}
                      </button>
                      <button
                        onClick={() => handleAddNote(selectedSubmission)}
                        className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-xs cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-gray-50"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {selectedSubmission.notes ? 'Edit Note' : 'Add Note'}
                      </button>
                      <button
                        onClick={() => handleDeleteSubmission(selectedSubmission)}
                        className="px-3 py-2 bg-white text-red-600 border border-red-300 rounded-md text-xs cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Responses */}
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Responses</h4>
                    <div className="flex flex-col gap-4">
                      {Object.entries(selectedSubmission.responses).map(([questionId, response]) => (
                        <div key={questionId} className="pb-4 border-b border-gray-100 last:border-0">
                          <div className="text-sm font-medium text-gray-800 mb-2">
                            {response.question_text}
                          </div>
                          <div className="text-base text-gray-700 pl-4 border-l-2 border-[#4242ea]">
                            {renderResponseValue(response)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center shadow-sm">
                  <div className="text-5xl mb-4">👆</div>
                  <p className="text-gray-500">Select a submission to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSubmissions;

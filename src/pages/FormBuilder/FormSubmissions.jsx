import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getFormById,
  getFormSubmissions,
  updateSubmission,
  deleteSubmission
} from '../../services/formService';
import { Download, FileJson, Flag, MessageSquare, Trash2, X, Eye, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

const INTERESTS_QUESTION_TEXT = 'How would you like to get involved with Pursuit?';

const FormSubmissions = () => {
  const { formId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const interestsRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    start_date: '',
    end_date: '',
    flagged: false,
    interests: []
  });

  // Debounce the search box so the backend is only queried after typing pauses,
  // instead of on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === searchInput ? prev : { ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadFormAndSubmissions();
    // Only re-fetch on backend-relevant filters; interests is applied client-side.
  }, [formId, filters.search, filters.start_date, filters.end_date, filters.flagged]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (interestsRef.current && !interestsRef.current.contains(e.target)) {
        setInterestsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setInterestsOpen(false);
        setSelectedSubmission(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const loadFormAndSubmissions = async () => {
    try {
      setLoading(true);
      const { interests, ...backendFilters } = filters;
      const [formData, submissionsData] = await Promise.all([
        getFormById(formId),
        getFormSubmissions(formId, backendFilters)
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

  const interestsQuestion = useMemo(() => {
    if (!form?.questions) return null;
    const target = INTERESTS_QUESTION_TEXT.toLowerCase().trim();
    return form.questions.find(
      (q) => q.type === 'multiple_choice' && q.text?.toLowerCase().trim() === target
    );
  }, [form]);

  const interestOptions = interestsQuestion?.options || [];

  const responseValue = (submission, questionId) => {
    const response = submission.responses?.[questionId];
    if (!response) return '';
    return Array.isArray(response.answer)
      ? response.answer.join(', ')
      : response.answer?.toString() || '';
  };

  const filteredSubmissions = useMemo(() => {
    if (!filters.interests.length || !interestsQuestion) return submissions;
    return submissions.filter((sub) => {
      const response = sub.responses?.[interestsQuestion.question_id];
      if (!response) return false;
      const answers = Array.isArray(response.answer) ? response.answer : [response.answer];
      return filters.interests.some((v) => answers.includes(v));
    });
  }, [submissions, filters.interests, interestsQuestion]);

  const toggleInterest = (option) => {
    setFilters((prev) => {
      const next = prev.interests.includes(option)
        ? prev.interests.filter((o) => o !== option)
        : [...prev.interests, option];
      return { ...prev, interests: next };
    });
  };

  const clearInterests = () => setFilters((prev) => ({ ...prev, interests: [] }));

  const handleToggleFlag = async (submission, e) => {
    e?.stopPropagation();
    try {
      const newFlaggedState = !submission.flagged;
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.submission_id === submission.submission_id
            ? { ...sub, flagged: newFlaggedState }
            : sub
        )
      );
      if (selectedSubmission?.submission_id === submission.submission_id) {
        setSelectedSubmission((prev) => ({ ...prev, flagged: newFlaggedState }));
      }
      await updateSubmission(formId, submission.submission_id, { flagged: newFlaggedState });
    } catch (error) {
      console.error('Error updating submission:', error);
      Swal.fire('Error', 'Failed to update submission', 'error');
      loadFormAndSubmissions();
    }
  };

  const handleAddNote = async (submission, e) => {
    e?.stopPropagation();
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
        if (selectedSubmission?.submission_id === submission.submission_id) {
          setSelectedSubmission((prev) => ({ ...prev, notes: note }));
        }
        Swal.fire('Success', 'Note saved', 'success');
      } catch (error) {
        console.error('Error saving note:', error);
        Swal.fire('Error', 'Failed to save note', 'error');
      }
    }
  };

  const handleDeleteSubmission = async (submission, e) => {
    e?.stopPropagation();
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

  const renderResponseValue = (response) => {
    if (Array.isArray(response.answer)) return response.answer.join(', ');
    return response.answer?.toString() || 'N/A';
  };

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return '';
    let str = String(value);
    if (/^[=+\-@]/.test(str)) str = `'${str}`;
    if (/[",\n\r]/.test(str)) str = `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const downloadBlob = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      Swal.fire('Nothing to export', 'No submissions match the current filters.', 'info');
      return;
    }
    const questionColumns = form?.questions || [];
    const headers = [
      'Submission ID',
      'Email',
      'Submitted At',
      'Completion Time (s)',
      'Status',
      'Flagged',
      'Notes',
      ...questionColumns.map((q) => q.text)
    ];
    const rows = filteredSubmissions.map((sub) => [
      sub.submission_id,
      sub.respondent_email || '',
      sub.submitted_at,
      sub.completion_time_seconds ?? '',
      sub.status || '',
      sub.flagged ? 'Yes' : 'No',
      sub.notes || '',
      ...questionColumns.map((q) => {
        const response = sub.responses?.[q.question_id];
        if (!response) return '';
        return Array.isArray(response.answer)
          ? response.answer.join('; ')
          : response.answer ?? '';
      })
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n');
    downloadBlob('﻿' + csv, `form-${formId}-submissions.csv`, 'text/csv;charset=utf-8;');
    Swal.fire(
      'Success',
      `Exported ${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? 's' : ''}`,
      'success'
    );
  };

  const handleExportJSON = () => {
    if (filteredSubmissions.length === 0) {
      Swal.fire('Nothing to export', 'No submissions match the current filters.', 'info');
      return;
    }
    const json = JSON.stringify(filteredSubmissions, null, 2);
    downloadBlob(json, `form-${formId}-submissions.json`, 'application/json;charset=utf-8;');
    Swal.fire(
      'Success',
      `Exported ${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? 's' : ''}`,
      'success'
    );
  };

  if (loading && !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4242ea] rounded-full animate-spin mb-4"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  const totalCount = submissions.length;
  const visibleCount = filteredSubmissions.length;
  const interestsFilterActive = filters.interests.length > 0;
  const questionColumns = form?.questions || [];

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
            {interestsFilterActive
              ? `Showing ${visibleCount} of ${totalCount} submission${totalCount !== 1 ? 's' : ''}`
              : `${totalCount} submission${totalCount !== 1 ? 's' : ''}`}
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
          {interestsFilterActive && (
            <span className="px-3 py-2 text-xs text-gray-600 italic self-center">
              Exports respect the active filters
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-16 py-6 bg-white border-b border-gray-200">
        <div className="flex gap-4 flex-wrap items-center">
          <input
            type="text"
            className="flex-1 min-w-[250px] px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
            placeholder="Search submissions..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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

          {interestsQuestion && (
            <div className="relative" ref={interestsRef}>
              <button
                type="button"
                onClick={() => setInterestsOpen((v) => !v)}
                className={`px-4 py-3 border rounded-lg text-sm inline-flex items-center gap-2 cursor-pointer transition-all duration-200 ${
                  filters.interests.length > 0
                    ? 'border-[#4242ea] text-[#4242ea] bg-[#4242ea]/5'
                    : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
                }`}
              >
                <span>
                  Interests
                  {filters.interests.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-[#4242ea] text-white rounded-full text-xs">
                      {filters.interests.length}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${interestsOpen ? 'rotate-180' : ''}`} />
              </button>
              {interestsOpen && (
                <div className="absolute z-20 top-full left-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Filter by interest
                    </span>
                    {filters.interests.length > 0 && (
                      <button
                        onClick={clearInterests}
                        className="text-xs text-[#4242ea] hover:text-[#3333d1] font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {interestOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#4242ea] cursor-pointer mt-0.5"
                          checked={filters.interests.includes(option)}
                          onChange={() => toggleInterest(option)}
                        />
                        <span className="text-sm text-gray-700 flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-8">
        {visibleCount === 0 ? (
          <div className="text-center py-16 px-8 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-2xl text-gray-800 mb-2">
              {totalCount === 0 ? 'No submissions yet' : 'No submissions match your filters'}
            </h2>
            <p className="text-gray-600">
              {totalCount === 0
                ? 'Submissions will appear here once users start filling out the form'
                : 'Try clearing one of the filters to see more results'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted
                    </th>
                    {questionColumns.map((q) => (
                      <th
                        key={q.question_id}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]"
                      >
                        <span className="line-clamp-2" title={q.text}>
                          {q.text}
                        </span>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Flag
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredSubmissions.map((submission) => {
                    return (
                      <tr
                        key={submission.submission_id}
                        onClick={() => setSelectedSubmission(submission)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                          {submission.respondent_email || (
                            <span className="text-gray-400 italic">Anonymous</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </td>
                        {questionColumns.map((q) => {
                          const value = responseValue(submission, q.question_id);
                          return (
                            <td
                              key={q.question_id}
                              className="px-6 py-4 text-sm text-gray-700 max-w-xs"
                            >
                              {value ? (
                                <span className="line-clamp-2" title={value}>
                                  {value}
                                </span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {submission.notes ? (
                            <span title={submission.notes} className="inline-flex items-center gap-1">
                              <MessageSquare className="w-4 h-4 text-yellow-600" />
                              <span className="line-clamp-1 max-w-[180px]">{submission.notes}</span>
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {submission.flagged ? (
                            <Flag className="w-4 h-4 text-red-500 fill-red-500" />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubmission(submission);
                              }}
                              title="View details"
                              className="p-2 text-gray-500 hover:text-[#4242ea] hover:bg-[#4242ea]/10 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleToggleFlag(submission, e)}
                              title={submission.flagged ? 'Unflag' : 'Flag'}
                              className={`p-2 rounded-md transition-colors ${
                                submission.flagged
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                              }`}
                            >
                              <Flag className={`w-4 h-4 ${submission.flagged ? 'fill-red-500' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => handleAddNote(submission, e)}
                              title={submission.notes ? 'Edit note' : 'Add note'}
                              className="p-2 text-gray-500 hover:text-yellow-700 hover:bg-yellow-50 rounded-md transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSubmission(submission, e)}
                              title="Delete"
                              className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
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
                      Completed in: {Math.floor(selectedSubmission.completion_time_seconds / 60)}m{' '}
                      {selectedSubmission.completion_time_seconds % 60}s
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={(e) => handleToggleFlag(selectedSubmission, e)}
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
                  onClick={(e) => handleAddNote(selectedSubmission, e)}
                  className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-xs cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-gray-50"
                >
                  <MessageSquare className="w-3 h-3" />
                  {selectedSubmission.notes ? 'Edit Note' : 'Add Note'}
                </button>
                <button
                  onClick={(e) => handleDeleteSubmission(selectedSubmission, e)}
                  className="px-3 py-2 bg-white text-red-600 border border-red-300 rounded-md text-xs cursor-pointer transition-all duration-200 inline-flex items-center gap-2 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>

            {/* Responses */}
            <div className="p-6 overflow-y-auto">
              {selectedSubmission.notes && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-2 border-yellow-400 rounded text-sm text-gray-700 italic">
                  <strong className="not-italic text-gray-800">Note: </strong>
                  {selectedSubmission.notes}
                </div>
              )}
              <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Responses</h4>
              <div className="flex flex-col gap-4">
                {Object.entries(selectedSubmission.responses).map(([questionId, response]) => (
                  <div key={questionId} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="text-sm font-medium text-gray-800 mb-2">{response.question_text}</div>
                    <div className="text-base text-gray-700 pl-4 border-l-2 border-[#4242ea]">
                      {renderResponseValue(response)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormSubmissions;

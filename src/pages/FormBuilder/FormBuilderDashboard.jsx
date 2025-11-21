import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllForms, deleteForm, duplicateForm, updateFormStatus } from '../../services/formService';
import { CopyButton } from '../../components/ui/copy-button';
import { LayoutGrid, List, MoreVertical } from 'lucide-react';
import Swal from 'sweetalert2';

const FormBuilderDashboard = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('card');
  const [openDropdown, setOpenDropdown] = useState(null);

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
    navigate('/forms/new');
  };

  const handleEditForm = (formId) => {
    navigate(`/forms/${formId}/edit`);
  };

  const handleViewSubmissions = (formId) => {
    navigate(`/forms/${formId}/submissions`);
  };

  const handleViewAnalytics = (formId) => {
    navigate(`/forms/${formId}/analytics`);
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

  const getFormUrl = (slug) => {
    return `${window.location.origin}/form/${slug}`;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-full mx-auto overflow-x-hidden box-border bg-[#f5f5f5] min-h-screen text-[#1a1a1a] p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Form Builder</h1>
          <p className="text-base text-gray-600 m-0">
            Create and manage custom forms with unique shareable URLs
          </p>
        </div>
        <button 
          onClick={handleCreateForm}
          className="px-6 py-3.5 bg-[#4242ea] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-md whitespace-nowrap hover:bg-[#3333d1] hover:-translate-y-0.5 hover:shadow-lg"
        >
          + Create New Form
        </button>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex gap-4 mb-8 flex-wrap items-center">
        <input
          type="text"
          className="w-[300px] px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
          placeholder="Search forms..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="px-4 py-3 border border-gray-300 rounded-lg text-base bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
        
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setViewMode('card')}
            title="Card View"
            className={`w-10 h-10 border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
              viewMode === 'card'
                ? 'bg-[#4242ea] border-[#4242ea] text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            title="Table View"
            className={`w-10 h-10 border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-[#4242ea] border-[#4242ea] text-white'
                : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#4242ea] rounded-full animate-spin mb-4"></div>
          <p>Loading forms...</p>
        </div>
      ) : forms.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-8 bg-gray-50 rounded-xl mt-8">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl text-gray-800 mb-2">No forms yet</h2>
          <p className="text-gray-600 mb-8">Create your first form to get started</p>
          <button 
            onClick={handleCreateForm}
            className="px-6 py-3.5 bg-[#4242ea] text-white border-none rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-md hover:bg-[#3333d1] hover:-translate-y-0.5 hover:shadow-lg"
          >
            Create New Form
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <div key={form.form_id} className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className="text-xl font-semibold text-[#1a1a1a] flex-1">{form.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${getStatusBadgeColor(form.status)}`}>
                  {form.status}
                </span>
              </div>

              {/* Description */}
              {form.description && (
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {form.description.substring(0, 100)}
                  {form.description.length > 100 ? '...' : ''}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mb-4 py-4 border-t border-b border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">Submissions</span>
                  <span className="text-xl font-bold text-gray-800">{form.submission_count || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">Questions</span>
                  <span className="text-xl font-bold text-gray-800">{form.questions?.length || 0}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 uppercase font-medium">Created</span>
                  <span className="text-xl font-bold text-gray-800">
                    {new Date(form.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* URL */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={getFormUrl(form.slug)}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50 cursor-pointer"
                />
                <CopyButton
                  content={getFormUrl(form.slug)}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleEditForm(form.form_id)}
                  className="px-4 py-2 bg-[#4242ea] text-white border-none rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-[#3333d1]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleViewSubmissions(form.form_id)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                >
                  Submissions
                </button>
                <button
                  onClick={() => handleViewAnalytics(form.form_id)}
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                >
                  Analytics
                </button>
                
                {/* Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === form.form_id ? null : form.form_id)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-800 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openDropdown === form.form_id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                      <button 
                        onClick={() => { handleStatusChange(form.form_id, form.status); setOpenDropdown(null); }}
                        className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-gray-50"
                      >
                        Change Status
                      </button>
                      <button 
                        onClick={() => { handleDuplicateForm(form.form_id, form.title); setOpenDropdown(null); }}
                        className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-gray-50"
                      >
                        Duplicate
                      </button>
                      <button 
                        onClick={() => { handleDeleteForm(form.form_id, form.title); setOpenDropdown(null); }}
                        className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors text-red-600 hover:bg-red-50"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                <th className="px-4 py-4 text-left font-semibold text-xs text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-center font-semibold text-xs text-gray-600 uppercase tracking-wider">Submissions</th>
                <th className="px-4 py-4 text-center font-semibold text-xs text-gray-600 uppercase tracking-wider">Questions</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-gray-600 uppercase tracking-wider">Created</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-gray-600 uppercase tracking-wider">URL</th>
                <th className="px-4 py-4 text-left font-semibold text-xs text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((form) => (
                <tr key={form.form_id} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-4 align-middle min-w-[200px]">
                    <div>
                      <div className="block text-[#1a1a1a] text-base font-medium mb-1">{form.title}</div>
                      {form.description && (
                        <p className="text-sm text-gray-600 m-0 leading-snug">
                          {form.description.substring(0, 60)}
                          {form.description.length > 60 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeColor(form.status)}`}>
                      {form.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle text-center font-semibold text-gray-800">
                    {form.submission_count || 0}
                  </td>
                  <td className="px-4 py-4 align-middle text-center font-semibold text-gray-800">
                    {form.questions?.length || 0}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    {new Date(form.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex gap-2 items-center min-w-[200px]">
                      <input
                        type="text"
                        readOnly
                        value={`/form/${form.slug}`}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md text-gray-600 bg-gray-50"
                      />
                      <CopyButton
                        content={getFormUrl(form.slug)}
                        variant="outline"
                        size="icon"
                        className="flex-shrink-0"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-middle">
                    <div className="flex gap-2 flex-nowrap items-center">
                      <button
                        onClick={() => handleEditForm(form.form_id)}
                        className="px-3 py-1.5 bg-[#4242ea] text-white border-none rounded-md text-xs cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-[#3333d1]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleViewSubmissions(form.form_id)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-800 text-xs cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                      >
                        Submissions
                      </button>
                      <button
                        onClick={() => handleViewAnalytics(form.form_id)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-800 text-xs cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                      >
                        Analytics
                      </button>
                      
                      {/* Dropdown */}
                      <div className="relative">
                        <button 
                          onClick={() => setOpenDropdown(openDropdown === form.form_id ? null : form.form_id)}
                          className="px-2 py-1.5 border border-gray-300 rounded-md bg-white text-gray-800 text-xs cursor-pointer transition-all duration-200 whitespace-nowrap hover:bg-gray-50 hover:border-[#4242ea] hover:text-[#4242ea]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdown === form.form_id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                            <button 
                              onClick={() => { handleStatusChange(form.form_id, form.status); setOpenDropdown(null); }}
                              className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-gray-50"
                            >
                              Change Status
                            </button>
                            <button 
                              onClick={() => { handleDuplicateForm(form.form_id, form.title); setOpenDropdown(null); }}
                              className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-gray-50"
                            >
                              Duplicate
                            </button>
                            <button 
                              onClick={() => { handleDeleteForm(form.form_id, form.title); setOpenDropdown(null); }}
                              className="block w-full px-4 py-3 text-left border-none bg-transparent cursor-pointer text-sm transition-colors text-red-600 hover:bg-red-50"
                            >
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FormBuilderDashboard;

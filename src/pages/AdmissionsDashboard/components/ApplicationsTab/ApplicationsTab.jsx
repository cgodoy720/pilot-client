import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Badge } from '../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../../components/ui/dropdown-menu';
import { formatPhoneNumber, getStatusBadgeClasses, formatStatus, getColumnLabel } from '../shared/utils';

// Filter options for each column
const filterOptions = {
  status: [
    { value: '', label: 'All' },
    { value: 'no_application', label: 'No Application' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'ineligible', label: 'Ineligible' },
  ],
  recommendation: [
    { value: '', label: 'All' },
    { value: 'strong_recommend', label: 'Strong Recommend' },
    { value: 'recommend', label: 'Recommend' },
    { value: 'review_needed', label: 'Review Needed' },
    { value: 'not_recommend', label: 'Not Recommend' },
  ],
  final_status: [
    { value: '', label: 'All' },
    { value: 'strong_recommend', label: 'Strong Recommend' },
    { value: 'recommend', label: 'Recommend' },
    { value: 'review_needed', label: 'Review Needed' },
    { value: 'not_recommend', label: 'Not Recommend' },
  ],
  info_session_status: [
    { value: '', label: 'All' },
    { value: 'not_registered', label: 'Not Registered' },
    { value: 'registered', label: 'Registered' },
    { value: 'attended', label: 'Attended' },
    { value: 'attended_event', label: 'Attended Event' },
    { value: 'no_show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  workshop_status: [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'registered', label: 'Registered' },
    { value: 'attended', label: 'Attended' },
    { value: 'no_show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  program_admission_status: [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'waitlisted', label: 'Waitlisted' },
    { value: 'deferred', label: 'Deferred' },
  ],
  deliberation: [
    { value: '', label: 'All' },
    { value: 'yes', label: 'Yes' },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: 'No' },
  ],
};

// Column labels for the table
const columnLabels = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  app_start_date: 'App Start Date',
  status: 'Status',
  assessment: 'Assessment',
  info_session: 'Info Session',
  workshop: 'Workshop',
  structured_task_grade: 'Workshop Grade',
  admission: 'Admission',
  deliberation: 'Deliberation',
  notes: 'Notes',
  age: 'Age',
  gender: 'Gender',
  race: 'Race/Ethnicity',
  education: 'Education',
  referral: 'Referral Source'
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  try {
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
};

// Memoized ApplicationRow component to prevent unnecessary re-renders
const ApplicationRow = React.memo(({ 
  app, 
  visibleColumns, 
  isSelected, 
  onSelect, 
  onViewApplication,
  onOpenNotes,
  onDeliberationChange 
}) => {
  return (
    <TableRow key={app.applicant_id} className="hover:bg-gray-50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(app.applicant_id, checked)}
        />
      </TableCell>
      {visibleColumns.name && (
        <TableCell 
          className="font-medium font-proxima text-[#4242ea] hover:text-[#3333d1] cursor-pointer hover:underline"
          onClick={() => onViewApplication(app.applicant_id)}
        >
          {app.first_name} {app.last_name}
        </TableCell>
      )}
      {visibleColumns.email && (
        <TableCell className="font-proxima text-gray-600">
          {app.email || 'N/A'}
        </TableCell>
      )}
      {visibleColumns.phone && (
        <TableCell className="font-proxima text-gray-600">
          {formatPhoneNumber(app.phone_number)}
        </TableCell>
      )}
      {visibleColumns.app_start_date && (
        <TableCell className="font-proxima text-gray-600">
          {app.created_at ? new Date(app.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : '-'}
        </TableCell>
      )}
      {visibleColumns.status && (
        <TableCell>
          <Badge className={`${getStatusBadgeClasses(app.status)} font-proxima`}>
            {formatStatus(app.status)}
          </Badge>
        </TableCell>
      )}
      {visibleColumns.assessment && (
        <TableCell>
          {(app.recommendation || app.final_status) && (
            <Badge className={`${getStatusBadgeClasses(app.final_status || app.recommendation)} font-proxima`}>
              {formatStatus(app.final_status || app.recommendation)}
            </Badge>
          )}
        </TableCell>
      )}
      {visibleColumns.info_session && (
        <TableCell>
          {app.info_session_status && (
            <Badge className={`${getStatusBadgeClasses(app.info_session_status)} font-proxima`}>
              {formatStatus(app.info_session_status)}
            </Badge>
          )}
        </TableCell>
      )}
      {visibleColumns.workshop && (
        <TableCell>
          {app.workshop_status && (
            <Badge className={`${getStatusBadgeClasses(app.workshop_status)} font-proxima`}>
              {formatStatus(app.workshop_status)}
            </Badge>
          )}
        </TableCell>
      )}
      {visibleColumns.structured_task_grade && (
        <TableCell className="font-proxima">
          {app.structured_task_grade || '-'}
        </TableCell>
      )}
      {visibleColumns.admission && (
        <TableCell>
          {app.program_admission_status && (
            <Badge className={`${getStatusBadgeClasses(app.program_admission_status)} font-proxima`}>
              {formatStatus(app.program_admission_status)}
            </Badge>
          )}
        </TableCell>
      )}
      {visibleColumns.deliberation && (
        <TableCell>
          <Select
            value={app.deliberation || '_none'}
            onValueChange={(value) => onDeliberationChange(app.applicant_id, value === '_none' ? '' : value)}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs font-proxima">
              <SelectValue placeholder="Set" />
            </SelectTrigger>
            <SelectContent className="font-proxima">
              <SelectItem value="_none">None</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
              <SelectItem value="maybe">Maybe</SelectItem>
              <SelectItem value="no">No</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      )}
      {visibleColumns.age && (
        <TableCell className="font-proxima text-gray-600">
          {calculateAge(app.date_of_birth) || '-'}
        </TableCell>
      )}
      {visibleColumns.gender && (
        <TableCell className="font-proxima text-gray-600">
          {app.gender || '-'}
        </TableCell>
      )}
      {visibleColumns.race && (
        <TableCell className="font-proxima text-gray-600 max-w-[150px] truncate" title={app.race_ethnicity}>
          {app.race_ethnicity || '-'}
        </TableCell>
      )}
      {visibleColumns.education && (
        <TableCell className="font-proxima text-gray-600 max-w-[150px] truncate" title={app.education_level}>
          {app.education_level || '-'}
        </TableCell>
      )}
      {visibleColumns.referral && (
        <TableCell className="font-proxima text-gray-600 max-w-[150px] truncate" title={app.referral_source}>
          {app.referral_source || '-'}
        </TableCell>
      )}
      {visibleColumns.notes && (
        <TableCell>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenNotes(app)}
            className="font-proxima text-[#4242ea] hover:text-[#3333d1]"
          >
            📝
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
});

ApplicationRow.displayName = 'ApplicationRow';

// Pagination component
const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible range
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if at the beginning
      if (currentPage <= 3) {
        end = 4;
      }
      
      // Adjust if at the end
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      // Add ellipsis if needed before middle pages
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed after middle pages
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 font-proxima">
        Showing {startItem}-{endItem} of {totalItems} applicants
      </span>
      
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          className="font-proxima h-8 px-2"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Prev
        </Button>
        
        {/* Page numbers */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              className={`font-proxima h-8 w-8 p-0 ${currentPage === page ? 'bg-[#4242ea] hover:bg-[#3333d1]' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
        
        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          className="font-proxima h-8 px-2"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

const ApplicationsTab = ({
  loading,
  applications,
  cohorts,
  applicationFilters,
  setApplicationFilters,
  visibleColumns,
  setVisibleColumns,
  columnSort,
  handleColumnSort,
  selectedApplicants,
  setSelectedApplicants,
  openFilterColumn,
  setOpenFilterColumn,
  openNotesModal,
  handleDeliberationChange,
  setBulkActionsModalOpen,
  fetchApplications,
  token,
  searchIndex,
  currentPage,
  pageSize,
  onPageChange,
  loadAllMode,
  onLoadAll,
  onReturnToPagination
}) => {
  const navigate = useNavigate();
  const [tableSearchTerm, setTableSearchTerm] = React.useState('');
  const [csvExportColumns, setCsvExportColumns] = React.useState({
    name: true,
    email: true,
    phone: true,
    app_start_date: true,
    status: true,
    assessment: true,
    info_session: true,
    workshop: true,
    workshop_grade: false,
    admission: true,
    deliberation: false,
    age: false,
    gender: false,
    race_ethnicity: false,
    education: false,
    referral: false
  });

  // Sync CSV export columns with visible columns when opening export
  const initializeCsvColumnsFromVisible = React.useCallback(() => {
    setCsvExportColumns({
      name: visibleColumns.name ?? true,
      email: visibleColumns.email ?? true,
      phone: visibleColumns.phone ?? true,
      app_start_date: visibleColumns.app_start_date ?? false,
      status: visibleColumns.status ?? true,
      assessment: visibleColumns.assessment ?? true,
      info_session: visibleColumns.info_session ?? true,
      workshop: visibleColumns.workshop ?? true,
      workshop_grade: visibleColumns.structured_task_grade ?? false,
      admission: visibleColumns.admission ?? true,
      deliberation: visibleColumns.deliberation ?? false,
      age: visibleColumns.age ?? false,
      gender: visibleColumns.gender ?? false,
      race_ethnicity: visibleColumns.race ?? false,
      education: visibleColumns.education ?? false,
      referral: visibleColumns.referral ?? false
    });
  }, [visibleColumns]);
  
  // Handle navigating to applicant detail
  const handleViewApplication = useCallback((applicantId) => {
    navigate(`/admissions-dashboard/applicant/${applicantId}`);
  }, [navigate]);

  // Sort and filter applications
  const sortedApplications = useMemo(() => {
    if (!applications?.applications || applications.applications.length === 0) return [];
    
    let sorted = [...applications.applications];
    
    // Apply client-side search filter
    if (tableSearchTerm.trim()) {
      const searchLower = tableSearchTerm.toLowerCase().trim();
      sorted = sorted.filter(app => {
        const fullName = `${app.first_name || ''} ${app.last_name || ''}`.toLowerCase();
        const email = (app.email || '').toLowerCase();
        const phone = (app.phone_number || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower);
      });
    }
    
    if (columnSort.column) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        
        if (columnSort.column === 'name') {
          aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
        } else {
          aVal = a[columnSort.column];
          bVal = b[columnSort.column];
        }
        
        if (aVal === null || aVal === undefined) aVal = '';
        if (bVal === null || bVal === undefined) bVal = '';
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = (bVal || '').toLowerCase();
        }
        
        if (aVal < bVal) return columnSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return columnSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sorted;
  }, [applications, columnSort, tableSearchTerm]);

  // Calculate pagination values
  const totalItems = applications?.total || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Handle select all (only selects current page)
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedApplicants(sortedApplications?.map(app => app.applicant_id) || []);
    } else {
      setSelectedApplicants([]);
    }
  }, [sortedApplications, setSelectedApplicants]);

  // Handle individual selection
  const handleSelectApplicant = useCallback((applicantId, checked) => {
    if (checked) {
      setSelectedApplicants(prev => [...prev, applicantId]);
    } else {
      setSelectedApplicants(prev => prev.filter(id => id !== applicantId));
    }
  }, [setSelectedApplicants]);

  // CSV export column configuration
  // Note: Export endpoint returns demographics data in a nested 'demographics' object
  const csvColumnConfig = {
    name: { label: 'Name', getValue: (app) => `${app.first_name || ''} ${app.last_name || ''}` },
    email: { label: 'Email', getValue: (app) => app.email || '' },
    phone: { label: 'Phone', getValue: (app) => app.phone_number || '' },
    app_start_date: { label: 'App Start Date', getValue: (app) => app.created_at ? new Date(app.created_at).toLocaleDateString() : '' },
    status: { label: 'Status', getValue: (app) => app.status || '' },
    assessment: { label: 'Assessment', getValue: (app) => app.recommendation || app.final_status || '' },
    info_session: { label: 'Info Session', getValue: (app) => app.info_session_status || '' },
    workshop: { label: 'Workshop', getValue: (app) => app.workshop_status || '' },
    workshop_grade: { label: 'Workshop Grade', getValue: (app) => app.structured_task_grade || '' },
    admission: { label: 'Admission', getValue: (app) => app.program_admission_status || '' },
    deliberation: { label: 'Deliberation', getValue: (app) => app.deliberation || '' },
    age: { label: 'Age', getValue: (app) => {
      const dob = app.demographics?.date_of_birth || app.date_of_birth;
      return dob ? calculateAge(dob) || '' : '';
    }},
    gender: { label: 'Gender', getValue: (app) => app.demographics?.gender || app.gender || '' },
    race_ethnicity: { label: 'Race/Ethnicity', getValue: (app) => app.demographics?.race_ethnicity || app.race_ethnicity || '' },
    education: { label: 'Education', getValue: (app) => app.demographics?.education_level || app.education_level || '' },
    referral: { label: 'Referral Source', getValue: (app) => app.demographics?.reason_for_applying || app.demographics?.referral_source || app.referral_source || '' }
  };

  // Handle CSV export
  const handleExportCSV = useCallback(async () => {
    if (selectedApplicants.length === 0) return;
    
    try {
      const selectedApplicantIds = selectedApplicants.join(',');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admissions/applicants/export?ids=${selectedApplicantIds}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch detailed applicant data');
      }
      
      const detailedApplicantData = await response.json();
      
      if (!detailedApplicantData || detailedApplicantData.length === 0) {
        alert('No data to export');
        return;
      }

      // Get selected columns
      const selectedCols = Object.entries(csvExportColumns)
        .filter(([_, isSelected]) => isSelected)
        .map(([key]) => key);
      
      if (selectedCols.length === 0) {
        alert('Please select at least one column to export');
        return;
      }

      // Create CSV content with selected columns
      const headers = selectedCols.map(col => csvColumnConfig[col].label);
      const rows = detailedApplicantData.map(app => 
        selectedCols.map(col => csvColumnConfig[col].getValue(app))
      );

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `applicants_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data');
    }
  }, [selectedApplicants, token, csvExportColumns]);

  // Optimized filter update handlers
  const handleColumnToggle = useCallback((column, checked) => {
    setVisibleColumns(prev => ({ ...prev, [column]: checked }));
  }, [setVisibleColumns]);

  const handleFilterChange = useCallback((filterKey, value) => {
    setApplicationFilters(prev => ({ ...prev, [filterKey]: value, offset: 0 }));
    onPageChange(1); // Reset to first page when filter changes
  }, [setApplicationFilters, onPageChange]);

  const handleClearFilter = useCallback((filterKey) => {
    setApplicationFilters(prev => ({ ...prev, [filterKey]: '', offset: 0 }));
    onPageChange(1);
  }, [setApplicationFilters, onPageChange]);

  const handleClearAllFilters = useCallback(() => {
    setApplicationFilters(prev => ({
      ...prev,
      status: '',
      final_status: '',
      info_session_status: '',
      workshop_status: '',
      program_admission_status: '',
      deliberation: '',
      offset: 0
    }));
    onPageChange(1);
    // Clear sessionStorage
    try {
      sessionStorage.removeItem('admissions-dashboard-filters-v1');
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }, [setApplicationFilters, onPageChange]);

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (columnSort.column !== column) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return <span className="text-[#4242ea] ml-1">{columnSort.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  // Render sortable + filterable column header
  const renderSortableFilterableHeader = (column, filterKey, label, sortKey = null) => {
    const options = filterOptions[filterKey];
    const currentValue = applicationFilters[filterKey] || '';
    const isFiltered = currentValue !== '';
    const isSortable = sortKey !== null;
    const isSorted = columnSort.column === sortKey;
    
    return (
      <div className="flex items-center gap-1">
        {/* Sortable label */}
        {isSortable ? (
          <span 
            className="cursor-pointer hover:text-[#4242ea] font-proxima-bold select-none flex items-center"
            onClick={() => handleColumnSort(sortKey)}
          >
            {label}
            {isSorted ? (
              <span className="text-[#4242ea] ml-1">{columnSort.direction === 'asc' ? '▲' : '▼'}</span>
            ) : (
              <span className="text-gray-400 ml-1">⇅</span>
            )}
          </span>
        ) : (
          <span className="font-proxima-bold">{label}</span>
        )}
        
        {/* Filter dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button 
              className={`p-1 rounded hover:bg-gray-200 ${isFiltered ? 'text-[#4242ea]' : 'text-gray-400'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 font-proxima">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">Filter by {label}</div>
            <DropdownMenuSeparator />
            {options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={currentValue === option.value}
                onCheckedChange={() => handleFilterChange(filterKey, option.value)}
                onSelect={(e) => e.preventDefault()}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
            {isFiltered && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 hover:text-red-700"
                  onSelect={(e) => {
                    e.preventDefault();
                    handleClearFilter(filterKey);
                  }}
                >
                  ✕ Clear Filter
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Loading state - Skeleton UI
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        {/* Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 border-b border-gray-200 shrink-0">
          {/* Search skeleton */}
          <div className="w-[300px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          
          {/* Cohort filter skeleton */}
          <div className="w-[200px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          
          {/* Columns button skeleton */}
          <div className="w-[100px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          
          {/* Actions button skeleton */}
          <div className="w-[110px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          
          {/* Export button skeleton */}
          <div className="w-[130px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          
          {/* Refresh button skeleton */}
          <div className="w-[90px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>

        {/* Table Skeleton - Using actual Table components for proper structure */}
        <div className="flex-1 bg-white overflow-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12">
                  <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
                <TableHead>
                  <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  {/* Checkbox */}
                  <TableCell>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </TableCell>
                  {/* Name */}
                  <TableCell>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </TableCell>
                  {/* Email */}
                  <TableCell>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  </TableCell>
                  {/* Phone */}
                  <TableCell>
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  </TableCell>
                  {/* Status Badge */}
                  <TableCell>
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </TableCell>
                  {/* Assessment Badge */}
                  <TableCell>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </TableCell>
                  {/* Info Session Badge */}
                  <TableCell>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </TableCell>
                  {/* Workshop Badge */}
                  <TableCell>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </TableCell>
                  {/* Workshop Grade */}
                  <TableCell>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </TableCell>
                  {/* Admission Badge */}
                  <TableCell>
                    <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  </TableCell>
                  {/* Deliberation Select */}
                  <TableCell>
                    <div className="h-8 w-[100px] bg-gray-200 rounded-md"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer Skeleton */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="w-48 h-5 bg-gray-300 rounded animate-pulse"></div>
            <div className="flex items-center gap-1">
              {/* Prev button */}
              <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
              {/* Page numbers */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              ))}
              {/* Next button */}
              <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border-b border-gray-200 shrink-0">
        {/* Real-time Search Filter */}
        <div className="relative w-[300px]">
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={tableSearchTerm}
            onChange={(e) => setTableSearchTerm(e.target.value)}
            className="w-full font-proxima pr-8"
          />
          {tableSearchTerm && (
            <button
              onClick={() => setTableSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          {!tableSearchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Cohort Filter */}
        <Select
          value={applicationFilters.cohort_id || '_all'}
          onValueChange={(value) => handleFilterChange('cohort_id', value === '_all' ? '' : value)}
        >
          <SelectTrigger className="w-[200px] bg-white font-proxima">
            <SelectValue placeholder="Cohort: All Time" />
          </SelectTrigger>
          <SelectContent className="font-proxima">
            <SelectItem value="_all">Cohort: All Time</SelectItem>
            {cohorts.map(cohort => (
              <SelectItem key={cohort.cohort_id} value={cohort.cohort_id}>
                {cohort.name}
              </SelectItem>
            ))}
            <SelectItem value="deferred">Deferred Applications</SelectItem>
          </SelectContent>
        </Select>

        {/* Columns Toggle */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-proxima">
              ⚙️ Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 font-proxima max-h-[400px] overflow-y-auto">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">Show/Hide Columns</div>
            <DropdownMenuSeparator />
            {Object.keys(visibleColumns).map(column => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={visibleColumns[column]}
                onCheckedChange={(checked) => handleColumnToggle(column, checked)}
                onSelect={(e) => e.preventDefault()}
              >
                {columnLabels[column] || getColumnLabel(column)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Bulk Actions */}
        <Button
          variant="default"
          className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
          disabled={selectedApplicants.length === 0}
          onClick={() => setBulkActionsModalOpen(true)}
        >
          Actions ({selectedApplicants.length})
        </Button>

        {/* Export CSV with Column Selection Dropdown */}
        <DropdownMenu modal={false} onOpenChange={(open) => { if (open) initializeCsvColumnsFromVisible(); }}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="font-proxima"
              disabled={selectedApplicants.length === 0}
            >
              Export CSV ({selectedApplicants.length})
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 font-proxima max-h-[400px] overflow-y-auto" align="start">
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
              Select Columns to Export
            </div>
            <DropdownMenuSeparator />
            {Object.entries(csvColumnConfig).map(([key, config]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={csvExportColumns[key]}
                onCheckedChange={(checked) => setCsvExportColumns(prev => ({ ...prev, [key]: checked }))}
                onSelect={(e) => e.preventDefault()}
              >
                {config.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setCsvExportColumns(Object.fromEntries(Object.keys(csvColumnConfig).map(k => [k, true])));
                }}
                className="font-proxima text-xs flex-1"
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setCsvExportColumns(Object.fromEntries(Object.keys(csvColumnConfig).map(k => [k, false])));
                }}
                className="font-proxima text-xs flex-1"
              >
                None
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                onClick={handleExportCSV}
                className="w-full bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                Download CSV
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Refresh */}
        <Button variant="outline" onClick={fetchApplications} className="font-proxima">
          Refresh
        </Button>

        {/* Active Filters Indicator */}
        {(applicationFilters.status || applicationFilters.final_status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.deliberation) && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500 font-proxima">Active filters:</span>
            {applicationFilters.status && (
              <Badge className="bg-blue-100 text-blue-700 font-proxima cursor-pointer hover:bg-blue-200" onClick={() => handleClearFilter('status')}>
                Status: {formatStatus(applicationFilters.status)} ✕
              </Badge>
            )}
            {applicationFilters.final_status && (
              <Badge className="bg-indigo-100 text-indigo-700 font-proxima cursor-pointer hover:bg-indigo-200" onClick={() => handleClearFilter('final_status')}>
                Assessment: {formatStatus(applicationFilters.final_status)} ✕
              </Badge>
            )}
            {applicationFilters.info_session_status && (
              <Badge className="bg-purple-100 text-purple-700 font-proxima cursor-pointer hover:bg-purple-200" onClick={() => handleClearFilter('info_session_status')}>
                Info Session: {formatStatus(applicationFilters.info_session_status)} ✕
              </Badge>
            )}
            {applicationFilters.workshop_status && (
              <Badge className="bg-green-100 text-green-700 font-proxima cursor-pointer hover:bg-green-200" onClick={() => handleClearFilter('workshop_status')}>
                Workshop: {formatStatus(applicationFilters.workshop_status)} ✕
              </Badge>
            )}
            {applicationFilters.program_admission_status && (
              <Badge className="bg-yellow-100 text-yellow-700 font-proxima cursor-pointer hover:bg-yellow-200" onClick={() => handleClearFilter('program_admission_status')}>
                Admission: {formatStatus(applicationFilters.program_admission_status)} ✕
              </Badge>
            )}
            {applicationFilters.deliberation && (
              <Badge className="bg-orange-100 text-orange-700 font-proxima cursor-pointer hover:bg-orange-200" onClick={() => handleClearFilter('deliberation')}>
                Deliberation: {formatStatus(applicationFilters.deliberation)} ✕
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-proxima h-6 px-2"
              onClick={handleClearAllFilters}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {applications?.applications?.length > 0 ? (
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          {/* Scrollable table container */}
          <div className="flex-1 overflow-auto relative">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplicants.length === sortedApplications?.length && sortedApplications?.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  {visibleColumns.name && (
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 font-proxima-bold"
                      onClick={() => handleColumnSort('name')}
                    >
                      <div className="flex items-center">
                        Name {renderSortIndicator('name')}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.email && (
                    <TableHead className="font-proxima-bold">Email</TableHead>
                  )}
                  {visibleColumns.phone && (
                    <TableHead className="font-proxima-bold">Phone</TableHead>
                  )}
                  {visibleColumns.app_start_date && (
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 font-proxima-bold"
                      onClick={() => handleColumnSort('created_at')}
                    >
                      <div className="flex items-center">
                        App Start Date {renderSortIndicator('created_at')}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead>
                      {renderSortableFilterableHeader('status', 'status', 'Status', 'status')}
                    </TableHead>
                  )}
                {visibleColumns.assessment && (
                  <TableHead>
                    {renderSortableFilterableHeader('assessment', 'final_status', 'Assessment', null)}
                  </TableHead>
                )}
                  {visibleColumns.info_session && (
                    <TableHead>
                      {renderSortableFilterableHeader('info_session', 'info_session_status', 'Info Session', 'info_session_status')}
                    </TableHead>
                  )}
                  {visibleColumns.workshop && (
                    <TableHead>
                      {renderSortableFilterableHeader('workshop', 'workshop_status', 'Workshop', 'workshop_status')}
                    </TableHead>
                  )}
                  {visibleColumns.structured_task_grade && (
                    <TableHead className="font-proxima-bold">Workshop Grade</TableHead>
                  )}
                  {visibleColumns.admission && (
                    <TableHead>
                      {renderSortableFilterableHeader('admission', 'program_admission_status', 'Admission', 'program_admission_status')}
                    </TableHead>
                  )}
                  {visibleColumns.deliberation && (
                    <TableHead>
                      {renderSortableFilterableHeader('deliberation', 'deliberation', 'Deliberation', 'deliberation')}
                    </TableHead>
                  )}
                  {visibleColumns.age && (
                    <TableHead className="font-proxima-bold">Age</TableHead>
                  )}
                  {visibleColumns.gender && (
                    <TableHead className="font-proxima-bold">Gender</TableHead>
                  )}
                  {visibleColumns.race && (
                    <TableHead className="font-proxima-bold">Race/Ethnicity</TableHead>
                  )}
                  {visibleColumns.education && (
                    <TableHead className="font-proxima-bold">Education</TableHead>
                  )}
                  {visibleColumns.referral && (
                    <TableHead className="font-proxima-bold">Referral</TableHead>
                  )}
                  {visibleColumns.notes && (
                    <TableHead className="font-proxima-bold">Notes</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApplications.map((app) => (
                  <ApplicationRow
                    key={app.applicant_id}
                    app={app}
                    visibleColumns={visibleColumns}
                    isSelected={selectedApplicants.includes(app.applicant_id)}
                    onSelect={handleSelectApplicant}
                    onViewApplication={handleViewApplication}
                    onOpenNotes={openNotesModal}
                    onDeliberationChange={handleDeliberationChange}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 font-proxima text-lg">No applicants found</p>
            <p className="text-gray-400 font-proxima text-sm mt-1">Try adjusting your filters</p>
            {(applicationFilters.status || applicationFilters.final_status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.deliberation) && (
              <Button
                variant="outline"
                className="mt-4 font-proxima"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer with Pagination or Load All */}
      {applications?.applications?.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          {loadAllMode ? (
            /* Load All Mode - Show count and return button */
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-proxima">
                Showing all {totalItems} applicants
              </span>
              <Button
                variant="outline"
                onClick={onReturnToPagination}
                className="font-proxima"
              >
                ← Back to Paginated View
              </Button>
            </div>
          ) : (
            /* Normal Mode - Show pagination and Load All button */
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                />
              </div>
              {totalItems > pageSize && (
                <Button
                  variant="outline"
                  onClick={onLoadAll}
                  className="font-proxima ml-4"
                >
                  Load All {totalItems} Applicants
                </Button>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ApplicationsTab;

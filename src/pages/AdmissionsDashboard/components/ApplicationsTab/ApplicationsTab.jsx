import React, { useMemo } from 'react';
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
  info_session_status: [
    { value: '', label: 'All' },
    { value: 'registered', label: 'Registered' },
    { value: 'attended', label: 'Attended' },
    { value: 'no_show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  workshop_status: [
    { value: '', label: 'All' },
    { value: 'registered', label: 'Registered' },
    { value: 'attended', label: 'Attended' },
    { value: 'no_show', label: 'No Show' },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  program_admission_status: [
    { value: '', label: 'All' },
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

const ApplicationsTab = ({
  loading,
  applications,
  cohorts,
  applicationFilters,
  setApplicationFilters,
  nameSearchInput,
  setNameSearchInput,
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
  token
}) => {
  const columnLabels = {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
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

  // Sort applications
  const sortedApplications = useMemo(() => {
    if (!applications?.applications) return [];
    
    let sorted = [...applications.applications];
    
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
  }, [applications, columnSort]);

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplicants(applications.applications?.map(app => app.applicant_id) || []);
    } else {
      setSelectedApplicants([]);
    }
  };

  // Handle individual selection
  const handleSelectApplicant = (applicantId, checked) => {
    if (checked) {
      setSelectedApplicants([...selectedApplicants, applicantId]);
    } else {
      setSelectedApplicants(selectedApplicants.filter(id => id !== applicantId));
    }
  };

  // Handle CSV export
  const handleExportCSV = async () => {
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

      // Create CSV content
      const headers = ['Name', 'Email', 'Phone', 'Status', 'Assessment', 'Info Session', 'Workshop', 'Admission', 'Created'];
      const rows = detailedApplicantData.map(app => [
        `${app.first_name || ''} ${app.last_name || ''}`,
        app.email || '',
        app.phone_number || '',
        app.status || '',
        app.recommendation || app.final_status || '',
        app.info_session_status || '',
        app.workshop_status || '',
        app.program_admission_status || '',
        app.created_at ? new Date(app.created_at).toLocaleDateString() : ''
      ]);

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
  };

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
        <DropdownMenu>
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
              <DropdownMenuItem
                key={option.value}
                className={`cursor-pointer ${currentValue === option.value ? 'bg-[#4242ea]/10 text-[#4242ea]' : ''}`}
                onClick={() => {
                  setApplicationFilters({ 
                    ...applicationFilters, 
                    [filterKey]: option.value,
                    offset: 0 
                  });
                }}
              >
                {currentValue === option.value && <span className="mr-2">✓</span>}
                {option.label}
              </DropdownMenuItem>
            ))}
            {isFiltered && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 hover:text-red-700"
                  onClick={() => {
                    setApplicationFilters({ 
                      ...applicationFilters, 
                      [filterKey]: '',
                      offset: 0 
                    });
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

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4242ea] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-proxima">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border-b border-gray-200 shrink-0">
        {/* Search */}
        <Input
          type="text"
          placeholder="Search by name..."
          value={nameSearchInput}
          onChange={(e) => setNameSearchInput(e.target.value)}
          className="w-[250px] font-proxima"
        />

        {/* Cohort Filter */}
        <Select
          value={applicationFilters.cohort_id || '_all'}
          onValueChange={(value) => setApplicationFilters({ ...applicationFilters, cohort_id: value === '_all' ? '' : value, offset: 0 })}
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
        <DropdownMenu>
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
                onCheckedChange={(checked) => setVisibleColumns({ ...visibleColumns, [column]: checked })}
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

        {/* Export CSV */}
        <Button
          variant="outline"
          className="font-proxima"
          disabled={selectedApplicants.length === 0}
          onClick={handleExportCSV}
        >
          Export CSV ({selectedApplicants.length})
        </Button>

        {/* Refresh */}
        <Button variant="outline" onClick={fetchApplications} className="font-proxima">
          Refresh
        </Button>

        {/* Active Filters Indicator */}
        {(applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.deliberation) && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500 font-proxima">Active filters:</span>
            {applicationFilters.status && (
              <Badge className="bg-blue-100 text-blue-700 font-proxima cursor-pointer hover:bg-blue-200" onClick={() => setApplicationFilters({ ...applicationFilters, status: '', offset: 0 })}>
                Status: {formatStatus(applicationFilters.status)} ✕
              </Badge>
            )}
            {applicationFilters.info_session_status && (
              <Badge className="bg-purple-100 text-purple-700 font-proxima cursor-pointer hover:bg-purple-200" onClick={() => setApplicationFilters({ ...applicationFilters, info_session_status: '', offset: 0 })}>
                Info Session: {formatStatus(applicationFilters.info_session_status)} ✕
              </Badge>
            )}
            {applicationFilters.workshop_status && (
              <Badge className="bg-green-100 text-green-700 font-proxima cursor-pointer hover:bg-green-200" onClick={() => setApplicationFilters({ ...applicationFilters, workshop_status: '', offset: 0 })}>
                Workshop: {formatStatus(applicationFilters.workshop_status)} ✕
              </Badge>
            )}
            {applicationFilters.program_admission_status && (
              <Badge className="bg-yellow-100 text-yellow-700 font-proxima cursor-pointer hover:bg-yellow-200" onClick={() => setApplicationFilters({ ...applicationFilters, program_admission_status: '', offset: 0 })}>
                Admission: {formatStatus(applicationFilters.program_admission_status)} ✕
              </Badge>
            )}
            {applicationFilters.deliberation && (
              <Badge className="bg-orange-100 text-orange-700 font-proxima cursor-pointer hover:bg-orange-200" onClick={() => setApplicationFilters({ ...applicationFilters, deliberation: '', offset: 0 })}>
                Deliberation: {formatStatus(applicationFilters.deliberation)} ✕
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 font-proxima h-6 px-2"
              onClick={() => setApplicationFilters({
                ...applicationFilters,
                status: '',
                info_session_status: '',
                workshop_status: '',
                program_admission_status: '',
                deliberation: '',
                offset: 0
              })}
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {applications?.applications?.length > 0 ? (
        <div className="flex-1 bg-white overflow-auto">
          <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedApplicants.length === applications.applications?.length && applications.applications?.length > 0}
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
                  {visibleColumns.status && (
                    <TableHead>
                      {renderSortableFilterableHeader('status', 'status', 'Status', 'status')}
                    </TableHead>
                  )}
                  {visibleColumns.assessment && (
                    <TableHead className="font-proxima-bold">Assessment</TableHead>
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
                  <TableRow key={app.applicant_id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedApplicants.includes(app.applicant_id)}
                        onCheckedChange={(checked) => handleSelectApplicant(app.applicant_id, checked)}
                      />
                    </TableCell>
                    {visibleColumns.name && (
                      <TableCell className="font-medium font-proxima">
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
                          onValueChange={(value) => handleDeliberationChange(app.applicant_id, value === '_none' ? '' : value)}
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
                        {app.age || '-'}
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
                      <TableCell className="font-proxima text-gray-600 max-w-[150px] truncate" title={app.how_did_you_hear}>
                        {app.how_did_you_hear || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.notes && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openNotesModal(app)}
                          className="font-proxima text-[#4242ea] hover:text-[#3333d1]"
                        >
                          📝
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      ) : (
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 font-proxima text-lg">No applicants found</p>
            <p className="text-gray-400 font-proxima text-sm mt-1">Try adjusting your search or filters</p>
            {(applicationFilters.status || applicationFilters.info_session_status || applicationFilters.workshop_status || applicationFilters.program_admission_status || applicationFilters.deliberation || nameSearchInput) && (
              <Button
                variant="outline"
                className="mt-4 font-proxima"
                onClick={() => {
                  setNameSearchInput('');
                  setApplicationFilters({
                    ...applicationFilters,
                    status: '',
                    info_session_status: '',
                    workshop_status: '',
                    program_admission_status: '',
                    deliberation: '',
                    ready_for_workshop_invitation: false,
                    name_search: '',
                    offset: 0
                  });
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer - Fixed at bottom */}
      {applications?.applications?.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <span className="text-sm text-gray-600 font-proxima">
            Showing {applications.applications.length} of {applications.total} applicants
          </span>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;


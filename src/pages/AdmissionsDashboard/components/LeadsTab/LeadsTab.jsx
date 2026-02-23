import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../../../../components/ui/dropdown-menu';
import { Upload, Settings, RefreshCw, ChevronDown, Users } from 'lucide-react';
import LeadImportModal from './LeadImportModal';
import EmailListsManager from './EmailListsManager';
import SourceConfigManager from './SourceConfigManager';

// Filter options for columns
const filterOptions = {
  status: [
    { value: 'active', label: 'Active' },
    { value: 'converted', label: 'Converted' },
    { value: 'builder', label: 'Builder' },
    { value: 'withdrawn', label: 'Withdrawn' },
  ],

  attended_event: [
    { value: '', label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ],
};

// Status badge styling helper
const getStatusBadgeClasses = (status) => {
  const styles = {
    'active': 'bg-blue-100 text-blue-800',
    'converted': 'bg-green-100 text-green-800',
    'builder': 'bg-purple-100 text-purple-800',
    'withdrawn': 'bg-gray-100 text-gray-800'
  };
  return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// Format status for display
const formatStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

// Format phone number
const formatPhoneNumber = (phone) => {
  if (!phone) return '-';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Pagination component (matching ApplicationsTab)
const Pagination = ({ currentPage, totalPages, totalItems, pageSize, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      }
      
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 font-proxima">
        Showing {startItem}-{endItem} of {totalItems} leads
      </span>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="font-proxima h-8 px-2"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ← Prev
        </Button>
        
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
        
        <Button
          variant="outline"
          size="sm"
          className="font-proxima h-8 px-2"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

const LeadsTab = ({ token }) => {
  // State
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [emailLists, setEmailLists] = useState([]);
  const [sourceConfig, setSourceConfig] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    status: [],
    source_type: '',
    list_id: '',
    attended_event: '',
    search: ''
  });


  // Column sorting
  const [columnSort, setColumnSort] = useState({ column: 'first_captured_at', direction: 'desc' });
  
  // Modals
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Selected leads for bulk actions
  const [selectedLeads, setSelectedLeads] = useState([]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (filters.status && filters.status.length > 0) {
        filters.status.forEach(s => params.append('status[]', s));
      }
      if (filters.source_type) params.append('source_type', filters.source_type);
      if (filters.list_id) params.append('list_id', filters.list_id);
      if (filters.attended_event) params.append('attended_event', filters.attended_event);
      if (filters.search) params.append('search', filters.search);

      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.limit, filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching lead stats:', error);
    }
  }, [token]);

  // Fetch email lists
  const fetchEmailLists = useCallback(async () => {
    console.log('📧 fetchEmailLists called, token:', token ? 'present' : 'missing');
    if (!token) return;
    
    try {
      const url = `${import.meta.env.VITE_API_URL}/api/admissions/leads/email-lists`;
      console.log('📧 Fetching from:', url);
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      
      console.log('📧 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Email lists received:', data);
        setEmailLists(data || []);
      } else {
        console.error('📧 Failed to fetch email lists:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Error fetching email lists:', error);
    }
  }, [token]);

  // Fetch source config
  const fetchSourceConfig = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/source-config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSourceConfig(data || []);
      }
    } catch (error) {
      console.error('Error fetching source config:', error);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchEmailLists();
      fetchSourceConfig();
    }
  }, [token]);

  // Fetch leads when filters or page changes
  useEffect(() => {
    if (token) {
      fetchLeads();
    }
  }, [token, filters, pagination.page, pagination.limit]);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Handle clear filter
  const handleClearFilter = useCallback((filterKey) => {
    setFilters(prev => ({ ...prev, [filterKey]: filterKey === 'status' ? [] : '' }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);


  // Handle column sort
  const handleColumnSort = useCallback((column) => {
    setColumnSort(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    // Don't clear selection on page change - user may want to select across pages
  };

  // Handle select all - fetches ALL matching lead IDs for current filter
  const handleSelectAll = async (checked) => {
    if (checked) {
      // Fetch all lead IDs matching current filter (no pagination limit)
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '10000', // Large limit to get all
          ids_only: 'true' // Signal to backend we only need IDs
        });
        if (filters.status && filters.status.length > 0) {
          filters.status.forEach(s => params.append('status[]', s));
        }

        if (filters.search) params.append('search', filters.search);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admissions/leads?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Get all lead IDs from response
          const allIds = (data.leads || []).map(l => l.lead_id);
          setSelectedLeads(allIds);
        }
      } catch (error) {
        console.error('Error fetching all lead IDs:', error);
        // Fallback to current page selection
        setSelectedLeads(sortedLeads.map(l => l.lead_id));
      }
    } else {
      setSelectedLeads([]);
    }
  };

  // Handle individual selection
  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  // Handle status update
  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/${leadId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      
      if (response.ok) {
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  // Handle email list update for a lead
  const handleEmailListsUpdate = async (leadId, listIds) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/${leadId}/lists`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ list_ids: listIds })
        }
      );
      
      if (response.ok) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Error updating lead email lists:', error);
    }
  };

  // Refresh all data
  const handleRefresh = () => {
    fetchLeads();
    fetchStats();
    fetchEmailLists();
    fetchSourceConfig();
  };

  // Bulk add selected leads to an email list
  const handleBulkAddToList = async (listId) => {
    if (selectedLeads.length === 0) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/leads/email-lists/${listId}/add-leads`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ lead_ids: selectedLeads })
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log(`Added ${result.added} leads to list`);
        setSelectedLeads([]); // Clear selection
        fetchLeads(); // Refresh table
      } else {
        console.error('Failed to add leads to list');
      }
    } catch (error) {
      console.error('Error bulk adding leads to list:', error);
    }
  };

  // Get unique source types for filter
  const uniqueSourceTypes = useMemo(() => {
    return [...new Set(sourceConfig.map(s => s.source_type).filter(Boolean))];
  }, [sourceConfig]);

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set();
    leads.forEach(lead => {
      if (lead.primary_source?.source_name) {
        sources.add(lead.primary_source.source_name);
      }
    });
    return [...sources].sort();
  }, [leads]);

  // Sort leads client-side
  const sortedLeads = useMemo(() => {
    if (!leads || leads.length === 0) return [];
    
    const sorted = [...leads];
    
    if (columnSort.column) {
      sorted.sort((a, b) => {
        let aVal, bVal;
        
        switch (columnSort.column) {
          case 'source':
            aVal = a.primary_source?.source_name || '';
            bVal = b.primary_source?.source_name || '';
            break;
          case 'first_captured_at':
            aVal = a.first_captured_at ? new Date(a.first_captured_at).getTime() : 0;
            bVal = b.first_captured_at ? new Date(b.first_captured_at).getTime() : 0;
            break;
          case 'first_name':
            aVal = (a.first_name || '').toLowerCase();
            bVal = (b.first_name || '').toLowerCase();
            break;
          case 'last_name':
            aVal = (a.last_name || '').toLowerCase();
            bVal = (b.last_name || '').toLowerCase();
            break;
          case 'status':
            aVal = (a.status || '').toLowerCase();
            bVal = (b.status || '').toLowerCase();
            break;
          case 'email_lists':
            aVal = a.email_lists?.length || 0;
            bVal = b.email_lists?.length || 0;
            break;
          case 'attended_event':
            aVal = a.attended_event ? 1 : 0;
            bVal = b.attended_event ? 1 : 0;
            break;
          default:
            aVal = a[columnSort.column] || '';
            bVal = b[columnSort.column] || '';
        }
        
        if (aVal < bVal) return columnSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return columnSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return sorted;
  }, [leads, columnSort]);

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (columnSort.column !== column) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return <span className="text-[#4242ea] ml-1">{columnSort.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  // Render sortable header (sort only)
  const renderSortableHeader = (column, label) => {
    return (
      <div 
        className="flex items-center cursor-pointer hover:text-[#4242ea] select-none"
        onClick={() => handleColumnSort(column)}
      >
        <span className="font-proxima-bold">{label}</span>
        {renderSortIndicator(column)}
      </div>
    );
  };

  // Render sortable + filterable column header
  // multiSelect=true: filter value is an array, each option toggles independently

  const renderSortableFilterableHeader = (column, filterKey, label, options, sortKey = null, multiSelect = false) => {
    const currentValue = filters[filterKey];
    const isFiltered = multiSelect ? currentValue.length > 0 : currentValue !== '';
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
            {options.map((option) => {
              if (multiSelect) {
                const isChecked = currentValue.includes(option.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={isChecked}
                    onCheckedChange={() => {
                      const next = isChecked
                        ? currentValue.filter(v => v !== option.value)
                        : [...currentValue, option.value];
                      handleFilterChange(filterKey, next);
                    }}
                    onSelect={(e) => e.preventDefault()}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                );
              }
              return (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={currentValue === option.value}
                  onCheckedChange={() => handleFilterChange(filterKey, option.value)}
                  onSelect={(e) => e.preventDefault()}
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              );
            })}
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


  // Dynamic source filter options
  const sourceFilterOptions = useMemo(() => {
    const options = [{ value: '', label: 'All' }];
    uniqueSourceTypes.forEach(type => {
      options.push({ value: type, label: type.replace('_', ' ') });
    });
    return options;
  }, [uniqueSourceTypes]);

  // Dynamic email list filter options
  const emailListFilterOptions = useMemo(() => {
    const options = [{ value: '', label: 'All' }];
    emailLists.forEach(list => {
      options.push({ value: list.list_id.toString(), label: list.name });
    });
    return options;
  }, [emailLists]);

  // Check if any filters are active
  const hasActiveFilters = filters.status.length > 0 || filters.source_type || filters.list_id || filters.attended_event;


  // Clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFilters({
      status: [],
      source_type: '',
      list_id: '',
      attended_event: '',
      search: filters.search // Keep search
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.search]);


  // Loading skeleton
  if (loading && leads.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 border-b border-gray-200 shrink-0">
          <div className="w-[300px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-[140px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-[160px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-[160px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-[160px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="ml-auto flex gap-2">
            <div className="w-[100px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-[120px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="flex-1 bg-white overflow-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-12"><div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-40 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-28 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div></TableHead>
                <TableHead><div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, index) => (
                <TableRow key={index} className="animate-pulse">
                  <TableCell><div className="h-4 w-4 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-32 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-20 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-24 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-48 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-4 w-28 bg-gray-200 rounded"></div></TableCell>
                  <TableCell><div className="h-6 w-20 bg-gray-200 rounded-full"></div></TableCell>
                  <TableCell><div className="h-6 w-16 bg-gray-200 rounded-full"></div></TableCell>
                  <TableCell><div className="h-4 w-12 bg-gray-200 rounded"></div></TableCell>
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
              <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
              ))}
              <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <div className="flex items-center gap-6 bg-white px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-proxima">Total:</span>
          <span className="font-semibold font-proxima">{stats?.total_leads || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-500 font-proxima">Active:</span>
          <span className="font-semibold text-blue-600 font-proxima">{stats?.active || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-500 font-proxima">Converted:</span>
          <span className="font-semibold text-green-600 font-proxima">{stats?.converted || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-purple-500 font-proxima">Builders:</span>
          <span className="font-semibold text-purple-600 font-proxima">{stats?.builders || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-proxima">Withdrawn:</span>
          <span className="font-semibold text-gray-600 font-proxima">{stats?.withdrawn || 0}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 border-b border-gray-200 shrink-0">
        {/* Search */}
        <div className="relative w-[300px]">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full font-proxima pr-8"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
          {!filters.search && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Bulk Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="font-proxima gap-2"
                disabled={selectedLeads.length === 0}
              >
                <Users className="h-4 w-4" />
                Bulk Actions {selectedLeads.length > 0 && `(${selectedLeads.length})`}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-proxima w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Add to Email List</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="font-proxima">
                  {emailLists.length > 0 ? (
                    emailLists.map(list => (
                      <DropdownMenuItem 
                        key={list.list_id}
                        onClick={() => handleBulkAddToList(list.list_id)}
                      >
                        {list.name}
                        {list.member_count > 0 && (
                          <span className="ml-auto text-gray-400 text-xs">
                            {list.member_count} members
                          </span>
                        )}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                      No email lists created yet.
                      <br />
                      <span className="text-xs">Create one in Settings.</span>
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setSelectedLeads([])}
                className="text-gray-500"
              >
                Clear Selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="font-proxima gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          
          <Button variant="outline" onClick={handleRefresh} className="font-proxima gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button 
            onClick={() => setImportModalOpen(true)} 
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima gap-2"
          >
            <Upload className="h-4 w-4" />
            Import Leads
          </Button>
        </div>
      </div>

      {/* Selection & Active Filters Display */}
      {(hasActiveFilters || selectedLeads.length > 0) && (
        <div className="flex items-center gap-2 bg-white px-4 py-2 border-b border-gray-200 shrink-0">
          {selectedLeads.length > 0 && (
            <>
              <Badge className="bg-[#4242ea] text-white font-proxima">
                {selectedLeads.length} of {pagination.total} selected
              </Badge>
              <span className="text-gray-300">|</span>
            </>
          )}
          {hasActiveFilters && <span className="text-sm text-gray-500 font-proxima">Active filters:</span>}
          {filters.status.length > 0 && (
            <Badge className="bg-blue-100 text-blue-700 font-proxima cursor-pointer hover:bg-blue-200" onClick={() => handleClearFilter('status')}>
              Status: {filters.status.map(s => formatStatus(s)).join(', ')} ✕
            </Badge>
          )}

          {filters.source_type && (
            <Badge className="bg-indigo-100 text-indigo-700 font-proxima cursor-pointer hover:bg-indigo-200" onClick={() => handleClearFilter('source_type')}>
              Source: {filters.source_type.replace('_', ' ')} ✕
            </Badge>
          )}
          {filters.list_id && (
            <Badge className="bg-purple-100 text-purple-700 font-proxima cursor-pointer hover:bg-purple-200" onClick={() => handleClearFilter('list_id')}>
              List: {emailLists.find(l => l.list_id.toString() === filters.list_id)?.name || filters.list_id} ✕
            </Badge>
          )}
          {filters.attended_event && (
            <Badge className="bg-green-100 text-green-700 font-proxima cursor-pointer hover:bg-green-200" onClick={() => handleClearFilter('attended_event')}>
              Attended: {filters.attended_event === 'true' ? 'Yes' : 'No'} ✕
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

      {/* Settings Panel */}
      {settingsOpen && (
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-6 max-w-6xl">
            <EmailListsManager 
              token={token} 
              emailLists={emailLists} 
              onUpdate={fetchEmailLists} 
            />
            <SourceConfigManager 
              token={token} 
              sourceConfig={sourceConfig} 
              onUpdate={fetchSourceConfig} 
            />
          </div>
        </div>
      )}

      {/* Table */}
      {sortedLeads.length > 0 ? (
        <div className="flex-1 bg-white overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto relative">
            <Table className="w-full min-w-max">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedLeads.length === 0 
                          ? false 
                          : selectedLeads.length === pagination.total 
                            ? true 
                            : "indeterminate"
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    {renderSortableFilterableHeader('source', 'source_type', 'Source', sourceFilterOptions, 'source')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('first_captured_at', 'Date Created')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('first_name', 'First Name')}
                  </TableHead>
                  <TableHead>
                    {renderSortableHeader('last_name', 'Last Name')}
                  </TableHead>
                  <TableHead className="font-proxima-bold">Email</TableHead>
                  <TableHead className="font-proxima-bold">Phone</TableHead>
                  <TableHead>
                    {renderSortableFilterableHeader('status', 'status', 'Status', filterOptions.status, 'status', true)}
                  </TableHead>
                  <TableHead>
                    {renderSortableFilterableHeader('email_lists', 'list_id', 'Email Lists', emailListFilterOptions, 'email_lists')}
                  </TableHead>
                  <TableHead>
                    {renderSortableFilterableHeader('attended_event', 'attended_event', 'Attended Event', filterOptions.attended_event, 'attended_event')}
                  </TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedLeads.map((lead) => (
                  <TableRow key={lead.lead_id} className="hover:bg-gray-50">
                    <TableCell>
                      <Checkbox 
                        checked={selectedLeads.includes(lead.lead_id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.lead_id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-proxima text-gray-600">
                      {lead.primary_source?.source_name || '-'}
                    </TableCell>
                    <TableCell className="font-proxima text-gray-600">
                      {formatDate(lead.first_captured_at)}
                    </TableCell>
                    <TableCell className="font-proxima text-gray-600">
                      {lead.first_name || '-'}
                    </TableCell>
                    <TableCell className="font-proxima text-gray-600">
                      {lead.last_name || '-'}
                    </TableCell>
                    <TableCell className="font-proxima text-[#4242ea]">
                      <a href={`mailto:${lead.email}`} className="hover:underline">
                        {lead.email}
                      </a>
                    </TableCell>
                    <TableCell className="font-proxima text-gray-600">
                      {formatPhoneNumber(lead.phone)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge 
                            className={`${getStatusBadgeClasses(lead.status)} cursor-pointer font-proxima`}
                          >
                            {formatStatus(lead.status)}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="font-proxima">
                          {lead.status !== 'converted' && lead.status !== 'builder' && (
                            <>
                              <DropdownMenuCheckboxItem
                                checked={lead.status === 'active'}
                                onCheckedChange={() => handleStatusUpdate(lead.lead_id, 'active')}
                              >
                                Active
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={lead.status === 'withdrawn'}
                                onCheckedChange={() => handleStatusUpdate(lead.lead_id, 'withdrawn')}
                              >
                                Withdrawn
                              </DropdownMenuCheckboxItem>
                            </>
                          )}
                          {(lead.status === 'converted' || lead.status === 'builder') && (
                            <div className="px-2 py-1 text-sm text-gray-500">
                              Status is auto-managed
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div className="flex flex-wrap gap-1 cursor-pointer min-w-[100px]">
                            {lead.email_lists && lead.email_lists.length > 0 ? (
                              lead.email_lists.map(list => (
                                <Badge key={list.list_id} variant="outline" className="text-xs font-proxima">
                                  {list.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm font-proxima">None</span>
                            )}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="font-proxima">
                          {emailLists.map(list => (
                            <DropdownMenuCheckboxItem
                              key={list.list_id}
                              checked={lead.email_lists?.some(l => l.list_id === list.list_id)}
                              onCheckedChange={(checked) => {
                                const currentIds = lead.email_lists?.map(l => l.list_id) || [];
                                const newIds = checked 
                                  ? [...currentIds, list.list_id]
                                  : currentIds.filter(id => id !== list.list_id);
                                handleEmailListsUpdate(lead.lead_id, newIds);
                              }}
                            >
                              {list.name}
                            </DropdownMenuCheckboxItem>
                          ))}
                          {emailLists.length === 0 && (
                            <div className="px-2 py-1 text-sm text-gray-500">
                              No lists created yet
                            </div>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      {lead.attended_event ? (
                        <Badge className="bg-green-100 text-green-800 font-proxima">Yes</Badge>
                      ) : (
                        <span className="text-gray-400 font-proxima">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 font-proxima text-lg">No leads found</p>
            <p className="text-gray-400 font-proxima text-sm mt-1">
              {hasActiveFilters || filters.search
                ? 'Try adjusting your filters'
                : 'Import leads to get started'}
            </p>
            {!hasActiveFilters && !filters.search && (
              <Button
                onClick={() => setImportModalOpen(true)}
                className="mt-4 bg-[#4242ea] hover:bg-[#3333d1] font-proxima"
              >
                Import Leads
              </Button>
            )}
            {hasActiveFilters && (
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

      {/* Footer with Pagination */}
      {sortedLeads.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 shrink-0">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Import Modal */}
      <LeadImportModal 
        open={importModalOpen} 
        onClose={() => setImportModalOpen(false)}
        token={token}
        onSuccess={() => {
          fetchLeads();
          fetchStats();
          fetchSourceConfig();
        }}
      />
    </div>
  );
};

export default LeadsTab;

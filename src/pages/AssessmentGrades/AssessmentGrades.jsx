import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'sonner';

// Import new components
import FiltersSection from './components/FiltersSection';
import ActionsBar from './components/ActionsBar';
import GradesTable from './components/GradesTable';
import GradeViewModal from './GradeViewModal';
import MassEmailModal from './MassEmailModal';

const AssessmentGrades = () => {
  const { user, token: authToken } = useAuth();
  const { canAccessPage } = usePermissions();
  const [assessmentGrades, setAssessmentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Editing states for Overview tab
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [editingStrengths, setEditingStrengths] = useState('');
  const [editingGrowthAreas, setEditingGrowthAreas] = useState('');
  const [savingOverview, setSavingOverview] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    cohort: '',
    assessmentPeriod: ''
  });
  const filtersRef = useRef(filters);
  const appliedFiltersRef = useRef(filters);
  const latestGradesRequestIdRef = useRef(0);
  const activeGradesRequestControllerRef = useRef(null);
  const [availableCohorts, setAvailableCohorts] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);

  // Pagination - Increased limit to get more records per request
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 100,
    offset: 0,
    hasMore: false
  });

  // Check if user has admin access
  useEffect(() => {
    if (!user || !canAccessPage('assessment_grades')) {
      setError('Access denied. Assessment grades permission required.');
      setLoading(false);
      return;
    }
    
    fetchInitialData();
  }, [user, authToken, canAccessPage]);

  useEffect(() => {
    return () => {
      if (activeGradesRequestControllerRef.current) {
        activeGradesRequestControllerRef.current.abort();
      }
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchAvailableCohorts(),
        fetchAvailablePeriods(),
        fetchAssessmentGrades(true)
      ]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCohorts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/cohorts`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cohorts');
      }

      const data = await response.json();
      setAvailableCohorts(data.cohorts || []);
    } catch (err) {
      console.error('Error fetching cohorts:', err);
    }
  };

  const fetchAvailablePeriods = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/periods`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment periods');
      }

      const data = await response.json();
      setAvailablePeriods(data.periods || []);
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  const fetchAssessmentGrades = async (resetOffset = false, filtersToUse = filters) => {
    const requestId = ++latestGradesRequestIdRef.current;

    // Cancel older in-flight request so only the latest filter/query wins
    if (activeGradesRequestControllerRef.current) {
      activeGradesRequestControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeGradesRequestControllerRef.current = controller;

    try {
      setLoading(true);
      const currentOffset = resetOffset ? 0 : pagination.offset;
      
      const queryParams = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: currentOffset.toString()
      });

      // Add filters
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessment grades');
      }

      const data = await response.json();

      // Ignore stale responses that return out of order
      if (requestId !== latestGradesRequestIdRef.current) {
        return;
      }
      
      // Debug pagination
      console.log('📊 Pagination Debug:', {
        resetOffset,
        requestedLimit: pagination.limit,
        requestedOffset: resetOffset ? 0 : pagination.offset,
        receivedRecords: data.data?.length || 0,
        currentTotal: assessmentGrades.length,
        paginationData: data.pagination,
        filters: filtersToUse,
        queryUrl: `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades?${queryParams}`
      });
      
      if (resetOffset) {
        setAssessmentGrades(data.data || []);
        setPagination(prev => ({ ...prev, offset: 0, ...data.pagination }));
      } else {
        setAssessmentGrades(prev => [...prev, ...(data.data || [])]);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
      
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching assessment grades:', err);
      setError('Failed to fetch assessment grades');
    } finally {
      if (requestId === latestGradesRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const nextFilters = { ...prev, [key]: value };
      filtersRef.current = nextFilters;
      return nextFilters;
    });
  };

  const applyFilters = () => {
    appliedFiltersRef.current = { ...filtersRef.current };
    setSelectedUsers(new Set());
    fetchAssessmentGrades(true, appliedFiltersRef.current);
  };

  const clearFilters = () => {
    const resetFilters = {
      cohort: '',
      assessmentPeriod: ''
    };
    setFilters(resetFilters);
    filtersRef.current = resetFilters;
    appliedFiltersRef.current = resetFilters;
    setSelectedUsers(new Set());
    fetchAssessmentGrades(true, resetFilters);
  };

  const handleUserSelection = (userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedUsers(new Set(assessmentGrades.map(grade => grade.user_id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const viewGrade = (grade) => {
    setSelectedGrade(grade);
    setShowGradeModal(true);
  };

  const handleSendEmails = () => {
    if (selectedUsers.size === 0) {
      toast.warning('No Users Selected', {
        description: 'Please select at least one user to send emails to.',
        duration: 4000,
      });
      return;
    }
    setShowEmailModal(true);
  };

  const exportData = async (format = 'csv') => {
    try {
      const queryParams = new URLSearchParams({ format });
      
      // Add current filters to export
      Object.entries(appliedFiltersRef.current).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/export?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `assessment-grades-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `assessment-grades-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Export Failed', {
        description: 'Failed to export data. Please try again.',
        duration: 5000,
      });
    }
  };

  const loadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
      fetchAssessmentGrades(false, appliedFiltersRef.current);
    }
  };

  const loadAllRecords = async () => {
    try {
      setLoading(true);
      
      console.log('📊 Loading all assessment grades with no limit...');
      
      // Fetch without any limit to get all records
      const queryParams = new URLSearchParams();

      // Add filters but NO limit/offset
      Object.entries(appliedFiltersRef.current).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      // Don't add limit or offset parameters at all
      const url = `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log('🔗 Load All URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all assessment grades');
      }

      const data = await response.json();
      
      console.log(`📊 Load All - API returned ${data.data?.length || 0} records`);
      console.log('📊 Load All - Pagination data:', data.pagination);
      
      setAssessmentGrades(data.data || []);
      setPagination({
        total: data.pagination?.total || data.data?.length || 0,
        limit: data.data?.length || 0,
        offset: 0,
        hasMore: false
      });
      
      console.log(`✅ Load All - Successfully loaded ${data.data?.length || 0} assessment grades`);
      
    } catch (err) {
      console.error('Error in Load All:', err);
      setError('Failed to load all assessment grades');
    } finally {
      setLoading(false);
    }
  };

  // Overview editing functions
  const handleStartEditing = (grade) => {
    setIsEditingOverview(true);
    setEditingStrengths(grade.strengths_summary || '');
    setEditingGrowthAreas(grade.growth_areas_summary || '');
  };

  const handleCancelEditing = () => {
    setIsEditingOverview(false);
    setEditingStrengths('');
    setEditingGrowthAreas('');
  };

  const handleSaveOverview = async (userId) => {
    try {
      setSavingOverview(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/update-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          userId: userId,
          strengths_summary: editingStrengths,
          growth_areas_summary: editingGrowthAreas
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }

      const result = await response.json();
      
      // Update the local state
      setAssessmentGrades(prev => prev.map(grade => 
        grade.user_id === userId 
          ? { ...grade, strengths_summary: editingStrengths, growth_areas_summary: editingGrowthAreas }
          : grade
      ));

      // Update selectedGrade if it's the same user
      if (selectedGrade && selectedGrade.user_id === userId) {
        setSelectedGrade(prev => ({
          ...prev,
          strengths_summary: editingStrengths,
          growth_areas_summary: editingGrowthAreas
        }));
      }

      setIsEditingOverview(false);
      setEditingStrengths('');
      setEditingGrowthAreas('');
      
      toast.success('Feedback Updated!', {
        description: 'The feedback has been successfully updated in the database.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Update Failed', {
        description: 'Failed to update feedback. Please try again.',
        duration: 5000,
      });
    } finally {
      setSavingOverview(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="bg-card border border-destructive rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Filters */}
        <FiltersSection
          filters={filters}
          availableCohorts={availableCohorts}
          availablePeriods={availablePeriods}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onClearFilters={clearFilters}
        />

        {/* Actions Bar */}
        <ActionsBar
          selectedUsers={selectedUsers}
          assessmentGrades={assessmentGrades}
          loading={loading}
          onSelectAll={handleSelectAll}
          onSendEmails={handleSendEmails}
          onLoadAllRecords={loadAllRecords}
          onExportData={exportData}
          onRefresh={() => fetchAssessmentGrades(true, appliedFiltersRef.current)}
        />

        {/* Pagination Info */}
        {assessmentGrades.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-2">
            Showing {assessmentGrades.length} of {pagination.total} assessment grades
            {pagination.hasMore && (
              <span className="text-primary font-medium"> • {pagination.total - assessmentGrades.length} more available</span>
            )}
          </div>
        )}

        {/* Assessment Grades Table */}
        <GradesTable
          assessmentGrades={assessmentGrades}
          selectedUsers={selectedUsers}
          loading={loading}
          pagination={pagination}
          onSelectAll={handleSelectAll}
          onUserSelection={handleUserSelection}
          onViewGrade={viewGrade}
          onLoadMore={loadMore}
          onLoadAllRecords={loadAllRecords}
        />

        {/* Grade View Modal */}
        <GradeViewModal
          isOpen={showGradeModal}
          grade={selectedGrade}
          onClose={() => {
            setShowGradeModal(false);
            setSelectedGrade(null);
          }}
          isEditingOverview={isEditingOverview}
          editingStrengths={editingStrengths}
          editingGrowthAreas={editingGrowthAreas}
          savingOverview={savingOverview}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveOverview={handleSaveOverview}
          setEditingStrengths={setEditingStrengths}
          setEditingGrowthAreas={setEditingGrowthAreas}
        />

        {/* Mass Email Modal */}
        <MassEmailModal
          isOpen={showEmailModal}
          selectedUsers={Array.from(selectedUsers)}
          assessmentGrades={assessmentGrades.filter(grade => selectedUsers.has(grade.user_id))}
          authToken={authToken}
          onClose={() => setShowEmailModal(false)}
          onEmailSent={() => {
            setShowEmailModal(false);
            setSelectedUsers(new Set());
          }}
        />
      </div>
    </div>
  );
};

export default AssessmentGrades;
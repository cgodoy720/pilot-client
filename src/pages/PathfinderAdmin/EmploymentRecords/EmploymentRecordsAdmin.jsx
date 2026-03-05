import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';

import StatsBar from './StatsBar';
import EmploymentRecordCard from './EmploymentRecordCard';
import EmploymentRecordForm from './EmploymentRecordForm';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL;
const ADMIN_ENDPOINT = `${API_URL}/api/pathfinder/admin/employment-records`;
const BUILDERS_ENDPOINT = `${API_URL}/api/users/builders`;
const LIMIT = 100;

const DEFAULT_FILTERS = {
  employmentType: '',
  engagementStage: 'active',
  program: '',
  search: '',
};

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time',  label: 'Full-Time' },
  { value: 'part_time',  label: 'Part-Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'freelance',  label: 'Freelance' },
  { value: 'pro_bono',   label: 'Pro Bono' },
];

const STAGE_OPTIONS = [
  { value: 'active',    label: 'Active' },
  { value: 'pipeline',  label: 'Pipeline' },
  { value: 'completed', label: 'Completed' },
  { value: 'ended',     label: 'Ended' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const EmploymentRecordsAdmin = () => {
  const { token } = useAuth();

  // ── Data ──
  const [records, setRecords]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [builders, setBuilders]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // ── Filters ──
  const [filters, setFilters]           = useState(DEFAULT_FILTERS);
  const [excludeProBono, setExcludeProBono] = useState(true);
  const [page, setPage]                 = useState(1);

  // ── Form dialog ──
  const [formOpen, setFormOpen]     = useState(false);
  const [editRecord, setEditRecord] = useState(null); // null = create, object = edit

  // ─── Derived ──────────────────────────────────────────────────────────────

  const displayedRecords = useMemo(() => {
    if (!excludeProBono) return records;
    return records.filter((r) => r.employment_type !== 'pro_bono');
  }, [records, excludeProBono]);

  const uniquePrograms = useMemo(() => {
    const seen = new Set();
    return records
      .map((r) => r.program)
      .filter((p) => p && !seen.has(p) && seen.add(p));
  }, [records]);

  const totalPages = Math.ceil(total / LIMIT);

  // ─── Fetch records ────────────────────────────────────────────────────────

  const fetchRecords = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (filters.employmentType) params.set('employmentType', filters.employmentType);
      if (filters.engagementStage) params.set('engagementStage', filters.engagementStage);
      if (filters.program)         params.set('program', filters.program);
      if (filters.search)          params.set('search', filters.search);

      const res = await fetch(`${ADMIN_ENDPOINT}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch employment records');

      const data = await res.json();
      setRecords(data.records ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error(err);
      setError('Could not load employment records. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [token, filters, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // ─── Fetch builders (once) ────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;

    const fetchBuilders = async () => {
      try {
        const res = await fetch(BUILDERS_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch builders');
        const data = await res.json();
        setBuilders(data);
      } catch (err) {
        console.error('Error fetching builders:', err);
      }
    };

    fetchBuilders();
  }, [token]);

  // ─── Filter helpers ───────────────────────────────────────────────────────

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleShowAll = () => {
    setFilters({ employmentType: '', engagementStage: '', program: '', search: '' });
    setExcludeProBono(false);
    setPage(1);
  };

  // ─── CRUD handlers ────────────────────────────────────────────────────────

  const handleSave = async (formData) => {
    if (editRecord) {
      await handleUpdate(formData);
    } else {
      await handleCreate(formData);
    }
  };

  const handleCreate = async (formData) => {
    const res = await fetch(ADMIN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create record');
    }

    Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Employment record added',
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    setFormOpen(false);
    setEditRecord(null);
    fetchRecords();
  };

  const handleUpdate = async (formData) => {
    const res = await fetch(`${ADMIN_ENDPOINT}/${editRecord.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update record');
    }

    Swal.fire({
      toast: true,
      icon: 'success',
      title: 'Employment record updated',
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    setFormOpen(false);
    setEditRecord(null);
    fetchRecords();
  };

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: 'Delete this record?',
      html: `<span class="text-sm text-gray-600">This will permanently remove <strong>${record.role_title}</strong> for <strong>${record.builder_name}</strong>. This cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${ADMIN_ENDPOINT}/${record.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete record');

      Swal.fire({
        toast: true,
        icon: 'success',
        title: 'Record deleted',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

      fetchRecords();
    } catch (err) {
      console.error(err);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Could not delete record',
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
    }
  };

  const openCreate = () => {
    setEditRecord(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditRecord(null);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Employment Records</h2>
          <p className="text-sm text-gray-500">
            Track Builder engagements — jobs, contracts, freelance work, and own ventures.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-[#4242ea] hover:bg-[#3333d1] text-white flex-shrink-0"
        >
          + Add Record
        </Button>
      </div>

      {/* ── Stats bar ── */}
      <StatsBar records={displayedRecords} total={total} />

      {/* ── Filter bar ── */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">

            {/* Employment Type */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <Label className="text-xs font-medium text-gray-600">Type</Label>
              <Select
                value={filters.employmentType || '__all__'}
                onValueChange={(v) => handleFilterChange('employmentType', v === '__all__' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {EMPLOYMENT_TYPE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Engagement Stage */}
            <div className="flex flex-col gap-1 min-w-[150px]">
              <Label className="text-xs font-medium text-gray-600">Stage</Label>
              <Select
                value={filters.engagementStage || '__all__'}
                onValueChange={(v) => handleFilterChange('engagementStage', v === '__all__' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Stages</SelectItem>
                  {STAGE_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Program */}
            <div className="flex flex-col gap-1 min-w-[160px]">
              <Label className="text-xs font-medium text-gray-600">Program</Label>
              <Select
                value={filters.program || '__all__'}
                onValueChange={(v) => handleFilterChange('program', v === '__all__' ? '' : v)}
                disabled={uniquePrograms.length === 0}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Programs</SelectItem>
                  {uniquePrograms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <Label className="text-xs font-medium text-gray-600">Search</Label>
              <Input
                className="h-8 text-sm"
                placeholder="Builder name, role, company…"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Exclude pro bono checkbox */}
            <div className="flex items-center gap-2 pb-0.5">
              <Checkbox
                id="excludeProBono"
                checked={excludeProBono}
                onCheckedChange={(checked) => setExcludeProBono(Boolean(checked))}
              />
              <Label htmlFor="excludeProBono" className="text-sm text-gray-600 cursor-pointer whitespace-nowrap">
                Exclude pro bono
              </Label>
            </div>

            {/* Show All */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShowAll}
              className="h-8 text-sm whitespace-nowrap"
            >
              Show All
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Results summary ── */}
      {!isLoading && !error && (
        <p className="text-sm text-gray-500">
          Showing <strong className="text-gray-700">{displayedRecords.length}</strong>
          {total > LIMIT && (
            <> of <strong className="text-gray-700">{total}</strong> total</>
          )}{' '}
          record{displayedRecords.length !== 1 ? 's' : ''}
          {excludeProBono && records.some((r) => r.employment_type === 'pro_bono') && (
            <span className="text-gray-400"> (pro bono hidden)</span>
          )}
        </p>
      )}

      {/* ── Card grid ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          Loading records…
        </div>
      ) : displayedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
          <span className="text-3xl">📋</span>
          <p className="text-sm">No employment records match the current filters.</p>
          <Button variant="ghost" size="sm" onClick={handleShowAll} className="text-[#4242ea]">
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecords.map((record) => (
            <EmploymentRecordCard
              key={record.id}
              record={record}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* ── Form dialog ── */}
      {formOpen && (
        <EmploymentRecordForm
          record={editRecord}
          onSave={handleSave}
          onClose={closeForm}
          builders={builders}
        />
      )}

    </div>
  );
};

export default EmploymentRecordsAdmin;

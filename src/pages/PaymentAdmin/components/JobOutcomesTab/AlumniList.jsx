import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Search } from 'lucide-react';

const formatCurrency = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const StatusBadge = ({ alumnus }) => {
  if (!alumnus.first_job_start_date) {
    return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Searching</Badge>;
  }
  if (alumnus.outcomes_status) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{alumnus.outcomes_status}</Badge>;
  }
  return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Hired</Badge>;
};

const AlumniList = ({ alumni, onSelect }) => {
  const [search, setSearch] = useState('');
  const [hiredFilter, setHiredFilter] = useState('all'); // all | hired | searching

  const filtered = useMemo(() => {
    let rows = alumni?.data || [];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(a =>
        (a.first_name || '').toLowerCase().includes(q) ||
        (a.last_name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.current_employer || '').toLowerCase().includes(q)
      );
    }
    if (hiredFilter === 'hired') rows = rows.filter(a => a.first_job_start_date);
    if (hiredFilter === 'searching') rows = rows.filter(a => !a.first_job_start_date);
    return rows;
  }, [alumni, search, hiredFilter]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by name, email, or employer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={hiredFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHiredFilter('all')}
            >
              All
            </Button>
            <Button
              variant={hiredFilter === 'hired' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHiredFilter('hired')}
            >
              Hired
            </Button>
            <Button
              variant={hiredFilter === 'searching' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setHiredFilter('searching')}
            >
              Searching
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-3">
          {filtered.length} {filtered.length === 1 ? 'alumnus' : 'alumni'}
          {alumni?.total != null && filtered.length !== alumni.total && ` (of ${alumni.total} total)`}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Current Employer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="text-right">Monthly Bond</TableHead>
                <TableHead className="text-right">ISA %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                    {alumni?.data?.length === 0
                      ? 'No alumni outcomes synced yet. Click "Refresh from Salesforce" to pull the latest data.'
                      : 'No alumni match the current filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow
                    key={a.salesforce_contact_id}
                    onClick={() => onSelect(a)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">
                      {a.first_name} {a.last_name}
                      {a.is_laid_off && (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs">Laid off</Badge>
                      )}
                      {a.is_paused && (
                        <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">Paused</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{a.cohort || a.core_cohort || '—'}</TableCell>
                    <TableCell>{a.current_employer || '—'}</TableCell>
                    <TableCell className="text-sm text-gray-600">{a.current_role || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(a.current_salary)}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm">{formatCurrency(a.bond_monthly_invoice)}</TableCell>
                    <TableCell className="text-right tabular-nums text-sm text-gray-600">
                      {a.income_share_pct != null ? `${a.income_share_pct}%` : '—'}
                    </TableCell>
                    <TableCell><StatusBadge alumnus={a} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlumniList;

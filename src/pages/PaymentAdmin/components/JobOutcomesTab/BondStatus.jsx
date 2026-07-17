import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { layoffHistory, pauseHistory, bondJobChanges } from './bondData';
import { AlertTriangle, Pause, CheckCircle2 } from 'lucide-react';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
};
const fmtCurrency = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </div>
      <div className="text-3xl font-bold mt-1" style={{ color: color || '#111827' }}>{value}</div>
    </CardContent>
  </Card>
);

const BondStatus = () => {
  const stats = useMemo(() => {
    const activeContract = bondJobChanges.filter(b => b.contract === true && b.salary != null).length;
    const pendingVerify = bondJobChanges.filter(b => b.contract === false).length;
    const upcoming      = bondJobChanges.filter(b => b.startDate && new Date(b.startDate) > new Date()).length;
    const totalMonthly  = bondJobChanges
      .filter(b => b.contract === true && b.monthly != null)
      .reduce((s, b) => s + b.monthly, 0);
    return { activeContract, pendingVerify, upcoming, totalMonthly };
  }, []);

  // Group layoffs by year-month for the timeline
  const layoffsSorted = [...layoffHistory].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Bond Contracts"
          value={stats.activeContract}
          icon={CheckCircle2}
          color="#16a34a"
        />
        <StatCard
          label="Pending Verification"
          value={stats.pendingVerify}
          icon={AlertTriangle}
          color="#d97706"
        />
        <StatCard
          label="Future Start Date"
          value={stats.upcoming}
        />
        <StatCard
          label="Monthly Invoice Total"
          value={fmtCurrency(stats.totalMonthly)}
          color="#4242EA"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Pause className="h-4 w-4 text-amber-600" />
              Active Invoice Pauses
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">{pauseHistory.length} fellows on payment pause</p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fellow</TableHead>
                    <TableHead>Pause Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pauseHistory.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{p.period || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Layoff History
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">{layoffHistory.length} layoffs / departures tracked</p>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead>Fellow</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layoffsSorted.map((l, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-sm text-gray-600">{fmtDate(l.date)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{l.detail || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bond Job Changes — Current Roster</CardTitle>
          <p className="text-xs text-gray-500 mt-1">From the Bond Job Changes tracker sheet</p>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fellow</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead className="text-right">Salary</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead>Contract</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bondJobChanges.map((b, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-sm text-gray-700">{b.title || <span className="text-gray-400">—</span>}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtCurrency(b.salary)}</TableCell>
                    <TableCell className="text-sm text-gray-600">{b.startDate || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtCurrency(b.monthly)}</TableCell>
                    <TableCell>
                      {b.contract === true && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Signed</Badge>
                      )}
                      {b.contract === false && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                      )}
                      {b.contract == null && <span className="text-gray-400 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600 max-w-xs truncate" title={b.notes}>
                      {b.notes || ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BondStatus;

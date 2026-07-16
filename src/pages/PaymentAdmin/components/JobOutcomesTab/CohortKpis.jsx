import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import InvoiceActivityTimeline from './InvoiceActivityTimeline';

const PURSUIT_PURPLE = '#4242EA';
const MASTERY_PINK = '#FF33FF';

const formatCurrency = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};
const formatPct = (n) => (n == null ? '—' : `${(n * 100).toFixed(1)}%`);
const formatNum = (n) => (n == null ? '—' : Number(n).toFixed(1));

const StatCard = ({ label, value, sublabel }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </CardContent>
  </Card>
);

const CohortKpis = ({ overview }) => {
  if (!overview) {
    return <div className="text-gray-500 text-sm">No overview data yet.</div>;
  }

  const hireData = [
    { name: 'Hired 3mo',  rate: overview.hireRate3mo ?? 0 },
    { name: 'Hired 6mo',  rate: overview.hireRate6mo ?? 0 },
    { name: 'Hired 1yr',  rate: overview.hireRate1yr ?? 0 },
  ];
  const hasHireBuckets = overview.hireRate3mo != null || overview.hireRate6mo != null || overview.hireRate1yr != null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="New Invoices (last 12 months)"
          value={overview.hiredLastYear ?? '—'}
          sublabel="From the Start Invoicing tab"
        />
        <StatCard
          label="Layoffs (last 12 months)"
          value={overview.laidOffLastYear ?? '—'}
          sublabel="From the Stop/Pause Invoicing tab"
        />
        <StatCard
          label="Median Current Salary"
          value={formatCurrency(overview.medianCurrentSalary)}
          sublabel={overview.medianSalaryLift != null ? `+${formatCurrency(overview.medianSalaryLift)} lift` : null}
        />
      </div>

      <InvoiceActivityTimeline />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasHireBuckets ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hire rate by milestone</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hireData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={{ fontSize: 12 }} domain={[0, 1]} />
                  <Tooltip formatter={(v) => formatPct(v)} />
                  <Bar dataKey="rate" fill={PURSUIT_PURPLE} radius={[4, 4, 0, 0]}>
                    {hireData.map((_, i) => (
                      <Cell key={i} fill={[PURSUIT_PURPLE, '#6e6efe', '#9b9bff'][i] || PURSUIT_PURPLE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hire rate by milestone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
              3/6/12-month hire rates not available in sheet data.<br />Available once Salesforce sync is enabled.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ISA status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">ISA Eligible</div>
                <div className="text-3xl font-bold mt-1" style={{ color: PURSUIT_PURPLE }}>
                  {overview.isaEligibleCount ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">right now</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">ISA Complete</div>
                <div className="text-3xl font-bold mt-1" style={{ color: MASTERY_PINK }}>
                  {overview.isaCompleteCount ?? 0}
                </div>
                <div className="text-xs text-gray-500 mt-1">all time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CohortKpis;

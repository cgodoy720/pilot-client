import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import { bondAlumni } from './bondData';

const PURSUIT_PURPLE = '#4242EA';
const MASTERY_PINK = '#FF33FF';
const PALETTE = ['#4242EA', '#6e6efe', '#9b9bff', '#FF33FF', '#FB6FFB', '#FFA8FF'];

const fmtCurrency = (n) => {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
};
const fmtPct = (n) => (n == null ? '—' : `${(n * 100).toFixed(0)}%`);
const median = (arr) => {
  const a = arr.filter(n => n != null).sort((x, y) => x - y);
  if (!a.length) return null;
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};
const mean = (arr) => {
  const a = arr.filter(n => n != null);
  return a.length ? a.reduce((s, n) => s + n, 0) / a.length : null;
};

const StatCard = ({ label, value, sublabel, color }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</div>
      <div className="text-3xl font-bold mt-1" style={{ color: color || '#111827' }}>{value}</div>
      {sublabel && <div className="text-xs text-gray-500 mt-1">{sublabel}</div>}
    </CardContent>
  </Card>
);

const SalaryAnalysis = () => {
  const data = useMemo(() => {
    const all = bondAlumni;
    const withSalary = all.filter(a => a.salary != null && a.salary > 0);
    const salaries = withSalary.map(a => a.salary);

    // Histogram: $10k buckets from $10k to $130k
    const histogram = [];
    for (let lo = 10000; lo <= 130000; lo += 10000) {
      const hi = lo + 10000;
      const count = withSalary.filter(a => a.salary >= lo && a.salary < hi).length;
      histogram.push({
        bucket: `$${(lo / 1000).toFixed(0)}-${(hi / 1000).toFixed(0)}k`,
        count,
      });
    }

    // By cohort
    const byCohort = {};
    withSalary.forEach(a => {
      if (!a.cohort) return;
      (byCohort[a.cohort] = byCohort[a.cohort] || []).push(a.salary);
    });
    const cohortData = Object.entries(byCohort)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([cohort, arr]) => ({
        cohort: `Cohort ${cohort}`,
        median: median(arr),
        mean: Math.round(mean(arr)),
        count: arr.length,
      }));

    // By year started
    const byYear = {};
    withSalary.forEach(a => {
      const year = a.yearStart;
      if (!year || year === 'Present') return;
      (byYear[year] = byYear[year] || []).push(a.salary);
    });
    const yearData = Object.entries(byYear)
      .sort()
      .map(([year, arr]) => ({
        year,
        median: median(arr),
        mean: Math.round(mean(arr)),
        count: arr.length,
      }));

    // Top employers by avg salary (min 2 alumni)
    const byOrg = {};
    withSalary.forEach(a => {
      if (!a.organization) return;
      (byOrg[a.organization] = byOrg[a.organization] || []).push(a.salary);
    });
    const employerData = Object.entries(byOrg)
      .filter(([, arr]) => arr.length >= 2)
      .map(([name, arr]) => ({
        name,
        avg_salary: Math.round(mean(arr)),
        count: arr.length,
      }))
      .sort((a, b) => b.avg_salary - a.avg_salary)
      .slice(0, 12);

    // Salary band breakdown
    const bands = [
      { name: '<$50k',     min: 0,      max: 50000 },
      { name: '$50-70k',   min: 50000,  max: 70000 },
      { name: '$70-85k',   min: 70000,  max: 85000 },
      { name: '$85-100k',  min: 85000,  max: 100000 },
      { name: '$100-115k', min: 100000, max: 115000 },
      { name: '$115k+',    min: 115000, max: Infinity },
    ].map(b => ({
      ...b,
      count: withSalary.filter(a => a.salary >= b.min && a.salary < b.max).length,
    }));

    return {
      total: withSalary.length,
      min: Math.min(...salaries),
      max: Math.max(...salaries),
      median: median(salaries),
      mean: Math.round(mean(salaries)),
      histogram,
      cohortData,
      yearData,
      employerData,
      bands,
      isaEligibleCount: withSalary.filter(a => a.isaEligible).length,
      currentCount: withSalary.filter(a => a.isCurrent).length,
      permanentCount: withSalary.filter(a => a.permTemp === 'Permanent').length,
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Jobs Analyzed"
          value={data.total}
          sublabel={`${data.currentCount} current, ${data.total - data.currentCount} historical`}
        />
        <StatCard
          label="Median Salary"
          value={fmtCurrency(data.median)}
          color={PURSUIT_PURPLE}
        />
        <StatCard
          label="Mean Salary"
          value={fmtCurrency(data.mean)}
          sublabel={`Range ${fmtCurrency(data.min)} – ${fmtCurrency(data.max)}`}
        />
        <StatCard
          label="ISA Eligible"
          value={data.isaEligibleCount}
          sublabel={fmtPct(data.isaEligibleCount / data.total) + ' of jobs'}
          color={MASTERY_PINK}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Salary distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.histogram} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Jobs', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <Tooltip />
              <Bar dataKey="count" fill={PURSUIT_PURPLE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Median salary by cohort</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.cohortData} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="median" name="Median" fill={PURSUIT_PURPLE} radius={[4, 4, 0, 0]} />
                <Bar dataKey="mean" name="Mean" fill={MASTERY_PINK} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg salary by job-start year</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.yearData} margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Line type="monotone" dataKey="median" stroke={PURSUIT_PURPLE} strokeWidth={2} dot={{ r: 4 }} name="Median" />
                <Line type="monotone" dataKey="mean" stroke={MASTERY_PINK} strokeWidth={2} dot={{ r: 4 }} name="Mean" />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Salary band breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.bands} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {data.bands.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top employers by avg salary</CardTitle>
            <p className="text-xs text-gray-500 mt-1">Employers with 2+ alumni</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.employerData} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `$${Math.round(v / 1000)}k`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(v) => fmtCurrency(v)} />
                <Bar dataKey="avg_salary" fill={PURSUIT_PURPLE} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalaryAnalysis;

import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

const METRICS = [
  {
    key: 'total',
    label: 'Total Records',
    compute: (_records, total) => total ?? 0,
  },
  {
    key: 'builders',
    label: 'Builders',
    compute: (records) => new Set(records.map((r) => r.user_id)).size,
  },
  {
    key: 'full_time',
    label: 'Full-Time',
    compute: (records) => records.filter((r) => r.employment_type === 'full_time').length,
  },
  {
    key: 'contract',
    label: 'Contract',
    compute: (records) => records.filter((r) => r.employment_type === 'contract').length,
  },
  {
    key: 'freelance',
    label: 'Freelance',
    compute: (records) => records.filter((r) => r.employment_type === 'freelance').length,
  },
];

const StatsBar = ({ records = [], total = 0 }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      {METRICS.map(({ key, label, compute }) => (
        <Card key={key} className="bg-white border border-gray-200">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-gray-900 leading-none">
              {compute(records, total)}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-wide mt-1">
              {label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsBar;

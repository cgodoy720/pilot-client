import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

const STAGE_LABELS = {
  lead_no_account: 'Lead (no account)',
  account_only: 'Account Only',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  info_session_attended: 'Info Session (attended)',
  workshop_attended: 'Workshop (attended)',
  offer_extended: 'Offer Extended',
};

const STAGE_DOT = {
  lead_no_account: '#9ca3af',
  account_only: '#3b82f6',
  in_progress: '#f59e0b',
  submitted: '#8b5cf6',
  info_session_attended: '#a855f7',
  workshop_attended: '#ec4899',
  offer_extended: '#10b981',
};

const SHADES = ['#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6', '#4242ea'];

function cellColor(value, max) {
  if (!value || max === 0) return '#ffffff';
  const ratio = value / max;
  const idx = Math.min(SHADES.length - 1, Math.floor(ratio * SHADES.length));
  return SHADES[idx];
}

/**
 * Heatmap: funnel stage (rows) × buckets (columns).
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {string[]} stages         row keys from the API
 * @param {string[]} columns        column keys from the API
 * @param {object}   data           data[stage][column] => count
 * @param {string}   filterLabel    label to show next to the dropdown
 * @param {string[]} filterOptions  dropdown values
 * @param {string}   filterValue
 * @param {function} onFilterChange
 */
export default function FunnelHeatmap({
  title,
  subtitle,
  stages,
  columns,
  data,
  filterLabel,
  filterOptions = [],
  filterValue,
  onFilterChange,
}) {
  const { rowTotals, colTotals, grandTotal, maxCell } = useMemo(() => {
    const rowTotals = {};
    const colTotals = {};
    let grandTotal = 0;
    let maxCell = 0;
    stages.forEach(stage => {
      rowTotals[stage] = 0;
      columns.forEach(col => {
        const v = data?.[stage]?.[col] ?? 0;
        rowTotals[stage] += v;
        colTotals[col] = (colTotals[col] || 0) + v;
        if (v > maxCell) maxCell = v;
        grandTotal += v;
      });
    });
    return { rowTotals, colTotals, grandTotal, maxCell };
  }, [stages, columns, data]);

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-[#1a1a1a] font-proxima-bold flex items-center gap-2">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-gray-500 font-proxima mt-1">{subtitle}</p>
            )}
          </div>
          {filterOptions.length > 0 && (
            <Select value={filterValue || '_all'} onValueChange={onFilterChange}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200 font-proxima">
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent className="font-proxima">
                <SelectItem value="_all">{filterLabel}</SelectItem>
                {filterOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-proxima border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Funnel Stage
                </th>
                {columns.map(col => (
                  <th key={col} className="text-center py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {col}{filterLabel?.toLowerCase().includes('recency') || filterLabel?.toLowerCase().includes('source') ? '' : ''}
                  </th>
                ))}
                <th className="text-center py-2 px-3 text-xs font-semibold text-[#4242ea] uppercase tracking-wide">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map(stage => (
                <tr key={stage} className="border-t border-gray-100">
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: STAGE_DOT[stage] || '#9ca3af' }}
                      />
                      <span className="text-gray-900">{STAGE_LABELS[stage] || stage}</span>
                    </span>
                  </td>
                  {columns.map(col => {
                    const v = data?.[stage]?.[col] ?? 0;
                    const bg = cellColor(v, maxCell);
                    return (
                      <td
                        key={col}
                        className="text-center py-2 px-3 text-gray-900"
                        style={{ backgroundColor: bg }}
                      >
                        {v === 0 ? <span className="text-gray-300">0</span> : v}
                      </td>
                    );
                  })}
                  <td className="text-center py-2 px-3 font-semibold text-[#4242ea]">
                    {rowTotals[stage]}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="py-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-700">Total</td>
                {columns.map(col => (
                  <td key={col} className="text-center py-2 px-3 font-semibold text-gray-900">
                    {colTotals[col] || 0}
                  </td>
                ))}
                <td className="text-center py-2 px-3 font-bold text-[#4242ea]">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 font-proxima">
          <span>Fewer</span>
          <div className="flex">
            {SHADES.map((c, i) => (
              <span
                key={i}
                className="inline-block w-6 h-3 border border-white"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

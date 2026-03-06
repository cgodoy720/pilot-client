import React, { useState } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

// ─── Badge config maps ────────────────────────────────────────────────────────

const TYPE_BADGE = {
  full_time:  { label: 'Long-Term',  className: 'bg-green-100 text-green-700 border-green-200' },
  part_time:  { label: 'Long-Term',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  contract:   { label: 'Short-Term', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  freelance:  { label: 'Short-Term', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  pro_bono:   { label: 'Pro Bono',   className: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const STAGE_BADGE = {
  active:    { label: 'Active',     className: 'bg-green-100 text-green-700 border-green-200' },
  pipeline:  { label: 'Pipeline',   className: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Completed',  className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ended:     { label: 'Ended',      className: 'bg-red-100 text-red-700 border-red-200' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPayment = (amount, notes) => {
  if (amount != null && amount !== '') {
    const num = parseFloat(amount);
    if (!isNaN(num)) {
      return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
  }
  if (notes) return notes;
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────

const EmploymentRecordCard = ({ record, onEdit, onDelete }) => {
  const [storyExpanded, setStoryExpanded] = useState(false);

  const typeConfig  = TYPE_BADGE[record.employment_type]  || { label: record.employment_type,  className: 'bg-gray-100 text-gray-600' };
  const stageConfig = STAGE_BADGE[record.engagement_stage] || { label: record.engagement_stage, className: 'bg-gray-100 text-gray-600' };

  const roleDisplay = record.company_name
    ? `${record.role_title} @ ${record.company_name}`
    : record.role_title;

  const paymentDisplay = formatPayment(record.payment_amount, record.payment_notes);

  const hasStory = record.story && record.story.trim().length > 0;

  return (
    <Card className="bg-white border border-gray-200 hover:border-[#4242ea]/40 hover:shadow-sm transition-all">
      <CardContent className="p-4 space-y-3">

        {/* Header: Builder name + type/stage badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 leading-tight">
            {record.builder_name}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge className={`text-[11px] px-2 py-0.5 ${typeConfig.className}`}>
              {typeConfig.label}
            </Badge>
            <Badge className={`text-[11px] px-2 py-0.5 ${stageConfig.className}`}>
              {stageConfig.label}
            </Badge>
          </div>
        </div>

        {/* Role @ Company */}
        <p className="text-sm font-bold text-gray-900 leading-tight m-0">
          {roleDisplay}
        </p>

        {/* Payment — prominent */}
        {paymentDisplay ? (
          <p className="text-base font-semibold text-[#4242ea] m-0">
            {paymentDisplay}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic m-0">No payment info</p>
        )}

        {/* Program badge + Own Venture tag */}
        {(record.program || record.is_own_venture) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {record.program && (
              <Badge className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-700 border-indigo-200">
                {record.program}
              </Badge>
            )}
            {record.is_own_venture && (
              <Badge className="text-[11px] px-2 py-0.5 bg-yellow-50 text-yellow-700 border-yellow-200">
                Own Venture
              </Badge>
            )}
          </div>
        )}

        {/* Industry */}
        {record.industry && (
          <p className="text-xs text-gray-500 m-0">
            <span className="font-medium text-gray-700">Industry:</span> {record.industry}
          </p>
        )}

        {/* Collaborators */}
        {record.collaborators && (
          <p className="text-xs text-gray-500 m-0">
            <span className="font-medium text-gray-700">Collaborators:</span> {record.collaborators}
          </p>
        )}

        {/* Story — truncated with toggle */}
        {hasStory && (
          <div>
            <p
              className={`text-xs text-gray-600 m-0 leading-relaxed ${
                storyExpanded ? '' : 'line-clamp-2'
              }`}
            >
              {record.story}
            </p>
            <button
              onClick={() => setStoryExpanded((prev) => !prev)}
              className="text-xs text-[#4242ea] hover:underline mt-0.5 focus:outline-none"
            >
              {storyExpanded ? 'Show less' : 'Show more'}
            </button>
          </div>
        )}

        {/* Edit / Delete */}
        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(record)}
            className="h-7 text-xs px-3"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(record)}
            className="h-7 text-xs px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export default EmploymentRecordCard;

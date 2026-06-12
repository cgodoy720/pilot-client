import React, { useMemo, useState } from 'react';
import { TrendingUp, Calendar, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

/**
 * BuilderSnapshotTimeline
 *
 * Expandable vertical timeline of the most recent N performance entries.
 * Each row collapses to date + task title + score chip; clicking expands
 * to reveal what_went_well, what_to_improve, and a deep-link to the task
 * page in the learning surface. Designed for staff to drill in fast.
 *
 * Props:
 *   - performance: { entries: [{ date, summary, task_id?, overall_score?,
 *                                passed?, what_went_well?, what_to_improve?,
 *                                trajectory_note? }] }
 *   - max: number — how many entries to show (default 8)
 */
const fmtDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
};

const ScoreChip = ({ score, passed }) => {
  if (typeof score !== 'number') return null;
  const isPass = passed === true || (passed == null && score >= 70);
  const isStrong = score >= 80;
  const tone = isStrong
    ? { bg: 'bg-[#4242EA]/10', text: 'text-[#4242EA]', ring: 'ring-[#4242EA]/30' }
    : isPass
    ? { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' }
    : { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ring-1 ${tone.bg} ${tone.text} ${tone.ring} px-2.5 py-0.5 text-[11px] font-proxima-bold tabular-nums`}
      title={`Overall score ${score}/100`}
    >
      {score}
    </span>
  );
};

const ExpandedDetail = ({ entry }) => {
  const wentWell = (entry.what_went_well || '').trim();
  const toImprove = (entry.what_to_improve || '').trim();
  const learningPath = entry.task_id
    ? `/learning?taskId=${encodeURIComponent(entry.task_id)}`
    : null;

  return (
    <div className="mt-3 pl-0 sm:pl-36 space-y-3">
      {wentWell && (
        <div className="rounded-lg bg-emerald-50/60 ring-1 ring-emerald-100 p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-proxima-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            What went well
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#1E1E1E]/90">{wentWell}</p>
        </div>
      )}
      {toImprove && (
        <div className="rounded-lg bg-amber-50/60 ring-1 ring-amber-100 p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-proxima-bold text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Areas to improve
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[#1E1E1E]/90">{toImprove}</p>
        </div>
      )}
      {!wentWell && !toImprove && (
        <p className="text-xs italic text-[#999]">
          No detailed feedback captured for this entry.
        </p>
      )}
      {learningPath && (
        <a
          href={learningPath}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-1.5
            text-xs font-proxima-bold text-[#4242EA] hover:text-[#3232BA]
            mt-1
          "
        >
          Open task in Learning
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

const BuilderSnapshotTimeline = ({ performance, max = 8 }) => {
  const items = useMemo(() => {
    const entries = Array.isArray(performance?.entries) ? performance.entries : [];
    return [...entries]
      .sort((a, b) => {
        const da = new Date(a?.date || a?.at || 0).getTime();
        const db = new Date(b?.date || b?.at || 0).getTime();
        return db - da;
      })
      .slice(0, max);
  }, [performance, max]);

  // Track which rows are expanded by index. Multiple can be open at once so
  // staff can compare adjacent entries.
  const [expanded, setExpanded] = useState(() => new Set());
  const toggle = (idx) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const hasAnyDetail = (entry) =>
    !!(entry.what_went_well?.trim() || entry.what_to_improve?.trim() || entry.task_id);

  return (
    <section className="rounded-2xl ring-1 ring-[#E3E3E3] shadow-md bg-white p-6 md:p-8 font-proxima">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-proxima-bold text-[#1E1E1E]">
          <TrendingUp className="w-6 h-6 text-[#4242EA]" />
          Recent Performance
        </h2>
        <p className="text-sm text-[#666] mt-1">
          The latest signals from completed tasks, newest first. Click any row
          for the strengths / growth notes captured during grading.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="w-10 h-10 text-[#E3E3E3] mx-auto mb-3" />
          <p className="text-sm italic text-[#999]">No performance entries yet.</p>
        </div>
      ) : (
        <ol className="relative space-y-3 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#E3E3E3]">
          {items.map((entry, idx) => {
            const isOpen = expanded.has(idx);
            const expandable = hasAnyDetail(entry);
            return (
              <li key={`${entry.date}-${idx}`} className="relative">
                {/* Rail dot */}
                <span
                  aria-hidden="true"
                  className="
                    absolute -left-[1.4rem] top-2
                    w-3 h-3 rounded-full
                    bg-white ring-2 ring-[#4242EA]
                    shadow-sm
                  "
                />
                <button
                  type="button"
                  onClick={() => expandable && toggle(idx)}
                  disabled={!expandable}
                  aria-expanded={isOpen}
                  className={`
                    w-full text-left
                    rounded-lg
                    transition-colors
                    ${expandable ? 'cursor-pointer hover:bg-[#F7F7F9]' : 'cursor-default'}
                    -mx-2 px-2 py-1.5
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <time
                      className="
                        inline-flex items-center
                        text-[11px] uppercase tracking-wider text-[#666] font-proxima-bold
                        tabular-nums shrink-0 sm:w-32
                      "
                    >
                      {fmtDate(entry.date || entry.at) || '—'}
                    </time>
                    <div className="mt-1 sm:mt-0 flex-1 flex items-center justify-between gap-3 min-w-0">
                      <p className="text-sm leading-snug text-[#1E1E1E]/90 truncate">
                        {entry.summary || <span className="italic text-[#999]">No summary</span>}
                      </p>
                      <div className="shrink-0 flex items-center gap-2">
                        <ScoreChip score={entry.overall_score} passed={entry.passed} />
                        {expandable && (
                          isOpen ? (
                            <ChevronUp className="w-4 h-4 text-[#999]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#999]" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                {isOpen && expandable && <ExpandedDetail entry={entry} />}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};

export default BuilderSnapshotTimeline;

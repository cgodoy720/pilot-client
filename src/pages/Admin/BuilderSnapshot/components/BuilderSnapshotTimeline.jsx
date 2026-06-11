import React, { useMemo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

/**
 * BuilderSnapshotTimeline
 *
 * Vertical timeline of the most recent N performance entries. Date pill on
 * the left rail, dot on the rail, summary card on the right. Designed to
 * read like a story — most recent first.
 *
 * Props:
 *   - performance: { entries: [{ date, summary, task_id? }] }
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

const BuilderSnapshotTimeline = ({ performance, max = 8 }) => {
  const items = useMemo(() => {
    const entries = Array.isArray(performance?.entries) ? performance.entries : [];
    return [...entries]
      .sort((a, b) => {
        const da = new Date(a?.date || 0).getTime();
        const db = new Date(b?.date || 0).getTime();
        return db - da;
      })
      .slice(0, max);
  }, [performance, max]);

  return (
    <section className="rounded-2xl ring-1 ring-[#E3E3E3] shadow-md bg-white p-6 md:p-8 font-proxima">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-proxima-bold text-[#1E1E1E]">
          <TrendingUp className="w-6 h-6 text-[#4242EA]" />
          Recent Performance
        </h2>
        <p className="text-sm text-[#666] mt-1">
          The latest signals from completed tasks, newest first.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Calendar className="w-10 h-10 text-[#E3E3E3] mx-auto mb-3" />
          <p className="text-sm italic text-[#999]">No performance entries yet.</p>
        </div>
      ) : (
        <ol className="relative space-y-5 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#E3E3E3]">
          {items.map((entry, idx) => (
            <li key={`${entry.date}-${idx}`} className="relative">
              {/* Rail dot */}
              <span
                aria-hidden="true"
                className="
                  absolute -left-[1.4rem] top-1.5
                  w-3 h-3 rounded-full
                  bg-white ring-2 ring-[#4242EA]
                  shadow-sm
                "
              />
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                <time
                  className="
                    inline-flex items-center
                    text-[11px] uppercase tracking-wider text-[#666] font-proxima-bold
                    tabular-nums
                    shrink-0
                    sm:w-32
                  "
                >
                  {fmtDate(entry.date) || '—'}
                </time>
                <p className="mt-1 sm:mt-0 text-sm leading-relaxed text-[#1E1E1E]/90">
                  {entry.summary || <span className="italic text-[#999]">No summary</span>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default BuilderSnapshotTimeline;

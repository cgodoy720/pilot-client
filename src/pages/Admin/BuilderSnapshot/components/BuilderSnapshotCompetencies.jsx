import React, { useMemo, useState } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { computeCompetencyRollup } from '../utils/competencyRollup';

/**
 * BuilderSnapshotCompetencies
 *
 * Rolls the per-skill levels up into the durable foundational competencies that
 * the skills "develop through". Each competency is a single horizontal record —
 * name + coverage hint + mean score — that expands inline to reveal the
 * contributing skills and their individual levels.
 *
 * Props:
 *   - skillTaxonomy: { foundationalCompetencies, skills, ... } from /v2-coach-engine
 *   - skillLevels:   { [slug]: 0..100 } from builder_profiles
 */
const BuilderSnapshotCompetencies = ({ skillTaxonomy, skillLevels }) => {
  const rows = useMemo(
    () => computeCompetencyRollup(skillLevels, skillTaxonomy),
    [skillLevels, skillTaxonomy],
  );

  const [expandedKey, setExpandedKey] = useState(null);

  return (
    <section className="rounded-2xl ring-1 ring-[#E3E3E3] shadow-md bg-white p-6 md:p-8 font-proxima">
      <header className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-proxima-bold text-[#1E1E1E]">
          <Layers className="w-6 h-6 text-[#4242EA]" />
          Foundational Competencies
        </h2>
        <p className="text-sm text-[#666] mt-1">
          Durable competencies rolled up from the skills that develop them. Scores are the mean of scored contributing skills.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="py-12 text-center">
          <Layers className="w-10 h-10 text-[#E3E3E3] mx-auto mb-3" />
          <p className="text-sm italic text-[#999]">
            No competency mapping available yet.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F0F0F0]">
          {rows.map((row) => {
            const isExpanded = expandedKey === row.key;
            const hasContrib = row.contributing.length > 0;
            return (
              <li key={row.key} className="py-4 first:pt-0 last:pb-0">
                <button
                  type="button"
                  disabled={!hasContrib}
                  onClick={() => setExpandedKey(isExpanded ? null : row.key)}
                  aria-expanded={isExpanded}
                  aria-label={`Toggle contributing skills for ${row.name}`}
                  className="w-full text-left flex items-center gap-4 group/row focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4242EA] rounded-lg disabled:cursor-default"
                >
                  {/* name + coverage hint */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-4 h-4 text-[#C8C8C8] transition-transform group-hover/row:text-[#4242EA] ${isExpanded ? 'rotate-180' : ''} ${hasContrib ? '' : 'invisible'}`}
                      />
                      <h3 className="text-sm font-proxima-bold text-[#1E1E1E] truncate">{row.name}</h3>
                    </div>
                    <p className="mt-0.5 ml-6 text-xs text-[#666]">
                      {row.score === null
                        ? 'Not enough data yet'
                        : `Based on ${row.coverage.scored} of ${row.coverage.total} skill${row.coverage.total === 1 ? '' : 's'}`}
                    </p>
                  </div>

                  {/* score block */}
                  <div className="shrink-0 text-right w-28">
                    {row.score === null ? (
                      <span className="text-xs italic text-[#999]">Not enough data yet</span>
                    ) : (
                      <>
                        <span className="text-xl font-proxima-bold text-[#1E1E1E] tabular-nums">{row.score}</span>
                        <span className="text-xs text-[#999]"> / 100</span>
                        {/* progress track + fill */}
                        <div
                          className="mt-1 h-1.5 w-full rounded-full bg-[#F0F0F0] overflow-hidden"
                          role="progressbar"
                          aria-valuenow={row.score}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.max(2, row.score)}%`, backgroundColor: '#4242EA' }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </button>

                {/* expanded contributing-skill list */}
                {isExpanded && hasContrib && (
                  <ul className="mt-3 ml-6 space-y-2">
                    {row.contributing.map((c) => (
                      <li key={c.slug} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 text-xs text-[#1E1E1E]/85 truncate">{c.name}</span>
                        <div
                          className="h-1.5 w-24 rounded-full bg-[#F0F0F0] overflow-hidden shrink-0"
                          role="progressbar"
                          aria-valuenow={c.level}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.max(2, c.level)}%`, backgroundColor: c.level > 0 ? '#4242EA' : '#E3E3E3', opacity: c.level > 0 ? 1 : 0.6 }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-proxima-bold text-[#1E1E1E] tabular-nums shrink-0">{c.level}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BuilderSnapshotCompetencies;

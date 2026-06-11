import React, { useMemo } from 'react';
import { Trophy, Award } from 'lucide-react';

/**
 * BuilderSnapshotAchievements
 *
 * A "trophy wall" for the builder's top competencies. Ranks competencies by
 * evidence count (the strongest signal we have today) and renders the top 6
 * as visually-distinct cards with a tier crest and the count of evidence
 * signals.
 *
 * Props:
 *   - competencies: { by_skill: { [slug]: { evidence: [] } } }
 *   - skillTaxonomy: { skills: { [slug]: { name } } } — used to resolve slug → name
 */
const TIERS = [
  { min: 8, label: 'Mastery',     bg: 'from-[#4242EA] to-[#FF33FF]', text: 'text-white' },
  { min: 5, label: 'Strong',      bg: 'from-[#4242EA] to-[#4242EA]/80', text: 'text-white' },
  { min: 3, label: 'Developing',  bg: 'from-[#FB923C] to-[#FB923C]/80', text: 'text-white' },
  { min: 1, label: 'Emerging',    bg: 'from-[#E3E3E3] to-[#F0F0F0]', text: 'text-[#1E1E1E]' },
];

const tierFor = (count) => TIERS.find((t) => count >= t.min) || TIERS[TIERS.length - 1];

// Format a slug into a readable name when taxonomy doesn't resolve it.
const slugToName = (slug) =>
  String(slug || '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');

const BuilderSnapshotAchievements = ({ competencies, skillTaxonomy }) => {
  const items = useMemo(() => {
    const bySkill = competencies?.by_skill || {};
    return Object.entries(bySkill)
      .map(([slug, data]) => ({
        slug,
        name: skillTaxonomy?.skills?.[slug]?.name || slugToName(slug),
        count: Array.isArray(data?.evidence) ? data.evidence.length : 0,
        latest: Array.isArray(data?.evidence) ? data.evidence.at(-1) : null,
      }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [competencies, skillTaxonomy]);

  return (
    <section className="rounded-2xl ring-1 ring-[#E3E3E3] shadow-md bg-white p-6 md:p-8 font-proxima">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-proxima-bold text-[#1E1E1E]">
            <Trophy className="w-6 h-6 text-[#FF33FF]" />
            Top Competencies
          </h2>
          <p className="text-sm text-[#666] mt-1">
            Ranked by evidence signals collected during reflection + apply tasks.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Award className="w-10 h-10 text-[#E3E3E3] mx-auto mb-3" />
          <p className="text-sm italic text-[#999]">
            No competency evidence yet. Signals accumulate as the coach runs.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const tier = tierFor(item.count);
            return (
              <li
                key={item.slug}
                className="
                  group relative overflow-hidden
                  rounded-xl ring-1 ring-[#E3E3E3]
                  bg-white
                  transition-all duration-200
                  hover:shadow-lg hover:-translate-y-0.5
                "
              >
                <div
                  className={`
                    bg-gradient-to-br ${tier.bg} ${tier.text}
                    p-4
                  `}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase tracking-widest font-proxima-bold opacity-90">
                      #{idx + 1} · {tier.label}
                    </span>
                    <span className="text-xs font-proxima-bold opacity-90 tabular-nums">
                      {item.count} signal{item.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-proxima-bold leading-tight">
                    {item.name}
                  </h3>
                </div>
                {item.latest?.summary && (
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-wider text-[#999] mb-1.5">
                      Most recent
                    </div>
                    <p className="text-xs text-[#1E1E1E]/85 line-clamp-3 leading-relaxed">
                      {item.latest.summary}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BuilderSnapshotAchievements;

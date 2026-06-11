import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

// Three distinct, palette-disciplined colors — one per category. Used by both
// the radar fills and the per-row chips in the leaderboard so the visual
// language is consistent across both views.
const CATEGORY_COLORS = {
  technical: { stroke: '#4242EA', fill: '#4242EA', label: 'Technical' },
  product_strategy: { stroke: '#FB923C', fill: '#FB923C', label: 'Product Strategy' },
  communication_collaboration: { stroke: '#FF33FF', fill: '#FF33FF', label: 'Communication' },
};
const FALLBACK_COLOR = { stroke: '#1E1E1E', fill: '#1E1E1E', label: 'Other' };

// Short label so axis tick text doesn't crowd the radar.
const shortLabel = (name) => {
  if (!name) return '';
  if (name.length <= 22) return name;
  return name.slice(0, 20).trim() + '…';
};

const CustomTick = ({ payload, x, y, textAnchor }) => (
  <text
    x={x}
    y={y}
    textAnchor={textAnchor}
    fill="#1E1E1E"
    fontSize="10"
    fontFamily="inherit"
  >
    {shortLabel(payload?.value)}
  </text>
);

/**
 * BuilderSnapshotSkillsPanel
 *
 * Two-column skills view: large radar on the left, a leaderboard of top
 * strengths + growth areas on the right. The radar plots one series per
 * category over the union of all skills; the leaderboard is sorted globally
 * (not per category) so staff see the absolute top 5 and bottom 5 at a glance.
 *
 * Props:
 *   - skillTaxonomy: { categories, skills } as returned by /v2-coach-engine
 *   - skillLevels:   { [slug]: 0..100 } from builder_profiles
 */
const BuilderSnapshotSkillsPanel = ({ skillTaxonomy, skillLevels }) => {
  const { data, categoryEntries, topStrengths, growthAreas, stats } = useMemo(() => {
    const taxonomySkills = skillTaxonomy?.skills || {};
    const taxonomyCategories = skillTaxonomy?.categories || {};
    const levels = skillLevels || {};

    const allCategoryKeys = Object.keys(taxonomyCategories);

    // Group skills by category, preserving taxonomy declaration order.
    const skillsByCategory = new Map();
    for (const key of allCategoryKeys) skillsByCategory.set(key, []);
    for (const slug of Object.keys(taxonomySkills)) {
      const skill = taxonomySkills[slug];
      if (!skill) continue;
      const catKey = skill.category;
      if (!skillsByCategory.has(catKey)) skillsByCategory.set(catKey, []);
      skillsByCategory.get(catKey).push(skill);
    }

    const orderedCategoryKeys = Array.from(skillsByCategory.keys()).filter(
      (k) => (skillsByCategory.get(k) || []).length > 0,
    );

    // Build radar rows — one per skill, with a value on its own category key.
    const rows = [];
    const allScored = []; // flat list for top/bottom rankings
    for (const catKey of orderedCategoryKeys) {
      const skills = skillsByCategory.get(catKey) || [];
      for (const skill of skills) {
        const raw = Number(levels[skill.slug] ?? 0);
        const value = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
        const row = { skill: skill.name, slug: skill.slug, category: catKey };
        for (const k of orderedCategoryKeys) row[k] = k === catKey ? value : 0;
        rows.push(row);
        allScored.push({ slug: skill.slug, name: skill.name, category: catKey, value });
      }
    }

    const entries = orderedCategoryKeys.map((key) => ({
      key,
      color: CATEGORY_COLORS[key] || FALLBACK_COLOR,
      name: taxonomyCategories[key]?.name || CATEGORY_COLORS[key]?.label || key,
    }));

    // Rankings — exclude unscored (value=0) skills from "strengths" but keep
    // them in "growth areas" since 0 IS a real gap.
    const scored = allScored.filter((s) => s.value > 0);
    const strengths = [...scored].sort((a, b) => b.value - a.value).slice(0, 5);
    const growth = [...allScored].sort((a, b) => a.value - b.value).slice(0, 5);

    const avg =
      scored.length > 0
        ? Math.round(scored.reduce((sum, s) => sum + s.value, 0) / scored.length)
        : 0;

    return {
      data: rows,
      categoryEntries: entries,
      topStrengths: strengths,
      growthAreas: growth,
      stats: {
        totalSkills: allScored.length,
        scoredSkills: scored.length,
        avg,
      },
    };
  }, [skillTaxonomy, skillLevels]);

  const colorFor = (catKey) => CATEGORY_COLORS[catKey] || FALLBACK_COLOR;

  return (
    <section className="rounded-2xl ring-1 ring-[#E3E3E3] shadow-md bg-white p-6 md:p-8 font-proxima">
      <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-proxima-bold text-[#1E1E1E]">Skill Profile</h2>
          <p className="text-sm text-[#666] mt-1">
            Proficiency across the 33-skill taxonomy. Higher is stronger;
            each category is plotted as its own colored series.
          </p>
        </div>
        {stats.totalSkills > 0 && (
          <div className="flex items-center gap-3 text-xs text-[#666]">
            <span>
              <span className="text-[#1E1E1E] font-proxima-bold">{stats.scoredSkills}</span>
              {' / '}
              <span>{stats.totalSkills}</span>{' scored'}
            </span>
            <span aria-hidden="true" className="text-[#C8C8C8]">·</span>
            <span>
              Avg{' '}
              <span className="text-[#1E1E1E] font-proxima-bold">{stats.avg}</span>
              {' / 100'}
            </span>
          </div>
        )}
      </header>

      {data.length === 0 ? (
        <div className="py-16 text-center text-[#999] italic">
          No skills available to plot yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* RADAR — left 3/5 */}
          <div className="lg:col-span-3">
            <div className="w-full" style={{ height: 460 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius="76%"
                  margin={{ top: 16, right: 32, bottom: 16, left: 32 }}
                >
                  <PolarGrid stroke="#E3E3E3" strokeDasharray="3 4" />
                  <PolarAngleAxis dataKey="skill" tick={<CustomTick />} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={5}
                    tick={{ fontSize: 9, fill: '#999' }}
                    stroke="#E3E3E3"
                  />
                  {categoryEntries.map((cat) => (
                    <Radar
                      key={cat.key}
                      name={cat.name}
                      dataKey={cat.key}
                      stroke={cat.color.stroke}
                      fill={cat.color.fill}
                      fillOpacity={0.35}
                      strokeWidth={2}
                      dot={{ r: 2, strokeWidth: 0, fill: cat.color.stroke }}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend chips — color swatch + category name */}
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-2" aria-label="Categories">
              {categoryEntries.map((cat) => (
                <li
                  key={cat.key}
                  className="inline-flex items-center gap-2 rounded-full border border-[#E3E3E3] bg-white px-3 py-1"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: cat.color.stroke }}
                  />
                  <span className="text-xs font-medium text-[#1E1E1E]">{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* LEADERBOARD — right 2/5 */}
          <div className="lg:col-span-2 space-y-6">
            <Leaderboard
              icon={<TrendingUp className="w-4 h-4 text-[#4242EA]" />}
              title="Top Strengths"
              empty="No scored skills yet."
              items={topStrengths}
              colorFor={colorFor}
            />
            <Leaderboard
              icon={<TrendingDown className="w-4 h-4 text-[#FB923C]" />}
              title="Growth Areas"
              empty="—"
              items={growthAreas}
              colorFor={colorFor}
              variant="growth"
            />
          </div>
        </div>
      )}
    </section>
  );
};

/**
 * Leaderboard — small ranked list with category-tinted progress bars.
 */
const Leaderboard = ({ icon, title, items, empty, colorFor, variant = 'strength' }) => {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#666] font-proxima-bold">
        {icon}
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[#999] italic">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {items.map((item) => {
            const color = colorFor(item.category);
            const value = item.value;
            return (
              <li key={item.slug} className="group">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#1E1E1E] truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-proxima-bold text-[#1E1E1E] tabular-nums">
                    {value}
                  </span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full rounded-full bg-[#F0F0F0] overflow-hidden"
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(2, value)}%`,
                      backgroundColor:
                        variant === 'growth' && value < 50 ? '#FB923C' : color.stroke,
                      opacity: variant === 'growth' ? 0.75 : 1,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default BuilderSnapshotSkillsPanel;

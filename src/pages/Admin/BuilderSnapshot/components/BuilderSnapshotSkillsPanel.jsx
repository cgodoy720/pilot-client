import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../../components/ui/dialog';
import { computeCategoryCompetencyBreakdown } from '../utils/competencyRollup';

// Three distinct, palette-disciplined colors — one per category. Used by both
// the radar fills and the per-row chips in the leaderboard so the visual
// language is consistent across both views.
const CATEGORY_COLORS = {
  technical: { stroke: '#4242EA', fill: '#4242EA', label: 'Technical' },
  product_strategy: { stroke: '#FB923C', fill: '#FB923C', label: 'Product Strategy' },
  communication_collaboration: { stroke: '#FF33FF', fill: '#FF33FF', label: 'Communication' },
};
const FALLBACK_COLOR = { stroke: '#1E1E1E', fill: '#1E1E1E', label: 'Other' };

// Wrap an axis label onto up to two short lines so ~11 ticks fit around a
// one-third-width radar without colliding.
const wrapLabel = (name, maxChars = 16) => {
  const words = String(name || '').split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= maxChars) {
      lines[lines.length - 1] = last + ' ' + word;
    } else {
      lines.push(word);
    }
  }
  if (lines.length > 2) {
    const rest = lines.slice(1).join(' ');
    return [lines[0], rest.slice(0, maxChars - 1).trim() + '…'];
  }
  return lines;
};

const CustomTick = ({ payload, x, y, textAnchor, maxChars = 16, fontSize = 10 }) => {
  const lines = wrapLabel(payload?.value, maxChars);
  const lineHeight = fontSize + 1;
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#1E1E1E"
      fontSize={fontSize}
      fontFamily="inherit"
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? (lines.length > 1 ? -4 : 0) : lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

/**
 * CategoryRadar — one category's skills on a full-circle radar. Rendered
 * small inside the grid cards and large inside the enlarge dialog.
 */
const CategoryRadar = ({ category, size = 'small' }) => {
  const large = size === 'large';
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        data={category.rows}
        cx="50%"
        cy="50%"
        outerRadius={large ? '72%' : '64%'}
        margin={
          large
            ? { top: 28, right: 48, bottom: 28, left: 48 }
            : { top: 20, right: 28, bottom: 20, left: 28 }
        }
      >
        <PolarGrid stroke="#E3E3E3" strokeDasharray="3 4" />
        <PolarAngleAxis
          dataKey="skill"
          tick={<CustomTick maxChars={large ? 24 : 16} fontSize={large ? 12 : 10} />}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tickCount={large ? 5 : 3}
          tick={{ fontSize: large ? 10 : 9, fill: '#999' }}
          stroke="#E3E3E3"
        />
        <Radar
          name={category.name}
          dataKey={category.key}
          stroke={category.color.stroke}
          fill={category.color.fill}
          fillOpacity={0.35}
          strokeWidth={2}
          dot={{ r: large ? 3 : 2, strokeWidth: 0, fill: category.color.stroke }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

/**
 * BuilderSnapshotSkillsPanel
 *
 * Small-multiples skills view: one radar per category (so each category's
 * ~11 skills spread around a full circle with readable labels) over a
 * two-column leaderboard of top strengths + growth areas. The leaderboard is
 * sorted globally (not per category) so staff see the absolute top 5 and
 * bottom 5 at a glance.
 *
 * Props:
 *   - skillTaxonomy: { categories, skills } as returned by /v2-coach-engine
 *   - skillLevels:   { [slug]: 0..100 } from builder_profiles
 */
const BuilderSnapshotSkillsPanel = ({ skillTaxonomy, skillLevels }) => {
  const [expandedKey, setExpandedKey] = useState(null);

  const { categoryEntries, topStrengths, growthAreas, stats } = useMemo(() => {
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

    // One radar per category — each category's rows only carry its own skills,
    // so every shape fills its full circle instead of collapsing to zero
    // outside its wedge.
    const allScored = []; // flat list for top/bottom rankings
    const entries = orderedCategoryKeys.map((catKey) => {
      const skills = skillsByCategory.get(catKey) || [];
      const rows = skills.map((skill) => {
        const raw = Number(levels[skill.slug] ?? 0);
        const value = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));
        allScored.push({ slug: skill.slug, name: skill.name, category: catKey, value });
        return { skill: skill.name, slug: skill.slug, [catKey]: value };
      });
      const catScored = rows.map((r) => r[catKey]).filter((v) => v > 0);
      const catAvg =
        catScored.length > 0
          ? Math.round(catScored.reduce((sum, v) => sum + v, 0) / catScored.length)
          : 0;
      return {
        key: catKey,
        color: CATEGORY_COLORS[catKey] || FALLBACK_COLOR,
        name: taxonomyCategories[catKey]?.name || CATEGORY_COLORS[catKey]?.label || catKey,
        rows,
        avg: catAvg,
        scoredCount: catScored.length,
      };
    });

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
            each category gets its own radar.
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

      {stats.totalSkills === 0 ? (
        <div className="py-16 text-center text-[#999] italic">
          No skills available to plot yet.
        </div>
      ) : (
        <>
          {/* SMALL MULTIPLES — one radar per category; click a card to enlarge */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoryEntries.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setExpandedKey(cat.key)}
                aria-label={`Enlarge ${cat.name} radar`}
                className="group/card rounded-xl border border-[#F0F0F0] bg-[#FAFAFA] p-4 text-left cursor-pointer transition-shadow hover:shadow-md hover:border-[#E3E3E3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4242EA]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="inline-flex items-center gap-2 text-sm font-proxima-bold text-[#1E1E1E]">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cat.color.stroke }}
                    />
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-2 text-xs text-[#666] whitespace-nowrap">
                    <span>
                      Avg{' '}
                      <span className="text-[#1E1E1E] font-proxima-bold">{cat.avg}</span>
                    </span>
                    <Maximize2
                      aria-hidden="true"
                      className="w-3.5 h-3.5 text-[#C8C8C8] transition-colors group-hover/card:text-[#4242EA]"
                    />
                  </span>
                </div>
                <div className="w-full" style={{ height: 300 }}>
                  <CategoryRadar category={cat} size="small" />
                </div>
              </button>
            ))}
          </div>

          {/* ENLARGE DIALOG — full-size radar for the clicked category, with the
              foundational competencies those skills feed shown beside it. The
              breakdown score is CATEGORY-SCOPED (mean of this category's skills
              only), so it can differ from the Foundational Competencies panel. */}
          <Dialog open={!!expandedKey} onOpenChange={(open) => !open && setExpandedKey(null)}>
            <DialogContent className="max-w-6xl">
              {(() => {
                const cat = categoryEntries.find((c) => c.key === expandedKey);
                if (!cat) return null;
                const breakdown = computeCategoryCompetencyBreakdown(
                  skillLevels,
                  skillTaxonomy,
                  cat.key,
                );
                return (
                  <>
                    <DialogHeader>
                      <DialogTitle className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color.stroke }}
                        />
                        {cat.name}
                      </DialogTitle>
                      <DialogDescription>
                        {cat.scoredCount} of {cat.rows.length} skills scored · Avg {cat.avg} / 100
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <div className="w-full" style={{ height: 520 }}>
                        <CategoryRadar category={cat} size="large" />
                      </div>
                      <CategoryCompetencyBreakdown
                        categoryName={cat.name}
                        color={cat.color}
                        items={breakdown}
                      />
                    </div>
                  </>
                );
              })()}
            </DialogContent>
          </Dialog>

          {/* LEADERBOARD — below the radars */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
        </>
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

/**
 * CategoryCompetencyBreakdown — shown beside the enlarged category radar.
 * Lists the foundational competencies this category's skills develop, each
 * with a CATEGORY-SCOPED score (mean of only this category's contributing
 * skills) and the contributing skill names. Scores can differ from the main
 * Foundational Competencies panel — that's intentional.
 */
const CategoryCompetencyBreakdown = ({ categoryName, color, items }) => {
  const tint = color?.stroke || '#4242EA';
  return (
    <div className="min-w-0">
      <h4 className="text-sm font-proxima-bold text-[#1E1E1E]">
        Foundational competencies these {categoryName} skills develop
      </h4>
      <p className="text-xs text-[#999] mt-1">
        Scored from this category&apos;s skills only — may differ from the
        Foundational Competencies panel.
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-[#999] italic">
          These skills aren&apos;t mapped to any competency yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-[#1E1E1E] truncate">
                  {item.name}
                </span>
                <span className="text-xs font-proxima-bold text-[#1E1E1E] tabular-nums shrink-0">
                  {item.score === null ? '—' : item.score}
                </span>
              </div>
              <div
                className="mt-1 h-1.5 w-full rounded-full bg-[#F0F0F0] overflow-hidden"
                role="progressbar"
                aria-valuenow={item.score ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(2, item.score ?? 0)}%`,
                    backgroundColor: tint,
                    opacity: item.score === null ? 0.3 : 1,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#999] leading-snug">
                {item.contributing.map((c) => c.name).join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuilderSnapshotSkillsPanel;

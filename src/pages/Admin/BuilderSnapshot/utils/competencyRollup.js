// Pure rollup of per-skill levels into foundational-competency scores.
//
// A foundational competency is "developed through" a set of taxonomy skills.
// Its score is the MEAN of the scored (level > 0) contributing skills, rounded.
// developedThrough slugs that don't resolve to a real taxonomy skill are
// treated as bad data and dropped from BOTH the numerator and denominator.

// Format a slug into a readable name when taxonomy doesn't resolve it.
// (Mirrors the title-case idiom in BuilderSnapshotAchievements.jsx.)
const slugToName = (slug) =>
  String(slug || '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');

// Read pattern mirrors the skills panel: coerce, default to 0, clamp 0..100.
const clampLevel = (raw) => {
  const n = Number(raw ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));
};

/**
 * computeCompetencyRollup
 *
 * @param {Object|null|undefined} skillLevels  - { [slug]: number } (0..100)
 * @param {Object|null|undefined} skillTaxonomy - { foundationalCompetencies, skills, ... }
 * @returns {Array} one row per foundational competency, sorted score-desc with
 *   null scores last; never null/undefined; never throws on malformed input.
 */
export function computeCompetencyRollup(skillLevels, skillTaxonomy) {
  if (
    !skillTaxonomy ||
    !skillTaxonomy.foundationalCompetencies ||
    Object.keys(skillTaxonomy.foundationalCompetencies).length === 0
  ) {
    return [];
  }

  const taxSkills = skillTaxonomy.skills || {};
  const levels = skillLevels || {};

  const result = Object.entries(skillTaxonomy.foundationalCompetencies).map(
    ([key, comp]) => {
      const devSlugs = Array.isArray(comp?.developedThrough)
        ? comp.developedThrough
        : [];

      const contributing = [];
      for (const slug of devSlugs) {
        const skill = taxSkills[slug];
        if (!skill) continue; // bad-data slug not in taxonomy.skills — drop it
        contributing.push({
          slug,
          name: skill.name || slugToName(slug),
          level: clampLevel(levels[slug]),
        });
      }

      const scoredContrib = contributing.filter((c) => c.level > 0);
      const score =
        scoredContrib.length === 0
          ? null
          : Math.round(
              scoredContrib.reduce((sum, c) => sum + c.level, 0) /
                scoredContrib.length,
            );

      return {
        key,
        name: comp?.name || slugToName(key),
        score,
        coverage: { scored: scoredContrib.length, total: contributing.length },
        contributing,
      };
    },
  );

  // Sort by score descending; null scores last (stable → declaration order).
  result.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score;
  });

  return result;
}

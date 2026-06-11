import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAuthStore from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { searchUsers } from '../../../services/builderProfileInspectorApi';
import BuilderSnapshotHero from './components/BuilderSnapshotHero';
import BuilderSnapshotSkillsPanel from './components/BuilderSnapshotSkillsPanel';
import BuilderSnapshotStoryGrid from './components/BuilderSnapshotStoryGrid';
import BuilderSnapshotAchievements from './components/BuilderSnapshotAchievements';
import BuilderSnapshotTimeline from './components/BuilderSnapshotTimeline';

const BRAND = '#4242EA';

// ---------------------------------------------------------------------------
// composeSummary — deterministic, no LLM. Reads first sentence of background +
// goals, plus top 3 skill names by proficiency level. Falls back gracefully
// when any source is missing so the hero never shows dangling commas.
// ---------------------------------------------------------------------------
const stripMarkdown = (md) =>
  String(md || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text
    .replace(/[*_`~>]/g, '')                 // emphasis / code / blockquote
    .replace(/^#{1,6}\s*/gm, '')             // headings
    .replace(/\s+/g, ' ')
    .trim();

const firstSentence = (md, maxLen = 140) => {
  const text = stripMarkdown(md);
  if (!text) return '';
  const match = text.match(/[^.!?]*[.!?]/);
  let s = match ? match[0].trim() : text;
  if (s.length > maxLen) {
    s = `${s.slice(0, maxLen - 1).trimEnd()}…`;
  }
  return s;
};

const lowercaseFirst = (s) =>
  s ? s.charAt(0).toLowerCase() + s.slice(1) : s;

// Format a skill slug into a human-readable name when taxonomy is missing.
const slugToName = (slug) =>
  String(slug || '')
    .split(/[_-]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');

const topSkillNames = (skillLevels, taxonomy, n = 3) => {
  const entries = Object.entries(skillLevels || {})
    .map(([slug, val]) => {
      // Server returns numeric skill_levels keyed by slug. Tolerate the older
      // shape `{ proficiency_level: number }` for forward-compat.
      const level =
        typeof val === 'number'
          ? val
          : Number(val?.proficiency_level ?? val?.level ?? 0);
      return { slug, level: Number.isFinite(level) ? level : 0 };
    })
    .filter((r) => r.level > 0)
    .sort((a, b) => b.level - a.level || a.slug.localeCompare(b.slug))
    .slice(0, n);

  return entries.map((e) => {
    const name = taxonomy?.skills?.[e.slug]?.name;
    return name || slugToName(e.slug);
  });
};

const joinWithOxford = (names) => {
  if (!names || names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
};

export const composeSummary = (snapshot, taxonomy) => {
  if (!snapshot) return '';
  const profile = snapshot.profile || {};
  const bg = firstSentence(profile.background?.markdown);
  const goals = firstSentence(profile.goals?.markdown);
  const skills = topSkillNames(profile.skill_levels, taxonomy, 3);
  const skillsStr = joinWithOxford(skills);
  // full_name lives at the TOP level of the snapshot (server contract); fall
  // back to identity.first_name + last_name if the top-level field is absent.
  const fullName =
    snapshot.full_name ||
    [snapshot.identity?.first_name, snapshot.identity?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

  if (bg && goals && skillsStr) {
    return `${bg} Currently focused on ${lowercaseFirst(goals).replace(/[.!?]$/, '')} with strengths in ${skillsStr}.`;
  }
  if (bg && skillsStr) {
    return `${bg} Strengths in ${skillsStr}.`;
  }
  if (goals && skillsStr) {
    return `Focused on ${lowercaseFirst(goals).replace(/[.!?]$/, '')}. Strengths in ${skillsStr}.`;
  }
  if (bg && goals) {
    return `${bg} Currently focused on ${lowercaseFirst(goals).replace(/[.!?]$/, '')}.`;
  }
  if (bg) return bg;
  if (goals) return `Focused on ${lowercaseFirst(goals).replace(/[.!?]$/, '')}.`;
  if (skillsStr) {
    return fullName
      ? `${fullName} shows strengths in ${skillsStr}.`
      : `Strengths in ${skillsStr}.`;
  }
  return 'No summary available yet.';
};

// ---------------------------------------------------------------------------
// UserPickerInline — mirrors the CoachProfiles UserPicker pattern, debounced
// search, name/email/cohort rows, click-to-select.
// ---------------------------------------------------------------------------
const UserPickerInline = ({ token, onSelect }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q || q.trim().length < 1) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const data = await searchUsers(token, q.trim());
        setResults(data.results || []);
      } catch (e) {
        setError(e.message || 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [q, token]);

  return (
    <div className="mx-auto max-w-2xl bg-white border border-[#E3E3E3] rounded-2xl shadow-sm p-6 font-proxima">
      <h2 className="text-xl font-proxima-bold text-[#1E1E1E]">Find a builder</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">
        Search by name or email to load their snapshot.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search builders by name or email…"
        aria-label="Search builders"
        className="w-full text-sm px-3 py-2 border border-[#E3E3E3] rounded-md focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': BRAND }}
      />
      <div className="mt-3">
        {searching && <div className="px-2 py-2 text-xs text-slate-400">Searching…</div>}
        {error && <div className="px-2 py-2 text-xs text-rose-600">{error}</div>}
        {!searching && q && results.length === 0 && (
          <div className="px-2 py-2 text-xs text-slate-400">No matches.</div>
        )}
        {results.map((u) => (
          <button
            key={u.user_id}
            onClick={() => onSelect(u)}
            className="w-full text-left px-3 py-2 border-b border-[#F0F0F0] hover:bg-[#F7F7F9] last:border-b-0"
          >
            <div className="text-sm font-semibold text-slate-800 truncate">
              {u.first_name} {u.last_name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {u.email} · {u.cohort || '—'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// BuilderSnapshot — top-level container.
// Props:
//   embedded {boolean} — when true, suppresses the page header (used by Coach
//     tab host); when false, renders standalone with its own header.
// ---------------------------------------------------------------------------
const BuilderSnapshot = ({ embedded = false }) => {
  const token = useAuthStore((s) => s.token);
  const { canAccessPage } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  const userIdParam = searchParams.get('userId');
  const initialUserId = userIdParam ? parseInt(userIdParam, 10) || null : null;
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);

  const [snapshot, setSnapshot] = useState(null);
  const [taxonomy, setTaxonomy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null); // last HTTP status

  // Keep selectedUserId in sync with the URL (e.g., browser back/forward).
  useEffect(() => {
    const p = searchParams.get('userId');
    const next = p ? parseInt(p, 10) || null : null;
    if (next !== selectedUserId) setSelectedUserId(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const apiBase = import.meta.env.VITE_API_URL;

  const loadSnapshot = useCallback(
    async (userId) => {
      if (!userId || !token) return;
      setLoading(true);
      setError(null);
      setStatus(null);
      try {
        const res = await fetch(`${apiBase}/api/admin/builder-profiles/${userId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        setStatus(res.status);
        if (!res.ok) {
          if (res.status === 404) {
            setSnapshot(null);
            setError('Builder not found');
            return;
          }
          let detail = '';
          try {
            const body = await res.json();
            detail = body?.error || body?.message || '';
          } catch (_) {
            /* ignore */
          }
          throw new Error(detail || `Request failed (${res.status})`);
        }
        const data = await res.json();
        setSnapshot(data);
      } catch (e) {
        setError(e.message || 'Failed to load snapshot');
        setSnapshot(null);
      } finally {
        setLoading(false);
      }
    },
    [apiBase, token],
  );

  // Fire-and-forget taxonomy load so the radar can show real skill names.
  // The server exposes the taxonomy via the v2-coach-engine bundle endpoint
  // (NOT /skill-taxonomy — that route is PUT-only). Response shape:
  //   { skillTaxonomy: { name, description, categories, skills, ... }, ... }
  useEffect(() => {
    if (!token || !canAccessPage('coach_observability')) return;
    let aborted = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/admin/prompts/v2-coach-engine`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!aborted) setTaxonomy(data?.skillTaxonomy || null);
      } catch (_) {
        // Taxonomy is best-effort; UI degrades gracefully without it.
      }
    })();
    return () => {
      aborted = true;
    };
  }, [apiBase, token, canAccessPage]);

  useEffect(() => {
    if (selectedUserId) {
      loadSnapshot(selectedUserId);
    } else {
      setSnapshot(null);
      setError(null);
    }
  }, [selectedUserId, loadSnapshot]);

  const handleSelectUser = useCallback(
    (u) => {
      if (!u?.user_id) return;
      setSelectedUserId(u.user_id);
      const next = new URLSearchParams(searchParams);
      next.set('userId', String(u.user_id));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleClearUser = useCallback(() => {
    setSelectedUserId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('userId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const summary = useMemo(
    () => composeSummary(snapshot, taxonomy),
    [snapshot, taxonomy],
  );

  // Compute hero KPI tiles from the snapshot. Falls back to undefined values
  // when a field is missing so the Hero can decide whether to render the
  // strip at all.
  const heroKpis = useMemo(() => {
    if (!snapshot) return [];
    const profile = snapshot.profile || {};
    const levels = profile.skill_levels || {};
    const scored = Object.values(levels)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avg = scored.length > 0
      ? Math.round(scored.reduce((s, n) => s + n, 0) / scored.length)
      : null;
    const competencyCount = profile.competencies?.by_skill
      ? Object.values(profile.competencies.by_skill).reduce(
          (sum, c) => sum + (Array.isArray(c?.evidence) ? c.evidence.length : 0),
          0,
        )
      : 0;
    const performanceCount = Array.isArray(profile.performance?.entries)
      ? profile.performance.entries.length
      : 0;

    return [
      { label: 'Avg Proficiency', value: avg != null ? `${avg}` : '—', hint: avg != null ? 'across scored skills' : 'no scores yet' },
      { label: 'Competency Signals', value: `${competencyCount}`, hint: `from ${Object.keys(profile.competencies?.by_skill || {}).length} skills` },
      { label: 'Performance Entries', value: `${performanceCount}`, hint: performanceCount > 0 ? 'most recent log' : 'none yet' },
    ];
  }, [snapshot]);

  if (!canAccessPage('coach_observability')) {
    return (
      <div className="min-h-screen bg-[#EFEFEF] p-8 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 px-6 py-8 rounded-lg border border-red-200 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Server contract: full_name / cohort_name / headshot_url are TOP-LEVEL
  // keys on the snapshot response (added by services/builderProfileSnapshot.js
  // via LEFT JOINs on cohort + lookbook_profiles). Fall back to identity.*
  // for the name in case the server fields are absent.
  const identity = snapshot?.identity || {};
  const fullName =
    snapshot?.full_name ||
    [identity.first_name, identity.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
  const cohortName = snapshot?.cohort_name || identity.cohort || null;
  const headshotUrl = snapshot?.headshot_url || null;

  return (
    <div
      className={`flex flex-col font-proxima ${
        embedded ? 'h-full overflow-y-auto' : 'min-h-screen bg-[#EFEFEF]'
      }`}
    >
      {!embedded && (
        <div className="shrink-0 bg-white border-b border-[#E3E3E3] px-8 py-4">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">Builder Snapshot</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            A read-only view of a builder's identity, skills, and profile envelopes.
          </p>
        </div>
      )}

      <div className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
        {/* Picker is only visible when no builder is selected; once a builder
            IS selected, the Back-to-search affordance lives inside the hero
            so the hero sits flush at the top of the page. */}
        {!selectedUserId && (
          <div className="mb-6">
            <UserPickerInline token={token} onSelect={handleSelectUser} />
          </div>
        )}

        {/* Loading */}
        {selectedUserId && loading && (
          <div className="space-y-6">
            <div className="rounded-2xl ring-1 ring-[#E3E3E3] bg-white shadow-sm p-8 animate-pulse h-40" />
            <div className="rounded-2xl ring-1 ring-[#E3E3E3] bg-white shadow-sm p-8 animate-pulse h-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl ring-1 ring-[#E3E3E3] bg-white shadow-sm p-6 animate-pulse h-64"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {selectedUserId && !loading && error && (
          <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
            <h2 className="text-lg font-semibold mb-1">
              {status === 404 ? 'Builder not found' : 'Something went wrong'}
            </h2>
            <p className="text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              {status !== 404 && (
                <button
                  type="button"
                  onClick={() => loadSnapshot(selectedUserId)}
                  className="text-sm font-medium text-white rounded-md px-4 py-2"
                  style={{ backgroundColor: BRAND }}
                >
                  Retry
                </button>
              )}
              <button
                type="button"
                onClick={handleClearUser}
                className="text-sm font-medium rounded-md px-4 py-2 border border-rose-200 bg-white text-rose-700"
              >
                Back to search
              </button>
            </div>
          </div>
        )}

        {/* Loaded snapshot */}
        {selectedUserId && !loading && !error && snapshot && (
          <div className="space-y-6">
            <BuilderSnapshotHero
              fullName={fullName}
              cohortName={cohortName}
              headshotUrl={headshotUrl}
              summary={summary}
              kpis={heroKpis}
              onBack={handleClearUser}
            />

            <BuilderSnapshotSkillsPanel
              skillTaxonomy={taxonomy || { categories: {}, skills: {} }}
              skillLevels={snapshot.profile?.skill_levels || {}}
            />

            <BuilderSnapshotStoryGrid profile={snapshot.profile} />

            <BuilderSnapshotAchievements
              competencies={snapshot.profile?.competencies}
              skillTaxonomy={taxonomy}
            />

            <BuilderSnapshotTimeline performance={snapshot.profile?.performance} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderSnapshot;

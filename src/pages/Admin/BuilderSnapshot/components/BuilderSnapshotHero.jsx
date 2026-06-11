import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';

/**
 * BuilderSnapshotHero
 *
 * Top-of-page hero band for the Builder Snapshot view. Visually-dense, dashboard
 * style — large headshot on the left, name + cohort eyebrow + summary on the
 * right, and a status strip at the bottom of the card with 3 inline KPIs.
 *
 * Headshot fallback matches the AdminDashboard BuilderDrawer pattern: a
 * neutral SVG silhouette (head + shoulders) on a light background. Same SVG
 * is used when the image URL is missing AND when it fails to load (onError).
 *
 * Color discipline: only Pursuit palette (#4242EA purple, #FF33FF pink,
 * #1E1E1E carbon, #E3E3E3 stardust, white).
 *
 * Props:
 *   - fullName    {string}        Required. Primary title.
 *   - cohortName  {string}        Cohort label rendered as a chip near the name.
 *   - headshotUrl {string|null}   Image URL; falls back to silhouette SVG.
 *   - summary     {string}        Deterministic 1-2 sentence builder summary.
 *   - kpis        {Array<{label, value, hint?}>}  0–3 inline KPI tiles. Optional.
 *   - onBack      {() => void}    Optional. Renders a small "Back to search"
 *                                  link in the hero's top-right corner.
 */

// Inline silhouette — matches the placeholder pattern in
// pages/AdminDashboard/components/BuilderDrawer.jsx. Same fill colors so the
// staff experience is visually consistent across admin surfaces.
const SilhouetteAvatar = ({ className = 'w-full h-full' }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="100" height="100" fill="#EFEFEF" />
    <circle cx="50" cy="38" r="18" fill="#C8C8C8" />
    <path d="M 10 95 Q 12 62 50 62 Q 88 62 90 95 Z" fill="#C8C8C8" />
  </svg>
);

const BuilderSnapshotHero = ({ fullName, cohortName, headshotUrl, summary, kpis = [], onBack }) => {
  const [imageErrored, setImageErrored] = useState(false);

  // Reset the error gate whenever the URL changes (e.g., switching builders).
  useEffect(() => {
    setImageErrored(false);
  }, [headshotUrl]);

  const showImage = !!headshotUrl && !imageErrored;

  return (
    <section
      className="
        relative overflow-hidden
        rounded-2xl
        bg-gradient-to-br from-[#4242EA] via-[#4242EA] to-[#FF33FF]
        text-white
        shadow-2xl
        font-proxima
      "
    >
      {/* Decorative orb */}
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#FF33FF]/30 blur-3xl"
      />

      {/* Back-to-search — small chip in the top-right of the hero, on the
          gradient. Only renders when the parent passed an onBack handler. */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="
            absolute top-5 right-5 z-10
            inline-flex items-center gap-1.5
            text-xs font-proxima
            text-white/85 hover:text-white
            rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-sm
            ring-1 ring-white/25
            px-3 py-1.5
            transition-colors
          "
          aria-label="Back to search"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to search
        </button>
      )}

      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          {/* LEFT — Headshot with ring + glow. Falls back to a neutral
              silhouette SVG (matches AdminDashboard's BuilderDrawer pattern)
              when the URL is missing OR the image fails to load. */}
          <div className="shrink-0 flex justify-center md:justify-start">
            <div
              className="
                w-36 h-36 md:w-40 md:h-40
                rounded-full overflow-hidden
                bg-white
                ring-4 ring-white/70
                shadow-[0_8px_32px_rgba(0,0,0,0.25)]
              "
            >
              {showImage ? (
                <img
                  src={headshotUrl}
                  alt={fullName || 'Builder headshot'}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={() => setImageErrored(true)}
                />
              ) : (
                <SilhouetteAvatar />
              )}
            </div>
          </div>

          {/* RIGHT — Text stack */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              {cohortName && (
                <span
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full
                    bg-white/15 backdrop-blur-sm
                    ring-1 ring-white/30
                    px-3 py-1
                    text-xs uppercase tracking-wider
                    text-white/90
                  "
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {cohortName}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-4xl md:text-5xl font-proxima-bold tracking-tight leading-tight">
              {fullName || 'Unnamed Builder'}
            </h1>

            {summary && (
              <p className="mt-4 text-base md:text-lg italic leading-relaxed text-white/90 max-w-2xl">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* Inline KPI strip — only renders when kpis is non-empty */}
        {kpis.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="
                  rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20
                  px-4 py-3
                "
              >
                <dt className="text-[11px] uppercase tracking-wider text-white/70">
                  {kpi.label}
                </dt>
                <dd className="mt-1 text-2xl md:text-3xl font-proxima-bold leading-none">
                  {kpi.value}
                </dd>
                {kpi.hint && (
                  <div className="mt-1 text-xs text-white/70">{kpi.hint}</div>
                )}
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
};

export default BuilderSnapshotHero;

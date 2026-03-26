import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import useAuthStore from '../../stores/authStore';
import { fetchAllSubmissions } from '../../services/platformIntakeService';

const PRIORITY_COLORS = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

const TYPE_COLORS = {
  bug: 'bg-purple-100 text-purple-700',
  feature: 'bg-blue-100 text-blue-700',
};

export default function PlatformIntakeBacklog() {
  const token = useAuthStore((s) => s.token);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAllSubmissions(token);
        setSubmissions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  const filtered = submissions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && s.recommended_prioritization !== priorityFilter) return false;
    return true;
  });

  const filterBtnClass = (active) =>
    `px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
      active
        ? 'bg-[#4242EA] text-white border-[#4242EA]'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
    }`;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Platform Intake Backlog</h1>
        <p className="text-gray-500 text-sm mb-6">All submitted bugs and feature requests.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex gap-1">
            {['all', 'bug', 'feature'].map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={filterBtnClass(typeFilter === t)}>
                {t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 ml-4">
            {['all', 'urgent', 'high', 'medium', 'low'].map((p) => (
              <button key={p} onClick={() => setPriorityFilter(p)} className={filterBtnClass(priorityFilter === p)}>
                {p === 'all' ? 'All priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-gray-500 text-sm">Loading...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="text-gray-500 text-sm">No submissions match the current filters.</p>
        )}

        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Row header */}
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-gray-50"
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-medium uppercase ${TYPE_COLORS[s.type]}`}>
                  {s.type}
                </span>
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-medium uppercase ${PRIORITY_COLORS[s.recommended_prioritization]}`}>
                  {s.recommended_prioritization}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.reporter} · {s.platform_component} ·{' '}
                    {new Date(s.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <svg
                  className={`shrink-0 h-4 w-4 text-gray-400 transition-transform ${expanded === s.id ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded detail */}
              {expanded === s.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-700">
                  <div>
                    <span className="font-medium">Reporter:</span> {s.reporter} ({s.reporter_email})
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 whitespace-pre-wrap text-gray-600">{s.description}</p>
                  </div>
                  <div>
                    <span className="font-medium">Prioritization justification:</span>
                    <p className="mt-1 text-gray-600">{s.prioritization_justification}</p>
                  </div>
                  {s.upload_url && (
                    <div>
                      <span className="font-medium">Attachment:</span>{' '}
                      <span className="text-gray-500 text-xs break-all">{s.upload_url}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

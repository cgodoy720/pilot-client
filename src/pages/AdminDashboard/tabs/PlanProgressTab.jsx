import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent } from '../../../components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];
const avatarColor = (userId) => AVATAR_COLORS[userId % AVATAR_COLORS.length];

const planStatus = (p, goals) => {
  if (!p.compass_this_week) return 'not_updated';
  if (!goals) return 'behind';
  const meetsGoal =
    (goals.applications_goal > 0 && p.application_count >= goals.applications_goal) ||
    (goals.networking_goal   > 0 && p.hustle_count      >= goals.networking_goal);
  return meetsGoal ? 'on_track' : 'behind';
};

const STATUS_CONFIG = {
  on_track:    { label: 'On Track',    bg: 'bg-[#4242EA]/10', text: 'text-[#4242EA]', border: 'border-l-[#4242EA]' },
  behind:      { label: 'Behind',      bg: 'bg-amber-50',     text: 'text-amber-700', border: 'border-l-amber-400' },
  not_updated: { label: 'Not Updated', bg: 'bg-gray-50',      text: 'text-gray-500',  border: 'border-l-[#E3E3E3]' },
};

const BuilderRow = ({ p, goals }) => {
  const status = planStatus(p, goals);
  const cfg = STATUS_CONFIG[status];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-l-4 ${cfg.border} rounded-r`}>
      <div className={`w-8 h-8 rounded-full ${avatarColor(p.user_id)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-xs font-bold">{getInitials(p.first_name, p.last_name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#1A1A1A]">{p.first_name} {p.last_name}</div>
        <div className="text-xs text-[#6B7280]">
          {p.application_count} apps · {p.hustle_count} hustles
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    </div>
  );
};

const Bucket = ({ title, builders, goals, color }) => (
  <div>
    <div className={`text-sm font-bold mb-2 ${color}`}>
      {title} <span className="font-normal text-gray-400">({builders.length})</span>
    </div>
    <div className="space-y-1">
      {builders.length === 0
        ? <p className="text-xs text-gray-400 py-2">None</p>
        : builders.map(p => <BuilderRow key={p.user_id} p={p} goals={goals} />)
      }
    </div>
  </div>
);

const PlanProgressTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [participants, setParticipants] = useState([]);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);

    const participantsReq = fetch(
      `${API_BASE}/api/external-cohorts/${selectedCohortId}/participants`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(r => r.json());

    const goalsReq = selectedCohort?.name
      ? fetch(
          `${API_BASE}/api/weekly-goals/current?cohort=${encodeURIComponent(selectedCohort.name)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(r => r.json()).catch(() => null)
      : Promise.resolve(null);

    Promise.all([participantsReq, goalsReq])
      .then(([pData, gData]) => {
        setParticipants(Array.isArray(pData) ? pData : []);
        setGoals(gData || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCohortId, selectedCohort?.name, token]);

  const buckets = useMemo(() => {
    const onTrack = [], behind = [], notUpdated = [];
    for (const p of participants) {
      if (p.is_employed) continue;
      const s = planStatus(p, goals);
      if (s === 'on_track')    onTrack.push(p);
      else if (s === 'behind') behind.push(p);
      else                     notUpdated.push(p);
    }
    return { onTrack, behind, notUpdated };
  }, [participants, goals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals this week */}
      {goals ? (
        <Card className="bg-white border border-[#C8C8C8]">
          <CardContent className="p-4">
            <div className="text-sm font-bold text-[#1A1A1A] mb-3">This week's cohort targets</div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-2xl font-bold text-[#4242EA]">{goals.applications_goal || 0}</span>
                <span className="text-[#6B7280] ml-1">applications</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#4242EA]">{goals.networking_goal || 0}</span>
                <span className="text-[#6B7280] ml-1">networking</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#4242EA]">{goals.interviews_goal || 0}</span>
                <span className="text-[#6B7280] ml-1">interviews</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-[#6B7280]">No weekly goals set for this cohort yet.</p>
      )}

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-4 py-2 bg-[#4242EA]/10 text-[#4242EA] rounded-full text-sm font-medium">
          <span className="font-bold">{buckets.onTrack.length}</span> On Track
        </div>
        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
          <span className="font-bold">{buckets.behind.length}</span> Behind
        </div>
        <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
          <span className="font-bold">{buckets.notUpdated.length}</span> Not Updated
        </div>
      </div>

      {/* Buckets */}
      <div className="space-y-6">
        <Bucket title="On Track"    builders={buckets.onTrack}    goals={goals} color="text-[#4242EA]" />
        <Bucket title="Behind"      builders={buckets.behind}     goals={goals} color="text-amber-700" />
        <Bucket title="Not Updated" builders={buckets.notUpdated} goals={goals} color="text-gray-500" />
      </div>
    </div>
  );
};

export default PlanProgressTab;

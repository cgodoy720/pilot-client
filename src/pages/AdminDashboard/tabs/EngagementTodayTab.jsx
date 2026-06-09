import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import DateNavigator from '../components/DateNavigator';
import AttendanceSection from '../components/AttendanceSection';

const getTodayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';

const getInitials = (first, last) =>
  `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500',
];
const avatarColor = (userId) => AVATAR_COLORS[userId % AVATAR_COLORS.length];

const SignalDot = ({ active, label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-[#4242EA]' : 'bg-[#C8C8C8]'}`} />
    <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

const HollowDot = ({ label }) => (
  <div className="flex flex-col items-center gap-0.5">
    <div className="w-2.5 h-2.5 rounded-full border border-[#C8C8C8]" />
    <span className="text-[10px] text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

const borderColor = (tier) => {
  if (tier === 'engaged')     return 'border-l-[#4242EA]';
  if (tier === 'not_engaged') return 'border-l-[#EF4444]';
  return 'border-l-[#E3E3E3]';
};

const SummaryChip = ({ count, label, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${color}`}>
    <span className="text-lg font-bold">{count}</span>
    <span className="text-xs">{label}</span>
  </div>
);

const CLASS_DAYS = new Set([1, 2, 3, 4]); // Mon/Tue/Wed/Thu

const EngagementTodayTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayET);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [cardsOpen, setCardsOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/participants`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoading(false));
  }, [selectedCohortId, token]);

  // Auto-excuse placed builders on class days
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    const dateObj = new Date(selectedDate + 'T12:00:00');
    if (!CLASS_DAYS.has(dateObj.getDay())) return;
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/auto-excuse-employed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: selectedDate }),
    }).catch(() => {});
  }, [selectedCohortId, selectedDate, token]);

  const cohortName = selectedCohort?.name || '';
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const isClassDay = CLASS_DAYS.has(dateObj.getDay());

  const visibleParticipants = useMemo(() => {
    if (statusFilter === 'active')    return participants.filter(p => p.active);
    if (statusFilter === 'withdrawn') return participants.filter(p => !p.active);
    return participants;
  }, [participants, statusFilter]);

  const summary = useMemo(() => ({
    engaged:    visibleParticipants.filter(p => p.engagement_tier === 'engaged').length,
    notEngaged: visibleParticipants.filter(p => p.engagement_tier === 'not_engaged').length,
    placed:     visibleParticipants.filter(p => p.is_employed).length,
    noData:     visibleParticipants.filter(p => p.engagement_tier === 'no_data').length,
  }), [visibleParticipants]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#4242EA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DateNavigator selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        <SummaryChip count={summary.engaged}    label="Engaged"      color="bg-[#4242EA]/10 text-[#4242EA]" />
        <SummaryChip count={summary.notEngaged} label="Not Engaged"  color="bg-red-50 text-red-600" />
        <SummaryChip count={summary.placed}     label="Placed"       color="bg-green-50 text-green-700" />
        <SummaryChip count={summary.noData}     label="No Data"      color="bg-gray-100 text-gray-500" />
      </div>

      {/* Builder cards — collapsible */}
      <div className="border border-[#E3E3E3] rounded-lg bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCardsOpen(o => !o)}
              className="flex items-center gap-2 text-left"
            >
              <span className="text-sm font-semibold text-[#1A1A1A]">
                Builders <span className="font-normal text-[#6B7280]">({visibleParticipants.length})</span>
              </span>
              <svg
                className={`w-4 h-4 text-[#6B7280] transition-transform ${cardsOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex rounded-md border border-[#E3E3E3] overflow-hidden text-xs">
            {['active', 'all', 'withdrawn'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 capitalize transition-colors ${
                  statusFilter === f
                    ? 'bg-[#4242EA] text-white'
                    : 'bg-white text-[#6B7280] hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {cardsOpen && (
          <div className="px-4 pb-4 pt-1">
            {visibleParticipants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No Builders enrolled yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleParticipants.map((p) => {
                  if (p.is_employed) {
                    const isLongTerm = p.employment_type === 'full-time';
                    const badgeLabel = p.employment_type
                      ? p.employment_type.charAt(0).toUpperCase() + p.employment_type.slice(1)
                      : 'Placed';
                    const badgeCls = isLongTerm
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700';
                    return (
                      <Card key={p.user_id} className="bg-white border border-[#C8C8C8] border-l-4 border-l-[#E3E3E3]">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${avatarColor(p.user_id)} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{getInitials(p.first_name, p.last_name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                              {p.first_name} {p.last_name}
                            </div>
                            <Badge className={`${badgeCls} text-xs mt-1`}>{badgeLabel}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Card key={p.user_id} className={`bg-white border border-[#C8C8C8] border-l-4 ${borderColor(p.engagement_tier)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-9 h-9 rounded-full ${avatarColor(p.user_id)} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white text-xs font-bold">{getInitials(p.first_name, p.last_name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                              {p.first_name} {p.last_name}
                            </div>
                            <div className="text-xs text-[#6B7280] truncate">{p.email}</div>
                          </div>
                        </div>
                        <div className="flex items-end gap-3">
                          <SignalDot active={p.attendance_this_week} label="In Person" />
                          <SignalDot active={p.compass_this_week}    label="Compass" />
                          <SignalDot active={p.log_this_week}        label="1:1" />
                          <HollowDot label="Applied" />
                          <HollowDot label="Hustled" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class day: attendance tracking */}
      {isClassDay && cohortName && (
        <AttendanceSection
          selectedDate={selectedDate}
          cohortName={cohortName}
          selectedCohortId={selectedCohortId}
          externalRefreshKey={attendanceRefreshKey}
        />
      )}

      {/* Non-class day: job search activity card */}
      {!isClassDay && cohortName && (
        <Card className="bg-white border border-[#C8C8C8]">
          <CardContent className="p-5">
            <div className="text-sm font-bold text-[#1A1A1A] mb-3">Today's requirement</div>
            <div className="space-y-2 text-sm text-[#374151]">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${summary.engaged > 0 ? 'bg-[#4242EA]' : 'bg-[#C8C8C8]'}`} />
                <span>Log in to Compass — {summary.engaged} of {participants.filter(p => !p.is_employed).length} Builders active this week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C8C8C8]" />
                <span>Log job applications and networking activity</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EngagementTodayTab;

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { CheckCircle, Clock, Users, AlertTriangle } from 'lucide-react';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import useAuthStore from '../../../stores/authStore';
import AttendanceStatusDrawer from './AttendanceStatusDrawer';

const AttendanceSection = ({ selectedDate, cohortName, selectedCohortId, externalRefreshKey = 0 }) => {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerStatus, setDrawerStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const combinedRefreshKey = refreshKey + externalRefreshKey;

  useEffect(() => {
    if (!token || !cohortName || !selectedDate) return;
    setLoading(true);
    cachedAdminApi.getCachedDayBuilderStatus(cohortName, selectedDate, token, { forceRefresh: combinedRefreshKey > 0 })
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [token, cohortName, selectedDate, combinedRefreshKey]);

  const isNoClass = data?.noClass === true;
  const builders = data?.builders || [];
  const present = builders.filter(b => b.status === 'present').length;
  const late = builders.filter(b => b.status === 'late').length;
  const absent = builders.filter(b => b.status === 'absent').length;
  const excused = builders.filter(b => b.status === 'excused').length;

  const cards = [
    { id: 'present', label: 'Checked In', value: present + late, sub: 'Present + Late', color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle, filter: ['present', 'late'] },
    { id: 'ontime', label: 'On Time', value: present, sub: 'Arrived on time', color: 'text-green-600', bg: 'bg-green-50', Icon: Users, filter: ['present'] },
    { id: 'late', label: 'Late', value: late, sub: 'Arrived late', color: 'text-amber-600', bg: 'bg-amber-50', Icon: Clock, filter: ['late'] },
    { id: 'absent', label: 'Absent', value: absent, sub: `${excused} excused`, color: 'text-red-600', bg: 'bg-red-50', Icon: AlertTriangle, filter: ['absent'] },
  ];

  const handleRefresh = () => {
    cachedAdminApi.invalidateAllAttendanceCaches();
    setRefreshKey(k => k + 1);
  };

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Attendance</h4>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
        </div>
      ) : isNoClass ? (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-6 text-center">
          <div className="text-2xl mb-2">📅</div>
          <p className="text-sm font-medium text-slate-600">No Class — {data?.dayType || 'Non-instructional Day'}</p>
          <p className="text-xs text-slate-400 mt-1">Attendance is not tracked for this day</p>
        </div>
      ) : builders.length === 0 ? (
        <div className="bg-[#FAFAFA] rounded-lg border border-[#E3E3E3] p-6 text-center">
          <p className="text-sm text-slate-400">No attendance data for this date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ id, label, value, sub, color, bg, Icon, filter }) => (
            <button
              key={id}
              onClick={() => setDrawerStatus(filter)}
              className="text-left"
            >
              <Card className="bg-white border border-[#E3E3E3] hover:border-[#4242EA] hover:shadow-sm transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">{label}</p>
                      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                      <p className="text-xs text-slate-400 mt-1">{sub}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${bg}`}>
                      <Icon size={18} className={color} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}

      {drawerStatus && (
        <AttendanceStatusDrawer
          open={!!drawerStatus}
          onClose={() => setDrawerStatus(null)}
          statusFilter={drawerStatus}
          builders={builders}
          selectedDate={selectedDate}
          cohortName={cohortName}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
};

export default AttendanceSection;

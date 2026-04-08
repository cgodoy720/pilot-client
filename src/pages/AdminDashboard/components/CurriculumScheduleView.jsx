import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Calendar, Clock, ChevronRight, Edit, CheckCircle, Loader2, Circle } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import { usePermissions } from '../../../hooks/usePermissions';
import TaskEditDialog from '../../../components/curriculum/TaskEditDialog';

const API_URL = import.meta.env.VITE_API_URL;

const formatTime = (time) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
};

const STATUS_CONFIG = {
  completed:   { label: 'Completed',   icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
  in_progress: { label: 'In Progress', icon: Loader2,     color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-400' },
  not_started: { label: 'Not Started', icon: Circle,      color: 'text-slate-400', bg: 'bg-slate-50', dot: 'bg-slate-300' },
};

const TaskBuilderList = ({ taskId, selectedDate, selectedCohortId, token, prog }) => {
  const [builders, setBuilders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');

  useEffect(() => {
    if (!taskId || !token) return;
    setLoading(true);
    fetch(`${API_URL}/api/admin/dashboard/task-builder-status?cohortId=${selectedCohortId}&date=${selectedDate}&taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setBuilders(data.builders || []); })
      .catch(() => setBuilders([]))
      .finally(() => setLoading(false));
  }, [taskId, selectedDate, selectedCohortId, token]);

  if (loading) {
    return <div className="py-3 text-center"><span className="text-[10px] text-slate-400">Loading builders...</span></div>;
  }
  if (!builders || builders.length === 0) return null;

  const groups = {
    completed: builders.filter(b => b.status === 'completed'),
    in_progress: builders.filter(b => b.status === 'in_progress'),
    not_started: builders.filter(b => b.status === 'not_started'),
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-[#EFEFEF]">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = groups[key]?.length || 0;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors border-b-2 ${
                isActive ? `${cfg.color} border-current` : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
              <span className={`text-[10px] ${isActive ? '' : 'text-slate-300'}`}>{count}</span>
            </button>
          );
        })}
      </div>
      {/* Builder list */}
      <div className="max-h-[200px] overflow-y-auto">
        {groups[activeTab]?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-0.5 px-3 py-2">
            {groups[activeTab].map(b => (
              <div key={b.userId} className="flex items-center gap-1.5 py-1">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[activeTab].dot}`} />
                <span className="text-xs text-[#1E1E1E] truncate">{b.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-400 text-center py-3">None</p>
        )}
      </div>
    </div>
  );
};

const CATEGORY_COLORS = {
  instruction: 'border-[#4242EA] bg-[#4242EA]/5',
  practice: 'border-green-500 bg-green-50',
  break: 'border-yellow-400 bg-yellow-50',
  reflection: 'border-purple-400 bg-purple-50',
};

const ProgressBar = ({ notStarted, inProgress, completed, present }) => {
  const total = present || (notStarted + inProgress + completed);
  if (total === 0) return null;
  const pctCompleted = Math.round((completed / total) * 100);
  const pctInProgress = Math.round((inProgress / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 flex-1 rounded-full overflow-hidden bg-slate-100">
        {completed > 0 && <div className="bg-green-500 h-full" style={{ width: `${pctCompleted}%` }} />}
        {inProgress > 0 && <div className="bg-yellow-400 h-full" style={{ width: `${pctInProgress}%` }} />}
      </div>
      <div className="flex gap-2 text-[10px] text-slate-500 flex-shrink-0">
        {completed > 0 && <span className="text-green-600 font-medium">{completed} done</span>}
        {inProgress > 0 && <span className="text-yellow-600 font-medium">{inProgress} active</span>}
        {(total - completed - inProgress) > 0 && <span className="text-slate-400">{total - completed - inProgress} waiting</span>}
      </div>
    </div>
  );
};

const CurriculumScheduleView = ({ selectedDate, cohortName, selectedCohortId, onDayLoaded, hideHeader = false }) => {
  const token = useAuthStore((s) => s.token);
  const { canUseFeature } = usePermissions();
  const canEdit = canUseFeature?.('edit_curriculum') ?? false;

  const [dayData, setDayData] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch curriculum day
  useEffect(() => {
    if (!token || !cohortName || !selectedDate) return;
    setLoading(true);
    setDayData(null);
    setDayDetails(null);

    fetch(`${API_URL}/api/curriculum/days/date/${selectedDate}?cohort=${encodeURIComponent(cohortName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.status === 404 ? null : r.json())
      .then(data => {
        if (!data) { setLoading(false); return; }
        setDayData(data);
        const dayId = data.id || data.day_id;
        if (!dayId) { setLoading(false); return; }
        return fetch(`${API_URL}/api/curriculum/days/${dayId}/full-details?cohort=${encodeURIComponent(cohortName)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.ok ? r.json() : null).then(d => setDayDetails(d));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, cohortName, selectedDate, refreshKey]);

  // Notify parent when day data is available
  useEffect(() => {
    if (dayData && onDayLoaded) {
      const d = dayDetails?.day || dayData;
      onDayLoaded({
        day_number: d.day_number || dayData.day_number,
        week_number: d.week_number || dayData.week_number,
        daily_goal: d.daily_goal || dayData.daily_goal,
        weekly_goal: d.weekly_goal || dayData.weekly_goal,
      });
    } else if (!dayData && onDayLoaded) {
      onDayLoaded(null);
    }
  }, [dayData, dayDetails]);

  // Fetch live task progress
  useEffect(() => {
    if (!token || !selectedCohortId || !selectedDate) return;
    fetch(`${API_URL}/api/admin/dashboard/day-task-progress?cohortId=${selectedCohortId}&date=${selectedDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.success) setProgress(data.data || {}); })
      .catch(() => {});
  }, [token, selectedCohortId, selectedDate, refreshKey]);

  // Auto-refresh progress every 30s if viewing today
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    if (selectedDate !== today || !token || !selectedCohortId) return;
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/admin/dashboard/day-task-progress?cohortId=${selectedCohortId}&date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => { if (data.success) setProgress(data.data || {}); })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [token, selectedCohortId, selectedDate]);

  const dateObj = new Date(selectedDate + 'T12:00:00');
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const isToday = selectedDate === today;
  const now = new Date();
  const currentMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : null;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (!dayData) {
    return (
      <div className="bg-[#FAFAFA] rounded-lg border border-[#E3E3E3] p-8 text-center">
        <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500 font-medium">No curriculum day scheduled</p>
        <p className="text-xs text-slate-400 mt-1">This may be a weekend, holiday, or off day.</p>
      </div>
    );
  }

  const day = dayDetails?.day || dayData;
  const blocks = dayDetails?.timeBlocks || dayDetails?.blocks || [];
  const allTasks = blocks.flatMap(b => (b.tasks || []).map(t => ({
    ...t,
    task_title: t.task_title || t.title,
    task_description: t.task_description || t.description,
    task_type: t.task_type || t.type,
    start_time: t.start_time || b.start_time,
    end_time: t.end_time || b.end_time,
    block_category: t.block_category || b.block_category,
    block_title: b.title || b.block_title,
  })));

  // If no blocks, use flattenedTasks
  const tasks = allTasks.length > 0 ? allTasks : (dayDetails?.flattenedTasks || []).map(t => ({
    ...t,
    task_title: t.task_title || t.title,
    task_description: t.task_description || t.description,
    task_type: t.task_type || t.type,
  }));

  const isTaskActive = (task) => {
    if (!isToday || !task.start_time || !task.end_time) return false;
    const [sh, sm] = task.start_time.split(':').map(Number);
    const [eh, em] = task.end_time.split(':').map(Number);
    return currentMinutes >= sh * 60 + sm && currentMinutes < eh * 60 + em;
  };

  const dayNum = day.day_number || dayData.day_number;
  const weekNum = day.week_number || dayData.week_number;
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }).toUpperCase();

  return (
    <div className="space-y-4">
      {/* Schedule header — only if not rendered externally */}
      {!hideHeader && (
        <div className="bg-[#4242EA] text-white rounded-xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                {isToday ? 'TODAY' : dateStr}
              </p>
              <h2 className="text-xl font-bold mt-0.5">Day {dayNum || '—'}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70">{cohortName}</p>
              {weekNum && <p className="text-sm font-medium">Week {weekNum}</p>}
            </div>
          </div>
          {(day.daily_goal || dayData.daily_goal) && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-white/60 uppercase tracking-wide">Daily Goal</p>
              <p className="text-sm text-white/90 mt-0.5">{day.daily_goal || dayData.daily_goal}</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule / Agenda */}
      <div className="border border-[#E3E3E3] rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-[#E3E3E3] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Schedule</span>
          <span className="text-[10px] text-slate-400">{tasks.length} activities</span>
        </div>

        <div className="divide-y divide-[#EFEFEF]">
          {tasks.map((task, idx) => {
            const taskId = task.id || task.task_id;
            const active = isTaskActive(task);
            const prog = progress[taskId];
            const isExpanded = expandedTask === taskId;
            const category = task.block_category || '';
            const catClass = CATEGORY_COLORS[category] || 'border-slate-200 bg-white';
            const hasDeliverable = task.deliverable_type && task.deliverable_type !== 'none' && task.deliverable_type !== 'text';

            return (
              <div
                key={taskId || idx}
                className={`${active ? 'bg-[#4242EA]/5 ring-1 ring-inset ring-[#4242EA]/30' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedTask(isExpanded ? null : taskId)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors"
                >
                  {/* Time column */}
                  <div className="w-20 flex-shrink-0 pt-0.5">
                    {task.start_time ? (
                      <div>
                        <p className={`text-xs font-semibold ${active ? 'text-[#4242EA]' : 'text-[#1E1E1E]'}`}>
                          {formatTime(task.start_time)}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatTime(task.end_time)}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-300">—</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 border-l-2 pl-3 ${catClass.split(' ')[0]}`}>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${active ? 'text-[#4242EA]' : 'text-[#1E1E1E]'}`}>
                        {task.task_title}
                      </p>
                      {task.task_type && (
                        <Badge className="bg-[#EFEFEF] text-slate-500 text-[10px] px-1.5 py-0">{task.task_type}</Badge>
                      )}
                      {hasDeliverable && (
                        <Badge className="bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0">
                          {task.deliverable_type}
                        </Badge>
                      )}
                      {active && <span className="w-2 h-2 rounded-full bg-[#4242EA] animate-pulse" />}
                    </div>

                    {/* Live progress */}
                    {prog && (
                      <div className="mt-1.5">
                        <ProgressBar
                          notStarted={prog.present - prog.completed - prog.in_progress}
                          inProgress={prog.in_progress}
                          completed={prog.completed}
                          present={prog.present}
                        />
                      </div>
                    )}
                  </div>

                  {/* Expand chevron */}
                  <ChevronRight size={14} className={`text-slate-300 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded: description + actions + builder status list */}
                {isExpanded && (
                  <div className="border-t border-[#EFEFEF]">
                    {/* Description + Edit row */}
                    <div className="px-4 py-2.5 flex items-start justify-between gap-4">
                      {task.task_description ? (
                        <p className="text-xs text-slate-600 leading-relaxed flex-1">{task.task_description}</p>
                      ) : (
                        <span />
                      )}
                      {canEdit && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingTask(task); }}
                          className="flex items-center gap-1 text-xs font-medium text-[#4242EA] hover:underline flex-shrink-0"
                        >
                          <Edit size={12} /> Edit
                        </button>
                      )}
                    </div>
                    {/* Builder list */}
                    <TaskBuilderList
                      taskId={taskId}
                      selectedDate={selectedDate}
                      selectedCohortId={selectedCohortId}
                      token={token}
                      prog={prog}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <TaskEditDialog
        open={!!editingTask}
        onOpenChange={(isOpen) => { if (!isOpen) setEditingTask(null); }}
        task={editingTask}
        onSave={() => { setEditingTask(null); setRefreshKey(k => k + 1); }}
        canEdit={canEdit}
        token={token}
      />
    </div>
  );
};

export default CurriculumScheduleView;

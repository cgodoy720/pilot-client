/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarIcon, RefreshCw, AlertTriangle, CheckCircle2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

import useAuthStore from '../../../stores/authStore';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Checkbox } from '../../../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  listDemoCohortSources,
  listDemoCohortCurriculum,
  previewDemoCohortRefresh,
  executeDemoCohortRefresh,
  getDemoCohortStatus,
  startDemoSeedJob,
  getDemoSeedJob,
  advanceDemoCohort,
} from '../../../services/adminApi';

const DEMO_COHORT_ID = 'bf0af959-11ec-4903-860b-f9f6243a0a44';
const DEMO_USER_ID = 699;
const DEFAULT_SEED_START = '2026-03-02';
const DEFAULT_TOTAL_WEEKDAYS = 260;
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_OPERATING_DAYS = [1, 2, 3, 4, 5]; // Mon-Fri in week-order

function toISO(date) {
  if (!date) return '';
  if (typeof date === 'string') return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y) return '—';
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y) return null;
  return new Date(y, m - 1, d);
}

function DemoCohortManager() {
  const token = useAuthStore((s) => s.token);

  // --- shared state ---
  const [sources, setSources] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { cohorts } = await listDemoCohortSources(token);
        setSources(cohorts.filter((c) => c.cohort_id !== DEMO_COHORT_ID));
      } catch (error) {
        toast.error(`Failed to load cohorts: ${error.message}`);
      }
    })();
  }, [token]);

  const fetchStatus = async () => {
    try {
      const { status: s } = await getDemoCohortStatus(token);
      setStatus(s);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 font-proxima">
      <div>
        <h1 className="text-2xl font-proxima-bold text-[#1a1a1a]">Demo Cohort Manager</h1>
        <p className="text-sm text-gray-600 mt-1">
          Seed 12 months of curriculum + attendance + feedback for the Platform Demo cohort and keep it current automatically.
        </p>
      </div>

      <StatusCard status={status} onRefresh={fetchStatus} />
      <SeedTwelveMonthsCard token={token} sources={sources} onSeeded={fetchStatus} />
      <AdvanceTodayCard token={token} onAdvanced={fetchStatus} />
      <SingleWeekRefreshCard token={token} sources={sources} onRefreshed={fetchStatus} />
    </div>
  );
}

// ============================================================================
// Status
// ============================================================================

function StatusCard({ status, onRefresh }) {
  if (!status) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
        <CardContent className="text-sm text-gray-500">Loading…</CardContent>
      </Card>
    );
  }
  const job = status.latestJob;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Status</CardTitle>
          <CardDescription>Platform Demo cohort · user {DEMO_USER_ID}</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Curriculum range">
            {status.curriculumStart ? `${formatDate(status.curriculumStart)} → ${formatDate(status.curriculumEnd)}` : '—'}
          </Stat>
          <Stat label="Total days">{status.totalCurriculumDays}</Stat>
          <Stat label="Last seeded day">{status.lastSeededDate ? formatDate(status.lastSeededDate) : '—'}</Stat>
          <Stat label="Selfie pool">{status.selfiePoolSize}</Stat>
        </div>
        {job && (
          <div className="mt-4 rounded border bg-gray-50 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Last job #{job.id}</span>
              <Badge variant="outline">{job.status}</Badge>
            </div>
            {job.progress && (
              <pre className="mt-2 whitespace-pre-wrap break-all">{JSON.stringify(job.progress, null, 2)}</pre>
            )}
            {job.error && <div className="mt-2 text-red-700">{job.error}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, children }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 font-proxima-bold">{children}</div>
    </div>
  );
}

// ============================================================================
// Seed 12 months
// ============================================================================

function SeedTwelveMonthsCard({ token, sources, onSeeded }) {
  const [sourceCohortId, setSourceCohortId] = useState('');
  const [sourceDays, setSourceDays] = useState([]);
  const [selectedDayIds, setSelectedDayIds] = useState([]);
  const [startDate, setStartDate] = useState(parseISO(DEFAULT_SEED_START));
  const [totalWeekdays, setTotalWeekdays] = useState(DEFAULT_TOTAL_WEEKDAYS);
  const [operatingDays, setOperatingDays] = useState(DEFAULT_OPERATING_DAYS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [activeJob, setActiveJob] = useState(null);
  const [jobProgress, setJobProgress] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!sourceCohortId) {
      setSourceDays([]);
      setSelectedDayIds([]);
      return;
    }
    (async () => {
      try {
        const { days } = await listDemoCohortCurriculum(sourceCohortId, token);
        setSourceDays(days);
        setSelectedDayIds([]);
      } catch (error) {
        toast.error(`Failed to load curriculum: ${error.message}`);
      }
    })();
  }, [sourceCohortId, token]);

  const daysByWeek = useMemo(() => {
    const map = new Map();
    for (const d of sourceDays) {
      const key = d.week == null ? 'null' : String(d.week);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    return Array.from(map.entries())
      .map(([week, days]) => ({ week: week === 'null' ? null : Number(week), days }))
      .sort((a, b) => (a.week ?? 999) - (b.week ?? 999));
  }, [sourceDays]);

  const toggleDay = (dayId) => {
    setSelectedDayIds((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId].sort((a, b) => a - b)
    );
  };

  const pickWeek = (weekDays, checked) => {
    setSelectedDayIds((prev) => {
      const ids = new Set(prev);
      for (const d of weekDays) {
        if (checked) ids.add(d.id); else ids.delete(d.id);
      }
      return Array.from(ids).sort((a, b) => a - b);
    });
  };

  const toggleOperatingDay = (dow) => {
    setOperatingDays((prev) =>
      prev.includes(dow)
        ? prev.filter((d) => d !== dow)
        : [...prev, dow].sort((a, b) => a - b)
    );
  };

  const selectedCount = selectedDayIds.length;
  const canStart = sourceCohortId && selectedCount >= 5 && !!startDate && operatingDays.length > 0 && !activeJob;
  const anchorDow = operatingDays[operatingDays.length - 1];

  const pollJob = async (jobId) => {
    try {
      const { job } = await getDemoSeedJob(jobId, token);
      setJobProgress(job);
      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setActiveJob(null);
        if (job.status === 'completed') toast.success('Seed complete.');
        else toast.error(`Seed failed: ${job.error || 'unknown'}`);
        onSeeded();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const start = async () => {
    setConfirmOpen(false);
    setConfirmText('');
    try {
      const { jobId } = await startDemoSeedJob(
        {
          sourceCohortId,
          sourceDayIds: selectedDayIds,
          startDate: toISO(startDate),
          totalWeekdays,
          operatingDays,
        },
        token
      );
      toast.success(`Seed job ${jobId} started.`);
      setActiveJob(jobId);
      setJobProgress({ status: 'running', progress: {} });
      pollRef.current = setInterval(() => pollJob(jobId), 2_000);
    } catch (err) {
      toast.error(`Failed to start seed: ${err.message}`);
    }
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seed 12 months</CardTitle>
        <CardDescription>
          Wipe the demo cohort and rebuild it with 12 months of curriculum starting {formatDate(DEFAULT_SEED_START)}.
          Past weekdays get attendance + submissions + feedback; future weekdays are curriculum-only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Source cohort</Label>
            <Select value={sourceCohortId} onValueChange={setSourceCohortId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select cohort" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((c) => (
                  <SelectItem key={c.cohort_id} value={c.cohort_id}>
                    {c.name} ({c.curriculum_day_count} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1 w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? formatDate(toISO(startDate)) : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Total weekdays</Label>
            <Input
              type="number"
              min={20}
              max={520}
              value={totalWeekdays}
              onChange={(e) => setTotalWeekdays(Number(e.target.value))}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">260 ≈ 12 months of M–F.</p>
          </div>
        </div>

        <div>
          <Label>Operating days</Label>
          <div className="mt-1 flex gap-1 flex-wrap">
            {DOW_LABELS.map((lbl, dow) => {
              const active = operatingDays.includes(dow);
              const isAnchor = dow === anchorDow;
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => toggleOperatingDay(dow)}
                  className={`px-3 py-1.5 rounded-md text-xs font-proxima-bold border ${
                    active
                      ? 'bg-[#4242EA] text-white border-[#4242EA]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {lbl}{active && isAnchor ? ' ★' : ''}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Days the cohort operates. ★ marks the weekly-retro anchor (last operating day of the week). Non-operating days get no curriculum or attendance.
          </p>
        </div>

        {sourceCohortId && (
          <div className="border rounded-md">
            <div className="p-3 border-b flex items-center justify-between text-sm">
              <span>{selectedCount} source weekday{selectedCount === 1 ? '' : 's'} selected (template will repeat across the whole range)</span>
            </div>
            <div className="divide-y">
              {daysByWeek.map((wk) => {
                const allSelected = wk.days.every((d) => selectedDayIds.includes(d.id));
                return (
                  <div key={String(wk.week ?? 'null')} className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Checkbox checked={allSelected} onCheckedChange={(v) => pickWeek(wk.days, v)} />
                      <span className="font-semibold text-sm">
                        Week {wk.week ?? '—'} · {wk.days.length} days
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-7">
                      {wk.days.map((d) => (
                        <label key={d.id} className="flex items-center gap-2 text-xs text-gray-700">
                          <Checkbox
                            checked={selectedDayIds.includes(d.id)}
                            onCheckedChange={() => toggleDay(d.id)}
                          />
                          <span>Day {d.day_number} · {formatDate(d.day_date)}</span>
                          <Badge variant="outline" className="text-[10px]">{d.day_type}</Badge>
                          <span className="truncate text-gray-500">{d.daily_goal || ''}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={() => setConfirmOpen(true)} disabled={!canStart}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Seed 12 months
          </Button>
          {activeJob && (
            <div className="text-sm text-gray-700">
              Job #{activeJob} running…
              {jobProgress?.progress?.phase && <span className="ml-2">{jobProgress.progress.phase}</span>}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm seed</DialogTitle>
            <DialogDescription>
              This wipes the Platform Demo cohort&apos;s curriculum, attendance, submissions, and feedback,
              then rebuilds {totalWeekdays} weekdays of content starting {formatDate(toISO(startDate))}. Type <strong>SEED</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="SEED" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={start} disabled={confirmText !== 'SEED'}>Start seed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============================================================================
// Advance to today
// ============================================================================

function AdvanceTodayCard({ token, onAdvanced }) {
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const run = async () => {
    try {
      setRunning(true);
      const result = await advanceDemoCohort(token);
      setLastResult(result);
      toast.success(`Advance added ${result.addedDays} day(s).`);
      onAdvanced();
    } catch (err) {
      toast.error(`Advance failed: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Advance to today</CardTitle>
        <CardDescription>
          Fill in attendance, submissions, and feedback for any weekdays up to today that haven&apos;t been seeded yet.
          Idempotent — safe to run whenever.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Button onClick={run} disabled={running}>
          {running ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
          Run catch-up
        </Button>
        {lastResult && (
          <span className="text-sm text-gray-700 inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            +{lastResult.addedDays} day{lastResult.addedDays === 1 ? '' : 's'}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Single-week refresh (legacy utility, collapsed)
// ============================================================================

function SingleWeekRefreshCard({ token, sources, onRefreshed }) {
  const [open, setOpen] = useState(false);
  const [sourceCohortId, setSourceCohortId] = useState('');
  const [sourceDays, setSourceDays] = useState([]);
  const [selectedDayIds, setSelectedDayIds] = useState([]);
  const [targetStartDate, setTargetStartDate] = useState(null);
  const [attendanceOverrides] = useState({});
  const [reseedSubmission, setReseedSubmission] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    if (!sourceCohortId) { setSourceDays([]); setSelectedDayIds([]); return; }
    (async () => {
      try {
        const { days } = await listDemoCohortCurriculum(sourceCohortId, token);
        setSourceDays(days);
        setSelectedDayIds([]);
      } catch (error) { toast.error(`Failed to load curriculum: ${error.message}`); }
    })();
  }, [sourceCohortId, token]);

  const payload = () => ({
    targetCohortId: DEMO_COHORT_ID,
    sourceCohortId,
    sourceDayIds: selectedDayIds,
    targetStartDate: toISO(targetStartDate),
    attendance: { userId: DEMO_USER_ID, overrides: attendanceOverrides },
    reseedSubmission,
  });

  const onPreview = async () => {
    try {
      const { preview } = await previewDemoCohortRefresh(payload(), token);
      setPreviewData(preview);
      setPreviewOpen(true);
    } catch (err) { toast.error(`Preview failed: ${err.message}`); }
  };

  const onExecute = async () => {
    try {
      setExecuting(true);
      await executeDemoCohortRefresh(payload(), token);
      toast.success('Single week refreshed.');
      setPreviewOpen(false);
      onRefreshed();
    } catch (err) { toast.error(`Refresh failed: ${err.message}`); }
    finally { setExecuting(false); }
  };

  const toggleDay = (dayId) => setSelectedDayIds((prev) =>
    prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId].sort((a, b) => a - b)
  );

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <CardTitle className="text-base">Single-week refresh (utility)</CardTitle>
        <CardDescription>
          Quick one-shot: shift one week of content onto a specific target date. Legacy tool — most runs should use the 12-month seed + daily advance.
        </CardDescription>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Source cohort</Label>
              <Select value={sourceCohortId} onValueChange={setSourceCohortId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select cohort" /></SelectTrigger>
                <SelectContent>
                  {sources.map((c) => (
                    <SelectItem key={c.cohort_id} value={c.cohort_id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target start date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-1 w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetStartDate ? formatDate(toISO(targetStartDate)) : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={targetStartDate} onSelect={setTargetStartDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {sourceDays.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Day #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Week</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceDays.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDayIds.includes(d.id)}
                          onCheckedChange={() => toggleDay(d.id)}
                        />
                      </TableCell>
                      <TableCell>{d.day_number}</TableCell>
                      <TableCell>{formatDate(d.day_date)}</TableCell>
                      <TableCell>{d.week ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="legacyReseed" checked={reseedSubmission} onCheckedChange={setReseedSubmission} />
            <Label htmlFor="legacyReseed" className="text-sm">Re-seed sample submission for Dave</Label>
          </div>

          <Button onClick={onPreview} disabled={!sourceCohortId || selectedDayIds.length === 0 || !targetStartDate}>
            Preview
          </Button>
        </CardContent>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Planned changes</DialogTitle>
            <DialogDescription>Single-week refresh diff.</DialogDescription>
          </DialogHeader>
          {previewData && (
            <div className="text-sm space-y-2">
              <div className="rounded border bg-amber-50 p-3 text-amber-900 inline-flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                Wipe: {previewData.wipe.existingDays} day(s).
              </div>
              <div>Insert: {previewData.insert.days.length} days, {previewData.insert.blocks} blocks, {previewData.insert.tasks} tasks.</div>
              <div>Attendance: {previewData.insert.attendance.length} rows.</div>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Source</TableHead><TableHead>Target</TableHead><TableHead>Type</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {previewData.insert.days.map((d) => (
                    <TableRow key={d.sourceDayId}>
                      <TableCell>{formatDate(d.sourceDate)}</TableCell>
                      <TableCell>{formatDate(d.targetDate)}</TableCell>
                      <TableCell>{d.dayType}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={executing}>Cancel</Button>
            <Button onClick={onExecute} disabled={executing}>Execute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default DemoCohortManager;

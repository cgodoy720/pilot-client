// Real Bond + salary analysis data (from Google Sheets, until SF sync lands).
// All aggregates are computed live from bondAlumni so adding rows just works.

import { bondAlumni, bondJobChanges, layoffHistory, pauseHistory } from './bondData';

const median = (nums) => {
  const arr = nums.filter(n => n != null).sort((a, b) => a - b);
  if (!arr.length) return null;
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
};

const parseEmployerFromTitle = (title) => {
  if (!title) return null;
  const m = title.match(/\s+at\s+(.+?)$/i);
  return m ? m[1].trim() : null;
};
const parseRoleFromTitle = (title) => {
  if (!title) return null;
  const idx = title.toLowerCase().lastIndexOf(' at ');
  return idx >= 0 ? title.slice(0, idx).trim() : title.trim();
};

// Build alumni rows for the table (one row per fellow; keep most-recent job).
// salary-analysis sheet has multiple jobs per fellow; pick the row marked current
// (yearEnd present or "Present"), or the highest start date.
const alumniByFellow = new Map();
for (const job of bondAlumni) {
  const key = job.fellow.toLowerCase();
  const existing = alumniByFellow.get(key);
  if (!existing) {
    alumniByFellow.set(key, job);
    continue;
  }
  const a = existing, b = job;
  const aDate = a.startDate || '';
  const bDate = b.startDate || '';
  if (b.isCurrent && !a.isCurrent) alumniByFellow.set(key, b);
  else if (bDate > aDate) alumniByFellow.set(key, b);
}

// Layer Bond Job Changes (sheet 1) status onto matching fellows.
const layoffsByName = new Map(layoffHistory.map(l => [l.name.toLowerCase(), l]));
const pausesByName  = new Map(pauseHistory.map(p => [p.name.toLowerCase(), p]));

const alumniRows = Array.from(alumniByFellow.values()).map((job, i) => {
  const [first, ...rest] = job.fellow.split(' ');
  const last = rest.join(' ');
  const lowerName = job.fellow.toLowerCase();
  const isLaidOff = layoffsByName.has(lowerName);
  const isPaused = pausesByName.has(lowerName);

  return {
    salesforce_contact_id: `local-${i}`,
    user_id: null,
    email: null,
    first_name: first,
    last_name: last,
    cohort: job.cohort ? `Cohort ${job.cohort}` : null,
    core_cohort: job.cohort ? `Cohort ${job.cohort}` : null,
    core_stack: null,
    first_job_start_date: job.startDate,
    weeks_to_first_job: null,
    current_salary: job.salary,
    current_job_type: job.permTemp,
    outcomes_status: isLaidOff ? 'Laid Off' : (isPaused ? 'Paused' : (job.isCurrent ? job.employedStatus : 'Former')),
    isa_eligible: job.isaEligible,
    isa_complete: false, // not tracked in sheet
    num_current_jobs: job.isCurrent ? 1 : 0,
    num_jobs_held: 1,
    current_employer: job.organization,
    current_role: job.role,
    // Bond-specific extensions:
    bond_monthly_invoice: job.monthlyBondInvoice,
    bond_total_invoice: job.totalBondInvoice,
    bond_payments: job.bondPayments,
    bond_threshold: job.bondSalaryThreshold,
    income_share_pct: job.incomeSharePct,
    currently_invoicing: job.currentlyInvoicing,
    employee_type: job.employeeType,
    perm_temp: job.permTemp,
    is_laid_off: isLaidOff,
    is_paused: isPaused,
  };
});

// Compute overview KPIs.
const totalAlumni = alumniRows.length;
const hiredCount = alumniRows.filter(a => a.current_employer).length;
const isaEligibleCount = alumniRows.filter(a => a.isa_eligible).length;
// Compute median salary the same way as the Salary Analysis tab: all jobs in bondAlumni
// with a positive salary, no per-fellow dedup. Keeps the two views consistent.
const medianSalary = median(bondAlumni.filter(j => j.salary != null && j.salary > 0).map(j => j.salary));

// Last-12-months window (relative to "now" at module load).
const today = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const oneYearAgoIso = oneYearAgo.toISOString().slice(0, 10);
const todayIso = today.toISOString().slice(0, 10);

// Source: the Bond Job Changes sheet — "Start Invoicing" tab for new invoices,
// "Stop/Pause Invoicing" tab for layoffs.
const hiredNames = new Set();
for (const j of bondJobChanges) {
  if (!j.startDate) continue;
  if (j.startDate < oneYearAgoIso || j.startDate > todayIso) continue;
  hiredNames.add(j.name.toLowerCase());
}
const hiredLastYear = hiredNames.size;

const laidOffLastYear = layoffHistory.filter(l => l.date && l.date >= oneYearAgoIso && l.date <= todayIso).length;

export const mockOverview = {
  totalAlumni,
  hiredCount,
  hiredLastYear,
  laidOffLastYear,
  // Sheet doesn't track 3/6/12-mo hire rates directly.
  hireRate3mo: null,
  hireRate6mo: null,
  hireRate1yr: null,
  isaEligibleCount: 71,
  isaCompleteCount: 128,
  medianWeeksToJob: null,
  medianCurrentSalary: medianSalary,
  medianSalaryLift: null,
};

// Distinct cohorts for the filter dropdown.
const cohortSet = new Set(alumniRows.map(a => a.cohort).filter(Boolean));
export const mockCohorts = Array.from(cohortSet).sort();

export const mockAlumni = {
  data: alumniRows,
  total: alumniRows.length,
  limit: 500,
  offset: 0,
};

// Aggregated employers (one row per organization).
const empMap = new Map();
for (const a of alumniRows) {
  if (!a.current_employer) continue;
  const e = empMap.get(a.current_employer) || {
    employer_name: a.current_employer,
    alumni_count: 0,
    current_count: 0,
    pursuit_facilitated_count: 0,
    salaries: [],
  };
  e.alumni_count += 1;
  if (a.num_current_jobs > 0) e.current_count += 1;
  if (a.current_salary != null) e.salaries.push(a.current_salary);
  empMap.set(a.current_employer, e);
}
export const mockEmployers = Array.from(empMap.values())
  .map(e => ({
    employer_name: e.employer_name,
    alumni_count: e.alumni_count,
    current_count: e.current_count,
    pursuit_facilitated_count: e.pursuit_facilitated_count,
    avg_salary: e.salaries.length ? e.salaries.reduce((s, n) => s + n, 0) / e.salaries.length : null,
  }))
  .sort((a, b) => b.alumni_count - a.alumni_count);

export const mockSyncStatus = {
  sync_id: 0,
  started_at: null,
  finished_at: null,
  status: null,
  contacts_fetched: alumniRows.length,
  contacts_upserted: alumniRows.length,
  affiliations_fetched: bondAlumni.length,
  affiliations_upserted: bondAlumni.length,
  unmatched_emails: 0,
  error_message: 'Loaded from Bond Job Changes + Salary Analysis sheets. Salesforce sync not yet enabled.',
};

// Detail modal data — for any alumnus in the table, return them plus their job history.
export const buildAlumniDetail = (contactId) => {
  const alum = alumniRows.find(a => a.salesforce_contact_id === contactId);
  if (!alum) return null;
  const fellowName = `${alum.first_name} ${alum.last_name}`.toLowerCase();
  const jobs = bondAlumni.filter(j => j.fellow.toLowerCase() === fellowName);
  const affiliations = jobs.map((j, k) => ({
    salesforce_affiliation_id: `${alum.salesforce_contact_id}-${k}`,
    salesforce_contact_id: alum.salesforce_contact_id,
    employer_name: j.organization,
    role_title: j.role,
    start_date: j.startDate,
    end_date: j.endDate,
    offer_date: null,
    status: j.isCurrent ? 'Current' : 'Former',
    is_primary: k === 0,
    annualized_salary: j.salary,
    has_equity: null,
    location: null,
    manager: null,
    is_pursuit_impacted: true,
    pursuit_facilitated: j.commit || j.organization === 'Uber' || j.organization === 'JPMorgan Chase & Co.',
    job_info_confirmed: true,
    is_promotion: null,
    converted_temp_to_ft: false,
  }));
  return { outcome: alum, affiliations };
};

// Fallback for the old hard-coded modal stub (not really used now).
export const mockAlumniDetail = buildAlumniDetail('local-0');

// Re-export raw data so the new SalaryAnalysis / BondStatus sub-views can use it.
export { bondAlumni, bondJobChanges, layoffHistory, pauseHistory };

export const isMockMode = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('mock') === '1';
};

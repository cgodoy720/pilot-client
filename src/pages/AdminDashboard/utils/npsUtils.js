/**
 * Shared NPS aggregation over rows from /surveys/nps/weekly-by-cohort.
 *
 * NPS is linear in response counts, so combining weeks must sum net promoters
 * (promoters − detractors) and divide by total responses — never average the
 * per-week NPS values, which overweights small weeks. Rows from servers that
 * don't include promoter/detractor counts (legacy API) fall back to
 * reconstructing the net from nps × total_responses.
 */

const rowNet = (row) =>
  row.promoters != null && row.detractors != null
    ? row.promoters - row.detractors
    : (row.nps * (row.total_responses || 0)) / 100;

export const totalResponses = (rows) =>
  rows.reduce((sum, r) => sum + (r.total_responses || 0), 0);

// Combine weekly rows into a single NPS. Returns null when there are no responses.
export const combineNps = (rows) => {
  const total = totalResponses(rows);
  if (total <= 0) return null;
  const net = rows.reduce((sum, r) => sum + rowNet(r), 0);
  return Math.round((net * 100) / total);
};

// week_start.value can be "YYYY-MM-DD" or a full ISO timestamp — normalize to YYYY-MM-DD.
export const weekStartIso = (row) =>
  row.week_start?.value ? String(row.week_start.value).slice(0, 10) : null;

// Rows belonging to the most recent calendar week that has responses.
export const latestWeekRows = (rows) => {
  const latest = rows.reduce((max, r) => {
    const ws = weekStartIso(r);
    return ws && (!max || ws > max) ? ws : max;
  }, null);
  return latest ? rows.filter((r) => weekStartIso(r) === latest) : [];
};

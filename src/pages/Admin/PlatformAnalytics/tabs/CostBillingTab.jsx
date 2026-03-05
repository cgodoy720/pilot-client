import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { useExternalUsage, useUsageByModel } from '../hooks/usePlatformAnalytics';

const formatCost = (cost) => {
  if (!cost && cost !== 0) return '$0.00';
  const val = parseFloat(cost);
  if (val < 0.01 && val > 0) return `$${val.toFixed(4)}`;
  return `$${val.toFixed(2)}`;
};

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return parseInt(num, 10)?.toLocaleString() || '0';
};

const shortenModel = (model) => {
  if (!model) return 'Unknown';
  return model.replace(/^(anthropic|openai|google|deepseek|x-ai|moonshotai|minimax)\//, '');
};

const InfoCard = ({ title, children, description, scrollable }) => (
  <Card className="bg-white border border-[#E3E3E3]">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-[#1E1E1E]">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className={scrollable ? 'max-h-[480px] overflow-y-auto' : ''}>
      {children}
    </CardContent>
  </Card>
);

const AlertBox = ({ message }) => (
  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
    <p className="text-sm text-amber-700">{message}</p>
  </div>
);

const StatBox = ({ label, value, sub }) => (
  <div className="bg-slate-50 p-3 rounded-lg">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-lg font-bold text-[#1E1E1E]">{value}</p>
    {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const CostBillingTab = ({ token, startDate, endDate }) => {
  const { data: externalData, isLoading: externalLoading } = useExternalUsage(token, startDate, endDate);
  const { data: modelData, isLoading: modelLoading } = useUsageByModel(token, startDate, endDate);

  const openRouter = externalData?.openRouter;
  const anthropic = externalData?.anthropic;

  // Aggregate activity by model for the model breakdown
  const modelBreakdown = useMemo(() => {
    if (!openRouter?.activity || !Array.isArray(openRouter.activity)) return [];
    const map = {};
    openRouter.activity.forEach(item => {
      const model = shortenModel(item.model);
      if (!map[model]) {
        map[model] = { model, prompt_tokens: 0, completion_tokens: 0, cost: 0, requests: 0 };
      }
      map[model].prompt_tokens += (item.prompt_tokens || 0);
      map[model].completion_tokens += (item.completion_tokens || 0);
      map[model].cost += parseFloat(item.usage || 0);
      map[model].requests += parseInt(item.requests || 0, 10);
    });
    return Object.values(map).sort((a, b) => b.cost - a.cost);
  }, [openRouter?.activity]);

  const credits = openRouter?.credits;

  return (
    <div className="space-y-4">
      {/* OpenRouter + Anthropic — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <InfoCard
          title="OpenRouter"
          description="Credit balance, spend, and model breakdown from the OpenRouter API"
          scrollable
        >
          {externalLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : openRouter?.error ? (
            <AlertBox message={openRouter.error} />
          ) : (
            <div className="space-y-4">
              {/* Spend stats */}
              {credits && (
                <div className="grid grid-cols-3 gap-2">
                  <StatBox label="Monthly Spend" value={formatCost(credits.usage_monthly)} />
                  <StatBox label="Weekly Spend" value={formatCost(credits.usage_weekly)} />
                  <StatBox label="Today's Spend" value={formatCost(credits.usage_daily)} />
                  <StatBox label="Total Spend" value={formatCost(credits.usage)} />
                  <StatBox
                    label="Remaining"
                    value={credits.limit_remaining != null ? formatCost(credits.limit_remaining) : '—'}
                    sub={credits.limit ? `of ${formatCost(credits.limit)} limit` : 'No limit set'}
                  />
                  <StatBox
                    label="Plan"
                    value={credits.is_free_tier ? 'Free Tier' : 'Paid'}
                    sub={credits.label || undefined}
                  />
                </div>
              )}

              {/* Model breakdown */}
              {modelBreakdown.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">Model Breakdown (30d)</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Prompt</TableHead>
                        <TableHead className="text-right">Completion</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Reqs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelBreakdown.map((m, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{m.model}</TableCell>
                          <TableCell className="text-right">{formatNumber(m.prompt_tokens)}</TableCell>
                          <TableCell className="text-right">{formatNumber(m.completion_tokens)}</TableCell>
                          <TableCell className="text-right">{formatCost(m.cost)}</TableCell>
                          <TableCell className="text-right">{m.requests.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-slate-50 font-semibold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">
                          {formatNumber(modelBreakdown.reduce((s, m) => s + m.prompt_tokens, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(modelBreakdown.reduce((s, m) => s + m.completion_tokens, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCost(modelBreakdown.reduce((s, m) => s + m.cost, 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {modelBreakdown.reduce((s, m) => s + m.requests, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </>
              )}

              {/* Daily activity table */}
              {openRouter?.activity && Array.isArray(openRouter.activity) && openRouter.activity.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide pt-1">Daily Activity Log</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Prompt</TableHead>
                        <TableHead className="text-right">Completion</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Reqs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {openRouter.activity.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium whitespace-nowrap">
                            {item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </TableCell>
                          <TableCell>{shortenModel(item.model)}</TableCell>
                          <TableCell className="text-right">{formatNumber(item.prompt_tokens || 0)}</TableCell>
                          <TableCell className="text-right">{formatNumber(item.completion_tokens || 0)}</TableCell>
                          <TableCell className="text-right">{formatCost(item.usage)}</TableCell>
                          <TableCell className="text-right">{parseInt(item.requests || 0, 10).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {!openRouter?.activity && !credits && (
                <p className="text-slate-400 text-sm">No OpenRouter data available</p>
              )}
            </div>
          )}
        </InfoCard>

        <InfoCard
          title="Anthropic (Direct API)"
          description="Daily usage from the Anthropic Admin API"
          scrollable
        >
          {externalLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : anthropic?.error ? (
            <AlertBox message={anthropic.error} />
          ) : anthropic?.usage?.data ? (() => {
            const nonEmptyBuckets = anthropic.usage.data.filter(
              b => b.results && b.results.length > 0 &&
              b.results.some(r => (r.uncached_input_tokens || 0) + (r.output_tokens || 0) > 0)
            );
            if (nonEmptyBuckets.length === 0) {
              return <div className="text-center py-8 text-slate-400">No Anthropic usage data for this period</div>;
            }
            return (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Input</TableHead>
                    <TableHead className="text-right">Output</TableHead>
                    <TableHead className="text-right">Cache</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nonEmptyBuckets.flatMap((bucket, bi) => {
                    const bucketDate = new Date(bucket.starting_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    });
                    return bucket.results
                      .filter(r => (r.uncached_input_tokens || 0) + (r.output_tokens || 0) > 0)
                      .map((r, ri) => (
                      <TableRow key={`${bi}-${ri}`}>
                        <TableCell className="font-medium">{bucketDate}</TableCell>
                        <TableCell>{r.model || 'All models'}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.uncached_input_tokens || 0)}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.output_tokens || 0)}</TableCell>
                        <TableCell className="text-right">{formatNumber(r.cache_read_input_tokens || 0)}</TableCell>
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            );
          })() : anthropic?.usage ? (
            <div className="text-center py-8 text-slate-400">No Anthropic usage data for this period</div>
          ) : (
            <AlertBox message="Anthropic admin API key not configured. Add ANTHROPIC_ADMIN_KEY to your environment for direct usage data." />
          )}
        </InfoCard>
      </div>

      {/* Internal Cost Estimates — full width */}
      <InfoCard
        title="Internal Cost Estimates by Model"
        description="Cost estimates from usage logs (based on per-token pricing)"
      >
        {modelLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !modelData || modelData.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No internal usage data yet</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className="text-right">Prompt Tokens</TableHead>
                <TableHead className="text-right">Completion Tokens</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead className="text-right">Requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{shortenModel(row.model)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.provider === 'claude_direct' ? 'Claude Direct' : 'OpenRouter'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(row.prompt_tokens)}</TableCell>
                  <TableCell className="text-right">{formatNumber(row.completion_tokens)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCost(row.estimated_cost)}</TableCell>
                  <TableCell className="text-right">{parseInt(row.request_count, 10).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {/* Total row */}
              <TableRow className="bg-slate-50 font-semibold">
                <TableCell>Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right">
                  {formatNumber(modelData.reduce((sum, r) => sum + parseInt(r.prompt_tokens || 0, 10), 0))}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(modelData.reduce((sum, r) => sum + parseInt(r.completion_tokens || 0, 10), 0))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCost(modelData.reduce((sum, r) => sum + parseFloat(r.estimated_cost || 0), 0))}
                </TableCell>
                <TableCell className="text-right">
                  {modelData.reduce((sum, r) => sum + parseInt(r.request_count || 0, 10), 0).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </InfoCard>
    </div>
  );
};

export default CostBillingTab;

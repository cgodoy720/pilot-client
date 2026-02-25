import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { useExternalUsage, useUsageByModel } from '../hooks/usePlatformAnalytics';

const formatCost = (cost) => {
  if (!cost && cost !== 0) return '$0.00';
  const val = parseFloat(cost);
  if (val < 0.01) return `$${val.toFixed(4)}`;
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

const InfoCard = ({ title, children, description }) => (
  <Card className="bg-white border border-[#E3E3E3]">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-[#1E1E1E]">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const AlertBox = ({ message }) => (
  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
    <p className="text-sm text-amber-700">{message}</p>
  </div>
);

const CostBillingTab = ({ token, startDate, endDate }) => {
  const { data: externalData, isLoading: externalLoading } = useExternalUsage(token, startDate, endDate);
  const { data: modelData, isLoading: modelLoading } = useUsageByModel(token, startDate, endDate);

  const openRouter = externalData?.openRouter;
  const anthropic = externalData?.anthropic;

  return (
    <div className="space-y-6">
      {/* OpenRouter Section */}
      <InfoCard
        title="OpenRouter"
        description="Credit balance and usage from the OpenRouter API"
      >
        {externalLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : openRouter?.error ? (
          <AlertBox message={openRouter.error} />
        ) : (
          <div className="space-y-4">
            {/* Credits */}
            {openRouter?.credits && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-500">Credit Balance</p>
                  <p className="text-xl font-bold text-[#1E1E1E]">
                    {formatCost(openRouter.credits.balance || openRouter.credits.usage)}
                  </p>
                </div>
                {openRouter.credits.limit && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Credit Limit</p>
                    <p className="text-xl font-bold text-[#1E1E1E]">{formatCost(openRouter.credits.limit)}</p>
                  </div>
                )}
                {openRouter.credits.is_free_tier !== undefined && (
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Plan</p>
                    <Badge variant={openRouter.credits.is_free_tier ? 'secondary' : 'default'}>
                      {openRouter.credits.is_free_tier ? 'Free Tier' : 'Paid'}
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {/* Activity */}
            {openRouter?.activity && Array.isArray(openRouter.activity) && openRouter.activity.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openRouter.activity.slice(0, 15).map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{shortenModel(item.model || item.model_id)}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.total_tokens || item.tokens)}</TableCell>
                      <TableCell className="text-right">{formatCost(item.cost || item.total_cost)}</TableCell>
                      <TableCell className="text-right">{(item.num_requests || item.requests || 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!openRouter?.activity && !openRouter?.credits && (
              <p className="text-slate-400 text-sm">No OpenRouter activity data available</p>
            )}
          </div>
        )}
      </InfoCard>

      {/* Anthropic Section */}
      <InfoCard
        title="Anthropic (Direct API)"
        description="Daily usage report from the Anthropic Admin API, grouped by model"
      >
        {externalLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : anthropic?.error ? (
          <AlertBox message={anthropic.error} />
        ) : anthropic?.usage?.data ? (() => {
          // Filter to only buckets that have results with actual token usage
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
                  <TableHead className="text-right">Input Tokens</TableHead>
                  <TableHead className="text-right">Output Tokens</TableHead>
                  <TableHead className="text-right">Cache Read</TableHead>
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

      {/* Internal Cost Estimates by Model */}
      <InfoCard
        title="Internal Cost Estimates by Model"
        description="Cost estimates from our usage logs (based on per-token pricing)"
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

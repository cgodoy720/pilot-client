import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../../../components/ui/table';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Plus, Send, Trash2, Edit2, BarChart2, ArrowLeft, RefreshCw } from 'lucide-react';
import ApplicantCampaignBuilder from './ApplicantCampaignBuilder';

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS = {
  draft:     'bg-gray-100 text-gray-600',
  scheduled: 'bg-yellow-100 text-yellow-700',
  sending:   'bg-blue-100 text-blue-700',
  sent:      'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtPct = (n) => `${parseFloat(n || 0).toFixed(1)}%`;

export default function ApplicantCampaignsTab({ token }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [analyticsFor, setAnalyticsFor] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admissions/applicant-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const openAnalytics = async (campaign) => {
    setAnalyticsFor(campaign);
    setAnalyticsLoading(true);
    setAnalyticsData(null);
    try {
      const res = await fetch(`${API}/api/admissions/applicant-campaigns/${campaign.campaign_id}/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load analytics');
      setAnalyticsData(await res.json());
    } catch (err) {
      alert(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/admissions/applicant-campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Delete failed');
      fetchCampaigns();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Send this campaign now?')) return;
    try {
      const res = await fetch(`${API}/api/admissions/applicant-campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Send failed');
      fetchCampaigns();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── Analytics view ────────────────────────────────────────────────────────
  if (analyticsFor) {
    const s = analyticsData?.stats;
    const chartData = s ? [
      { name: 'Sent',    value: parseInt(s.sent),       color: '#6366f1' },
      { name: 'Opened',  value: parseInt(s.opened),     color: '#22c55e' },
      { name: 'Clicked', value: parseInt(s.clicked),    color: '#f59e0b' },
      { name: 'Unsub.',  value: parseInt(s.unsubscribed), color: '#ef4444' },
    ] : [];

    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="font-proxima gap-1"
            onClick={() => { setAnalyticsFor(null); setAnalyticsData(null); }}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div>
            <h2 className="font-proxima font-semibold text-lg">{analyticsFor.name}</h2>
            <p className="text-sm text-gray-500 font-proxima">Sent {fmt(analyticsData?.campaign?.sent_at)}</p>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="text-center py-12 text-gray-400 font-proxima">Loading analytics…</div>
        ) : s ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Open Rate',    value: fmtPct(s.open_rate),        sub: `${s.opened} opened` },
                { label: 'Click Rate',   value: fmtPct(s.click_rate),       sub: `${s.clicked} clicked` },
                { label: 'Unsubscribed', value: fmtPct(s.unsubscribe_rate), sub: `${s.unsubscribed} unsub.` },
                { label: 'Sent',         value: s.sent,                     sub: `of ${analyticsData?.campaign?.recipient_count || 0} recipients` },
              ].map(stat => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 font-proxima">{stat.label}</p>
                    <p className="text-2xl font-bold font-proxima">{stat.value}</p>
                    <p className="text-xs text-gray-400 font-proxima">{stat.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'proxima-nova' }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-proxima">Recipient</TableHead>
                      <TableHead className="font-proxima">Status</TableHead>
                      <TableHead className="font-proxima">Opened</TableHead>
                      <TableHead className="font-proxima">Clicked</TableHead>
                      <TableHead className="font-proxima">Unsubscribed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analyticsData?.recipients || []).map(r => (
                      <TableRow key={r.recipient_id}>
                        <TableCell className="font-proxima text-sm">
                          {r.first_name} {r.last_name}<br />
                          <span className="text-gray-400 text-xs">{r.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs font-proxima ${STATUS_COLORS[r.status] || ''}`}>{r.status}</Badge>
                        </TableCell>
                        <TableCell className="font-proxima text-sm text-gray-600">{r.opened_at ? fmt(r.opened_at) : '—'}</TableCell>
                        <TableCell className="font-proxima text-sm text-gray-600">{r.clicked_at ? fmt(r.clicked_at) : '—'}</TableCell>
                        <TableCell className="font-proxima text-sm text-gray-600">{r.unsubscribed_at ? fmt(r.unsubscribed_at) : '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-gray-400 font-proxima text-sm">No analytics data yet.</p>
        )}
      </div>
    );
  }

  // ── Campaign list ─────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-proxima font-semibold text-lg">Applicant Email Campaigns</h2>
          <p className="text-sm text-gray-500 font-proxima">
            Send targeted mass emails to applicants by pipeline stage, assessment, and more.
            Recipients cannot see each other.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-proxima gap-1" onClick={fetchCampaigns}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima gap-2"
            onClick={() => { setEditingCampaign(null); setBuilderOpen(true); }}
          >
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-proxima">Loading campaigns…</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-proxima">
          <p className="text-lg mb-2">No applicant campaigns yet.</p>
          <p className="text-sm">Click <strong>New Campaign</strong> to get started.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-proxima">Campaign</TableHead>
                  <TableHead className="font-proxima">Status</TableHead>
                  <TableHead className="font-proxima">Sent</TableHead>
                  <TableHead className="font-proxima">Opens</TableHead>
                  <TableHead className="font-proxima">Clicks</TableHead>
                  <TableHead className="font-proxima">Created</TableHead>
                  <TableHead className="font-proxima w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map(c => {
                  const sent = parseInt(c.sent_count) || 0;
                  const openRate = sent ? ((c.opened_count / sent) * 100).toFixed(1) : '—';
                  const clickRate = sent ? ((c.clicked_count / sent) * 100).toFixed(1) : '—';
                  return (
                    <TableRow key={c.campaign_id}>
                      <TableCell>
                        <p className="font-proxima font-medium text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 font-proxima truncate max-w-[240px]">{c.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs font-proxima capitalize ${STATUS_COLORS[c.status] || ''}`}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-proxima text-sm text-gray-600">{sent || '—'}</TableCell>
                      <TableCell className="font-proxima text-sm text-gray-600">
                        {sent ? `${openRate}%` : '—'}
                      </TableCell>
                      <TableCell className="font-proxima text-sm text-gray-600">
                        {sent ? `${clickRate}%` : '—'}
                      </TableCell>
                      <TableCell className="font-proxima text-sm text-gray-500">{fmt(c.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {c.status === 'sent' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Analytics"
                              onClick={() => openAnalytics(c)}>
                              <BarChart2 className="h-3.5 w-3.5 text-[#4242ea]" />
                            </Button>
                          )}
                          {(c.status === 'draft' || c.status === 'scheduled') && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit"
                                onClick={() => { setEditingCampaign(c); setBuilderOpen(true); }}>
                                <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Send Now"
                                onClick={() => handleSend(c.campaign_id)}>
                                <Send className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Delete"
                                onClick={() => handleDelete(c.campaign_id)}>
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {builderOpen && (
        <ApplicantCampaignBuilder
          token={token}
          campaign={editingCampaign}
          onClose={() => { setBuilderOpen(false); setEditingCampaign(null); }}
          onSaved={() => { setBuilderOpen(false); setEditingCampaign(null); fetchCampaigns(); }}
        />
      )}
    </div>
  );
}

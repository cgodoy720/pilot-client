import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../../../components/ui/table';
import { Plus, Edit2, Trash2, RefreshCw, Zap } from 'lucide-react';
import AutomationBuilder from './AutomationBuilder';

const API = import.meta.env.VITE_API_URL;

const TRIGGER_LABELS = {
  days_after_account_created:       'Days after account created',
  days_after_app_started:           'Days after app started',
  days_after_app_submitted:         'Days after app submitted',
  days_after_info_session_attended: 'Days after info session',
  days_after_no_action:             'Days after no action',
  stage_changed_to:                 'Stage changed to',
  days_after_lead_created:          'Days after lead created',
};

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtPct = (n, d) => d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '—';

export default function AutomationsTab({ token }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admissions/automations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setRules(await res.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleToggle = async (rule) => {
    await fetch(`${API}/api/admissions/automations/${rule.rule_id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active })
    });
    fetchRules();
  };

  const handleDelete = async (rule) => {
    if (!confirm(`Delete "${rule.name}"? This cannot be undone.`)) return;
    await fetch(`${API}/api/admissions/automations/${rule.rule_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchRules();
  };

  const triggerDescription = (rule) => {
    const base = TRIGGER_LABELS[rule.trigger_type] || rule.trigger_type;
    if (rule.trigger_type === 'stage_changed_to') return `${base}: ${rule.trigger_stage || '—'}`;
    if (rule.trigger_delay_days) return `${base} (${rule.trigger_delay_days}d)`;
    return base;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-proxima font-semibold text-lg">Automation Rules</h2>
          <p className="text-sm text-gray-500 font-proxima">
            Trigger-based emails sent automatically to applicants and leads.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-proxima gap-1" onClick={fetchRules}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            className="bg-[#4242ea] hover:bg-[#3333d1] font-proxima gap-2"
            onClick={() => { setEditingRule(null); setBuilderOpen(true); }}
          >
            <Plus className="h-4 w-4" /> New Rule
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 font-proxima">Loading automation rules…</div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-proxima">
          <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg mb-1">No automation rules yet.</p>
          <p className="text-sm">Click <strong>New Rule</strong> to create your first automation.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-proxima">Name</TableHead>
                  <TableHead className="font-proxima">Audience</TableHead>
                  <TableHead className="font-proxima">Trigger</TableHead>
                  <TableHead className="font-proxima">Sent</TableHead>
                  <TableHead className="font-proxima">Opens</TableHead>
                  <TableHead className="font-proxima">Active</TableHead>
                  <TableHead className="font-proxima w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(rule => (
                  <TableRow key={rule.rule_id}>
                    <TableCell>
                      <p className="font-proxima font-medium text-sm">{rule.name}</p>
                      {rule.description && (
                        <p className="text-xs text-gray-400 font-proxima truncate max-w-[260px]">{rule.description}</p>
                      )}
                      {rule.is_builtin && (
                        <Badge className="text-xs font-proxima bg-purple-50 text-purple-600 mt-0.5">built-in</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-proxima capitalize ${
                        rule.audience === 'lead' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rule.audience}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-proxima text-sm text-gray-600">
                      {triggerDescription(rule)}
                    </TableCell>
                    <TableCell className="font-proxima text-sm text-gray-600">
                      {parseInt(rule.total_sent) || 0}
                    </TableCell>
                    <TableCell className="font-proxima text-sm text-gray-600">
                      {fmtPct(parseInt(rule.total_opened) || 0, parseInt(rule.total_sent) || 0)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          rule.is_active ? 'bg-[#4242ea]' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.is_active ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7" title="Edit"
                          onClick={() => { setEditingRule(rule); setBuilderOpen(true); }}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                        {!rule.is_builtin && (
                          <Button
                            variant="ghost" size="icon" className="h-7 w-7" title="Delete"
                            onClick={() => handleDelete(rule)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {builderOpen && (
        <AutomationBuilder
          token={token}
          rule={editingRule}
          onClose={() => { setBuilderOpen(false); setEditingRule(null); }}
          onSaved={() => { setBuilderOpen(false); setEditingRule(null); fetchRules(); }}
        />
      )}
    </div>
  );
}

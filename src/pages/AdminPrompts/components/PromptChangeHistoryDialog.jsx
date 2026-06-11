import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Clock, RotateCcw, Loader2 } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';

/**
 * PromptChangeHistoryDialog — modal listing recent edits for one entity
 * across the V2 coach engine audit trail, with a "Revert to this version"
 * button per row.
 *
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   target: { entityType, entityId, entityName, title? }
 *   onReverted: () => void   // parent refreshes data after a revert
 *   showNotification: (msg, severity) => void
 */
export default function PromptChangeHistoryDialog({ open, onClose, target, onReverted, showNotification }) {
  // Read the token via the auth store selector so a renamed/rotated key
  // doesn't silently send `Bearer null` — matches the project pattern.
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [reverting, setReverting] = useState(null); // id being reverted

  useEffect(() => {
    if (!open || !target) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const url = `${import.meta.env.VITE_API_URL}/api/admin/prompts/change-history?entityType=${encodeURIComponent(target.entityType)}&entityId=${encodeURIComponent(target.entityId)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const body = await res.json();
        if (!cancelled) setHistory(body.history || []);
      } catch (e) {
        console.error('history load failed', e);
        showNotification?.('Failed to load history', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, target, token, showNotification]);

  const handleRevert = async (rowId) => {
    if (!confirm('Revert to this version? The current state will be saved as a new history entry, then the entity will be set to the snapshot from this row.')) return;
    try {
      setReverting(rowId);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/prompts/change-history/${rowId}/revert`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `revert failed: ${res.status}`);
      }
      showNotification?.(`Reverted to version #${rowId}`);
      onReverted?.();
      onClose();
    } catch (e) {
      console.error('revert failed', e);
      showNotification?.(`Revert failed: ${e.message}`, 'error');
    } finally {
      setReverting(null);
    }
  };

  // Render a tiny content preview from new_value's notable field, depending
  // on entity type. Keeps the list scannable without expanding huge JSONB.
  const renderPreview = (row) => {
    const v = row.new_value;
    if (!v || typeof v !== 'object') return null;
    if (typeof v.content === 'string') {
      const snippet = v.content.replace(/\s+/g, ' ').trim().slice(0, 120);
      return snippet + (v.content.length > 120 ? '…' : '');
    }
    if (v.value !== undefined) {
      return `value: ${JSON.stringify(v.value)}`;
    }
    if (v.skills) {
      return `skills: ${Object.keys(v.skills).length}, categories: ${Object.keys(v.categories || {}).length}`;
    }
    return null;
  };

  const fmtTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch { return iso; }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-proxima-bold text-[#1E1E1E] text-xl flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#4242EA]" />
            Change History
          </DialogTitle>
          <DialogDescription className="font-proxima text-[#666]">
            Recent edits to <code className="font-mono text-[#4242EA]">{target?.entityName || target?.entityId}</code>. Click revert to restore that snapshot — it will be saved as a new entry, not destructive.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-[#666]">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading history…
            </div>
          ) : history.length === 0 ? (
            <p className="font-proxima text-sm text-[#666] text-center py-12">
              No edits recorded yet. History captures changes from this point on.
            </p>
          ) : (
            <ScrollArea className="max-h-[55vh]">
              <ul className="space-y-2">
                {history.map((row, idx) => (
                  <li key={row.id} className="border border-[#E3E3E3] rounded-lg p-3 hover:border-[#4242EA] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {idx === 0 && (
                            <Badge variant="outline" className="text-xs border-[#4242EA] text-[#4242EA] bg-[#4242EA]/5">
                              Current
                            </Badge>
                          )}
                          <span className="font-proxima text-xs text-[#999]">#{row.id}</span>
                          <span className="font-proxima text-xs text-[#666]">{fmtTime(row.changed_at)}</span>
                          {row.changed_by_email && (
                            <span className="font-proxima text-xs text-[#666]">· {row.changed_by_email}</span>
                          )}
                        </div>
                        {row.change_summary && (
                          <p className="font-proxima text-sm text-[#1E1E1E]">{row.change_summary}</p>
                        )}
                        {renderPreview(row) && (
                          <p className="font-mono text-xs text-[#666] mt-1 line-clamp-2">{renderPreview(row)}</p>
                        )}
                      </div>
                      {idx !== 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3] shrink-0"
                          onClick={() => handleRevert(row.id)}
                          disabled={reverting !== null}
                        >
                          {reverting === row.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          )}
                          Revert
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Chip, IconButton, TextField, Typography, Paper, List,
  ListItemButton, ListItemText, CircularProgress, Tooltip, ClickAwayListener,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

interface LinkedOpportunitiesProps {
  projectId: string;
  onOppClick?: (oppId: string) => void;
}

interface OppLink { id: string; opportunity_id: string; role: string; name?: string; }

const LinkedOpportunities: React.FC<LinkedOpportunitiesProps> = ({ projectId, onOppClick }) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ['project-opportunities', projectId];
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const { data: linksData } = useQuery(QUERY_KEY, async () => {
    const res = await apiService.getProjectOpportunities(projectId);
    return (res.data?.data || []) as OppLink[];
  }, { staleTime: 30_000, enabled: !!projectId });
  const links: OppLink[] = linksData || [];

  const { data: oppsData } = useQuery(['opportunities'], async () => {
    const res = await apiService.getOpportunities();
    const raw = res.data;
    return Array.isArray(raw) ? raw : (raw?.opportunities || raw?.data || []);
  }, { staleTime: 60_000 });
  const allOpps: any[] = oppsData || [];

  const resolvedLinks = links.map((link) => {
    const opp = allOpps.find((o: any) => o.Id === link.opportunity_id);
    return { ...link, name: opp?.Name || link.opportunity_id };
  });

  const linkMutation = useMutation(
    (oppId: string) => apiService.linkOpportunity(projectId, { opportunity_id: oppId }),
    { onSuccess: () => { queryClient.invalidateQueries(QUERY_KEY); toast.success('Opportunity linked'); setShowSearch(false); setSearchQuery(''); setSearchResults([]); },
      onError: () => { toast.error('Failed to link opportunity'); } }
  );

  const unlinkMutation = useMutation(
    (oppId: string) => apiService.unlinkOpportunity(projectId, oppId),
    { onSuccess: () => { queryClient.invalidateQueries(QUERY_KEY); toast.success('Opportunity unlinked'); },
      onError: () => { toast.error('Failed to unlink opportunity'); } }
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiService.globalSearch(value.trim());
        const data = res.data?.data || res.data || {};
        const opps = data.opportunities || [];
        const linkedIds = new Set(links.map((l) => l.opportunity_id));
        setSearchResults(opps.filter((o: any) => !linkedIds.has(o.Id)));
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [links]);

  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current); }; }, []);

  if (!projectId) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', minHeight: 28 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, fontWeight: 600 }}>Linked Opps:</Typography>
      {resolvedLinks.map((link) => (
        <Chip key={link.opportunity_id} label={link.name} size="small" variant="outlined"
          onClick={() => onOppClick?.(link.opportunity_id)}
          onDelete={() => unlinkMutation.mutate(link.opportunity_id)}
          deleteIcon={<CloseIcon sx={{ fontSize: 12 }} />}
          sx={{ fontSize: '0.7rem', height: 22, cursor: onOppClick ? 'pointer' : 'default' }}
        />
      ))}
      {resolvedLinks.length === 0 && !showSearch && <Typography variant="caption" color="text.disabled">None</Typography>}

      {showSearch ? (
        <ClickAwayListener onClickAway={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}>
          <Box sx={{ position: 'relative' }}>
            <TextField autoFocus size="small" placeholder="Search opportunities..." value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') { setShowSearch(false); setSearchQuery(''); setSearchResults([]); } }}
              sx={{ width: 220, '& .MuiInputBase-root': { height: 26, fontSize: '0.75rem' } }}
              InputProps={{ endAdornment: searching ? <CircularProgress size={14} /> : null }}
            />
            {searchResults.length > 0 && (
              <Paper elevation={8} sx={{ position: 'absolute', top: 30, left: 0, width: 300, maxHeight: 200, overflow: 'auto', zIndex: 1300 }}>
                <List dense>
                  {searchResults.slice(0, 10).map((opp: any) => (
                    <ListItemButton key={opp.Id} onClick={() => linkMutation.mutate(opp.Id)} dense>
                      <ListItemText primary={opp.Name}
                        secondary={opp.StageName ? `${opp.StageName}${opp.Amount ? ` \u2014 $${(opp.Amount / 1000).toFixed(0)}K` : ''}` : undefined}
                        primaryTypographyProps={{ variant: 'body2', noWrap: true }} secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        </ClickAwayListener>
      ) : (
        <Tooltip title="Link an Opportunity">
          <IconButton size="small" onClick={() => setShowSearch(true)} sx={{ width: 22, height: 22 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default LinkedOpportunities;

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Slider,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Switch,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import ForceGraph2D from 'react-force-graph-2d';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import { apiService } from '../services/api';
import { useLeads } from '../contexts/LeadsContext';
import { useLinkedInContacts } from '../hooks/useLinkedInContacts';
import { parseLinkedInCSV } from '../utils/linkedInCsvParser';
import { buildGraphData } from '../utils/networkGraphBuilder';
import type { GraphNode, NodeType } from '../types/networkGraph';

const NODE_TYPE_LABELS: Record<NodeType, string> = {
  account: 'Accounts',
  contact: 'Contacts',
  opportunity: 'Opportunities',
  lead: 'Leads',
  linkedin: 'LinkedIn',
};

const NODE_TYPE_COLORS: Record<NodeType, string> = {
  account: '#1976d2',
  contact: '#4caf50',
  opportunity: '#ff9800',
  lead: '#9c27b0',
  linkedin: '#607d8b',
};

const NetworkMap: React.FC = () => {
  const { leads, importLeads } = useLeads();
  const { contacts: linkedInContacts, importContacts, clearContacts } = useLinkedInContacts();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<any>(null);

  // Filters
  const [visibleTypes, setVisibleTypes] = useState<Record<NodeType, boolean>>({
    account: true,
    contact: true,
    opportunity: true,
    lead: true,
    linkedin: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [minOppAmount, setMinOppAmount] = useState(0);
  const [showUnlinkedOnly, setShowUnlinkedOnly] = useState(false);

  // Detail panel
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Fetch SF data
  const { data: contactsData } = useQuery('contacts', async () => {
    const res = await apiService.getContacts();
    return res.data;
  });
  const { data: accountsData } = useQuery('accounts', async () => {
    const res = await apiService.getAccounts();
    return res.data;
  });
  const { data: oppsData } = useQuery('opportunities', async () => {
    const res = await apiService.getOpportunities();
    return res.data;
  });

  const sfContacts = useMemo(() => {
    const raw = Array.isArray(contactsData)
      ? contactsData
      : (contactsData?.contacts || contactsData?.data || []);
    return raw as any[];
  }, [contactsData]);

  const accounts = useMemo(() => {
    const raw = Array.isArray(accountsData)
      ? accountsData
      : (accountsData?.accounts || accountsData?.data || []);
    return raw as any[];
  }, [accountsData]);

  const opportunities = useMemo(() => {
    const raw = Array.isArray(oppsData)
      ? oppsData
      : (oppsData?.opportunities || oppsData?.data || []);
    return raw as any[];
  }, [oppsData]);

  // Build graph
  const fullGraph = useMemo(
    () => buildGraphData(sfContacts, accounts, opportunities, leads, linkedInContacts),
    [sfContacts, accounts, opportunities, leads, linkedInContacts]
  );

  // Filter graph
  const graphData = useMemo(() => {
    const linkedNodeIds = new Set(
      fullGraph.links.flatMap((l) => {
        const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return [s, t];
      })
    );

    let nodes = fullGraph.nodes.filter((n) => {
      if (!visibleTypes[n.type]) return false;
      if (n.type === 'opportunity' && minOppAmount > 0 && (n.meta.Amount || 0) < minOppAmount) return false;
      if (showUnlinkedOnly && n.type === 'linkedin' && linkedNodeIds.has(n.id)) return false;
      if (showUnlinkedOnly && n.type !== 'linkedin') return false;
      return true;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchIds = new Set(
        fullGraph.nodes.filter((n) => n.label.toLowerCase().includes(q)).map((n) => n.id)
      );
      // Include matches + their neighbors
      const neighborIds = new Set<string>();
      fullGraph.links.forEach((l) => {
        const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
        if (matchIds.has(s)) neighborIds.add(t);
        if (matchIds.has(t)) neighborIds.add(s);
      });
      matchIds.forEach((id) => neighborIds.add(id));
      nodes = nodes.filter((n) => neighborIds.has(n.id));
    }

    const visibleIds = new Set(nodes.map((n) => n.id));
    const links = fullGraph.links.filter((l) => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return visibleIds.has(s) && visibleIds.has(t);
    });

    return { nodes, links };
  }, [fullGraph, visibleTypes, searchQuery, minOppAmount, showUnlinkedOnly]);

  // Handlers
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node as GraphNode);
    if (graphRef.current) {
      graphRef.current.centerAt(node.x, node.y, 500);
      graphRef.current.zoom(3, 500);
    }
  }, []);

  const handleLinkedInImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await parseLinkedInCSV(file);
    if (result.errors.length > 0 && result.contacts.length === 0) {
      toast.error(result.errors[0].message);
      return;
    }
    const { added, duplicates } = importContacts(result.contacts);
    let msg = `Imported ${added} LinkedIn contact${added !== 1 ? 's' : ''}`;
    if (duplicates > 0) msg += ` (${duplicates} duplicates skipped)`;
    toast.success(msg);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddToLeads = () => {
    if (!selectedNode || selectedNode.type !== 'linkedin') return;
    const m = selectedNode.meta;
    const now = new Date().toISOString();
    const newLead = {
      id: `lead-${Date.now()}-li`,
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      organization: m.organization,
      title: m.title,
      email: m.email,
      source: 'LinkedIn Import',
      status: 'new' as const,
      priority: 'medium' as const,
      created_at: now,
      updated_at: now,
    };
    const { added } = importLeads([newLead]);
    if (added > 0) {
      toast.success(`Added ${m.first_name} ${m.last_name} to Leads`);
    } else {
      toast('Already exists in Leads');
    }
  };

  // Custom node render
  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = Math.max(node.val || 2, 2);
      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || '#999';
      ctx.fill();

      // Highlight selected
      if (selectedNode && node.id === selectedNode.id) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Labels when zoomed
      if (globalScale > 1.5) {
        ctx.font = `${Math.min(12 / globalScale, 3)}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = '#333';
        ctx.fillText(node.label || '', node.x, node.y + r + 1);
      }
    },
    [selectedNode]
  );

  // Get connected nodes for detail panel
  const connectedNodes = useMemo(() => {
    if (!selectedNode) return [];
    const connected: GraphNode[] = [];
    fullGraph.links.forEach((l) => {
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      if (s === selectedNode.id) {
        const n = fullGraph.nodes.find((n) => n.id === t);
        if (n) connected.push(n);
      } else if (t === selectedNode.id) {
        const n = fullGraph.nodes.find((n) => n.id === s);
        if (n) connected.push(n);
      }
    });
    return connected;
  }, [selectedNode, fullGraph]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Network Map</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(Object.keys(NODE_TYPE_COLORS) as NodeType[]).map((type) => (
            <Chip
              key={type}
              label={`${NODE_TYPE_LABELS[type]}`}
              size="small"
              sx={{
                bgcolor: NODE_TYPE_COLORS[type],
                color: '#fff',
                opacity: visibleTypes[type] ? 1 : 0.4,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 180px)', minHeight: 500 }}>
        {/* Left filter panel */}
        <Card sx={{ width: 250, flexShrink: 0, overflow: 'auto' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2">Filters</Typography>

            <TextField
              size="small"
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />

            <FormGroup>
              {(Object.keys(NODE_TYPE_LABELS) as NodeType[]).map((type) => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      size="small"
                      checked={visibleTypes[type]}
                      onChange={(e) =>
                        setVisibleTypes((prev) => ({ ...prev, [type]: e.target.checked }))
                      }
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: NODE_TYPE_COLORS[type] }}>
                      {NODE_TYPE_LABELS[type]}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>

            <Box>
              <Typography variant="caption">Min Opportunity Amount</Typography>
              <Slider
                size="small"
                value={minOppAmount}
                onChange={(_, v) => setMinOppAmount(v as number)}
                min={0}
                max={1000000}
                step={10000}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showUnlinkedOnly}
                  onChange={(e) => setShowUnlinkedOnly(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Unlinked LinkedIn only</Typography>}
            />

            <Divider />

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              hidden
              onChange={handleLinkedInImport}
            />
            <Button
              startIcon={<UploadIcon />}
              variant="contained"
              size="small"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload LinkedIn CSV
            </Button>

            {linkedInContacts.length > 0 && (
              <Button
                startIcon={<DeleteSweepIcon />}
                variant="outlined"
                size="small"
                color="error"
                onClick={() => {
                  clearContacts();
                  toast.success('LinkedIn contacts cleared');
                }}
              >
                Clear LinkedIn ({linkedInContacts.length})
              </Button>
            )}

            <Divider />
            <Typography variant="caption" color="text.secondary">
              {graphData.nodes.length} nodes, {graphData.links.length} links
            </Typography>
          </CardContent>
        </Card>

        {/* Center: graph canvas */}
        <Card sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasObject}
            nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
              const r = Math.max(node.val || 2, 2);
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 2, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }}
            linkColor={() => 'rgba(0,0,0,0.12)'}
            onNodeClick={handleNodeClick}
            warmupTicks={100}
            cooldownTime={3000}
            nodeRelSize={6}
            width={undefined}
            height={undefined}
          />
        </Card>

        {/* Right: detail panel */}
        {selectedNode && (
          <Card sx={{ width: 320, flexShrink: 0, overflow: 'auto' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={selectedNode.type}
                  size="small"
                  sx={{ bgcolor: NODE_TYPE_COLORS[selectedNode.type], color: '#fff' }}
                />
                <IconButton size="small" onClick={() => setSelectedNode(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              <Typography variant="h6" gutterBottom>
                {selectedNode.label}
              </Typography>

              {/* Meta details */}
              {selectedNode.type === 'account' && (
                <Box sx={{ mb: 2 }}>
                  {selectedNode.meta.Type && (
                    <Typography variant="body2">Type: {selectedNode.meta.Type}</Typography>
                  )}
                  {selectedNode.meta.Website && (
                    <Typography variant="body2">Web: {selectedNode.meta.Website}</Typography>
                  )}
                </Box>
              )}

              {selectedNode.type === 'opportunity' && (
                <Box sx={{ mb: 2 }}>
                  {selectedNode.meta.Amount != null && (
                    <Typography variant="body2">
                      Amount: ${Number(selectedNode.meta.Amount).toLocaleString()}
                    </Typography>
                  )}
                  {selectedNode.meta.StageName && (
                    <Typography variant="body2">Stage: {selectedNode.meta.StageName}</Typography>
                  )}
                  {selectedNode.meta.CloseDate && (
                    <Typography variant="body2">Close: {selectedNode.meta.CloseDate}</Typography>
                  )}
                </Box>
              )}

              {selectedNode.type === 'contact' && (
                <Box sx={{ mb: 2 }}>
                  {selectedNode.meta.Title && (
                    <Typography variant="body2">Title: {selectedNode.meta.Title}</Typography>
                  )}
                  {selectedNode.meta.Email && (
                    <Typography variant="body2">Email: {selectedNode.meta.Email}</Typography>
                  )}
                  {selectedNode.meta.linkedin && (
                    <Chip label="LinkedIn matched" size="small" color="success" sx={{ mt: 0.5 }} />
                  )}
                </Box>
              )}

              {selectedNode.type === 'lead' && (
                <Box sx={{ mb: 2 }}>
                  {selectedNode.meta.organization && (
                    <Typography variant="body2">Org: {selectedNode.meta.organization}</Typography>
                  )}
                  {selectedNode.meta.estimated_capacity != null && (
                    <Typography variant="body2">
                      Capacity: ${Number(selectedNode.meta.estimated_capacity).toLocaleString()}
                    </Typography>
                  )}
                  {selectedNode.meta.estimated_ask != null && (
                    <Typography variant="body2">
                      Ask: ${Number(selectedNode.meta.estimated_ask).toLocaleString()}
                    </Typography>
                  )}
                  <Chip
                    label={selectedNode.meta.status}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              )}

              {selectedNode.type === 'linkedin' && (
                <Box sx={{ mb: 2 }}>
                  {selectedNode.meta.organization && (
                    <Typography variant="body2">Org: {selectedNode.meta.organization}</Typography>
                  )}
                  {selectedNode.meta.title && (
                    <Typography variant="body2">Title: {selectedNode.meta.title}</Typography>
                  )}
                  {selectedNode.meta.connection_date && (
                    <Typography variant="body2">
                      Connected: {selectedNode.meta.connection_date}
                    </Typography>
                  )}
                  <Button
                    startIcon={<PersonAddIcon />}
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={handleAddToLeads}
                  >
                    Add to Leads
                  </Button>
                </Box>
              )}

              {connectedNodes.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Connected ({connectedNodes.length})
                  </Typography>
                  <List dense disablePadding>
                    {connectedNodes.slice(0, 20).map((cn) => (
                      <ListItemButton
                        key={cn.id}
                        onClick={() => handleNodeClick(cn)}
                        dense
                      >
                        <Chip
                          label={cn.type.charAt(0).toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: NODE_TYPE_COLORS[cn.type],
                            color: '#fff',
                            mr: 1,
                            minWidth: 24,
                            height: 20,
                          }}
                        />
                        <ListItemText
                          primary={cn.label}
                          primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        />
                      </ListItemButton>
                    ))}
                    {connectedNodes.length > 20 && (
                      <Typography variant="caption" color="text.secondary" sx={{ pl: 2 }}>
                        +{connectedNodes.length - 20} more
                      </Typography>
                    )}
                  </List>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default NetworkMap;

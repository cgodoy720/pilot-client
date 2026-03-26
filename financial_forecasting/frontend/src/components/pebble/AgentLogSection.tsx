import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import type { AgentLogEntry } from '../../services/pebbleApi';

interface AgentLogSectionProps {
  agents: AgentLogEntry[];
  defaultExpanded?: boolean;
}

const OUTCOME_CHIP: Record<string, { color: 'success' | 'error' | 'warning' | 'default'; label?: string }> = {
  success: { color: 'success' },
  done: { color: 'success' },
  ok: { color: 'success' },
  error: { color: 'error' },
  timeout: { color: 'warning' },
  no_data: { color: 'default' },
  skipped: { color: 'default' },
  unknown: { color: 'default' },
};

const AgentLogSection: React.FC<AgentLogSectionProps> = ({ agents, defaultExpanded = false }) => {
  const totalTime = agents.reduce((sum, a) => sum + a.elapsed_seconds, 0);
  const totalCost = agents.reduce((sum, a) => sum + a.cost_usd, 0);
  const skippedAgents = agents.filter((a) => a.outcome === 'skipped');
  const displayAgents = agents.filter((a) => a.outcome !== 'skipped');

  return (
    <Accordion
      disableGutters
      variant="outlined"
      defaultExpanded={defaultExpanded}
      sx={{ '&:before': { display: 'none' }, mt: 1 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0.5 } }}
      >
        <Typography variant="body2" color="text.secondary">
          {agents.length} agents | {totalTime.toFixed(1)}s total | ${totalCost.toFixed(3)}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 1 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Outcome</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }} align="right">Time</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }} align="right">Cost</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }} align="right">Tokens</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }} align="right">Records</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 0.5 }}>Error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayAgents.map((agent, idx) => {
                const chipConfig = OUTCOME_CHIP[agent.outcome] || OUTCOME_CHIP.unknown;
                return (
                  <TableRow key={idx} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                      {agent.name.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip
                        label={chipConfig.label || agent.outcome}
                        color={chipConfig.color}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                      {agent.elapsed_seconds.toFixed(1)}s
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                      {agent.cost_usd > 0 ? `$${agent.cost_usd.toFixed(4)}` : '\u2014'}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                      {agent.tokens_input > 0 || agent.tokens_output > 0
                        ? `${agent.tokens_input}/${agent.tokens_output}`
                        : '\u2014'}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                      {agent.records_found != null ? agent.records_found : '\u2014'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '0.8rem', maxWidth: 150 }}>
                      {agent.error ? (
                        <Tooltip title={agent.error} arrow>
                          <Typography
                            variant="caption"
                            color="error"
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 150,
                            }}
                          >
                            {agent.error}
                          </Typography>
                        </Tooltip>
                      ) : (
                        '\u2014'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {skippedAgents.length > 0 && (
          <Box sx={{ mt: 0.5, px: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Skipped: {skippedAgents.map((a) => a.name.replace(/_/g, ' ')).join(', ')}
            </Typography>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default AgentLogSection;

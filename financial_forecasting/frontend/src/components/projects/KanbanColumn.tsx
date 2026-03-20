import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { TaskStatus, FlatTask } from './types';
import { TASK_STATUS_COLOR } from './constants';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: FlatTask[];
  onCardClick?: (task: FlatTask) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks, onCardClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 280, maxWidth: 280,
        bgcolor: isOver ? 'action.selected' : 'grey.50',
        borderRadius: 2, display: 'flex', flexDirection: 'column',
        maxHeight: 'calc(100vh - 240px)',
        border: '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 1.5, display: 'flex', alignItems: 'center', gap: 1,
        borderBottom: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{
          width: 8, height: 8, borderRadius: '50%',
          bgcolor: TASK_STATUS_COLOR[status] || '#9e9e9e',
        }} />
        <Typography variant="subtitle2" sx={{ flex: 1 }}>{status}</Typography>
        <Chip label={tasks.length} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
      </Box>

      {/* Cards */}
      <Box sx={{
        flex: 1, overflowY: 'auto', p: 1,
        display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} onCardClick={onCardClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 2 }}>
            No tasks
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default KanbanColumn;

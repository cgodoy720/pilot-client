import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Tooltip,
  Collapse,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface Task {
  Id: string;
  Subject: string;
  Status: string;
  Priority: string;
  ActivityDate: string | null;
  Description: string | null;
  OwnerId: string;
  OwnerName: string | null;
  CreatedDate: string;
  LastModifiedDate: string;
  Type: string | null;
  TaskSubtype: string | null;
}

interface Opportunity {
  Id: string;
  Name: string;
  Account?: { Name: string } | null;
  StageName: string;
  Amount: number | null;
  Probability: number | null;
  CloseDate: string | null;
  Owner?: { Name: string } | null;
}

interface TaskPanelProps {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  users?: Array<{ Id: string; Name: string }>;
}

const STATUS_COLORS: Record<string, string> = {
  'Not Started': '#9e9e9e',
  'In Progress': '#2196f3',
  'Completed': '#4caf50',
  'Deferred': '#ff9800',
  'No Status': '#bdbdbd',
};

const PRIORITY_COLORS: Record<string, string> = {
  'High': '#f44336',
  'Normal': '#2196f3',
  'Low': '#9e9e9e',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (value: number | null) => {
  if (value === null || value === undefined) return '$0';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const isOverdue = (dateStr: string | null, status: string) => {
  if (!dateStr || status === 'Completed') return false;
  return new Date(dateStr) < new Date();
};

const TASK_PANEL_PREFS_KEY = 'pursuit-task-panel-prefs';
const DEFAULT_WIDTH = 520;
const MIN_WIDTH = 360;
const MAX_WIDTH = 800;

function loadTaskPanelWidth(): number {
  try {
    const raw = localStorage.getItem(TASK_PANEL_PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const w = parsed?.width ?? DEFAULT_WIDTH;
      return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));
    }
  } catch {}
  return DEFAULT_WIDTH;
}

function saveTaskPanelWidth(width: number) {
  localStorage.setItem(TASK_PANEL_PREFS_KEY, JSON.stringify({ width }));
}

const TaskPanel: React.FC<TaskPanelProps> = ({ open, onClose, opportunity, users }) => {
  const queryClient = useQueryClient();
  const [width, setWidth] = useState(loadTaskPanelWidth);
  const widthRef = useRef(width);
  const resizeRef = useRef<{ active: boolean; startX: number; startWidth: number }>({ active: false, startX: 0, startWidth: 0 });

  widthRef.current = width;

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = { active: true, startX: e.clientX, startWidth: widthRef.current };
  }, []);

  useEffect(() => {
    const onMouseMove = (e: globalThis.MouseEvent) => {
      if (!resizeRef.current.active) return;
      const dx = e.clientX - resizeRef.current.startX; // drag right = wider, drag left = narrower
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeRef.current.startWidth + dx));
      setWidth(newWidth);
    };
    const onMouseUp = () => {
      if (resizeRef.current.active) {
        saveTaskPanelWidth(widthRef.current);
        resizeRef.current.active = false;
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  
  // New task form state
  const [newTask, setNewTask] = useState({
    Subject: '',
    Status: 'Not Started',
    Priority: 'Normal',
    ActivityDate: '',
    Description: '',
    OwnerId: '',
    DriveLink: '',
  });

  // Edit task form state
  const [editTask, setEditTask] = useState({
    Subject: '',
    Status: '',
    Priority: '',
    ActivityDate: '',
    Description: '',
    OwnerId: '',
    DriveLink: '',
  });

  // Fetch tasks for the selected opportunity
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['opportunity-tasks', opportunity?.Id],
    async () => {
      if (!opportunity?.Id) return null;
      const response = await apiService.getOpportunityTasks(opportunity.Id);
      return response.data;
    },
    {
      enabled: !!opportunity?.Id && open,
    }
  );

  const tasks: Task[] = tasksData?.tasks || [];

  // Create task mutation
  const createTaskMutation = useMutation(
    async (taskData: typeof newTask) => {
      if (!opportunity?.Id) throw new Error('No opportunity selected');
      const response = await apiService.createTask(opportunity.Id, {
        ...taskData,
        ActivityDate: taskData.ActivityDate || undefined,
        Description: taskData.Description || undefined,
        OwnerId: taskData.OwnerId || undefined,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['opportunity-tasks', opportunity?.Id]);
        toast.success('Task created!');
        setShowAddForm(false);
        setNewTask({ Subject: '', Status: 'Not Started', Priority: 'Normal', ActivityDate: '', Description: '', OwnerId: '', DriveLink: '' });
      },
      onError: (error: any) => {
        toast.error(`Failed to create task: ${error.message}`);
      },
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await apiService.updateTask(taskId, updates);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['opportunity-tasks', opportunity?.Id]);
        toast.success('Task updated!');
        setEditingTaskId(null);
      },
      onError: (error: any) => {
        toast.error(`Failed to update task: ${error.message}`);
      },
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    async (taskId: string) => {
      const response = await apiService.deleteTask(taskId);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['opportunity-tasks', opportunity?.Id]);
        toast.success('Task deleted');
      },
      onError: (error: any) => {
        toast.error(`Failed to delete task: ${error.message}`);
      },
    }
  );

  // Quick toggle task status
  const toggleTaskStatus = (task: Task) => {
    const newStatus = task.Status === 'Completed' ? 'Not Started' : 'Completed';
    updateTaskMutation.mutate({ taskId: task.Id, updates: { Status: newStatus } });
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.Id);
    setEditTask({
      Subject: task.Subject || '',
      Status: task.Status || 'Not Started',
      Priority: task.Priority || 'Normal',
      ActivityDate: task.ActivityDate || '',
      Description: task.Description || '',
      OwnerId: task.OwnerId || '',
      DriveLink: '',
    });
  };

  const saveEdit = () => {
    if (editingTaskId) {
      updateTaskMutation.mutate({ taskId: editingTaskId, updates: editTask });
    }
  };

  const handleCreateTask = () => {
    if (!newTask.Subject.trim()) {
      toast.error('Subject is required');
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  if (!opportunity) return null;

  const openTasks = tasks.filter(t => t.Status !== 'Completed');
  const completedTasks = tasks.filter(t => t.Status === 'Completed');

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          p: 0,
          position: 'relative',
        },
      }}
    >
      {/* Resize handle on left edge (sm+ only) */}
      <Box
        onMouseDown={handleResizeStart}
        sx={{
          display: { xs: 'none', sm: 'block' },
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 8,
          cursor: 'col-resize',
          zIndex: 20,
          '&:hover::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 4,
            height: 48,
            borderRadius: 2,
            bgcolor: 'primary.main',
            opacity: 0.4,
          },
        }}
      />
      {/* Header - Opportunity Summary */}
      <Box sx={{ 
        p: 2.5, 
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
              {opportunity.Name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {opportunity.Account?.Name || 'No Account'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white', mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
          <Chip 
            label={opportunity.StageName} 
            size="small" 
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}
          />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {formatCurrency(opportunity.Amount)}
          </Typography>
          {opportunity.CloseDate && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Close: {formatDate(opportunity.CloseDate)}
            </Typography>
          )}
          {opportunity.Owner?.Name && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Owner: {opportunity.Owner.Name}
            </Typography>
          )}
        </Box>

        {/* Task count summary */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
          <Typography variant="caption" sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.3, borderRadius: 1, fontWeight: 600 
          }}>
            {openTasks.length} open
          </Typography>
          <Typography variant="caption" sx={{ 
            bgcolor: 'rgba(255,255,255,0.15)', px: 1.5, py: 0.3, borderRadius: 1, fontWeight: 600 
          }}>
            {completedTasks.length} completed
          </Typography>
        </Box>
      </Box>

      {/* Task Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Add Task Button / Form */}
        {!showAddForm ? (
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            variant="outlined"
            fullWidth
            sx={{ 
              mb: 2, py: 1.2, borderStyle: 'dashed', borderColor: '#bdbdbd',
              color: '#666', '&:hover': { borderColor: '#1976d2', color: '#1976d2', bgcolor: '#e3f2fd' }
            }}
          >
            Add Task
          </Button>
        ) : (
          <Box sx={{ 
            mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' 
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>New Task</Typography>
            
            <TextField
              label="Subject"
              value={newTask.Subject}
              onChange={(e) => setNewTask({ ...newTask, Subject: e.target.value })}
              fullWidth
              size="small"
              sx={{ mb: 1.5 }}
              autoFocus
            />
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newTask.Status}
                  label="Status"
                  onChange={(e) => setNewTask({ ...newTask, Status: e.target.value })}
                >
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Deferred">Deferred</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.Priority}
                  label="Priority"
                  onChange={(e) => setNewTask({ ...newTask, Priority: e.target.value })}
                >
                  <MenuItem value="High">🔴 High</MenuItem>
                  <MenuItem value="Normal">🔵 Normal</MenuItem>
                  <MenuItem value="Low">⚪ Low</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              label="Due Date"
              type="date"
              value={newTask.ActivityDate}
              onChange={(e) => setNewTask({ ...newTask, ActivityDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 1.5 }}
            />

            {users && users.length > 0 && (
              <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTask.OwnerId}
                  label="Assign To"
                  onChange={(e) => setNewTask({ ...newTask, OwnerId: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.Id} value={user.Id}>{user.Name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Description"
              value={newTask.Description}
              onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
              fullWidth
              size="small"
              multiline
              rows={2}
              sx={{ mb: 1.5 }}
            />

            <TextField
              label="Drive Link"
              placeholder="https://drive.google.com/..."
              value={newTask.DriveLink}
              onChange={(e) => setNewTask({ ...newTask, DriveLink: e.target.value })}
              fullWidth
              size="small"
              type="url"
              sx={{ mb: 1.5 }}
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={() => { setShowAddForm(false); setNewTask({ Subject: '', Status: 'Not Started', Priority: 'Normal', ActivityDate: '', Description: '', OwnerId: '', DriveLink: '' }); }}
                startIcon={<CancelIcon />}
              >
                Cancel
              </Button>
              <Button 
                size="small" 
                variant="contained" 
                onClick={handleCreateTask}
                disabled={createTaskMutation.isLoading || !newTask.Subject.trim()}
                startIcon={createTaskMutation.isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
              >
                Create
              </Button>
            </Box>
          </Box>
        )}

        {/* Loading */}
        {tasksLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* No tasks */}
        {!tasksLoading && tasks.length === 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            No tasks yet for this opportunity. Click "Add Task" to get started!
          </Alert>
        )}

        {/* Open Tasks */}
        {openTasks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ color: '#666', fontWeight: 700, display: 'block', mb: 1 }}>
              Open Tasks ({openTasks.length})
            </Typography>
            {openTasks.map((task) => (
              <TaskItem
                key={task.Id}
                task={task}
                isEditing={editingTaskId === task.Id}
                editTask={editTask}
                setEditTask={setEditTask}
                expandedTaskId={expandedTaskId}
                setExpandedTaskId={setExpandedTaskId}
                onToggleStatus={toggleTaskStatus}
                onStartEdit={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingTaskId(null)}
                onDelete={(id) => deleteTaskMutation.mutate(id)}
                users={users}
                isSaving={updateTaskMutation.isLoading}
              />
            ))}
          </Box>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Box>
            <Typography variant="overline" sx={{ color: '#666', fontWeight: 700, display: 'block', mb: 1 }}>
              Completed ({completedTasks.length})
            </Typography>
            {completedTasks.map((task) => (
              <TaskItem
                key={task.Id}
                task={task}
                isEditing={editingTaskId === task.Id}
                editTask={editTask}
                setEditTask={setEditTask}
                expandedTaskId={expandedTaskId}
                setExpandedTaskId={setExpandedTaskId}
                onToggleStatus={toggleTaskStatus}
                onStartEdit={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={() => setEditingTaskId(null)}
                onDelete={(id) => deleteTaskMutation.mutate(id)}
                users={users}
                isSaving={updateTaskMutation.isLoading}
              />
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

// Individual Task Item Component
interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  editTask: any;
  setEditTask: (val: any) => void;
  expandedTaskId: string | null;
  setExpandedTaskId: (id: string | null) => void;
  onToggleStatus: (task: Task) => void;
  onStartEdit: (task: Task) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  users?: Array<{ Id: string; Name: string }>;
  isSaving: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task, isEditing, editTask, setEditTask, expandedTaskId, setExpandedTaskId,
  onToggleStatus, onStartEdit, onSaveEdit, onCancelEdit, onDelete, users, isSaving
}) => {
  const isCompleted = task.Status === 'Completed';
  const isExpanded = expandedTaskId === task.Id;
  const overdue = isOverdue(task.ActivityDate, task.Status);

  if (isEditing) {
    return (
      <Box sx={{ 
        mb: 1, p: 2, border: '1px solid #1976d2', borderRadius: 2, bgcolor: '#f5f9ff' 
      }}>
        <TextField
          label="Subject"
          value={editTask.Subject}
          onChange={(e) => setEditTask({ ...editTask, Subject: e.target.value })}
          fullWidth
          size="small"
          sx={{ mb: 1.5 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={editTask.Status}
              label="Status"
              onChange={(e) => setEditTask({ ...editTask, Status: e.target.value })}
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Deferred">Deferred</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: 1 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={editTask.Priority}
              label="Priority"
              onChange={(e) => setEditTask({ ...editTask, Priority: e.target.value })}
            >
              <MenuItem value="High">🔴 High</MenuItem>
              <MenuItem value="Normal">🔵 Normal</MenuItem>
              <MenuItem value="Low">⚪ Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Due Date"
          type="date"
          value={editTask.ActivityDate}
          onChange={(e) => setEditTask({ ...editTask, ActivityDate: e.target.value })}
          fullWidth
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 1.5 }}
        />

        {users && users.length > 0 && (
          <FormControl size="small" fullWidth sx={{ mb: 1.5 }}>
            <InputLabel>Assign To</InputLabel>
            <Select
              value={editTask.OwnerId}
              label="Assign To"
              onChange={(e) => setEditTask({ ...editTask, OwnerId: e.target.value })}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(user => (
                <MenuItem key={user.Id} value={user.Id}>{user.Name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <TextField
          label="Description"
          value={editTask.Description}
          onChange={(e) => setEditTask({ ...editTask, Description: e.target.value })}
          fullWidth
          size="small"
          multiline
          rows={2}
          sx={{ mb: 1.5 }}
        />

        <TextField
          label="Drive Link"
          placeholder="https://drive.google.com/..."
          value={editTask.DriveLink}
          onChange={(e) => setEditTask({ ...editTask, DriveLink: e.target.value })}
          fullWidth
          size="small"
          type="url"
          sx={{ mb: 1.5 }}
        />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={onCancelEdit} startIcon={<CancelIcon />}>Cancel</Button>
          <Button 
            size="small" 
            variant="contained" 
            onClick={onSaveEdit}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            Save
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      mb: 0.5,
      border: '1px solid',
      borderColor: overdue ? '#ffcdd2' : '#e0e0e0',
      borderRadius: 1.5,
      bgcolor: overdue ? '#fff8f8' : (isCompleted ? '#fafafa' : 'white'),
      transition: 'all 0.15s ease',
      '&:hover': { 
        borderColor: overdue ? '#ef9a9a' : '#bbdefb',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      },
    }}>
      {/* Main row */}
      <Box sx={{ 
        display: 'flex', alignItems: 'center', px: 1.5, py: 1,
        cursor: 'pointer',
      }}
        onClick={() => setExpandedTaskId(isExpanded ? null : task.Id)}
      >
        {/* Checkbox */}
        <Tooltip title={isCompleted ? 'Mark as open' : 'Mark as complete'}>
          <IconButton 
            size="small" 
            onClick={(e) => { e.stopPropagation(); onToggleStatus(task); }}
            sx={{ mr: 1, color: isCompleted ? '#4caf50' : '#bdbdbd' }}
          >
            {isCompleted ? <CheckCircleIcon /> : <UncheckedIcon />}
          </IconButton>
        </Tooltip>

        {/* Subject + meta */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              textDecoration: isCompleted ? 'line-through' : 'none',
              color: isCompleted ? '#999' : '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {task.Subject}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.3 }}>
            {task.ActivityDate && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: overdue ? '#f44336' : '#888',
                  fontWeight: overdue ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 0.3,
                }}
              >
                <CalendarIcon sx={{ fontSize: 12 }} />
                {formatDate(task.ActivityDate)}
                {overdue && ' (overdue)'}
              </Typography>
            )}
            {task.OwnerName && (
              <Typography variant="caption" sx={{ color: '#888', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                <PersonIcon sx={{ fontSize: 12 }} />
                {task.OwnerName}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Priority flag */}
        {task.Priority === 'High' && (
          <Tooltip title="High Priority">
            <FlagIcon sx={{ fontSize: 18, color: '#f44336', mr: 0.5 }} />
          </Tooltip>
        )}

        {/* Status chip */}
        <Chip
          label={task.Status}
          size="small"
          sx={{
            bgcolor: STATUS_COLORS[task.Status] || '#9e9e9e',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 22,
            mr: 0.5,
          }}
        />

        {/* Expand icon */}
        {isExpanded ? <ExpandLessIcon sx={{ color: '#999', fontSize: 20 }} /> : <ExpandMoreIcon sx={{ color: '#999', fontSize: 20 }} />}
      </Box>

      {/* Expanded content */}
      <Collapse in={isExpanded}>
        <Divider />
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#fafafa' }}>
          {task.Description && (
            <Typography variant="body2" sx={{ color: '#555', mb: 1, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
              {task.Description}
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
            <Chip label={`Priority: ${task.Priority}`} size="small" variant="outlined" 
              sx={{ borderColor: PRIORITY_COLORS[task.Priority], color: PRIORITY_COLORS[task.Priority] }} />
            {task.Type && <Chip label={task.Type} size="small" variant="outlined" />}
            <Chip label={`Created: ${formatDate(task.CreatedDate)}`} size="small" variant="outlined" sx={{ color: '#888' }} />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              startIcon={<EditIcon />} 
              onClick={() => onStartEdit(task)}
              sx={{ fontSize: '0.75rem' }}
            >
              Edit
            </Button>
            <Button 
              size="small" 
              color="error" 
              startIcon={<DeleteIcon />}
              onClick={() => {
                if (window.confirm('Delete this task?')) {
                  onDelete(task.Id);
                }
              }}
              sx={{ fontSize: '0.75rem' }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

export default TaskPanel;

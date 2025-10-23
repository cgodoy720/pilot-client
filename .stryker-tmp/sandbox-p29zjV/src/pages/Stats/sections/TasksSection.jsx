// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneIcon from '@mui/icons-material/Done';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';

const TasksSection = ({ tasks = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  
  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'completed') return matchesSearch && task.completed;
    if (statusFilter === 'incomplete') return matchesSearch && !task.completed;
    
    return matchesSearch;
  });

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Handle task click - navigate to past session
  const handleTaskClick = (task) => {
    console.log('Navigating to task:', task);
    
    // Check if we have day_id or day_number
    if (task.day_id) {
      navigate(`/past-session?dayId=${task.day_id}`);
    } else if (task.day_number) {
      navigate(`/past-session?dayNumber=${task.day_number}`);
    } else {
      console.error('No day_id or day_number found for this task');
    }
  };

  // Get task status display
  const getStatusDisplay = (task) => {
    if (task.completed) {
      return <Chip icon={<DoneIcon />} label="Completed" color="success" size="small" />;
    } else {
      return <Chip icon={<HourglassEmptyIcon />} label="In Progress" color="warning" size="small" />;
    }
  };

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box className="tasks-section">
      <Box className="tasks-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Search tasks..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          className="tasks-section__search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'var(--color-text-secondary)' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchTerm('')}
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={handleStatusChange}
            label="Status"
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" sx={{ color: 'var(--color-text-secondary)', marginRight: '5px' }} />
              </InputAdornment>
            }
            sx={{
              '& .MuiSelect-icon': {
                color: 'var(--color-text-secondary)'
              }
            }}
          >
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="incomplete">In Progress</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredTasks.length === 0 ? (
        <Box textAlign="center" py={4} className="tasks-section__empty">
          <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
            No tasks found matching your filters.
          </Typography>
        </Box>
      ) : (
        <TableContainer 
          component={Paper} 
          className="tasks-section__table-container"
        >
          <Table stickyHeader aria-label="tasks table">
            <TableHead>
              <TableRow>
                <TableCell width="40%">Task</TableCell>
                <TableCell width="20%">Category</TableCell>
                <TableCell width="20%">Assigned Date</TableCell>
                <TableCell width="20%">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task) => {
                console.log('Task object in Stats:', task);
                return (
                <TableRow key={task.task_id} 
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'var(--color-primary-transparent)',
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => handleTaskClick(task)}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">{task.title}</Typography>
                    {task.description && (
                      <Typography variant="body2" 
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          mt: 0.5,
                          color: 'var(--color-text-secondary)',
                          opacity: 0.9
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{task.category || 'General'}</TableCell>
                  <TableCell>{formatDate(task.assigned_date)}</TableCell>
                  <TableCell>{getStatusDisplay(task)}</TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TasksSection; 
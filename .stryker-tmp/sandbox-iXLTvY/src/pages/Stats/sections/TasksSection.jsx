// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, InputAdornment, IconButton, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DoneIcon from '@mui/icons-material/Done';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CloseIcon from '@mui/icons-material/Close';
const TasksSection = ({
  tasks = stryMutAct_9fa48("27302") ? ["Stryker was here"] : (stryCov_9fa48("27302"), [])
}) => {
  if (stryMutAct_9fa48("27303")) {
    {}
  } else {
    stryCov_9fa48("27303");
    const [searchTerm, setSearchTerm] = useState(stryMutAct_9fa48("27304") ? "Stryker was here!" : (stryCov_9fa48("27304"), ''));
    const [statusFilter, setStatusFilter] = useState(stryMutAct_9fa48("27305") ? "" : (stryCov_9fa48("27305"), 'all'));
    const navigate = useNavigate();

    // Filter tasks based on search and status
    const filteredTasks = stryMutAct_9fa48("27306") ? tasks : (stryCov_9fa48("27306"), tasks.filter(task => {
      if (stryMutAct_9fa48("27307")) {
        {}
      } else {
        stryCov_9fa48("27307");
        const matchesSearch = stryMutAct_9fa48("27310") ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) && task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27309") ? false : stryMutAct_9fa48("27308") ? true : (stryCov_9fa48("27308", "27309", "27310"), (stryMutAct_9fa48("27311") ? task.title.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("27311"), task.title.toLowerCase().includes(stryMutAct_9fa48("27312") ? searchTerm.toUpperCase() : (stryCov_9fa48("27312"), searchTerm.toLowerCase())))) || (stryMutAct_9fa48("27314") ? task.description || task.description.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27313") ? false : (stryCov_9fa48("27313", "27314"), task.description && (stryMutAct_9fa48("27315") ? task.description.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("27315"), task.description.toLowerCase().includes(stryMutAct_9fa48("27316") ? searchTerm.toUpperCase() : (stryCov_9fa48("27316"), searchTerm.toLowerCase())))))));
        if (stryMutAct_9fa48("27319") ? statusFilter !== 'all' : stryMutAct_9fa48("27318") ? false : stryMutAct_9fa48("27317") ? true : (stryCov_9fa48("27317", "27318", "27319"), statusFilter === (stryMutAct_9fa48("27320") ? "" : (stryCov_9fa48("27320"), 'all')))) return matchesSearch;
        if (stryMutAct_9fa48("27323") ? statusFilter !== 'completed' : stryMutAct_9fa48("27322") ? false : stryMutAct_9fa48("27321") ? true : (stryCov_9fa48("27321", "27322", "27323"), statusFilter === (stryMutAct_9fa48("27324") ? "" : (stryCov_9fa48("27324"), 'completed')))) return stryMutAct_9fa48("27327") ? matchesSearch || task.completed : stryMutAct_9fa48("27326") ? false : stryMutAct_9fa48("27325") ? true : (stryCov_9fa48("27325", "27326", "27327"), matchesSearch && task.completed);
        if (stryMutAct_9fa48("27330") ? statusFilter !== 'incomplete' : stryMutAct_9fa48("27329") ? false : stryMutAct_9fa48("27328") ? true : (stryCov_9fa48("27328", "27329", "27330"), statusFilter === (stryMutAct_9fa48("27331") ? "" : (stryCov_9fa48("27331"), 'incomplete')))) return stryMutAct_9fa48("27334") ? matchesSearch || !task.completed : stryMutAct_9fa48("27333") ? false : stryMutAct_9fa48("27332") ? true : (stryCov_9fa48("27332", "27333", "27334"), matchesSearch && (stryMutAct_9fa48("27335") ? task.completed : (stryCov_9fa48("27335"), !task.completed)));
        return matchesSearch;
      }
    }));
    const handleSearchChange = event => {
      if (stryMutAct_9fa48("27336")) {
        {}
      } else {
        stryCov_9fa48("27336");
        setSearchTerm(event.target.value);
      }
    };
    const handleStatusChange = event => {
      if (stryMutAct_9fa48("27337")) {
        {}
      } else {
        stryCov_9fa48("27337");
        setStatusFilter(event.target.value);
      }
    };

    // Handle task click - navigate to past session
    const handleTaskClick = task => {
      if (stryMutAct_9fa48("27338")) {
        {}
      } else {
        stryCov_9fa48("27338");
        console.log(stryMutAct_9fa48("27339") ? "" : (stryCov_9fa48("27339"), 'Navigating to task:'), task);

        // Check if we have day_id or day_number
        if (stryMutAct_9fa48("27341") ? false : stryMutAct_9fa48("27340") ? true : (stryCov_9fa48("27340", "27341"), task.day_id)) {
          if (stryMutAct_9fa48("27342")) {
            {}
          } else {
            stryCov_9fa48("27342");
            navigate(stryMutAct_9fa48("27343") ? `` : (stryCov_9fa48("27343"), `/past-session?dayId=${task.day_id}`));
          }
        } else if (stryMutAct_9fa48("27345") ? false : stryMutAct_9fa48("27344") ? true : (stryCov_9fa48("27344", "27345"), task.day_number)) {
          if (stryMutAct_9fa48("27346")) {
            {}
          } else {
            stryCov_9fa48("27346");
            navigate(stryMutAct_9fa48("27347") ? `` : (stryCov_9fa48("27347"), `/past-session?dayNumber=${task.day_number}`));
          }
        } else {
          if (stryMutAct_9fa48("27348")) {
            {}
          } else {
            stryCov_9fa48("27348");
            console.error(stryMutAct_9fa48("27349") ? "" : (stryCov_9fa48("27349"), 'No day_id or day_number found for this task'));
          }
        }
      }
    };

    // Get task status display
    const getStatusDisplay = task => {
      if (stryMutAct_9fa48("27350")) {
        {}
      } else {
        stryCov_9fa48("27350");
        if (stryMutAct_9fa48("27352") ? false : stryMutAct_9fa48("27351") ? true : (stryCov_9fa48("27351", "27352"), task.completed)) {
          if (stryMutAct_9fa48("27353")) {
            {}
          } else {
            stryCov_9fa48("27353");
            return <Chip icon={<DoneIcon />} label="Completed" color="success" size="small" />;
          }
        } else {
          if (stryMutAct_9fa48("27354")) {
            {}
          } else {
            stryCov_9fa48("27354");
            return <Chip icon={<HourglassEmptyIcon />} label="In Progress" color="warning" size="small" />;
          }
        }
      }
    };

    // Format date for better display
    const formatDate = dateString => {
      if (stryMutAct_9fa48("27355")) {
        {}
      } else {
        stryCov_9fa48("27355");
        if (stryMutAct_9fa48("27358") ? false : stryMutAct_9fa48("27357") ? true : stryMutAct_9fa48("27356") ? dateString : (stryCov_9fa48("27356", "27357", "27358"), !dateString)) return stryMutAct_9fa48("27359") ? "" : (stryCov_9fa48("27359"), 'No date');
        const date = new Date(dateString);
        return date.toLocaleDateString(stryMutAct_9fa48("27360") ? "" : (stryCov_9fa48("27360"), 'en-US'), stryMutAct_9fa48("27361") ? {} : (stryCov_9fa48("27361"), {
          year: stryMutAct_9fa48("27362") ? "" : (stryCov_9fa48("27362"), 'numeric'),
          month: stryMutAct_9fa48("27363") ? "" : (stryCov_9fa48("27363"), 'short'),
          day: stryMutAct_9fa48("27364") ? "" : (stryCov_9fa48("27364"), 'numeric')
        }));
      }
    };
    return <Box className="tasks-section">
      <Box className="tasks-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField placeholder="Search tasks..." variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange} className="tasks-section__search" InputProps={stryMutAct_9fa48("27365") ? {} : (stryCov_9fa48("27365"), {
          startAdornment: <InputAdornment position="start">
                <SearchIcon sx={stryMutAct_9fa48("27366") ? {} : (stryCov_9fa48("27366"), {
              color: stryMutAct_9fa48("27367") ? "" : (stryCov_9fa48("27367"), 'var(--color-text-secondary)')
            })} />
              </InputAdornment>,
          endAdornment: stryMutAct_9fa48("27370") ? searchTerm || <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')} sx={{
              color: 'var(--color-text-secondary)'
            }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment> : stryMutAct_9fa48("27369") ? false : stryMutAct_9fa48("27368") ? true : (stryCov_9fa48("27368", "27369", "27370"), searchTerm && <InputAdornment position="end">
                <IconButton size="small" onClick={stryMutAct_9fa48("27371") ? () => undefined : (stryCov_9fa48("27371"), () => setSearchTerm(stryMutAct_9fa48("27372") ? "Stryker was here!" : (stryCov_9fa48("27372"), '')))} sx={stryMutAct_9fa48("27373") ? {} : (stryCov_9fa48("27373"), {
              color: stryMutAct_9fa48("27374") ? "" : (stryCov_9fa48("27374"), 'var(--color-text-secondary)')
            })}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>)
        })} sx={stryMutAct_9fa48("27375") ? {} : (stryCov_9fa48("27375"), {
          flexGrow: 1,
          minWidth: stryMutAct_9fa48("27376") ? "" : (stryCov_9fa48("27376"), '200px')
        })} />
        
        <FormControl size="small" sx={stryMutAct_9fa48("27377") ? {} : (stryCov_9fa48("27377"), {
          minWidth: stryMutAct_9fa48("27378") ? "" : (stryCov_9fa48("27378"), '150px')
        })}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select labelId="status-filter-label" value={statusFilter} onChange={handleStatusChange} label="Status" startAdornment={<InputAdornment position="start">
                <FilterListIcon fontSize="small" sx={stryMutAct_9fa48("27379") ? {} : (stryCov_9fa48("27379"), {
              color: stryMutAct_9fa48("27380") ? "" : (stryCov_9fa48("27380"), 'var(--color-text-secondary)'),
              marginRight: stryMutAct_9fa48("27381") ? "" : (stryCov_9fa48("27381"), '5px')
            })} />
              </InputAdornment>} sx={stryMutAct_9fa48("27382") ? {} : (stryCov_9fa48("27382"), {
            '& .MuiSelect-icon': stryMutAct_9fa48("27383") ? {} : (stryCov_9fa48("27383"), {
              color: stryMutAct_9fa48("27384") ? "" : (stryCov_9fa48("27384"), 'var(--color-text-secondary)')
            })
          })}>
            <MenuItem value="all">All Tasks</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="incomplete">In Progress</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {(stryMutAct_9fa48("27387") ? filteredTasks.length !== 0 : stryMutAct_9fa48("27386") ? false : stryMutAct_9fa48("27385") ? true : (stryCov_9fa48("27385", "27386", "27387"), filteredTasks.length === 0)) ? <Box textAlign="center" py={4} className="tasks-section__empty">
          <Typography variant="body1" sx={stryMutAct_9fa48("27388") ? {} : (stryCov_9fa48("27388"), {
          color: stryMutAct_9fa48("27389") ? "" : (stryCov_9fa48("27389"), 'var(--color-text-secondary)')
        })}>
            No tasks found matching your filters.
          </Typography>
        </Box> : <TableContainer component={Paper} className="tasks-section__table-container">
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
              {filteredTasks.map(task => {
              if (stryMutAct_9fa48("27390")) {
                {}
              } else {
                stryCov_9fa48("27390");
                console.log(stryMutAct_9fa48("27391") ? "" : (stryCov_9fa48("27391"), 'Task object in Stats:'), task);
                return <TableRow key={task.task_id} sx={stryMutAct_9fa48("27392") ? {} : (stryCov_9fa48("27392"), {
                  '&:hover': stryMutAct_9fa48("27393") ? {} : (stryCov_9fa48("27393"), {
                    backgroundColor: stryMutAct_9fa48("27394") ? "" : (stryCov_9fa48("27394"), 'var(--color-primary-transparent)'),
                    cursor: stryMutAct_9fa48("27395") ? "" : (stryCov_9fa48("27395"), 'pointer')
                  })
                })} onClick={stryMutAct_9fa48("27396") ? () => undefined : (stryCov_9fa48("27396"), () => handleTaskClick(task))}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">{task.title}</Typography>
                    {stryMutAct_9fa48("27399") ? task.description || <Typography variant="body2" sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mt: 0.5,
                      color: 'var(--color-text-secondary)',
                      opacity: 0.9
                    }}>
                        {task.description}
                      </Typography> : stryMutAct_9fa48("27398") ? false : stryMutAct_9fa48("27397") ? true : (stryCov_9fa48("27397", "27398", "27399"), task.description && <Typography variant="body2" sx={stryMutAct_9fa48("27400") ? {} : (stryCov_9fa48("27400"), {
                      display: stryMutAct_9fa48("27401") ? "" : (stryCov_9fa48("27401"), '-webkit-box'),
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: stryMutAct_9fa48("27402") ? "" : (stryCov_9fa48("27402"), 'vertical'),
                      overflow: stryMutAct_9fa48("27403") ? "" : (stryCov_9fa48("27403"), 'hidden'),
                      textOverflow: stryMutAct_9fa48("27404") ? "" : (stryCov_9fa48("27404"), 'ellipsis'),
                      mt: 0.5,
                      color: stryMutAct_9fa48("27405") ? "" : (stryCov_9fa48("27405"), 'var(--color-text-secondary)'),
                      opacity: 0.9
                    })}>
                        {task.description}
                      </Typography>)}
                  </TableCell>
                  <TableCell>{stryMutAct_9fa48("27408") ? task.category && 'General' : stryMutAct_9fa48("27407") ? false : stryMutAct_9fa48("27406") ? true : (stryCov_9fa48("27406", "27407", "27408"), task.category || (stryMutAct_9fa48("27409") ? "" : (stryCov_9fa48("27409"), 'General')))}</TableCell>
                  <TableCell>{formatDate(task.assigned_date)}</TableCell>
                  <TableCell>{getStatusDisplay(task)}</TableCell>
                </TableRow>;
              }
            })}
            </TableBody>
          </Table>
        </TableContainer>}
    </Box>;
  }
};
export default TasksSection;
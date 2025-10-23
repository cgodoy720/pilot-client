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
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
const SubmissionsSection = ({
  submissions = stryMutAct_9fa48("27123") ? ["Stryker was here"] : (stryCov_9fa48("27123"), [])
}) => {
  if (stryMutAct_9fa48("27124")) {
    {}
  } else {
    stryCov_9fa48("27124");
    const [searchTerm, setSearchTerm] = useState(stryMutAct_9fa48("27125") ? "Stryker was here!" : (stryCov_9fa48("27125"), ''));
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(stryMutAct_9fa48("27126") ? true : (stryCov_9fa48("27126"), false));

    // Filter submissions based on search
    const filteredSubmissions = stryMutAct_9fa48("27127") ? submissions : (stryCov_9fa48("27127"), submissions.filter(stryMutAct_9fa48("27128") ? () => undefined : (stryCov_9fa48("27128"), submission => stryMutAct_9fa48("27131") ? (submission.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) || submission.content?.toLowerCase().includes(searchTerm.toLowerCase())) && submission.feedback?.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27130") ? false : stryMutAct_9fa48("27129") ? true : (stryCov_9fa48("27129", "27130", "27131"), (stryMutAct_9fa48("27133") ? submission.task_title?.toLowerCase().includes(searchTerm.toLowerCase()) && submission.content?.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27132") ? false : (stryCov_9fa48("27132", "27133"), (stryMutAct_9fa48("27135") ? submission.task_title.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27134") ? submission.task_title?.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("27134", "27135"), submission.task_title?.toLowerCase().includes(stryMutAct_9fa48("27136") ? searchTerm.toUpperCase() : (stryCov_9fa48("27136"), searchTerm.toLowerCase())))) || (stryMutAct_9fa48("27138") ? submission.content.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27137") ? submission.content?.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("27137", "27138"), submission.content?.toLowerCase().includes(stryMutAct_9fa48("27139") ? searchTerm.toUpperCase() : (stryCov_9fa48("27139"), searchTerm.toLowerCase())))))) || (stryMutAct_9fa48("27141") ? submission.feedback.toLowerCase().includes(searchTerm.toLowerCase()) : stryMutAct_9fa48("27140") ? submission.feedback?.toUpperCase().includes(searchTerm.toLowerCase()) : (stryCov_9fa48("27140", "27141"), submission.feedback?.toLowerCase().includes(stryMutAct_9fa48("27142") ? searchTerm.toUpperCase() : (stryCov_9fa48("27142"), searchTerm.toLowerCase()))))))));
    const handleSearchChange = event => {
      if (stryMutAct_9fa48("27143")) {
        {}
      } else {
        stryCov_9fa48("27143");
        setSearchTerm(event.target.value);
      }
    };
    const handleViewSubmission = submission => {
      if (stryMutAct_9fa48("27144")) {
        {}
      } else {
        stryCov_9fa48("27144");
        setSelectedSubmission(submission);
        setDialogOpen(stryMutAct_9fa48("27145") ? false : (stryCov_9fa48("27145"), true));
      }
    };
    const handleCloseDialog = () => {
      if (stryMutAct_9fa48("27146")) {
        {}
      } else {
        stryCov_9fa48("27146");
        setDialogOpen(stryMutAct_9fa48("27147") ? true : (stryCov_9fa48("27147"), false));
      }
    };

    // Get feedback status
    const getFeedbackStatus = submission => {
      if (stryMutAct_9fa48("27148")) {
        {}
      } else {
        stryCov_9fa48("27148");
        // Check for AI feedback in the analysis results
        if (stryMutAct_9fa48("27151") ? submission.analysis_results || Object.keys(submission.analysis_results).length > 0 : stryMutAct_9fa48("27150") ? false : stryMutAct_9fa48("27149") ? true : (stryCov_9fa48("27149", "27150", "27151"), submission.analysis_results && (stryMutAct_9fa48("27154") ? Object.keys(submission.analysis_results).length <= 0 : stryMutAct_9fa48("27153") ? Object.keys(submission.analysis_results).length >= 0 : stryMutAct_9fa48("27152") ? true : (stryCov_9fa48("27152", "27153", "27154"), Object.keys(submission.analysis_results).length > 0)))) {
          if (stryMutAct_9fa48("27155")) {
            {}
          } else {
            stryCov_9fa48("27155");
            const firstKey = Object.keys(submission.analysis_results)[0];
            const analysis = submission.analysis_results[firstKey];
            if (stryMutAct_9fa48("27158") ? analysis && analysis.feedback || analysis.feedback.trim() !== '' : stryMutAct_9fa48("27157") ? false : stryMutAct_9fa48("27156") ? true : (stryCov_9fa48("27156", "27157", "27158"), (stryMutAct_9fa48("27160") ? analysis || analysis.feedback : stryMutAct_9fa48("27159") ? true : (stryCov_9fa48("27159", "27160"), analysis && analysis.feedback)) && (stryMutAct_9fa48("27162") ? analysis.feedback.trim() === '' : stryMutAct_9fa48("27161") ? true : (stryCov_9fa48("27161", "27162"), (stryMutAct_9fa48("27163") ? analysis.feedback : (stryCov_9fa48("27163"), analysis.feedback.trim())) !== (stryMutAct_9fa48("27164") ? "Stryker was here!" : (stryCov_9fa48("27164"), '')))))) {
              if (stryMutAct_9fa48("27165")) {
                {}
              } else {
                stryCov_9fa48("27165");
                return <Chip icon={<CommentIcon fontSize="small" />} label="AI Feedback" color="info" size="small" variant="outlined" />;
              }
            }
          }
        }
        return <Chip label="No Feedback" size="small" variant="outlined" sx={stryMutAct_9fa48("27166") ? {} : (stryCov_9fa48("27166"), {
          opacity: 0.6
        })} />;
      }
    };

    // Format date for better display
    const formatDate = dateString => {
      if (stryMutAct_9fa48("27167")) {
        {}
      } else {
        stryCov_9fa48("27167");
        if (stryMutAct_9fa48("27170") ? false : stryMutAct_9fa48("27169") ? true : stryMutAct_9fa48("27168") ? dateString : (stryCov_9fa48("27168", "27169", "27170"), !dateString)) return stryMutAct_9fa48("27171") ? "" : (stryCov_9fa48("27171"), 'No date');
        const date = new Date(dateString);
        return date.toLocaleDateString(stryMutAct_9fa48("27172") ? "" : (stryCov_9fa48("27172"), 'en-US'), stryMutAct_9fa48("27173") ? {} : (stryCov_9fa48("27173"), {
          year: stryMutAct_9fa48("27174") ? "" : (stryCov_9fa48("27174"), 'numeric'),
          month: stryMutAct_9fa48("27175") ? "" : (stryCov_9fa48("27175"), 'short'),
          day: stryMutAct_9fa48("27176") ? "" : (stryCov_9fa48("27176"), 'numeric')
        }));
      }
    };

    // Format datetime for dialog
    const formatDateTime = dateString => {
      if (stryMutAct_9fa48("27177")) {
        {}
      } else {
        stryCov_9fa48("27177");
        if (stryMutAct_9fa48("27180") ? false : stryMutAct_9fa48("27179") ? true : stryMutAct_9fa48("27178") ? dateString : (stryCov_9fa48("27178", "27179", "27180"), !dateString)) return stryMutAct_9fa48("27181") ? "" : (stryCov_9fa48("27181"), 'No date');
        const date = new Date(dateString);
        return date.toLocaleString(stryMutAct_9fa48("27182") ? "" : (stryCov_9fa48("27182"), 'en-US'), stryMutAct_9fa48("27183") ? {} : (stryCov_9fa48("27183"), {
          year: stryMutAct_9fa48("27184") ? "" : (stryCov_9fa48("27184"), 'numeric'),
          month: stryMutAct_9fa48("27185") ? "" : (stryCov_9fa48("27185"), 'short'),
          day: stryMutAct_9fa48("27186") ? "" : (stryCov_9fa48("27186"), 'numeric'),
          hour: stryMutAct_9fa48("27187") ? "" : (stryCov_9fa48("27187"), '2-digit'),
          minute: stryMutAct_9fa48("27188") ? "" : (stryCov_9fa48("27188"), '2-digit')
        }));
      }
    };
    return <Box className="submissions-section">
      <Box className="submissions-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField placeholder="Search submissions..." variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange} className="submissions-section__search" InputProps={stryMutAct_9fa48("27189") ? {} : (stryCov_9fa48("27189"), {
          startAdornment: <InputAdornment position="start">
                <SearchIcon sx={stryMutAct_9fa48("27190") ? {} : (stryCov_9fa48("27190"), {
              color: stryMutAct_9fa48("27191") ? "" : (stryCov_9fa48("27191"), 'var(--color-text-secondary)')
            })} />
              </InputAdornment>,
          endAdornment: stryMutAct_9fa48("27194") ? searchTerm || <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')} sx={{
              color: 'var(--color-text-secondary)'
            }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment> : stryMutAct_9fa48("27193") ? false : stryMutAct_9fa48("27192") ? true : (stryCov_9fa48("27192", "27193", "27194"), searchTerm && <InputAdornment position="end">
                <IconButton size="small" onClick={stryMutAct_9fa48("27195") ? () => undefined : (stryCov_9fa48("27195"), () => setSearchTerm(stryMutAct_9fa48("27196") ? "Stryker was here!" : (stryCov_9fa48("27196"), '')))} sx={stryMutAct_9fa48("27197") ? {} : (stryCov_9fa48("27197"), {
              color: stryMutAct_9fa48("27198") ? "" : (stryCov_9fa48("27198"), 'var(--color-text-secondary)')
            })}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>)
        })} fullWidth />
      </Box>

      {(stryMutAct_9fa48("27201") ? filteredSubmissions.length !== 0 : stryMutAct_9fa48("27200") ? false : stryMutAct_9fa48("27199") ? true : (stryCov_9fa48("27199", "27200", "27201"), filteredSubmissions.length === 0)) ? <Box textAlign="center" py={4} className="submissions-section__empty">
          <Typography variant="body1" sx={stryMutAct_9fa48("27202") ? {} : (stryCov_9fa48("27202"), {
          color: stryMutAct_9fa48("27203") ? "" : (stryCov_9fa48("27203"), 'var(--color-text-secondary)')
        })}>
            No submissions found matching your search.
          </Typography>
        </Box> : <TableContainer component={Paper} className="submissions-section__table-container">
          <Table stickyHeader aria-label="submissions table">
            <TableHead>
              <TableRow>
                <TableCell width="50%">Task</TableCell>
                <TableCell width="25%">Submitted Date</TableCell>
                <TableCell width="15%">Feedback</TableCell>
                <TableCell width="10%">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.map(stryMutAct_9fa48("27204") ? () => undefined : (stryCov_9fa48("27204"), submission => <TableRow key={submission.submission_id} sx={stryMutAct_9fa48("27205") ? {} : (stryCov_9fa48("27205"), {
              '&:hover': stryMutAct_9fa48("27206") ? {} : (stryCov_9fa48("27206"), {
                backgroundColor: stryMutAct_9fa48("27207") ? "" : (stryCov_9fa48("27207"), 'var(--color-primary-transparent)'),
                cursor: stryMutAct_9fa48("27208") ? "" : (stryCov_9fa48("27208"), 'pointer')
              })
            })}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">{submission.task_title}</Typography>
                  </TableCell>
                  <TableCell>{formatDate(submission.submitted_date)}</TableCell>
                  <TableCell>{getFeedbackStatus(submission)}</TableCell>
                  <TableCell>
                    <IconButton onClick={stryMutAct_9fa48("27209") ? () => undefined : (stryCov_9fa48("27209"), () => handleViewSubmission(submission))} size="small" sx={stryMutAct_9fa48("27210") ? {} : (stryCov_9fa48("27210"), {
                  color: stryMutAct_9fa48("27211") ? "" : (stryCov_9fa48("27211"), 'var(--color-primary)'),
                  '&:hover': stryMutAct_9fa48("27212") ? {} : (stryCov_9fa48("27212"), {
                    backgroundColor: stryMutAct_9fa48("27213") ? "" : (stryCov_9fa48("27213"), 'var(--color-primary-transparent-light)')
                  })
                })}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>
        </TableContainer>}

      {/* Submission Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth className="submissions-section__dialog">
        {stryMutAct_9fa48("27216") ? selectedSubmission || <>
            <DialogTitle>
              <Typography variant="h6">
                Submission: {selectedSubmission.task_title}
              </Typography>
              <IconButton aria-label="close" onClick={handleCloseDialog} sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--color-text-muted)'
            }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }} gutterBottom>
                  Submitted on
                </Typography>
                <Typography sx={{
                color: 'var(--color-text-primary)'
              }}>
                  {formatDateTime(selectedSubmission.submitted_date)}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }} gutterBottom>
                  Your Submission
                </Typography>
                <Paper variant="outlined" sx={{
                p: 2,
                backgroundColor: 'var(--color-background-darker)',
                border: '1px solid var(--color-border)'
              }}>
                  <Typography whiteSpace="pre-wrap" sx={{
                  color: 'var(--color-text-primary)'
                }}>
                    {selectedSubmission.content}
                  </Typography>
                  {selectedSubmission.content?.startsWith('http') && <Button variant="contained" color="primary" href={selectedSubmission.content} target="_blank" rel="noopener noreferrer" sx={{
                  mt: 2
                }}>
                      Open Submission
                    </Button>}
                </Paper>
              </Box>
              
              {selectedSubmission.analysis_results && Object.keys(selectedSubmission.analysis_results).length > 0 ? <Box>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }} gutterBottom>
                    AI Feedback
                  </Typography>
                  <Paper variant="outlined" sx={{
                p: 2,
                backgroundColor: 'var(--color-primary-transparent-light)',
                border: '1px solid var(--color-primary-transparent)'
              }}>
                    {Object.entries(selectedSubmission.analysis_results).map(([key, analysis]) => <Box key={key} mb={2}>
                        {analysis.feedback && <Typography whiteSpace="pre-wrap" sx={{
                    color: 'var(--color-text-primary)'
                  }}>
                            {analysis.feedback}
                          </Typography>}
                        {analysis.criteria_met && analysis.criteria_met.length > 0 && <Box mt={2}>
                            <Typography variant="subtitle2" sx={{
                      color: 'var(--color-text-primary)',
                      fontWeight: 500
                    }} gutterBottom>
                              Criteria Met:
                            </Typography>
                            <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                              {analysis.criteria_met.map((criterion, index) => <li key={index} style={{
                        color: 'var(--color-text-primary)'
                      }}>
                                  <Typography variant="body2" sx={{
                          color: 'var(--color-text-primary)'
                        }}>
                                    {criterion}
                                  </Typography>
                                </li>)}
                            </ul>
                          </Box>}
                        {analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 && <Box mt={2}>
                            <Typography variant="subtitle2" sx={{
                      color: 'var(--color-text-primary)',
                      fontWeight: 500
                    }} gutterBottom>
                              Areas for Improvement:
                            </Typography>
                            <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                              {analysis.areas_for_improvement.map((area, index) => <li key={index} style={{
                        color: 'var(--color-text-primary)'
                      }}>
                                  <Typography variant="body2" sx={{
                          color: 'var(--color-text-primary)'
                        }}>
                                    {area}
                                  </Typography>
                                </li>)}
                            </ul>
                          </Box>}
                      </Box>)}
                  </Paper>
                </Box> : <Box>
                  <Typography variant="subtitle2" sx={{
                color: 'var(--color-text-primary)',
                fontWeight: 500
              }} gutterBottom>
                    Feedback
                  </Typography>
                  <Paper variant="outlined" sx={{
                p: 2,
                backgroundColor: 'var(--color-background-darker)',
                border: '1px solid var(--color-border)'
              }}>
                    <Typography sx={{
                  color: 'var(--color-text-muted)'
                }}>
                      No feedback has been provided for this submission.
                    </Typography>
                  </Paper>
                </Box>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{
              color: 'var(--color-primary)',
              '&:hover': {
                backgroundColor: 'var(--color-primary-transparent-light)'
              }
            }}>
                Close
              </Button>
            </DialogActions>
          </> : stryMutAct_9fa48("27215") ? false : stryMutAct_9fa48("27214") ? true : (stryCov_9fa48("27214", "27215", "27216"), selectedSubmission && <>
            <DialogTitle>
              <Typography variant="h6">
                Submission: {selectedSubmission.task_title}
              </Typography>
              <IconButton aria-label="close" onClick={handleCloseDialog} sx={stryMutAct_9fa48("27217") ? {} : (stryCov_9fa48("27217"), {
              position: stryMutAct_9fa48("27218") ? "" : (stryCov_9fa48("27218"), 'absolute'),
              right: 8,
              top: 8,
              color: stryMutAct_9fa48("27219") ? "" : (stryCov_9fa48("27219"), 'var(--color-text-muted)')
            })}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box mb={3}>
                <Typography variant="subtitle2" sx={stryMutAct_9fa48("27220") ? {} : (stryCov_9fa48("27220"), {
                color: stryMutAct_9fa48("27221") ? "" : (stryCov_9fa48("27221"), 'var(--color-text-primary)'),
                fontWeight: 500
              })} gutterBottom>
                  Submitted on
                </Typography>
                <Typography sx={stryMutAct_9fa48("27222") ? {} : (stryCov_9fa48("27222"), {
                color: stryMutAct_9fa48("27223") ? "" : (stryCov_9fa48("27223"), 'var(--color-text-primary)')
              })}>
                  {formatDateTime(selectedSubmission.submitted_date)}
                </Typography>
              </Box>
              
              <Box mb={3}>
                <Typography variant="subtitle2" sx={stryMutAct_9fa48("27224") ? {} : (stryCov_9fa48("27224"), {
                color: stryMutAct_9fa48("27225") ? "" : (stryCov_9fa48("27225"), 'var(--color-text-primary)'),
                fontWeight: 500
              })} gutterBottom>
                  Your Submission
                </Typography>
                <Paper variant="outlined" sx={stryMutAct_9fa48("27226") ? {} : (stryCov_9fa48("27226"), {
                p: 2,
                backgroundColor: stryMutAct_9fa48("27227") ? "" : (stryCov_9fa48("27227"), 'var(--color-background-darker)'),
                border: stryMutAct_9fa48("27228") ? "" : (stryCov_9fa48("27228"), '1px solid var(--color-border)')
              })}>
                  <Typography whiteSpace="pre-wrap" sx={stryMutAct_9fa48("27229") ? {} : (stryCov_9fa48("27229"), {
                  color: stryMutAct_9fa48("27230") ? "" : (stryCov_9fa48("27230"), 'var(--color-text-primary)')
                })}>
                    {selectedSubmission.content}
                  </Typography>
                  {stryMutAct_9fa48("27233") ? selectedSubmission.content?.startsWith('http') || <Button variant="contained" color="primary" href={selectedSubmission.content} target="_blank" rel="noopener noreferrer" sx={{
                  mt: 2
                }}>
                      Open Submission
                    </Button> : stryMutAct_9fa48("27232") ? false : stryMutAct_9fa48("27231") ? true : (stryCov_9fa48("27231", "27232", "27233"), (stryMutAct_9fa48("27235") ? selectedSubmission.content.startsWith('http') : stryMutAct_9fa48("27234") ? selectedSubmission.content?.endsWith('http') : (stryCov_9fa48("27234", "27235"), selectedSubmission.content?.startsWith(stryMutAct_9fa48("27236") ? "" : (stryCov_9fa48("27236"), 'http')))) && <Button variant="contained" color="primary" href={selectedSubmission.content} target="_blank" rel="noopener noreferrer" sx={stryMutAct_9fa48("27237") ? {} : (stryCov_9fa48("27237"), {
                  mt: 2
                })}>
                      Open Submission
                    </Button>)}
                </Paper>
              </Box>
              
              {(stryMutAct_9fa48("27240") ? selectedSubmission.analysis_results || Object.keys(selectedSubmission.analysis_results).length > 0 : stryMutAct_9fa48("27239") ? false : stryMutAct_9fa48("27238") ? true : (stryCov_9fa48("27238", "27239", "27240"), selectedSubmission.analysis_results && (stryMutAct_9fa48("27243") ? Object.keys(selectedSubmission.analysis_results).length <= 0 : stryMutAct_9fa48("27242") ? Object.keys(selectedSubmission.analysis_results).length >= 0 : stryMutAct_9fa48("27241") ? true : (stryCov_9fa48("27241", "27242", "27243"), Object.keys(selectedSubmission.analysis_results).length > 0)))) ? <Box>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("27244") ? {} : (stryCov_9fa48("27244"), {
                color: stryMutAct_9fa48("27245") ? "" : (stryCov_9fa48("27245"), 'var(--color-text-primary)'),
                fontWeight: 500
              })} gutterBottom>
                    AI Feedback
                  </Typography>
                  <Paper variant="outlined" sx={stryMutAct_9fa48("27246") ? {} : (stryCov_9fa48("27246"), {
                p: 2,
                backgroundColor: stryMutAct_9fa48("27247") ? "" : (stryCov_9fa48("27247"), 'var(--color-primary-transparent-light)'),
                border: stryMutAct_9fa48("27248") ? "" : (stryCov_9fa48("27248"), '1px solid var(--color-primary-transparent)')
              })}>
                    {Object.entries(selectedSubmission.analysis_results).map(stryMutAct_9fa48("27249") ? () => undefined : (stryCov_9fa48("27249"), ([key, analysis]) => <Box key={key} mb={2}>
                        {stryMutAct_9fa48("27252") ? analysis.feedback || <Typography whiteSpace="pre-wrap" sx={{
                    color: 'var(--color-text-primary)'
                  }}>
                            {analysis.feedback}
                          </Typography> : stryMutAct_9fa48("27251") ? false : stryMutAct_9fa48("27250") ? true : (stryCov_9fa48("27250", "27251", "27252"), analysis.feedback && <Typography whiteSpace="pre-wrap" sx={stryMutAct_9fa48("27253") ? {} : (stryCov_9fa48("27253"), {
                    color: stryMutAct_9fa48("27254") ? "" : (stryCov_9fa48("27254"), 'var(--color-text-primary)')
                  })}>
                            {analysis.feedback}
                          </Typography>)}
                        {stryMutAct_9fa48("27257") ? analysis.criteria_met && analysis.criteria_met.length > 0 || <Box mt={2}>
                            <Typography variant="subtitle2" sx={{
                      color: 'var(--color-text-primary)',
                      fontWeight: 500
                    }} gutterBottom>
                              Criteria Met:
                            </Typography>
                            <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                              {analysis.criteria_met.map((criterion, index) => <li key={index} style={{
                        color: 'var(--color-text-primary)'
                      }}>
                                  <Typography variant="body2" sx={{
                          color: 'var(--color-text-primary)'
                        }}>
                                    {criterion}
                                  </Typography>
                                </li>)}
                            </ul>
                          </Box> : stryMutAct_9fa48("27256") ? false : stryMutAct_9fa48("27255") ? true : (stryCov_9fa48("27255", "27256", "27257"), (stryMutAct_9fa48("27259") ? analysis.criteria_met || analysis.criteria_met.length > 0 : stryMutAct_9fa48("27258") ? true : (stryCov_9fa48("27258", "27259"), analysis.criteria_met && (stryMutAct_9fa48("27262") ? analysis.criteria_met.length <= 0 : stryMutAct_9fa48("27261") ? analysis.criteria_met.length >= 0 : stryMutAct_9fa48("27260") ? true : (stryCov_9fa48("27260", "27261", "27262"), analysis.criteria_met.length > 0)))) && <Box mt={2}>
                            <Typography variant="subtitle2" sx={stryMutAct_9fa48("27263") ? {} : (stryCov_9fa48("27263"), {
                      color: stryMutAct_9fa48("27264") ? "" : (stryCov_9fa48("27264"), 'var(--color-text-primary)'),
                      fontWeight: 500
                    })} gutterBottom>
                              Criteria Met:
                            </Typography>
                            <ul style={stryMutAct_9fa48("27265") ? {} : (stryCov_9fa48("27265"), {
                      margin: 0,
                      paddingLeft: stryMutAct_9fa48("27266") ? "" : (stryCov_9fa48("27266"), '20px'),
                      listStyleType: stryMutAct_9fa48("27267") ? "" : (stryCov_9fa48("27267"), 'disc')
                    })}>
                              {analysis.criteria_met.map(stryMutAct_9fa48("27268") ? () => undefined : (stryCov_9fa48("27268"), (criterion, index) => <li key={index} style={stryMutAct_9fa48("27269") ? {} : (stryCov_9fa48("27269"), {
                        color: stryMutAct_9fa48("27270") ? "" : (stryCov_9fa48("27270"), 'var(--color-text-primary)')
                      })}>
                                  <Typography variant="body2" sx={stryMutAct_9fa48("27271") ? {} : (stryCov_9fa48("27271"), {
                          color: stryMutAct_9fa48("27272") ? "" : (stryCov_9fa48("27272"), 'var(--color-text-primary)')
                        })}>
                                    {criterion}
                                  </Typography>
                                </li>))}
                            </ul>
                          </Box>)}
                        {stryMutAct_9fa48("27275") ? analysis.areas_for_improvement && analysis.areas_for_improvement.length > 0 || <Box mt={2}>
                            <Typography variant="subtitle2" sx={{
                      color: 'var(--color-text-primary)',
                      fontWeight: 500
                    }} gutterBottom>
                              Areas for Improvement:
                            </Typography>
                            <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                              {analysis.areas_for_improvement.map((area, index) => <li key={index} style={{
                        color: 'var(--color-text-primary)'
                      }}>
                                  <Typography variant="body2" sx={{
                          color: 'var(--color-text-primary)'
                        }}>
                                    {area}
                                  </Typography>
                                </li>)}
                            </ul>
                          </Box> : stryMutAct_9fa48("27274") ? false : stryMutAct_9fa48("27273") ? true : (stryCov_9fa48("27273", "27274", "27275"), (stryMutAct_9fa48("27277") ? analysis.areas_for_improvement || analysis.areas_for_improvement.length > 0 : stryMutAct_9fa48("27276") ? true : (stryCov_9fa48("27276", "27277"), analysis.areas_for_improvement && (stryMutAct_9fa48("27280") ? analysis.areas_for_improvement.length <= 0 : stryMutAct_9fa48("27279") ? analysis.areas_for_improvement.length >= 0 : stryMutAct_9fa48("27278") ? true : (stryCov_9fa48("27278", "27279", "27280"), analysis.areas_for_improvement.length > 0)))) && <Box mt={2}>
                            <Typography variant="subtitle2" sx={stryMutAct_9fa48("27281") ? {} : (stryCov_9fa48("27281"), {
                      color: stryMutAct_9fa48("27282") ? "" : (stryCov_9fa48("27282"), 'var(--color-text-primary)'),
                      fontWeight: 500
                    })} gutterBottom>
                              Areas for Improvement:
                            </Typography>
                            <ul style={stryMutAct_9fa48("27283") ? {} : (stryCov_9fa48("27283"), {
                      margin: 0,
                      paddingLeft: stryMutAct_9fa48("27284") ? "" : (stryCov_9fa48("27284"), '20px'),
                      listStyleType: stryMutAct_9fa48("27285") ? "" : (stryCov_9fa48("27285"), 'disc')
                    })}>
                              {analysis.areas_for_improvement.map(stryMutAct_9fa48("27286") ? () => undefined : (stryCov_9fa48("27286"), (area, index) => <li key={index} style={stryMutAct_9fa48("27287") ? {} : (stryCov_9fa48("27287"), {
                        color: stryMutAct_9fa48("27288") ? "" : (stryCov_9fa48("27288"), 'var(--color-text-primary)')
                      })}>
                                  <Typography variant="body2" sx={stryMutAct_9fa48("27289") ? {} : (stryCov_9fa48("27289"), {
                          color: stryMutAct_9fa48("27290") ? "" : (stryCov_9fa48("27290"), 'var(--color-text-primary)')
                        })}>
                                    {area}
                                  </Typography>
                                </li>))}
                            </ul>
                          </Box>)}
                      </Box>))}
                  </Paper>
                </Box> : <Box>
                  <Typography variant="subtitle2" sx={stryMutAct_9fa48("27291") ? {} : (stryCov_9fa48("27291"), {
                color: stryMutAct_9fa48("27292") ? "" : (stryCov_9fa48("27292"), 'var(--color-text-primary)'),
                fontWeight: 500
              })} gutterBottom>
                    Feedback
                  </Typography>
                  <Paper variant="outlined" sx={stryMutAct_9fa48("27293") ? {} : (stryCov_9fa48("27293"), {
                p: 2,
                backgroundColor: stryMutAct_9fa48("27294") ? "" : (stryCov_9fa48("27294"), 'var(--color-background-darker)'),
                border: stryMutAct_9fa48("27295") ? "" : (stryCov_9fa48("27295"), '1px solid var(--color-border)')
              })}>
                    <Typography sx={stryMutAct_9fa48("27296") ? {} : (stryCov_9fa48("27296"), {
                  color: stryMutAct_9fa48("27297") ? "" : (stryCov_9fa48("27297"), 'var(--color-text-muted)')
                })}>
                      No feedback has been provided for this submission.
                    </Typography>
                  </Paper>
                </Box>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={stryMutAct_9fa48("27298") ? {} : (stryCov_9fa48("27298"), {
              color: stryMutAct_9fa48("27299") ? "" : (stryCov_9fa48("27299"), 'var(--color-primary)'),
              '&:hover': stryMutAct_9fa48("27300") ? {} : (stryCov_9fa48("27300"), {
                backgroundColor: stryMutAct_9fa48("27301") ? "" : (stryCov_9fa48("27301"), 'var(--color-primary-transparent-light)')
              })
            })}>
                Close
              </Button>
            </DialogActions>
          </>)}
      </Dialog>
    </Box>;
  }
};
export default SubmissionsSection;
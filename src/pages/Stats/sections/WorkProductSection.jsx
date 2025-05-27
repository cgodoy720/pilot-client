import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  CircularProgress,
  Divider,
  Grid,
  Button,
  Modal,
  Card,
  CardContent,
  CardActions,
  Chip,
  Link,
  IconButton
} from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { fetchExternalWorkProduct } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import MonthFilter from '../../../components/MonthFilter';

const WorkProductSection = ({ cohortMonth }) => {
  const { user, token } = useAuth();
  const [workProductData, setWorkProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    const loadWorkProductData = async () => {
      try {
        console.log('Starting to fetch work product data...');
        setLoading(true);
        
        // Debug what's in the auth context
        console.log('Auth context user:', user);
        console.log('Cohort month:', cohortMonth);
        
        // Extract user ID from auth context
        const userId = user?.user_id || 17; // Use user_id from context or fallback to 17
        console.log('Using user ID:', userId);
        
        const data = await fetchExternalWorkProduct(userId, selectedMonth);
        console.log('Received external work product data:', data);
        setWorkProductData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch work product data:', err);
        setError(err.message || 'Failed to load work product data');
      } finally {
        setLoading(false);
      }
    };

    loadWorkProductData();
  }, [user, token, selectedMonth, cohortMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    // Check if dateString is already in a Date format
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString; // Return as is if it's not a valid date
    }
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeColor = (score) => {
    if (score === 0) return 'error';
    if (score === null || score === undefined || isNaN(score)) return 'error';
    
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const getGradeLabel = (score) => {
    if (score === 0) return "Document Access Error";
    if (score === null || score === undefined || isNaN(score)) return "F";
    
    if (score >= 93) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'B-';
    if (score >= 40) return 'C+';
    return 'C';
  };

  const getCompletionScore = (item) => {
    try {
      const analysis = parseAnalysis(item);
      if (analysis && !isNaN(analysis.completion_score)) {
        return analysis.completion_score || 0;
      }
      return 0;
    } catch (err) {
      console.error('Error getting completion score:', err);
      return 0;
    }
  };

  const getFeedback = (item) => {
    try {
      const analysis = parseAnalysis(item);
      if (analysis) {
        // Handle case where feedback might be NaN or null
        if (analysis.feedback === null || analysis.feedback === undefined || 
            (typeof analysis.feedback === 'number' && isNaN(analysis.feedback))) {
          return ''; // Return empty string if feedback is NaN, null or undefined
        }
        return analysis.feedback || '';
      }
      return '';
    } catch (err) {
      console.error('Error parsing feedback:', err);
      return '';
    }
  };

  const getAnalyzedContent = (item) => {
    try {
      if (!item.analyzed_content) return '';
      
      // Handle case where analyzed_content is a string but might be JSON
      if (typeof item.analyzed_content === 'string') {
        try {
          // Check if it's a JSON string
          const parsed = JSON.parse(item.analyzed_content);
          
          // Handle array of objects with type and content properties
          if (Array.isArray(parsed)) {
            const links = parsed.filter(p => p.type === 'link').map(p => p.content);
            return links.length > 0 ? links[0] : '';
          }
          
          // Handle object with content property
          if (parsed && parsed.content) {
            return parsed.content;
          }
          
          return item.analyzed_content; // Return original if JSON parsing doesn't yield useful results
        } catch (e) {
          // Not a JSON string, just return as is
          return item.analyzed_content;
        }
      }
      
      // Handle object format
      if (typeof item.analyzed_content === 'object') {
        if (item.analyzed_content.content) {
          return item.analyzed_content.content;
        }
        
        // For arrays of objects
        if (Array.isArray(item.analyzed_content)) {
          const links = item.analyzed_content
            .filter(item => item.type === 'link')
            .map(item => item.content);
          return links.length > 0 ? links[0] : '';
        }
      }
      
      return '';
    } catch (err) {
      console.error('Error extracting analyzed content:', err);
      return '';
    }
  };

  // Parse the analysis object safely handling NaN and other edge cases
  const parseAnalysis = (item) => {
    try {
      if (!item || !item.analysis) return null;
      
      // Handle NaN values in the JSON by replacing them before parsing
      let analysisStr = item.analysis;
      if (typeof analysisStr === 'string') {
        // Replace NaN with null since NaN is not valid in JSON
        analysisStr = analysisStr.replace(/"feedback"\s*:\s*NaN/g, '"feedback": null');
        analysisStr = analysisStr.replace(/:\s*NaN/g, ': null');
        
        try {
          return JSON.parse(analysisStr);
        } catch (jsonError) {
          console.error('JSON parse error:', jsonError);
          console.log('Problem string:', analysisStr);
          return {}; // Return empty object if parse fails
        }
      } else if (typeof item.analysis === 'object') {
        return item.analysis;
      }
      
      return {};
    } catch (err) {
      console.error('Error parsing analysis:', err);
      return {};
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={4}>
        <Typography color="error" variant="h6" gutterBottom>
          Error Loading Work Product Data
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!workProductData || !Array.isArray(workProductData) || workProductData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
            Work Product Analysis
          </Typography>
          
          <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
            <MonthFilter 
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              cohortMonth={cohortMonth}
            />
          </Box>
        </Box>
        <Typography sx={{ color: 'var(--color-text-secondary)' }}>
          No work product data available for the selected month.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="work-product-section">
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
          Work Product Analysis
        </Typography>
        
        <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
          <MonthFilter 
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            cohortMonth={cohortMonth}
          />
        </Box>
      </Box>
      
      {/* List view of work products */}
      <Grid container spacing={2}>
        {workProductData.map((item, index) => {
          const score = getCompletionScore(item);
          const feedback = getFeedback(item);
          
          return (
            <Grid item xs={12} key={index}>
              <Card 
                variant="outlined" 
                sx={{ 
                  backgroundColor: '#171c28',
                  border: '1px solid var(--color-border)',
                  borderRadius: 2
                }}
              >
                <CardContent sx={{ pb: 1.5 }}>
                  {/* Date at top - small */}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'var(--color-text-secondary)', 
                      display: 'block',
                      mb: 0.5,
                      textAlign: 'left'
                    }}
                  >
                    {formatDate(item.date?.value || item.analyzed_at || item.curriculum_date)}
                  </Typography>
                  
                  {/* Title and score on same line */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'var(--color-text-primary)', 
                        fontWeight: 500,
                        textAlign: 'left'
                      }}
                    >
                      {item.task_title || `Work Product ${item.task_id || ''}`}
                    </Typography>
                    
                    <Chip 
                      label={`${score}% (${getGradeLabel(score)})`}
                      color={getGradeColor(score)}
                      size="small"
                    />
                  </Box>
                  
                  {/* Feedback summary */}
                  {feedback && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--color-text-primary)',
                        opacity: 0.8,
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textAlign: 'left'
                      }}
                    >
                      {feedback}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1.5, pt: 0 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleOpenModal(item)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Modal for detailed view */}
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="work-product-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {xs: '90%', sm: '80%', md: '70%'},
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: '#171c28',
          border: '1px solid var(--color-border)',
          borderRadius: 1,
          boxShadow: 24,
          p: 4
        }}>
          {selectedItem && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography id="work-product-modal-title" variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {selectedItem.task_title || `Work Product ${selectedItem.task_id || ''}`}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'var(--color-text-secondary)', mt: 1 }}>
                    Date: {formatDate(selectedItem.date?.value || selectedItem.analyzed_at || selectedItem.curriculum_date)}
                  </Typography>
                </Box>
                <IconButton onClick={handleCloseModal} sx={{ p: 1 }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {/* Analyzed Content */}
              {getAnalyzedContent(selectedItem) && (
                <Box mb={3}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Analyzed Content:
                  </Typography>
                  {getAnalyzedContent(selectedItem).startsWith('https://') ? (
                    <Link 
                      href={getAnalyzedContent(selectedItem)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ wordBreak: 'break-all' }}
                    >
                      {getAnalyzedContent(selectedItem)}
                    </Link>
                  ) : (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        padding: 2,
                        borderRadius: 1,
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {getAnalyzedContent(selectedItem)}
                    </Typography>
                  )}
                </Box>
              )}
              
              {/* Analysis Content */}
              {parseAnalysis(selectedItem) && (
                <Box>
                  {/* Score */}
                  {parseAnalysis(selectedItem).completion_score && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Score: {parseAnalysis(selectedItem).completion_score} ({getGradeLabel(parseAnalysis(selectedItem).completion_score)})
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Submission Summary */}
                  {parseAnalysis(selectedItem).submission_summary && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Submission Summary:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                        {parseAnalysis(selectedItem).submission_summary}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Feedback */}
                  {parseAnalysis(selectedItem).feedback && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Feedback:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--color-text-primary)' }}>
                        {parseAnalysis(selectedItem).feedback}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Criteria Met */}
                  {parseAnalysis(selectedItem).criteria_met && parseAnalysis(selectedItem).criteria_met.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Criteria Met:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).criteria_met.map((criterion, idx) => (
                          <Chip
                            key={idx}
                            label={criterion}
                            color="success"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Areas for Improvement */}
                  {parseAnalysis(selectedItem).areas_for_improvement && parseAnalysis(selectedItem).areas_for_improvement.length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Areas for Improvement:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {parseAnalysis(selectedItem).areas_for_improvement.map((area, idx) => (
                          <Chip
                            key={idx}
                            label={area}
                            color="warning"
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Specific Findings */}
                  {parseAnalysis(selectedItem).specific_findings && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Specific Findings:
                      </Typography>
                      
                      {Object.entries(parseAnalysis(selectedItem).specific_findings).map(([category, findings], idx) => (
                        <Box key={idx} mb={2}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            {category}:
                          </Typography>
                          
                          {findings.strengths && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(findings.strengths) ? (
                                  findings.strengths.map((strength, sIdx) => (
                                    <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {findings.strengths}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {findings.weaknesses && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(findings.weaknesses) ? (
                                  findings.weaknesses.map((weakness, wIdx) => (
                                    <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {findings.weaknesses}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {findings.score && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Score: {findings.score}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default WorkProductSection; 
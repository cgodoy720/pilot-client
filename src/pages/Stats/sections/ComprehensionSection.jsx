import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
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
import { fetchExternalComprehension } from '../../../utils/statsApi';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import MonthFilter from '../../../components/MonthFilter';
import AITrendAnalysis from '../../../components/AITrendAnalysis';

const ComprehensionSection = ({ cohortMonth }) => {
  const { user, token } = useAuth();
  const [comprehensionData, setComprehensionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('all');

  // Filter out entries with technical errors
  const filterOutErrors = (data) => {
    if (!Array.isArray(data)) return data;
    
    return data.filter(item => {
      try {
        const analysis = parseAnalysis(item);
        if (!analysis) return true; // Keep items without analysis
        
        // Check areas_for_improvement for technical error messages
        if (analysis.areas_for_improvement && Array.isArray(analysis.areas_for_improvement)) {
          const hasError = analysis.areas_for_improvement.some(area => 
            typeof area === 'string' && 
            area.toLowerCase().includes('technical issue') &&
            area.toLowerCase().includes('try again')
          );
          if (hasError) return false; // Filter out this item
        }
        
        // Check feedback for technical error messages
        if (analysis.feedback && typeof analysis.feedback === 'string') {
          const hasError = analysis.feedback.toLowerCase().includes('technical issue') &&
                           analysis.feedback.toLowerCase().includes('try again');
          if (hasError) return false; // Filter out this item
        }
        
        return true; // Keep this item
      } catch (err) {
        console.error('Error checking for technical errors:', err);
        return true; // Keep item if we can't parse it
      }
    });
  };

  useEffect(() => {
    const loadComprehensionData = async () => {
      try {
        console.log('Starting to fetch comprehension data...');
        setLoading(true);
        
        // Debug what's in the auth context
        console.log('Auth context user:', user);
        console.log('Cohort month:', cohortMonth);
        
        // Extract user ID from auth context
        const userId = user?.user_id || 17; // Use user_id from context or fallback to 17
        console.log('Using user ID:', userId);
        
        const data = await fetchExternalComprehension(userId, selectedMonth);
        console.log('Received external comprehension data:', data);
        
        // Filter out entries with technical errors
        const filteredData = filterOutErrors(data);
        console.log('Filtered comprehension data (removed errors):', filteredData);
        
        setComprehensionData(filteredData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch comprehension data:', err);
        setError(err.message || 'Failed to load comprehension data');
      } finally {
        setLoading(false);
      }
    };

    loadComprehensionData();
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

  // Get all section scores from the analysis
  const getAllSectionScores = (item) => {
    try {
      const analysis = parseAnalysis(item);
      if (!analysis || !analysis.specific_findings) return [];
      
      const scores = [];
      const findings = analysis.specific_findings;
      
      // Check for comprehension score (both cases)
      const comprehensionData = findings.comprehension || findings.Comprehension;
      if (comprehensionData && comprehensionData.score !== undefined) {
        scores.push({
          section: 'Comprehension',
          score: comprehensionData.score
        });
      }
      
      // Check for business value score (multiple possible keys)
      const businessValueData = findings.business_value || findings.Business_value || findings['Business Value'];
      if (businessValueData && businessValueData.score !== undefined) {
        scores.push({
          section: 'Business Value',
          score: businessValueData.score
        });
      }
      
      // Check for professional skills score (multiple possible keys)
      const professionalSkillsData = findings.professional_skills || findings.Professional_skills || findings['Professional Skills'];
      if (professionalSkillsData && professionalSkillsData.score !== undefined) {
        scores.push({
          section: 'Professional Skills',
          score: professionalSkillsData.score
        });
      }
      
      // If no section scores found, fall back to overall completion score
      if (scores.length === 0 && analysis.completion_score !== undefined) {
        scores.push({
          section: 'Overall',
          score: analysis.completion_score
        });
      }
      
      return scores;
    } catch (err) {
      console.error('Error getting section scores:', err);
      return [];
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
          Error Loading Comprehension Data
        </Typography>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!comprehensionData || !Array.isArray(comprehensionData) || comprehensionData.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
            Comprehension Analysis
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
          No comprehension data available for the selected month.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="comprehension-section">
      <Box sx={{ position: 'relative', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'var(--color-text-primary)', mb: 3 }}>
          Comprehension Analysis
        </Typography>
        
        <Box sx={{ position: 'absolute', right: 0, top: 0 }}>
          <MonthFilter 
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            cohortMonth={cohortMonth}
          />
        </Box>
      </Box>
      
      {/* AI Trend Analysis */}
      <AITrendAnalysis 
        analysisType="comprehension"
        cohortMonth={cohortMonth}
        title="Comprehension"
      />
      
      {/* List view of comprehension items */}
      <Grid container spacing={2}>
        {comprehensionData.map((item, index) => {
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
                      {item.task_title || `Comprehension ${item.task_id || ''}`}
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
        aria-labelledby="comprehension-modal-title"
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
                  <Typography id="comprehension-modal-title" variant="h5" component="h2" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {selectedItem.task_title || `Comprehension ${selectedItem.task_id || ''}`}
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
                  {/* Section Scores Summary */}
                  {getAllSectionScores(selectedItem).length > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Section Scores:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {getAllSectionScores(selectedItem).map((scoreData, idx) => (
                          <Chip
                            key={idx}
                            label={`${scoreData.section}: ${scoreData.score}% (${getGradeLabel(scoreData.score)})`}
                            color={getGradeColor(scoreData.score)}
                            size="medium"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ))}
                      </Box>
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
                      
                      {/* Comprehension Section - handle both cases: lowercase and uppercase 'c' */}
                      {(parseAnalysis(selectedItem).specific_findings.comprehension || parseAnalysis(selectedItem).specific_findings.Comprehension) && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Comprehension:
                          </Typography>
                          
                          {/* Display Comprehension Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.score || 
                            parseAnalysis(selectedItem).specific_findings.Comprehension?.score) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.comprehension?.score || 
                                        parseAnalysis(selectedItem).specific_findings.Comprehension?.score}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Get strengths from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || 
                            parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || 
                                              parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths) ? (
                                  (parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || 
                                   parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths).map((strength, sIdx) => (
                                    <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.strengths || 
                                     parseAnalysis(selectedItem).specific_findings.Comprehension?.strengths}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Get weaknesses from either case version */}
                          {(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || 
                            parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || 
                                              parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses) ? (
                                  (parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || 
                                   parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses).map((weakness, wIdx) => (
                                    <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.comprehension?.weaknesses || 
                                     parseAnalysis(selectedItem).specific_findings.Comprehension?.weaknesses}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {/* Business Value Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.business_value || 
                        parseAnalysis(selectedItem).specific_findings.Business_value || 
                        parseAnalysis(selectedItem).specific_findings['Business Value']) && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Business Value:
                          </Typography>
                          
                          {/* Display Business Value Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.score || 
                            parseAnalysis(selectedItem).specific_findings.Business_value?.score ||
                            parseAnalysis(selectedItem).specific_findings['Business Value']?.score) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.business_value?.score || 
                                        parseAnalysis(selectedItem).specific_findings.Business_value?.score ||
                                        parseAnalysis(selectedItem).specific_findings['Business Value']?.score}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || 
                            parseAnalysis(selectedItem).specific_findings.Business_value?.strengths ||
                            parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.strengths || 
                                             parseAnalysis(selectedItem).specific_findings.Business_value?.strengths ||
                                             parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths) ? (
                                  (parseAnalysis(selectedItem).specific_findings.business_value?.strengths || 
                                   parseAnalysis(selectedItem).specific_findings.Business_value?.strengths ||
                                   parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths).map((strength, sIdx) => (
                                    <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.strengths || 
                                     parseAnalysis(selectedItem).specific_findings.Business_value?.strengths ||
                                     parseAnalysis(selectedItem).specific_findings['Business Value']?.strengths}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || 
                            parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses ||
                            parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || 
                                             parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses ||
                                             parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses) ? (
                                  (parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || 
                                   parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses ||
                                   parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses).map((weakness, wIdx) => (
                                    <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.business_value?.weaknesses || 
                                     parseAnalysis(selectedItem).specific_findings.Business_value?.weaknesses ||
                                     parseAnalysis(selectedItem).specific_findings['Business Value']?.weaknesses}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {/* Professional Skills Section - keep existing code but make the check case-insensitive */}
                      {(parseAnalysis(selectedItem).specific_findings.professional_skills || 
                        parseAnalysis(selectedItem).specific_findings.Professional_skills ||
                        parseAnalysis(selectedItem).specific_findings['Professional Skills']) && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            Professional Skills:
                          </Typography>
                          
                          {/* Display Professional Skills Score if available */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.score || 
                            parseAnalysis(selectedItem).specific_findings.Professional_skills?.score ||
                            parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Score: {parseAnalysis(selectedItem).specific_findings.professional_skills?.score || 
                                        parseAnalysis(selectedItem).specific_findings.Professional_skills?.score ||
                                        parseAnalysis(selectedItem).specific_findings['Professional Skills']?.score}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Use the first available property for strengths */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || 
                            parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths ||
                            parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Strengths:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || 
                                             parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths ||
                                             parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths) ? (
                                  (parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || 
                                   parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths ||
                                   parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths).map((strength, sIdx) => (
                                    <Typography key={sIdx} component="li" variant="body2">
                                      {strength}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.strengths || 
                                     parseAnalysis(selectedItem).specific_findings.Professional_skills?.strengths ||
                                     parseAnalysis(selectedItem).specific_findings['Professional Skills']?.strengths}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {/* Use the first available property for weaknesses */}
                          {(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || 
                            parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses ||
                            parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Weaknesses:
                              </Typography>
                              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                                {Array.isArray(parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || 
                                             parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses ||
                                             parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses) ? (
                                  (parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || 
                                   parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses ||
                                   parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses).map((weakness, wIdx) => (
                                    <Typography key={wIdx} component="li" variant="body2">
                                      {weakness}
                                    </Typography>
                                  ))
                                ) : (
                                  <Typography component="li" variant="body2">
                                    {parseAnalysis(selectedItem).specific_findings.professional_skills?.weaknesses || 
                                     parseAnalysis(selectedItem).specific_findings.Professional_skills?.weaknesses ||
                                     parseAnalysis(selectedItem).specific_findings['Professional Skills']?.weaknesses}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                      
                      {/* Display AI Generation Information if available */}
                      {(parseAnalysis(selectedItem).ai_generated_likelihood || parseAnalysis(selectedItem).ai_detection_reasoning) && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
                            AI Detection:
                          </Typography>
                          
                          {parseAnalysis(selectedItem).ai_generated_likelihood && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                AI Generated Likelihood:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_generated_likelihood}
                              </Typography>
                            </Box>
                          )}
                          
                          {parseAnalysis(selectedItem).ai_detection_reasoning && (
                            <Box ml={2} mt={1}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Reasoning:
                              </Typography>
                              <Typography variant="body2">
                                {parseAnalysis(selectedItem).ai_detection_reasoning}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
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

export default ComprehensionSection; 
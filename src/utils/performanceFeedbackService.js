import { fetchExternalWorkProduct, fetchExternalComprehension, fetchExternalPeerFeedback } from './statsApi';

/**
 * Parse completion score from analysis data
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {number} - Completion score (0-100)
 */
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

/**
 * Parse feedback content from analysis data
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {string} - Feedback content
 */
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

/**
 * Parse skill tags from analysis data
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {Array} - Array of skill tags
 */
const parseSkillTags = (item) => {
  try {
    const analysis = parseAnalysis(item);
    if (analysis && analysis.criteria_met && Array.isArray(analysis.criteria_met)) {
      return analysis.criteria_met.slice(0, 4); // Limit to 4 skills
    }
    return [];
  } catch (err) {
    console.error('Error parsing skill tags:', err);
    return [];
  }
};

/**
 * Get improvement areas from analysis data
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {Array} - Array of improvement areas
 */
const getImprovementAreas = (item) => {
  try {
    const analysis = parseAnalysis(item);
    if (analysis && analysis.areas_for_improvement && Array.isArray(analysis.areas_for_improvement)) {
      return analysis.areas_for_improvement.slice(0, 3); // Limit to 3 areas
    }
    return [];
  } catch (err) {
    console.error('Error getting improvement areas:', err);
    return [];
  }
};

/**
 * Get analyzed content type
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {string} - Content type (Video, Document, Link, etc.)
 */
const getAnalyzedContentType = (item) => {
  try {
    if (!item.analyzed_content) return 'Assignment';
    
    if (typeof item.analyzed_content === 'string') {
      if (item.analyzed_content.startsWith('https://')) {
        if (item.analyzed_content.includes('youtube.com') || item.analyzed_content.includes('vimeo.com')) {
          return 'Video';
        }
        return 'Link';
      }
      return 'Document';
    }
    
    return 'Assignment';
  } catch (err) {
    console.error('Error getting content type:', err);
    return 'Assignment';
  }
};

/**
 * Parse the analysis object safely handling NaN and other edge cases
 * 
 * @param {Object} item - Feedback item with analysis data
 * @returns {Object} - Parsed analysis object
 */
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

/**
 * Fetch and combine all feedback data for a user
 * 
 * @param {number} userId - The user ID
 * @param {Object} dateRange - Date range object with month property
 * @returns {Promise<Array>} - Combined feedback array
 */
export const fetchCombinedFeedback = async (userId, dateRange) => {
  try {
    console.log('Fetching combined feedback for user:', userId, 'dateRange:', dateRange);
    
    const [workProduct, comprehension, peerFeedback] = await Promise.all([
      fetchExternalWorkProduct(userId, dateRange.month),
      fetchExternalComprehension(userId, dateRange.month), 
      fetchExternalPeerFeedback(userId, dateRange.month)
    ]);

    console.log('Raw data received:', {
      workProduct: workProduct?.length || 0,
      comprehension: comprehension?.length || 0,
      peerFeedback: peerFeedback?.length || 0
    });

    // Combine and normalize all feedback
    const combinedFeedback = [
      ...workProduct.map(item => ({
        ...item,
        type: 'Work Product',
        typeColor: '#3B82F6', // blue
        date: item.date?.value || item.analyzed_at || item.curriculum_date,
        subject: item.task_title || 'Work Product Analysis',
        score: getCompletionScore(item),
        content: getFeedback(item),
        skills: parseSkillTags(item),
        improvementAreas: getImprovementAreas(item),
        isComplete: true,
        contentType: getAnalyzedContentType(item),
        task_id: item.task_id,
        day_id: item.day_id
      })),
      ...comprehension.map(item => ({
        ...item,
        type: 'Comprehension',
        typeColor: '#8B5CF6', // purple
        date: item.date?.value || item.analyzed_at || item.curriculum_date,
        subject: item.task_title || 'Comprehension Analysis',
        score: getCompletionScore(item),
        content: getFeedback(item),
        skills: parseSkillTags(item),
        improvementAreas: getImprovementAreas(item),
        isComplete: true,
        contentType: getAnalyzedContentType(item),
        task_id: item.task_id,
        day_id: item.day_id
      })),
      ...peerFeedback.map(item => ({
        ...item,
        type: 'Peer Feedback',
        typeColor: '#EC4899', // pink
        date: item.timestamp?.value,
        subject: 'Peer Feedback Session',
        score: null, // Peer feedback doesn't have scores
        content: item.summary,
        skills: [],
        improvementAreas: [],
        isComplete: true,
        contentType: 'Discussion',
        task_id: null,
        day_id: null
      }))
    ];

    // Sort by date (newest first) and add unique IDs
    const sortedFeedback = combinedFeedback
      .filter(item => item.date) // Remove items without dates
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((item, index) => ({ ...item, id: `feedback-${index}` }));
      
    console.log('Combined feedback processed:', sortedFeedback.length, 'items');
    return sortedFeedback;
      
  } catch (error) {
    console.error('Error fetching combined feedback:', error);
    return [];
  }
};

/**
 * Filter feedback by search term and type
 * 
 * @param {Array} feedbackData - Array of feedback items
 * @param {string} searchTerm - Search term to filter by
 * @param {string} typeFilter - Type filter ('All' or specific type)
 * @returns {Array} - Filtered feedback array
 */
export const filterFeedback = (feedbackData, searchTerm = '', typeFilter = 'All') => {
  return feedbackData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
};

/**
 * Get feedback statistics
 * 
 * @param {Array} feedbackData - Array of feedback items
 * @returns {Object} - Feedback statistics
 */
export const getFeedbackStatistics = (feedbackData) => {
  const stats = {
    total: feedbackData.length,
    workProduct: 0,
    comprehension: 0,
    peerFeedback: 0,
    averageScore: 0,
    highScoreCount: 0, // Score >= 90
    mediumScoreCount: 0, // Score 70-89
    lowScoreCount: 0 // Score < 70
  };
  
  let totalScore = 0;
  let scoredItems = 0;
  
  feedbackData.forEach(item => {
    // Count by type
    switch (item.type) {
      case 'Work Product':
        stats.workProduct++;
        break;
      case 'Comprehension':
        stats.comprehension++;
        break;
      case 'Peer Feedback':
        stats.peerFeedback++;
        break;
    }
    
    // Calculate score statistics
    if (item.score !== null && item.score !== undefined) {
      totalScore += item.score;
      scoredItems++;
      
      if (item.score >= 90) {
        stats.highScoreCount++;
      } else if (item.score >= 70) {
        stats.mediumScoreCount++;
      } else {
        stats.lowScoreCount++;
      }
    }
  });
  
  stats.averageScore = scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0;
  
  return stats;
};

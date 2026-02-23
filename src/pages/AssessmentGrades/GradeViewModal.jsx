import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import SubmissionContent from './components/SubmissionContent';

const GradeViewModal = ({ 
  isOpen,
  grade, 
  onClose,
  isEditingOverview,
  editingStrengths,
  editingGrowthAreas,
  savingOverview,
  onStartEditing,
  onCancelEditing,
  onSaveOverview,
  setEditingStrengths,
  setEditingGrowthAreas
}) => {
  const { token: authToken } = useAuth();
  const [tabValue, setTabValue] = useState("overview");
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Website preview states
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showCode, setShowCode] = useState(true);
  const [websitePreview, setWebsitePreview] = useState('');
  
  // Assessment types mapping - now direct from task submissions
  const assessmentTypeMapping = {
    'business': 'business',
    'technical': 'technical', 
    'professional': 'professional',
    'self': 'self',
    // L2 assessment type mappings
    'l2_technical_improvement': 'technical',
    'l2_professional_ceo': 'professional',
    'l2_business_justification': 'business',
    // Legacy mappings for backward compatibility
    'quiz': 'self',
    'knowledge_assessment': 'self',
    'project': 'technical', 
    'problem_solution': 'business',
    'video': 'professional'
  };
  
  // Base assessment types - will be filtered to only show tabs with actual data
  const allAssessmentTypes = ['technical', 'business', 'professional', 'self'];

  // Smart website preview generator (simplified version)
  const createWebsitePreview = (files) => {
    if (!files || files.length === 0) {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No files found</h2><p>No HTML, CSS, or JS files were submitted.</p></div></body></html>';
    }

    const htmlFiles = files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.html'));
    const cssFiles = files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.css'));
    const jsFiles = files.filter(f => f && f.name && f.name.toLowerCase().endsWith('.js'));

    let htmlContent = '';

    if (htmlFiles.length > 0) {
      htmlContent = htmlFiles[0].content || '';
      
      // Inject CSS
      if (cssFiles.length > 0) {
        const combinedCSS = cssFiles.map(f => f.content || '').filter(content => content.trim()).join('\n\n');
        if (combinedCSS.trim()) {
          const formattedCSS = `/* Injected External CSS Files */\n${combinedCSS}`;
          if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>`);
          } else {
            htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
          }
        }
      }

      // Inject JS
      if (jsFiles.length > 0) {
        const combinedJS = jsFiles.map(f => f.content || '').filter(content => content.trim()).join('\n\n');
        if (combinedJS.trim()) {
          const formattedJS = `/* Injected External JS Files */\n${combinedJS}`;
          if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `  <script type="text/javascript">\n${formattedJS}\n  </script>\n</body>`);
          } else {
            htmlContent += `\n  <script type="text/javascript">\n${formattedJS}\n  </script>\n</body>`;
          }
        }
      }
    } else if (cssFiles.length > 0 || jsFiles.length > 0) {
      const combinedCSS = cssFiles.map(f => f.content || '').join('\n');
      const combinedJS = jsFiles.map(f => f.content || '').join('\n');
      
      htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Student Submission Preview</title>
  ${combinedCSS ? `<style>\n${combinedCSS}\n</style>` : ''}
</head>
<body>
  <div style="padding: 20px; font-family: Arial, sans-serif;">
    <h2>Preview Generated</h2>
    <p>No HTML file was submitted, but CSS/JS files were found and included.</p>
  </div>
  ${combinedJS ? `<script>\n${combinedJS}\n</script>` : ''}
</body>
</html>`;
    } else {
      return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Web Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No web files found</h2><p>No HTML, CSS, or JS files were submitted for preview.</p></div></body></html>';
    }

    // Ensure we have a complete HTML document
    if (!htmlContent.includes('<!DOCTYPE html>')) {
      if (!htmlContent.includes('<html')) {
        htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Student Submission</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
      } else {
        htmlContent = `<!DOCTYPE html>\n${htmlContent}`;
      }
    }
    
    return htmlContent;
  };
  
  useEffect(() => {
    if (!isOpen || !grade) return;
    
    console.log('🔍 Grade object:', grade);
    console.log('🔍 Grade assessment_period:', grade.assessment_period);
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user submissions - pass assessment_period AND cohort as query params
        const submissionsParams = new URLSearchParams({
          assessmentPeriod: grade.assessment_period || 'Week 8',
          cohort: grade.assessment_cohort || grade.cohort || ''
        });
        const submissionsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/user-submissions/${grade.user_id}?${submissionsParams}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json();
          console.log('🔍 User Submissions API Response:', submissionsData);
          console.log('🔍 Submissions Array:', submissionsData.submissions);
          setUserSubmissions(submissionsData.submissions || []);
        }
        
        // Fetch comprehensive analysis data - pass assessment_period AND cohort as query params
        const analysisParams = new URLSearchParams({
          assessmentPeriod: grade.assessment_period || 'Week 8',
          cohort: grade.assessment_cohort || grade.cohort || ''
        });
        const analysisResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/assessment-grades/comprehensive-analysis/${grade.user_id}?${analysisParams}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          console.log('🔍 Comprehensive Analysis API Response:', analysisData);
          console.log('🔍 Analysis Array:', analysisData.analysis);
          setComprehensiveAnalysis(analysisData.analysis || []);
        }
        
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [grade?.user_id, grade?.assessment_period, grade?.cohort, authToken, isOpen]);

  // Generate website preview when technical submission data is available
  useEffect(() => {
    if (!userSubmissions || userSubmissions.length === 0) return;
    
    const technicalSubmission = userSubmissions.find(sub => sub.assessment_type === 'technical');
    if (technicalSubmission && technicalSubmission.submission_data && technicalSubmission.submission_data.files) {
      try {
        const preview = createWebsitePreview(technicalSubmission.submission_data.files);
        setWebsitePreview(preview);
      } catch (error) {
        console.error('Error generating website preview:', error);
        setWebsitePreview('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview Error</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>Preview Error</h2><p>Unable to generate website preview due to invalid file data.</p></div></body></html>');
      }
    }
  }, [userSubmissions]);
  
  // Group comprehensive analysis by our assessment types (case-insensitive matching)
  const analysisByType = comprehensiveAnalysis.reduce((acc, analysis) => {
    const typeKey = (analysis.assessment_type || '').toLowerCase();
    const mappedType = assessmentTypeMapping[typeKey] || typeKey;
    console.log('🔍 Analysis mapping:', { original: analysis.assessment_type, typeKey, mappedType });
    if (!acc[mappedType]) {
      acc[mappedType] = [];
    }
    acc[mappedType].push(analysis);
    return acc;
  }, {});

  // Group user submissions by assessment type for easier access (case-insensitive)
  const submissionsByType = userSubmissions.reduce((acc, submission) => {
    const type = (submission.assessment_type || 'unknown').toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(submission);
    return acc;
  }, {});
  
  // Debug logging
  console.log('📊 analysisByType keys:', Object.keys(analysisByType));
  console.log('📊 submissionsByType keys:', Object.keys(submissionsByType));
  
  // Filter assessment types to only show tabs that have submissions or analysis data
  const assessmentTypesWithData = allAssessmentTypes.filter(type => {
    const hasSubmission = submissionsByType[type] && submissionsByType[type].length > 0;
    const hasAnalysis = analysisByType[type] && analysisByType[type].length > 0;
    return hasSubmission || hasAnalysis;
  });
  
  // Create tabs: Overview + individual assessment types that have data
  const availableTabs = ['overview', ...assessmentTypesWithData];
  
  // Get the current tab's analysis data
  const currentAnalysis = analysisByType[tabValue] || [];
  
  // Function to render analysis feedback
  const renderAnalysisFeedback = (analysis) => {
    if (!analysis) return <p className="text-muted-foreground">No feedback available for this assessment type</p>;
    
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <h4 className="text-2xl font-bold text-primary">Overall Score: {(analysis.overall_score * 100).toFixed(1)}%</h4>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Detailed Feedback</h4>
          <div className="bg-muted/50 p-4 rounded-lg border whitespace-pre-wrap">
            {analysis.feedback}
          </div>
        </div>
        
        {/* Show strengths and growth areas if available */}
        {(analysis.strengths_summary || analysis.growth_areas_summary) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.strengths_summary && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-green-600">Strengths</h4>
                <div className="bg-muted/50 p-4 rounded-lg border whitespace-pre-wrap">
                  {analysis.strengths_summary}
                </div>
              </div>
            )}
            
            {analysis.growth_areas_summary && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="text-lg font-semibold mb-4 text-amber-600">Areas for Growth</h4>
                <div className="bg-muted/50 p-4 rounded-lg border whitespace-pre-wrap">
                  {analysis.growth_areas_summary}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show type-specific insights */}
        {(() => {
          try {
            const typeSpecificData = JSON.parse(analysis.type_specific_data || '{}');
            
            if (typeSpecificData.key_insights) {
              return (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">Key Insights</h4>
                  <ul className="space-y-2">
                    {typeSpecificData.key_insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            
            return null;
          } catch (parseError) {
            console.warn('Failed to parse type_specific_data for analysis:', parseError);
            return null;
          }
        })()}
      </div>
    );
  };

  if (!isOpen || !grade) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0 fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[90vw] sm:w-[90vw]">
        <DialogHeader className="p-4 sm:p-6 border-b border-border bg-muted/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
              <DialogTitle className="text-lg sm:text-xl font-bold">
                {grade.user_first_name} {grade.user_last_name}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span><strong>Email:</strong> {grade.user_email}</span>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <span><strong>Cohort:</strong> {grade.cohort}</span>
                <span className="hidden sm:inline text-muted-foreground">•</span>
                <span><strong>Analysis:</strong> {new Date(grade.created_at?.value || grade.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden min-h-0">
          <Tabs value={tabValue} onValueChange={setTabValue} className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/50 p-0 h-auto flex-shrink-0 overflow-x-auto">
              {availableTabs.map((type) => (
                <TabsTrigger 
                  key={type} 
                  value={type}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3"
                >
                  {type === 'overview' ? 'Overview' : type.charAt(0).toUpperCase() + type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">Loading assessment data...</div>
                    <div className="text-sm">Please wait while we fetch the student's information</div>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-destructive">
                  <div className="text-center">
                    <div className="text-lg font-medium mb-2">Error</div>
                    <div className="text-sm">{error}</div>
                  </div>
                </div>
              ) : userSubmissions.length === 0 && comprehensiveAnalysis.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">No Assessment Data Available</h3>
                    <p className="mb-1">This user has no assessment submissions or analysis data yet.</p>
                    <p>Assessment data will appear here once the user completes assessments and they are analyzed.</p>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="mt-0 p-6 h-full overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-full">
                      {/* Detailed Feedback Section */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold">Detailed Feedback by Assessment</h3>
                        {userSubmissions.length > 0 ? (
                          <div className="space-y-6">
                            {/* Show submissions by assessment type */}
                            {Object.entries(submissionsByType).map(([type, submissions]) => {
                              const latestSubmission = submissions[0]; // Most recent submission
                              const latestAnalysis = analysisByType[type]?.[0]; // Most recent analysis if available
                              
                              return (
                                <div key={type} className="bg-card border border-border rounded-lg p-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold">
                                      {type.charAt(0).toUpperCase() + type.slice(1)} Assessment
                                    </h4>
                                    <div className="flex items-center gap-4">
                                      {latestAnalysis && (
                                        <span className="font-semibold text-primary">
                                          Score: {(latestAnalysis.overall_score * 100).toFixed(1)}%
                                        </span>
                                      )}
                                      <span className="text-sm text-muted-foreground">
                                        {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                  {latestAnalysis ? (
                                    <div className="space-y-4">
                                      <div>
                                        <h5 className="font-medium mb-2">Detailed Feedback</h5>
                                        <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">
                                          {latestAnalysis.feedback}
                                        </div>
                                      </div>
                                      {(() => {
                                        try {
                                          const typeSpecificData = JSON.parse(latestAnalysis.type_specific_data || '{}');
                                          if (typeSpecificData.key_insights) {
                                            return (
                                              <div>
                                                <h5 className="font-medium mb-2">Key Insights</h5>
                                                <ul className="space-y-1 text-sm">
                                                  {typeSpecificData.key_insights.map((insight, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                      <span className="text-primary mt-0.5">•</span>
                                                      <span>{insight}</span>
                                                    </li>
                                                  ))}
                                                </ul>
                                              </div>
                                            );
                                          }
                                          return null;
                                        } catch (parseError) {
                                          console.warn('Failed to parse type_specific_data for', type, ':', parseError);
                                          return null;
                                        }
                                      })()}
                                    </div>
                                  ) : (
                                    <p className="text-muted-foreground">No detailed feedback available</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No detailed feedback available</p>
                        )}
                      </div>
                      
                      {/* Overall Feedback Section */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold">Overall Feedback</h3>
                          {!isEditingOverview && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => onStartEditing(grade)}
                              title="Edit feedback"
                            >
                              ✏️ Edit
                            </Button>
                          )}
                        </div>

                        {isEditingOverview ? (
                          <div className="bg-card border-2 border-primary rounded-lg p-6 space-y-6">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Strengths Summary</h4>
                              <Textarea
                                value={editingStrengths}
                                onChange={(e) => setEditingStrengths(e.target.value)}
                                className="min-h-[100px] resize-none"
                                placeholder="Enter strengths summary..."
                              />
                            </div>

                            <div className="space-y-3">
                              <h4 className="font-semibold">Growth Areas Summary</h4>
                              <Textarea
                                value={editingGrowthAreas}
                                onChange={(e) => setEditingGrowthAreas(e.target.value)}
                                className="min-h-[100px] resize-none"
                                placeholder="Enter growth areas summary..."
                              />
                            </div>

                            <div className="flex gap-4 justify-end pt-4 border-t border-border">
                              <Button 
                                variant="outline"
                                onClick={onCancelEditing}
                                disabled={savingOverview}
                              >
                                ❌ Cancel
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => onSaveOverview(grade.user_id)}
                                disabled={savingOverview}
                              >
                                {savingOverview ? 'Saving...' : '💾 Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <div className="bg-card border border-border rounded-lg p-6">
                              <h4 className="text-lg font-semibold mb-4 text-green-600">Strengths Summary</h4>
                              <div className="bg-muted/50 p-4 rounded border whitespace-pre-wrap">
                                {grade.strengths_summary || 'No strengths summary available'}
                              </div>
                            </div>

                            <div className="bg-card border border-border rounded-lg p-6">
                              <h4 className="text-lg font-semibold mb-4 text-amber-600">Growth Areas Summary</h4>
                              <div className="bg-muted/50 p-4 rounded border whitespace-pre-wrap">
                                {grade.growth_areas_summary || 'No growth areas summary available'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Individual Assessment Tabs - only render tabs that have data */}
                  {assessmentTypesWithData.map((assessmentType) => (
                    <TabsContent key={assessmentType} value={assessmentType} className="mt-0 p-6 h-full overflow-y-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-full">
                        {/* Student Submission Content */}
                        <div>
                          <h3 className="text-xl font-bold mb-6">Student Submission</h3>
                          <SubmissionContent
                            currentTabType={assessmentType}
                            userSubmissions={userSubmissions}
                            assessmentTypeMapping={assessmentTypeMapping}
                            previewMode={previewMode}
                            setPreviewMode={setPreviewMode}
                            showCode={showCode}
                            setShowCode={setShowCode}
                            websitePreview={websitePreview}
                            setWebsitePreview={setWebsitePreview}
                            createWebsitePreview={createWebsitePreview}
                          />
                        </div>
                        
                        {/* AI Analysis & Feedback */}
                        <div>
                          <h3 className="text-xl font-bold mb-6">AI Analysis & Feedback</h3>
                          {currentAnalysis.length > 0 ? (
                            renderAnalysisFeedback(currentAnalysis[0])
                          ) : (
                            <div className="bg-card border border-border rounded-lg p-6">
                              <p className="text-muted-foreground mb-4">No specific feedback available for {assessmentType} assessment.</p>
                              <div className="space-y-4">
                                <div>
                                  <h5 className="font-medium mb-2 text-green-600">Overall Strengths</h5>
                                  <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">
                                    {grade.strengths_summary || 'No strengths summary available'}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="font-medium mb-2 text-amber-600">Areas for Continued Focus</h5>
                                  <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">
                                    {grade.growth_areas_summary || 'No growth areas summary available'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </>
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeViewModal;

import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../stores/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
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
  const authToken = useAuthStore((s) => s.token);
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
        
        const submissionsParams = new URLSearchParams({
          assessmentPeriod: grade.assessment_period || 'Week 8',
          level: grade.level || ''
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
          setUserSubmissions(submissionsData.submissions || []);
        }
        
        const analysisParams = new URLSearchParams({
          assessmentPeriod: grade.assessment_period || 'Week 8',
          level: grade.level || ''
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
  }, [grade?.user_id, grade?.assessment_period, grade?.level, authToken, isOpen]);

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
  
  // Render analysis feedback for individual assessment tabs
  const renderAnalysisFeedback = (analysis) => {
    if (!analysis) return <p className="text-sm text-muted-foreground">No feedback available.</p>;

    const score = analysis.overall_score != null ? Math.round(analysis.overall_score * 100) : null;
    let insights = [];
    try {
      const tsd = JSON.parse(analysis.type_specific_data || '{}');
      if (tsd.key_insights) insights = tsd.key_insights;
    } catch {}

    return (
      <div className="space-y-4">
        {/* Score badge */}
        {score != null && (
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold ${
              score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'
            }`}>{score}%</span>
            <span className="text-sm text-muted-foreground">overall score</span>
          </div>
        )}

        {/* Feedback */}
        {analysis.feedback && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Feedback</h4>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.feedback}</p>
          </div>
        )}

        {/* Key insights */}
        {insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Insights</h4>
            <ul className="space-y-1.5">
              {insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths + growth side by side */}
        {(analysis.strengths_summary || analysis.growth_areas_summary) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {analysis.strengths_summary && (
              <div>
                <h4 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-1">Strengths</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.strengths_summary}</p>
              </div>
            )}
            {analysis.growth_areas_summary && (
              <div>
                <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-1">Growth Areas</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.growth_areas_summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Build radar chart data from per-type analysis scores
  const radarData = useMemo(() => {
    const typeLabels = { self: 'Self Assessment', technical: 'Technical', business: 'Business', professional: 'Professional' };
    return ['self', 'technical', 'business', 'professional'].map(type => {
      const analyses = analysisByType[type] || [];
      const score = analyses.length > 0 && analyses[0].overall_score != null
        ? Math.round(analyses[0].overall_score * 100)
        : null;
      return { category: typeLabels[type], score };
    });
  }, [analysisByType]);

  const hasRadarData = radarData.some(d => d.score != null);

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
                    {/* Radar chart + scores */}
                    {hasRadarData && (
                      <div className="bg-card border border-border rounded-lg p-5 mb-6">
                        <div className="flex items-center justify-center gap-8">
                          <div className="w-[300px] h-[240px] flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="60%">
                                <PolarGrid stroke="#E3E3E3" />
                                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: '#1E1E1E' }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar dataKey="score" stroke="#4242EA" fill="#4242EA" fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: '#4242EA' }} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-2">
                            {radarData.map(d => (
                              <div key={d.category} className="flex items-center gap-3">
                                <span className={`text-xl font-bold w-12 text-right ${
                                  d.score >= 80 ? 'text-green-600' : d.score >= 60 ? 'text-yellow-600' : d.score != null ? 'text-red-500' : 'text-slate-300'
                                }`}>{d.score != null ? `${d.score}%` : '—'}</span>
                                <span className="text-sm text-muted-foreground">{d.category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {/* Overall Feedback Section — full width */}
                      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold">Overall Feedback</h3>
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
                          <div className="space-y-4">
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
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-green-600 uppercase tracking-wide">Strengths</h4>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {grade.strengths_summary || 'No strengths summary available'}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2 text-amber-600 uppercase tracking-wide">Growth Areas</h4>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {grade.growth_areas_summary || 'No growth areas summary available'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Individual Assessment Tabs */}
                  {assessmentTypesWithData.map((assessmentType) => {
                    const tabAnalysis = analysisByType[assessmentType] || [];
                    const tabScore = tabAnalysis[0]?.overall_score != null
                      ? Math.round(tabAnalysis[0].overall_score * 100) : null;

                    return (
                      <TabsContent key={assessmentType} value={assessmentType} className="mt-0 p-6 h-full overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Left: Submission */}
                          <div className="bg-card border border-border rounded-lg p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Submission</h3>
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

                          {/* Right: AI Feedback */}
                          <div className="bg-card border border-border rounded-lg p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">AI Feedback</h3>
                            {tabAnalysis.length > 0 ? (
                              renderAnalysisFeedback(tabAnalysis[0])
                            ) : (
                              <p className="text-sm text-muted-foreground">No AI feedback available for this assessment yet.</p>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
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

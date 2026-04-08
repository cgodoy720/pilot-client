import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../stores/authStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import SubmissionContent from './components/SubmissionContent';

const assessmentTypeMapping = {
  'business': 'business',
  'technical': 'technical',
  'professional': 'professional',
  'self': 'self',
  'l2_technical_improvement': 'technical',
  'l2_professional_ceo': 'professional',
  'l2_business_justification': 'business',
  'quiz': 'self',
  'knowledge_assessment': 'self',
  'project': 'technical',
  'problem_solution': 'business',
  'video': 'professional'
};

const ALL_TYPES = ['technical', 'business', 'professional', 'self'];

// Smart website preview generator
const createWebsitePreview = (files) => {
  if (!files || files.length === 0) {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No files found</h2><p>No HTML, CSS, or JS files were submitted.</p></div></body></html>';
  }
  const htmlFiles = files.filter(f => f?.name?.toLowerCase().endsWith('.html'));
  const cssFiles = files.filter(f => f?.name?.toLowerCase().endsWith('.css'));
  const jsFiles = files.filter(f => f?.name?.toLowerCase().endsWith('.js'));
  let htmlContent = '';
  if (htmlFiles.length > 0) {
    htmlContent = htmlFiles[0].content || '';
    if (cssFiles.length > 0) {
      const combinedCSS = cssFiles.map(f => f.content || '').filter(c => c.trim()).join('\n\n');
      if (combinedCSS.trim()) {
        const formattedCSS = `/* Injected External CSS Files */\n${combinedCSS}`;
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace('</head>', `  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>`);
        } else {
          htmlContent = `<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <style type="text/css">\n${formattedCSS}\n  </style>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
        }
      }
    }
    if (jsFiles.length > 0) {
      const combinedJS = jsFiles.map(f => f.content || '').filter(c => c.trim()).join('\n\n');
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
    htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  ${combinedCSS ? `<style>\n${combinedCSS}\n</style>` : ''}\n</head>\n<body>\n  <div style="padding: 20px; font-family: Arial, sans-serif;">\n    <h2>Preview Generated</h2>\n    <p>No HTML file was submitted, but CSS/JS files were found and included.</p>\n  </div>\n  ${combinedJS ? `<script>\n${combinedJS}\n</script>` : ''}\n</body>\n</html>`;
  } else {
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>No Web Files</title></head><body><div style="padding: 20px; font-family: Arial, sans-serif; text-align: center;"><h2>No web files found</h2><p>No HTML, CSS, or JS files were submitted for preview.</p></div></body></html>';
  }
  if (!htmlContent.includes('<!DOCTYPE html>')) {
    htmlContent = htmlContent.includes('<html') ? `<!DOCTYPE html>\n${htmlContent}` : `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Student Submission</title>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
  }
  return htmlContent;
};

const GradeViewModal = ({
  isOpen,
  grade,
  onClose,
  onSaveOverview, // (userId, assessmentPeriod, level, strengths, growthAreas) => Promise<boolean>
}) => {
  const authToken = useAuthStore((s) => s.token);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState([]);
  const [holisticHistory, setHolisticHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Accordion: which period keys are expanded
  const [expandedPeriods, setExpandedPeriods] = useState(new Set());
  // Which type rows are expanded: key = `${period}|${level}|${type}`
  const [expandedTypes, setExpandedTypes] = useState(new Set());

  // Edit state (one period edited at a time)
  const [editingKey, setEditingKey] = useState(null); // `${period}|${level}`
  const [editingStrengths, setEditingStrengths] = useState('');
  const [editingGrowthAreas, setEditingGrowthAreas] = useState('');
  const [saving, setSaving] = useState(false);

  // SubmissionContent preview state (shared)
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showCode, setShowCode] = useState(true);
  const [websitePreview, setWebsitePreview] = useState('');

  useEffect(() => {
    if (!isOpen || !grade) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);

        const headers = {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        };
        const base = `${import.meta.env.VITE_API_URL}/api/admin/assessment-grades`;

        const [subsRes, analysisRes, historyRes] = await Promise.all([
          fetch(`${base}/user-submissions/${grade.user_id}`, { headers }),
          fetch(`${base}/comprehensive-analysis/${grade.user_id}`, { headers }),
          fetch(`${base}/user-history/${grade.user_id}`, { headers }),
        ]);

        if (subsRes.ok) {
          const data = await subsRes.json();
          setUserSubmissions(data.submissions || []);
        }
        if (analysisRes.ok) {
          const data = await analysisRes.json();
          setComprehensiveAnalysis(data.analysis || []);
        }
        if (historyRes.ok) {
          const data = await historyRes.json();
          setHolisticHistory(data.history || []);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // Reset UI state on open
    setExpandedPeriods(new Set());
    setExpandedTypes(new Set());
    setEditingKey(null);
  }, [grade?.user_id, authToken, isOpen]);

  // Build rounds from submissions + analysis
  const rounds = useMemo(() => {
    const analysisById = {};
    comprehensiveAnalysis.forEach(a => {
      analysisById[a.submission_id] = a;
    });

    const roundMap = {};
    userSubmissions.forEach(sub => {
      const key = `${sub.assessment_period}|${sub.level}`;
      if (!roundMap[key]) {
        roundMap[key] = {
          assessment_period: sub.assessment_period,
          level: sub.level,
          trigger_day_number: sub.trigger_day_number || 0,
          submissions: []
        };
      }
      roundMap[key].submissions.push({ ...sub, analysis: analysisById[sub.submission_id] || null });
      if ((sub.trigger_day_number || 0) > roundMap[key].trigger_day_number) {
        roundMap[key].trigger_day_number = sub.trigger_day_number || 0;
      }
    });

    const sorted = Object.values(roundMap).sort((a, b) => {
      // Primary: level descending (L2 before L1)
      const levelCmp = (b.level || '').localeCompare(a.level || '');
      if (levelCmp !== 0) return levelCmp;
      // Secondary: week number descending within same level
      return b.trigger_day_number - a.trigger_day_number;
    });

    return sorted.map(round => {
      const key = `${round.assessment_period}|${round.level}`;
      // Deduplicate holistic history: pick the most recent record for this period+level
      const holisticRecord = holisticHistory.find(
        h => h.assessment_period === round.assessment_period && h.level === round.level
      ) || null;

      const scores = round.submissions
        .filter(s => s.analysis?.overall_score != null)
        .map(s => s.analysis.overall_score);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

      return { ...round, key, holisticRecord, avgScore };
    });
  }, [userSubmissions, comprehensiveAnalysis, holisticHistory]);

  // Auto-expand most recent period when rounds load
  useEffect(() => {
    if (rounds.length > 0 && expandedPeriods.size === 0) {
      setExpandedPeriods(new Set([rounds[0].key]));
    }
  }, [rounds.length]);

  // Generate website preview for any round's technical submission
  useEffect(() => {
    if (!userSubmissions || userSubmissions.length === 0) return;
    const tech = userSubmissions.find(sub => sub.assessment_type === 'technical');
    if (tech?.submission_data?.files) {
      try {
        setWebsitePreview(createWebsitePreview(tech.submission_data.files));
      } catch {
        setWebsitePreview('<!DOCTYPE html><html><body><p>Preview error</p></body></html>');
      }
    }
  }, [userSubmissions]);

  const togglePeriod = (key) => {
    setExpandedPeriods(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleType = (key) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const startEditing = (round) => {
    setEditingKey(round.key);
    setEditingStrengths(round.holisticRecord?.strengths_summary || '');
    setEditingGrowthAreas(round.holisticRecord?.growth_areas_summary || '');
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditingStrengths('');
    setEditingGrowthAreas('');
  };

  const saveEditing = async (round) => {
    setSaving(true);
    const ok = await onSaveOverview(
      grade.user_id,
      round.assessment_period,
      round.level,
      editingStrengths,
      editingGrowthAreas
    );
    setSaving(false);
    if (ok) {
      // Optimistically update local holisticHistory
      setHolisticHistory(prev => {
        const idx = prev.findIndex(
          h => h.assessment_period === round.assessment_period && h.level === round.level
        );
        const updated = { assessment_period: round.assessment_period, level: round.level, strengths_summary: editingStrengths, growth_areas_summary: editingGrowthAreas };
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...updated };
          return next;
        }
        return [updated, ...prev];
      });
      setEditingKey(null);
      setEditingStrengths('');
      setEditingGrowthAreas('');
    }
  };

  // Group comprehensive analysis by our assessment types (case-insensitive matching)
  const analysisByType = comprehensiveAnalysis.reduce((acc, analysis) => {
    const typeKey = (analysis.assessment_type || '').toLowerCase();
    const mappedType = assessmentTypeMapping[typeKey] || typeKey;
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <DialogTitle className="text-lg sm:text-xl font-bold">
              {grade.user_first_name} {grade.user_last_name}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span><strong>Email:</strong> {grade.user_email}</span>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <span><strong>Cohort:</strong> {grade.cohort}</span>
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
          )}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeViewModal;

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

  const renderTypeAnalysis = (analysis) => {
    if (!analysis) return null;
    return (
      <div className="space-y-4 pt-3">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <span className="text-xl font-bold text-primary">
            Score: {(analysis.overall_score * 100).toFixed(1)}%
          </span>
        </div>
        {analysis.feedback && (
          <div className="bg-card border border-border rounded-lg p-4">
            <h5 className="font-semibold mb-2">Detailed Feedback</h5>
            <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">{analysis.feedback}</div>
          </div>
        )}
        {(() => {
          try {
            const tsd = JSON.parse(analysis.type_specific_data || '{}');
            if (tsd.key_insights?.length) {
              return (
                <div className="bg-card border border-border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Key Insights</h5>
                  <ul className="space-y-1 text-sm">
                    {tsd.key_insights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
          } catch { /* ignore */ }
          return null;
        })()}
      </div>
    );
  };

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

        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Loading assessment history...</div>
                <div className="text-sm">Fetching all periods and levels</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-destructive">
              <div className="text-center">
                <div className="text-lg font-medium mb-2">Error</div>
                <div className="text-sm">{error}</div>
              </div>
            </div>
          ) : rounds.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No Assessment Data</h3>
                <p>This user has no assessment submissions yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Assessment History — {rounds.length} period{rounds.length !== 1 ? 's' : ''} (newest first)
              </h3>

              {rounds.map((round) => {
                const isPeriodOpen = expandedPeriods.has(round.key);
                const isEditing = editingKey === round.key;

                // Get submissions grouped by canonical type for this round
                const subsByType = {};
                round.submissions.forEach(sub => {
                  const canonical = assessmentTypeMapping[(sub.assessment_type || '').toLowerCase()] || sub.assessment_type;
                  if (!subsByType[canonical]) subsByType[canonical] = [];
                  subsByType[canonical].push(sub);
                });
                const typesWithData = ALL_TYPES.filter(t => subsByType[t]?.length > 0);

                return (
                  <div key={round.key} className="border border-border rounded-lg overflow-hidden" data-testid="period-section">
                    {/* Period header */}
                    <button
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => togglePeriod(round.key)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isPeriodOpen ? '▼' : '▶'}</span>
                        <div>
                          <span className="font-semibold text-base">
                            {round.assessment_period}
                            {round.level ? ` — ${round.level.toUpperCase()}` : ''}
                          </span>
                          {round.avgScore != null && (
                            <span className="ml-3 text-sm text-muted-foreground">
                              avg {(round.avgScore * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{typesWithData.length} assessment{typesWithData.length !== 1 ? 's' : ''}</span>
                    </button>

                    {isPeriodOpen && (
                      <div className="p-4 space-y-4 border-t border-border">
                        {/* Overall Feedback block */}
                        {(round.holisticRecord || !isEditing) && (
                          <div className="bg-card border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">Overall Feedback</h4>
                              {!isEditing && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEditing(round)}
                                  disabled={!!editingKey}
                                >
                                  ✏️ Edit
                                </Button>
                              )}
                            </div>

                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <h5 className="font-medium text-sm">Strengths Summary</h5>
                                  <Textarea
                                    value={editingStrengths}
                                    onChange={(e) => setEditingStrengths(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                    placeholder="Enter strengths summary..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <h5 className="font-medium text-sm">Growth Areas Summary</h5>
                                  <Textarea
                                    value={editingGrowthAreas}
                                    onChange={(e) => setEditingGrowthAreas(e.target.value)}
                                    className="min-h-[80px] resize-none"
                                    placeholder="Enter growth areas summary..."
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={cancelEditing} disabled={saving}>Cancel</Button>
                                  <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => saveEditing(round)}
                                    disabled={saving}
                                  >
                                    {saving ? 'Saving...' : '💾 Save'}
                                  </Button>
                                </div>
                              </div>
                            ) : round.holisticRecord ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-green-600 mb-1">Strengths</h5>
                                  <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">
                                    {round.holisticRecord.strengths_summary || 'No strengths summary'}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-amber-600 mb-1">Growth Areas</h5>
                                  <div className="bg-muted/50 p-3 rounded border text-sm whitespace-pre-wrap">
                                    {round.holisticRecord.growth_areas_summary || 'No growth areas summary'}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No holistic feedback generated for this period yet.</p>
                            )}
                          </div>
                        )}

                        {/* Type rows */}
                        {typesWithData.length > 0 && (
                          <div className="space-y-2">
                            {typesWithData.map((type) => {
                              const typeSubs = subsByType[type] || [];
                              const latestSub = typeSubs[0];
                              const typeAnalysis = latestSub?.analysis || null;
                              const typeRowKey = `${round.key}|${type}`;
                              const isTypeOpen = expandedTypes.has(typeRowKey);
                              const scoreDisplay = typeAnalysis?.overall_score != null
                                ? `${(typeAnalysis.overall_score * 100).toFixed(0)}%`
                                : null;

                              return (
                                <div key={type} className="border border-border rounded-lg overflow-hidden">
                                  <button
                                    className="w-full flex items-center justify-between p-3 bg-background hover:bg-muted/30 transition-colors text-left"
                                    onClick={() => toggleType(typeRowKey)}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm">{isTypeOpen ? '▼' : '▶'}</span>
                                      <span className="font-medium capitalize">{type}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {scoreDisplay && (
                                        <span className="text-sm font-semibold text-primary">{scoreDisplay}</span>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {typeSubs.length} submission{typeSubs.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </button>

                                  {isTypeOpen && (
                                    <div className="border-t border-border p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      {/* Submission content */}
                                      <div>
                                        <h5 className="font-semibold mb-3">Student Submission</h5>
                                        <SubmissionContent
                                          currentTabType={type}
                                          userSubmissions={typeSubs}
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

                                      {/* AI Analysis */}
                                      <div>
                                        <h5 className="font-semibold mb-3">AI Analysis & Feedback</h5>
                                        {typeAnalysis ? (
                                          renderTypeAnalysis(typeAnalysis)
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No AI analysis available for this assessment.</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeViewModal;

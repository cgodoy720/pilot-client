import React from 'react';
import WebsitePreview from './WebsitePreview';

// Helper function to determine file language for syntax highlighting
const getFileLanguage = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return 'text';
  }
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'javascript',
    'html': 'html',
    'css': 'css',
    'py': 'python',
    'txt': 'text',
    'md': 'markdown'
  };
  return languageMap[ext] || 'text';
};

const SubmissionContent = ({
  currentTabType,
  userSubmissions,
  assessmentTypeMapping,
  previewMode,
  setPreviewMode,
  showCode,
  setShowCode,
  websitePreview,
  setWebsitePreview,
  createWebsitePreview
}) => {
  // Find the actual submission data for this assessment type
  const submission = userSubmissions.find(sub => {
    const mappedType = assessmentTypeMapping[sub.assessment_type] || sub.assessment_type;
    return mappedType === currentTabType;
  });

  if (!submission) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p className="text-lg font-medium">No submission found for {currentTabType} assessment.</p>
        <p>This student may not have completed this assessment type yet.</p>
      </div>
    );
  }

  // Task submissions have a different structure - submission_data contains everything
  const submissionData = submission.submission_data || {};
  // For task submissions, conversation data might be embedded or separate
  const conversationData = submissionData.llm_conversation_data || submissionData.conversation || {};

  if (currentTabType === 'technical') {
    return (
      <div className="space-y-6">
        {/* AI Conversation */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💬</span>
            <h4 className="text-lg font-semibold">AI Conversation</h4>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg border font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {submissionData.conversationText || 'No conversation provided'}
          </div>
        </div>

        {/* GitHub/Deployed Link */}
        {submissionData.githubUrl && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔗</span>
              <h4 className="text-lg font-semibold">GitHub/Deployed Link</h4>
            </div>
            <a
              href={submissionData.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-muted/50 border border-border rounded-md p-3 text-primary hover:bg-muted/70 transition-colors break-all"
            >
              {submissionData.githubUrl}
            </a>
          </div>
        )}

        {/* Website Preview */}
        {submissionData.files && submissionData.files.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🌐</span>
              <h4 className="text-lg font-semibold">Website Preview</h4>
            </div>
            <WebsitePreview
              submissionData={submissionData}
              previewMode={previewMode}
              setPreviewMode={setPreviewMode}
              showCode={showCode}
              setShowCode={setShowCode}
              websitePreview={websitePreview}
              setWebsitePreview={setWebsitePreview}
              createWebsitePreview={createWebsitePreview}
            />
          </div>
        )}

        {/* Source Code Files */}
        {submissionData.files && submissionData.files.length > 0 && showCode && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📁</span>
              <h4 className="text-lg font-semibold">Source Code ({submissionData.files.length} files)</h4>
            </div>
            <div className="space-y-4">
              {submissionData.files.map((file, index) => (
                <div key={index} className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border">
                    <div className="font-mono font-semibold text-primary">{file.name}</div>
                    {(file.size || file.type || file.uploadedAt) && (
                      <div className="text-sm text-muted-foreground font-mono mt-1">
                        {file.size && `${Math.round(file.size / 1024)}KB`}
                        {file.type && ` • ${file.type}`}
                        {file.uploadedAt && ` • ${new Date(file.uploadedAt).toLocaleString()}`}
                      </div>
                    )}
                  </div>
                  {file.content ? (
                    <div className="max-h-96 overflow-y-auto bg-muted/25">
                      <pre className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="p-4 text-center border-2 border-dashed border-muted-foreground/25 bg-muted/25">
                      <p className="text-amber-600 font-semibold">⚠️ File content not available</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Only metadata was stored: {file.name} ({Math.round(file.size / 1024)}KB)
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentTabType === 'business') {
    return (
      <div className="space-y-6">
        {/* Problem Statement */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">📄</span>
            <h4 className="text-lg font-semibold">Problem Statement</h4>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 italic whitespace-pre-wrap">
            {submissionData.problemStatement || submissionData.deliverables?.problem_statement?.content || 'No problem statement provided'}
          </div>
        </div>

        {/* Proposed Solution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💡</span>
            <h4 className="text-lg font-semibold">Proposed Solution</h4>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 italic whitespace-pre-wrap">
            {submissionData.proposedSolution || submissionData.deliverables?.proposed_solution?.content || 'No solution provided'}
          </div>
        </div>

        {/* AI Discussion */}
        {conversationData.messages && conversationData.messages.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💬</span>
              <h4 className="text-lg font-semibold">AI Discussion ({conversationData.messages.length} messages)</h4>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversationData.messages.map((message, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  message.role === 'user' 
                    ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                    : 'bg-muted/50 border-border border-l-4 border-l-muted-foreground'
                }`}>
                  <div className="font-semibold mb-1">
                    {message.role === 'user' ? 'Student' : 'AI'}:
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentTabType === 'professional') {
    const loomUrl = submissionData.loomUrl || submissionData.deliverables?.video_url?.content || submissionData.deliverables?.video_url?.value;

    return (
      <div className="space-y-6">
        {/* Video Presentation */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎥</span>
            <h4 className="text-lg font-semibold">Video Presentation</h4>
          </div>
          {loomUrl ? (
            <div className="space-y-4">
              <a
                href={loomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                🎬 Watch Video on Loom
              </a>

              {/* Video Embed */}
              <div className="bg-muted/25 border border-border rounded-lg p-4">
                {loomUrl.includes('loom.com') ? (
                  <iframe
                    src={loomUrl.replace('/share/', '/embed/')}
                    frameBorder="0"
                    webkitallowfullscreen="true"
                    mozallowfullscreen="true"
                    allowFullScreen
                    className="w-full h-80 rounded-md"
                    title="Student Video Presentation"
                  />
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <p className="text-2xl mb-2">🎥 Video Preview</p>
                    <p><em>Click the link above to watch the presentation</em></p>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-3 rounded-md border text-sm">
                <strong>Video URL:</strong> <span className="break-all">{loomUrl}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No video URL provided</p>
          )}
        </div>

        {/* AI Discussion */}
        {conversationData.messages && conversationData.messages.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💬</span>
              <h4 className="text-lg font-semibold">AI Discussion ({conversationData.messages.length} messages)</h4>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversationData.messages.map((message, i) => (
                <div key={i} className={`p-3 rounded-lg border ${
                  message.role === 'user' 
                    ? 'bg-blue-50 border-blue-200 border-l-4 border-l-blue-500' 
                    : 'bg-muted/50 border-border border-l-4 border-l-muted-foreground'
                }`}>
                  <div className="font-semibold mb-1">
                    {message.role === 'user' ? 'Student' : 'AI'}:
                  </div>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentTabType === 'self') {
    return (
      <div className="space-y-6">
        {/* Self-Assessment Responses */}
        {submissionData.responses && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Student's Self-Assessment Responses</h4>
            <div className="space-y-3">
              {Object.entries(submissionData.responses).map(([qNum, response]) => (
                <div key={qNum} className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 p-3 rounded">
                  <div className="font-medium">
                    <span className="text-blue-600">Question {qNum}:</span> {response}/5
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Statistics */}
        {submissionData.completionTime && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Assessment Statistics</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Completion Time:</strong> {new Date(submissionData.completionTime).toLocaleTimeString()}</p>
              <p><strong>Start Time:</strong> {new Date(submissionData.startTime).toLocaleTimeString()}</p>
              {submissionData.questionTimes && (
                <p><strong>Questions Completed:</strong> {Object.keys(submissionData.questionTimes).length}</p>
              )}
            </div>
          </div>
        )}

        {/* Section Times */}
        {submissionData.sectionTimes && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Time Per Section</h4>
            <div className="space-y-2">
              {Object.entries(submissionData.sectionTimes).map(([section, time]) => (
                <div key={section} className="p-2 bg-muted/50 rounded text-sm">
                  <strong>Section {section}:</strong> {Math.round(time)} seconds
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center p-8 text-muted-foreground">
      <p>No submission content available for this assessment type</p>
    </div>
  );
};

export default SubmissionContent;

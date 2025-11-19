import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import DeliverablePanel from '../../pages/Learning/components/DeliverablePanel/DeliverablePanel';

function AssessmentInterface({
  taskId,
  assessmentId,
  dayNumber,
  cohort,
  onComplete,
  isCompleted = false,
  isLastTask = false
}) {
  const { token, user } = useAuth();
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeliverablePanel, setShowDeliverablePanel] = useState(false);

  // Check if user has active status
  const isActive = user?.active !== false;

  useEffect(() => {
    if (assessmentId && token) {
      loadAssessmentData();
    }
  }, [assessmentId, token]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assessment details and user's existing submission
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          const errorData = await response.json();
          setError(errorData.error || 'Assessment not available');
        } else {
          throw new Error('Failed to load assessment');
        }
        return;
      }

      const data = await response.json();
      console.log('📋 Loaded assessment data:', data);

      setAssessmentData(data.assessment);
      setCurrentSubmission(data.submission);

    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Failed to load assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSubmit = async (submissionData) => {
    if (!assessmentId) {
      toast.error("Unable to submit - assessment not found");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('📤 Submitting assessment:', assessmentId, submissionData);

      // Submit to assessment endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          submission_data: submissionData,
          status: 'submitted'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment');
      }

      const submission = await response.json();
      console.log('✅ Assessment submission successful:', submission);

      // Update local state
      setCurrentSubmission(submission.submission);
      
      // Show success message
      toast.success("Assessment submitted successfully!", {
        duration: 4000,
      });

      // Close deliverable panel
      setShowDeliverablePanel(false);

      // Trigger completion callback
      if (onComplete) {
        await onComplete();
      }

    } catch (error) {
      console.error('❌ Error submitting assessment:', error);
      toast.error(error.message || "Failed to submit assessment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusInfo = () => {
    if (isCompleted) {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        text: "Completed",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200"
      };
    }

    if (currentSubmission?.status === 'submitted') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        text: "Submitted",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-200"
      };
    }

    if (currentSubmission?.status === 'draft') {
      return {
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        text: "In Progress",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-200"
      };
    }

    return {
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      text: "Available",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    };
  };

  // Convert assessment deliverables to deliverable_schema format for DeliverablePanel
  const getDeliverableSchema = () => {
    if (!assessmentData?.deliverables) return null;

    try {
      const deliverables = typeof assessmentData.deliverables === 'string' 
        ? JSON.parse(assessmentData.deliverables)
        : assessmentData.deliverables;

      return {
        type: "structured",
        style: "assessment",
        fields: deliverables.map(deliverable => ({
          name: deliverable.id || deliverable.name,
          label: deliverable.label || deliverable.title,
          type: deliverable.type || 'textarea',
          required: deliverable.required !== false,
          placeholder: deliverable.placeholder || '',
          rows: deliverable.rows || 4,
          help: deliverable.help || deliverable.description
        }))
      };
    } catch (e) {
      console.error('Error parsing assessment deliverables:', e);
      return null;
    }
  };

  // Create a mock task object for DeliverablePanel
  const getMockTask = () => ({
    id: taskId,
    deliverable: `Complete the ${assessmentData?.assessment_name || 'assessment'}`,
    deliverable_type: 'structured',
    deliverable_schema: getDeliverableSchema()
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pursuit-purple mb-4"></div>
          <p className="text-carbon-black font-proxima">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-carbon-black mb-2 font-proxima">Assessment Unavailable</h3>
          <p className="text-carbon-black/70 mb-4 font-proxima">{error}</p>
          <button
            onClick={loadAssessmentData}
            className="px-4 py-2 bg-pursuit-purple text-white rounded-lg hover:bg-pursuit-purple/90 transition-colors font-proxima"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <p className="text-carbon-black font-proxima">Assessment not found</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="flex-1 flex flex-col bg-bg-light relative">
      {/* Assessment Content */}
      <div className="flex-1 overflow-y-auto py-8 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Assessment Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-carbon-black font-proxima">
                {assessmentData.assessment_name}
              </h1>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-proxima ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border`}>
                {statusInfo.icon}
                {statusInfo.text}
              </div>
            </div>
            
            <div className="text-sm text-carbon-black/60 font-proxima mb-4">
              {assessmentData.assessment_type?.charAt(0).toUpperCase() + assessmentData.assessment_type?.slice(1)} Assessment
              {assessmentData.assessment_period && ` • ${assessmentData.assessment_period}`}
            </div>
          </div>

          {/* Assessment Instructions */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-carbon-black mb-4 font-proxima">Instructions</h2>
            <div className="prose prose-sm max-w-none text-carbon-black font-proxima">
              {assessmentData.instructions?.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-3 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Submission Status and Action */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-carbon-black font-proxima mb-2">
                  Your Submission
                </h3>
                <p className="text-carbon-black/70 font-proxima">
                  {currentSubmission?.status === 'submitted' 
                    ? 'You have successfully submitted this assessment.'
                    : currentSubmission?.status === 'draft'
                    ? 'You have a draft submission. Continue working to complete it.'
                    : 'Click below to start working on this assessment.'
                  }
                </p>
                {currentSubmission?.submitted_at && (
                  <p className="text-sm text-carbon-black/60 font-proxima mt-1">
                    Submitted on {new Date(currentSubmission.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => setShowDeliverablePanel(true)}
                disabled={!isActive}
                className="px-6 py-2 bg-pursuit-purple text-white rounded-lg hover:bg-pursuit-purple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-proxima"
              >
                {currentSubmission?.status === 'submitted' ? 'View Submission' : 'Start Assessment'}
              </button>
            </div>
          </div>

          {!isActive && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-proxima">
                You have historical access only and cannot submit new assessments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Deliverable Panel for Assessment Submission */}
      {assessmentData && getDeliverableSchema() && (
        <DeliverablePanel
          task={getMockTask()}
          currentSubmission={currentSubmission ? {
            content: currentSubmission.submission_data
          } : null}
          isOpen={showDeliverablePanel}
          onClose={() => setShowDeliverablePanel(false)}
          onSubmit={handleAssessmentSubmit}
          isLocked={!isActive || (currentSubmission?.status === 'submitted' && !assessmentData.resubmission_allowed)}
        />
      )}
    </div>
  );
}

export default AssessmentInterface;

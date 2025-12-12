import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '../ui/sheet';
import AssessmentStructuredSubmission from './AssessmentStructuredSubmission';

function AssessmentDeliverablePanel({
  assessmentType,
  assessmentName,
  currentSubmission,
  draftFormData,
  onDraftUpdate,
  isOpen,
  onClose,
  onSubmit,
  isLocked = false
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (submissionData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(submissionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a mock task object that matches what StructuredSubmission expects
  const mockTask = {
    deliverable: `Complete your ${assessmentType} assessment by filling out the required fields below.`
  };

  // Create assessment schema based on type
  const getAssessmentSchema = () => {
    const schemas = {
      business: {
        fields: [
          {
            name: 'problemStatement',
            label: 'Problem Statement',
            type: 'textarea',
            required: true,
            rows: 4,
            placeholder: 'Enter your one-sentence problem statement here...',
            help: 'Clearly state the main problem the coffee shop is facing in one concise sentence.'
          },
          {
            name: 'proposedSolution',
            label: 'Proposed Solution',
            type: 'textarea',
            required: true,
            rows: 4,
            placeholder: 'Enter your one-sentence proposed solution here...',
            help: 'Describe your AI-powered solution to the problem in one clear sentence.'
          }
        ]
      },
      technical: {
        fields: [
          {
            name: 'conversationText',
            label: 'Full AI Conversation',
            type: 'textarea',
            required: true,
            rows: 8,
            placeholder: 'Copy and paste your full conversation with whichever AI tool you use for this. For this assessment only, you are free to use the in-tool LLM, but you are also welcome to use a different tool if you prefer.',
            help: 'Include your complete conversation history with ChatGPT, Claude, or any other AI tool you used.'
          },
          {
            name: 'files',
            label: 'Upload Relevant Files',
            type: 'file_upload',
            required: true,
            help: 'Upload all relevant files (e.g., HTML, CSS, JS, Python files). You can upload multiple files.'
          },
          {
            name: 'githubUrl',
            label: 'GitHub / Deployed Web App Link (Optional)',
            type: 'url',
            required: false,
            placeholder: 'https://github.com/username/repository or https://your-deployed-app.com',
            help: 'If you have a GitHub repository or deployed web app, provide the link here. This is optional.'
          }
        ]
      },
      professional: {
        fields: [
          {
            name: 'loomUrl',
            label: 'Loom Video URL',
            type: 'loom_url',
            required: true,
            placeholder: 'https://www.loom.com/share/...',
            help: 'Record a pitch describing your coffee shop AI solution to showcase your thinking and communication skills. Paste the share link from your Loom video.'
          }
        ]
      },
      self: {
        fields: [
          {
            name: 'selfResponse',
            label: 'Self Assessment Response',
            type: 'textarea',
            required: true,
            rows: 6,
            placeholder: 'Enter your self assessment response here...',
            help: 'Provide your self assessment response based on the instructions.'
          }
        ]
      }
    };

    return schemas[assessmentType] || schemas.self;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[400px] sm:w-[460px] flex flex-col p-0 gap-0 bg-[#F1F1F1]">
        {/* Header with title and close button (close button is in SheetContent) */}
        <div className="px-[25px] py-[20px] flex flex-col gap-[6px]">
          {/* Deliverable title with submitted badge */}
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] leading-[20px] font-proxima font-bold text-carbon-black">
              Deliverable
            </h2>
            {currentSubmission?.status === 'submitted' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-proxima font-semibold">
                <CheckCircle className="w-3 h-3" />
                Submitted
              </span>
            )}
          </div>
          
          {/* Separator */}
          <div className="w-full h-0 border border-carbon-black"></div>
          
          {/* Deliverable instructions instead of task title */}
          <div className="text-[16px] leading-[22px] font-proxima font-normal text-carbon-black">
            {mockTask.deliverable}
          </div>
        </div>

        {/* Body - Dynamic submission form */}
        <div className="flex-1 overflow-y-auto">
          <AssessmentStructuredSubmission
            task={mockTask}
            schema={getAssessmentSchema()}
            currentSubmission={currentSubmission}
            draftFormData={draftFormData}
            onDraftUpdate={onDraftUpdate}
            isSubmitting={isSubmitting}
            isLocked={isLocked}
            onSubmit={handleSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default AssessmentDeliverablePanel;
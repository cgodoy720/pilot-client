import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '../../../../components/ui/sheet';
import StructuredSubmission from './StructuredSubmission';
import SubmissionForm from './SubmissionForm';
import ImageSubmission from './ImageSubmission';
import FileSubmission from './FileSubmission';
import NoDeliverableConfigured from './NoDeliverableConfigured';

// Deliverable types that submit a URL through the shared SubmissionForm (link mode).
const LINK_TYPES = ['link', 'document', 'url', 'presentation'];

// Pure routing decision: given a task, which panel handles its deliverable.
// Returns one of: 'structured' | 'video' | 'image' | 'file' | 'text' | 'link' | 'none'.
// 'none' is the genuine fallback — only reached by an unknown/unconfigured type,
// never as a silent catch-all for known types. Exported for unit testing.
export function resolveDeliverablePanel(task) {
  if (!task) return 'none';
  // Schema-based custom forms (workshop-style) take precedence over type.
  if (task.deliverable_schema) return 'structured';
  const type = task.deliverable_type;
  if (type === 'video') return 'video';
  if (type === 'image') return 'image';
  if (type === 'file') return 'file';
  if (type === 'text') return 'text';
  if (LINK_TYPES.includes(type)) return 'link';
  return 'none';
}

function DeliverablePanel({
  task,
  currentSubmission,
  isOpen,
  onClose,
  onSubmit,
  isLocked = false,
  userId,
  taskId
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (submissionData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create video schema for Loom submissions
  const getVideoSchema = () => ({
    fields: [
      {
        name: 'loomUrl',
        label: 'Loom Video URL',
        type: 'loom_url',
        required: true,
        placeholder: 'https://www.loom.com/share/...',
        instructions: task.deliverable || 'Record a video to share your work. Make sure your video is set to "Anyone with the link can view".',
        help: 'Paste the share link from your Loom video.'
      }
    ]
  });

  const getSubmissionComponent = () => {
    const commonProps = {
      task,
      currentSubmission,
      isSubmitting,
      isLocked,
      onSubmit: handleSubmit,
      userId,
      taskId
    };

    // Explicit per-type routing. Every known deliverable type maps to a focused
    // panel; only a genuinely unknown/unconfigured type reaches the terminal
    // fallback (no silent generic selector).
    switch (resolveDeliverablePanel(task)) {
      case 'structured':
        return <StructuredSubmission {...commonProps} schema={task.deliverable_schema} />;
      // Video → dedicated Loom form (schema-based; keeps existing storage shape).
      case 'video':
        return <StructuredSubmission {...commonProps} schema={getVideoSchema()} />;
      case 'image':
        return <ImageSubmission {...commonProps} />;
      case 'file':
        return <FileSubmission {...commonProps} />;
      case 'text':
        return <SubmissionForm {...commonProps} mode="text" />;
      case 'link':
        return <SubmissionForm {...commonProps} mode="link" />;
      // Genuinely no submittable deliverable configured (e.g. 'none', null,
      // or an unrecognized type).
      default:
        return <NoDeliverableConfigured deliverableType={task.deliverable_type} />;
    }
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
            {currentSubmission && (
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
            {task.deliverable 
              ? task.deliverable.charAt(0).toUpperCase() + task.deliverable.slice(1)
              : 'Please complete the deliverable for this activity.'}
          </div>
        </div>

        {/* Body - Dynamic submission form */}
        <div className="flex-1 overflow-y-auto">
          {getSubmissionComponent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default DeliverablePanel;



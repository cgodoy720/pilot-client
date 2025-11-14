import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
} from '../../../../components/ui/sheet';
import StructuredSubmission from './StructuredSubmission';
import FlexibleSubmission from './FlexibleSubmission';

function DeliverablePanel({
  task,
  currentSubmission,
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

  const getSubmissionComponent = () => {
    const commonProps = {
      task,
      currentSubmission,
      isSubmitting,
      isLocked,
      onSubmit: handleSubmit
    };

    console.log('DeliverablePanel - task:', task);
    console.log('DeliverablePanel - deliverable_schema:', task.deliverable_schema);
    console.log('DeliverablePanel - deliverable_type:', task.deliverable_type);

    // Check for structured deliverable first (workshop schema-based custom forms)
    if (task.deliverable_schema) {
      return <StructuredSubmission {...commonProps} schema={task.deliverable_schema} />;
    }

    // For all standard deliverable types (text, link, document, video), use FlexibleSubmission
    // This gives builders the 3-option selector (Text, Google Drive Link, Video)
    return <FlexibleSubmission {...commonProps} />;
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
            {task.deliverable || 'Please complete the deliverable for this activity.'}
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



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
          {/* Deliverable title */}
          <h2 className="text-[18px] leading-[20px] font-proxima font-bold text-carbon-black">
            Deliverable
          </h2>
          
          {/* Separator */}
          <div className="w-full h-0 border border-carbon-black"></div>
          
          {/* Task title */}
          <h3 className="text-[18px] leading-[20px] font-proxima font-normal text-carbon-black flex items-center gap-2">
            {task.title || task.task_title}
            {currentSubmission && currentSubmission.task_id === task.id && (
              <CheckCircle className="w-5 h-5 text-success-green" title="Submitted" />
            )}
          </h3>
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



import React, { useState } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
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
      <SheetContent side="right" className="w-[400px] sm:w-[500px] flex flex-col p-0 gap-0">
        {/* Purple Header with Icon */}
        <div className="bg-pursuit-purple px-6 py-4 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-white" />
          <h2 className="text-white font-proxima font-semibold text-lg">
            Deliverable
          </h2>
        </div>

        {/* Task Title Section */}
        <div className="px-6 py-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <h3 className="text-carbon-black font-proxima font-semibold text-base flex-1">
              {task.title || task.task_title}
            </h3>
            {currentSubmission && currentSubmission.task_id === task.id && (
              <div className="flex items-center gap-1 text-success-green" title="Submitted">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {/* Description Section - Only show for structured submissions (workshops) */}
        {task.deliverable_schema && task.deliverable && (
          <div className="px-6 py-4 bg-bg-light border-b border-divider">
            <p className="text-sm font-proxima text-carbon-black/80 leading-relaxed">
              {task.deliverable}
            </p>
          </div>
        )}

        {/* Body - Dynamic submission form */}
        <div className="flex-1 overflow-y-auto">
          {getSubmissionComponent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default DeliverablePanel;


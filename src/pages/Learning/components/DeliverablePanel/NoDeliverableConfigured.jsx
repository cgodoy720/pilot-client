import React from 'react';
import { AlertCircle } from 'lucide-react';

// Terminal state shown only when a task has no submittable deliverable
// configured — an unrecognized deliverable_type, or none/null. This is the
// genuine fallback: known types route to a focused panel upstream, so seeing
// this means the task data needs attention, not that the UI is guessing.
function NoDeliverableConfigured({ deliverableType }) {
  return (
    <div className="flex flex-col h-full bg-[#F1F1F1]">
      <div className="flex-1 overflow-y-auto px-[25px] py-[20px]">
        <div className="flex items-start gap-2 text-carbon-black bg-white border border-[#E3E3E3] rounded-[10px] p-4">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <div className="font-proxima">
            <p className="text-[16px] leading-[22px] font-semibold">
              No deliverable to submit
            </p>
            <p className="text-[14px] leading-[20px] text-carbon-black/70 mt-1">
              This task doesn&apos;t have a submittable deliverable configured
              {deliverableType ? ` (type: ${deliverableType})` : ''}. If you
              believe you should be able to submit something here, let your
              instructor know.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoDeliverableConfigured;

import React from 'react';
import { FileText } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = FileText,
  title = 'No tasks found',
  description = 'Select a different day or week to view tasks.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-[#F5F5F5] p-4 mb-4">
        <Icon className="h-8 w-8 text-[#666]" />
      </div>
      <h3 className="font-proxima-bold text-[#1E1E1E] text-lg mb-2">
        {title}
      </h3>
      <p className="font-proxima text-[#666] max-w-md">
        {description}
      </p>
    </div>
  );
};

export default EmptyState;

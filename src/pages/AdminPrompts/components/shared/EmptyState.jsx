import React from 'react';
import { Button } from '../../../../components/ui/button';

const EmptyState = ({ 
  icon = '📝', 
  title = 'No items found', 
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="font-proxima-bold text-xl text-[#1E1E1E] mb-2">
        {title}
      </h3>
      <p className="font-proxima text-[#666] mb-6 max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#4242EA] text-white hover:bg-[#3535D1]"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;


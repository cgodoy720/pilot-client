import React from 'react';

const LoadingState = ({ message = 'Loading curriculum...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4242EA]"></div>
      <p className="mt-4 font-proxima text-[#666]">{message}</p>
    </div>
  );
};

export default LoadingState;

import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import CurriculumEditor from './CurriculumEditor';

const Content = () => {
  const { canAccessPage } = usePermissions();

  if (!canAccessPage('content')) {
    return (
      <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white border border-[#C8C8C8] rounded-lg p-8 text-center">
            <h2 className="font-proxima-bold text-xl text-[#1E1E1E] mb-2">Access Restricted</h2>
            <p className="font-proxima text-[#666]">You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return <CurriculumEditor />;
};

export default Content;

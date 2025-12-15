import React from 'react';
import { useAuth } from '../../context/AuthContext';
import CurriculumEditor from './CurriculumEditor';

const Content = () => {
  const { user } = useAuth();
  
  // Check if user has access to curriculum editor
  const canAccessCurriculumEditor = user?.role === 'staff' || user?.role === 'admin' || user?.role === 'volunteer';
  
  if (!canAccessCurriculumEditor) {
    return (
      <div className="w-full min-h-full p-6 bg-[#EFEFEF]">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white border border-[#C8C8C8] rounded-lg p-8 text-center">
            <h2 className="font-proxima-bold text-xl text-[#1E1E1E] mb-2">Access Restricted</h2>
            <p className="font-proxima text-[#666]">This page is only available to staff, admin, and volunteer users.</p>
          </div>
        </div>
      </div>
    );
  }

  return <CurriculumEditor />;
};

export default Content; 
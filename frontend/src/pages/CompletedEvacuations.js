import React from 'react';
import EvacuationList from '../components/EvacuationList';

function CompletedEvacuations() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Completed Evacuation Applications</h1>
      <EvacuationList status="approved" />
    </div>
  );
}

export default CompletedEvacuations; 
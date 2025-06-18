import React from 'react';
import EvacuationList from '../components/EvacuationList';

function PendingEvacuations() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pending Evacuation Applications</h1>
      <EvacuationList status="pending" />
    </div>
  );
}

export default PendingEvacuations; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function PendingEvacuation() {
  const { token } = useAuth();
  const [evacuations, setEvacuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchEvacuations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/evacuation/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch evacuations');
        }

        const data = await response.json();
        setEvacuations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvacuations();
  }, [token]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pending Evacuations</h1>
        
        {evacuations.length === 0 ? (
          <div className="text-center text-gray-500">No pending evacuations found.</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {evacuations.map((evac) => (
                <li key={evac.id}>
                  <div 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(evac.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {evac.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(evac.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                        <svg 
                          className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${expandedId === evac.id ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedId === evac.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span> {evac.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone Number:</span> {evac.phone_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {evac.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Evacuation Reason:</span> {evac.evacuation_reason}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Evacuation Date:</span> {new Date(evac.evacuation_date).toLocaleDateString()}
                        </p>
                        {evac.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {evac.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingEvacuation; 
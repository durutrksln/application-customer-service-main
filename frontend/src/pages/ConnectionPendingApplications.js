import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function ConnectionPendingApplications() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/applications/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Pending Connection Applications</h1>
        
        {applications.length === 0 ? (
          <div className="text-center text-gray-500">No pending connection applications found.</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={`connection-pending-${app.id}`}>
                  <div 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(app.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {app.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                        <svg 
                          className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${expandedId === app.id ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedId === app.id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Full Name:</span> {app.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">TCKN:</span> {app.tckn}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Application Date:</span> {new Date(app.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Requires License:</span> {app.requires_license ? 'Yes' : 'No'}
                        </p>
                        {/* connection_applications tablosundaki diğer alanları buraya ekleyebilirsiniz */}
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

export default ConnectionPendingApplications; 
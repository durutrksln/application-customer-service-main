import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function CompletedSubscriptions() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/applications/completed-subscriptions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Başvurular getirilemedi');
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
          <div className="text-center">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">Hata: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tamamlanan Abonelikler</h1>
        
        {applications.length === 0 ? (
          <div className="text-center text-gray-500">Tamamlanan abonelik bulunamadı.</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((app) => (
                <li key={app.application_id}>
                  <div 
                    className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleExpand(app.application_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {app.applicant_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(app.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Tamamlandı
                        </span>
                        <svg 
                          className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${expandedId === app.application_id ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {expandedId === app.application_id && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Mülk Adresi:</span> {app.property_address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Tesisat Numarası:</span> {app.installation_number}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">DASK Poliçe Numarası:</span> {app.dask_policy_number}
                        </p>
                        {app.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notlar:</span> {app.notes}
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

export default CompletedSubscriptions; 
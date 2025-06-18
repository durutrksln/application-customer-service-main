import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EvacuationList = ({ status }) => {
  const [evacuations, setEvacuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvacuations = async () => {
      try {
        // Debug: Check localStorage token
        const storedToken = localStorage.getItem('token');
        console.log('Stored token exists:', !!storedToken);
        
        // Debug: Check user object
        console.log('Current user:', user);
        
        console.log('Fetching evacuations...');
        const response = await api.get('/api/evacuation/my-applications');
        
        console.log('Evacuation response:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Tahliye başvuruları getirilemedi');
        }

        // Filter evacuations based on status
        const filteredEvacuations = response.data.data.filter(evacuation => {
          if (status === 'pending') {
            return evacuation.status === 'pending' || evacuation.status === 'in_review';
          } else if (status === 'approved') {
            return evacuation.status === 'approved' || evacuation.status === 'rejected';
          }
          return false;
        });
        
        console.log('Filtered evacuations:', filteredEvacuations);
        
        setEvacuations(filteredEvacuations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching evacuations:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers
        });
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (user) {
      fetchEvacuations();
    } else {
      console.log('No user found');
      setError('Kimlik doğrulama gerekli');
      setLoading(false);
    }
  }, [status, user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Hata: {error}</p>
        <p className="text-sm text-red-500 mt-2">Lütfen sayfayı yenilemeyi deneyin veya sorun devam ederse destek ekibiyle iletişime geçin.</p>
      </div>
    );
  }

  if (evacuations.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">{status} durumunda tahliye başvurusu bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {evacuations.map((evacuation) => (
          <li key={evacuation.id}>
            <Link
              to={`/evacuation/${evacuation.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-primary-600 truncate">
                      {evacuation.user_type === 'mulkSahibi' ? 'Mülk Sahibi' : 'Kiracı'}
                    </p>
                    <div className={`ml-2 flex-shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(evacuation.status)}`}>
                      {evacuation.status}
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {evacuation.tesisat_numarasi}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {evacuation.dask_police_numarasi}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Oluşturulma Tarihi: {new Date(evacuation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EvacuationList; 
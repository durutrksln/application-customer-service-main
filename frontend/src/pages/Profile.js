import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApplications(data.applications || []);
        } else {
          setError('Başvurular getirilemedi');
        }
      } catch (err) {
        setError('Başvurular getirilirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ApplicationCard = ({ application }) => (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {application.customer_name || 'Belirtilmemiş'}
          </h3>
          <p className="text-sm text-gray-500">
            Gönderilme Tarihi: {new Date(application.submitted_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
            application.status
          )}`}
        >
          {application.status}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">
          {application.description || 'Açıklama belirtilmemiş'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profil Bilgileri</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h3>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ad Soyad</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.full_name || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">E-posta</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.email || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Rol</p>
                  <p className="mt-1 text-sm text-gray-900">{user?.role || 'Belirtilmemiş'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 
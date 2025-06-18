import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubscriptionList = ({ status }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Kimlik doğrulama token\'ı bulunamadı');
        }

        console.log('Fetching subscriptions with status:', status);
        console.log('Current user:', user);
        
        const response = await fetch(`http://localhost:5000/api/applications?status=${status}&application_type=new_installation`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response data:', data);
        
        if (data.applications) {
          setSubscriptions(data.applications);
        } else {
          setSubscriptions([]);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [status, user]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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

  if (subscriptions.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">{status} durumunda abonelik bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div key={subscription.application_id} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{subscription.applicant_name}</h3>
              <p className="text-gray-600">{subscription.property_address}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Gönderilme Tarihi: {new Date(subscription.submitted_at).toLocaleDateString()}</p>
              {subscription.updated_at && (
                <p>Son Güncelleme: {new Date(subscription.updated_at).toLocaleDateString()}</p>
              )}
            </div>
            <div className="text-right">
              <Link
                to={`/applications/${subscription.application_id}`}
                className="text-primary-600 hover:text-primary-800"
              >
                Detayları Görüntüle →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionList; 
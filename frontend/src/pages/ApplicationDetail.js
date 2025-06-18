import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        // Check if applicationId is valid
        const invalidIds = ['completed', 'pending', 'completed-subscriptions', 'pending-subscriptions', 'completed-applications'];
        if (!applicationId || invalidIds.includes(applicationId)) {
          setError('Invalid application ID');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/applications/${applicationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Application not found');
          } else {
            throw new Error('Error fetching application');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [applicationId, token]);

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
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-red-600 hover:text-red-800"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Application not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-gray-600 hover:text-gray-800"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Application Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Applicant Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-gray-900">{application.applicant_name || application.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Application Date</p>
                <p className="text-gray-900">{new Date(application.created_at || application.submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Property Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-900">{application.property_address}</p>
              </div>
              {application.installation_number && (
                <div>
                  <p className="text-sm text-gray-600">Installation Number</p>
                  <p className="text-gray-900">{application.installation_number}</p>
                </div>
              )}
            </div>
          </div>

          {application.notes && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-900">{application.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetail; 
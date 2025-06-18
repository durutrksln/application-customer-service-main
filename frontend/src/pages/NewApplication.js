import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NewApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    installationNumber: '',
    installationType: 'tekil_kod', // Default to tekil kod
    old_bill_file: null,
    tckn: '',
    propertyType: 'owner', // Default to owner
    propertyOwnerName: '',
    propertyOwnerId: '',
    isProxy: false,
    proxy_document: null,
    daskPolicyNumber: '',
    dask_policy_file: null,
    ownership_document: null,
    propertyAddress: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // TCKN validation (11 digits)
    if (!/^\d{11}$/.test(formData.tckn)) {
      newErrors.tckn = 'TCKN 11 haneli olmalıdır';
    }

    // Installation number validation
    if (formData.installationType !== 'old_bill' && !formData.installationNumber) {
      newErrors.installationNumber = 'Tesisat numarası gereklidir';
    }
    if (formData.installationType === 'old_bill' && !formData.old_bill_file) {
      newErrors.old_bill_file = 'Eski fatura dosyası gereklidir';
    }

    // Property owner validation
    if (formData.propertyType !== 'owner') {
      if (!formData.propertyOwnerName) {
        newErrors.propertyOwnerName = 'Mülk sahibi adı gereklidir';
      }
      if (!formData.propertyOwnerId) {
        newErrors.propertyOwnerId = 'Mülk sahibi kimlik numarası gereklidir';
      }
    }

    // DASK policy validation
    if (!formData.daskPolicyNumber) {
      newErrors.daskPolicyNumber = 'DASK poliçe numarası gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if token exists and is valid
      const token = localStorage.getItem('token');
      if (!token) {
        setErrors({ submit: 'Lütfen tekrar giriş yapın' });
        navigate('/login');
        return;
      }

      // Validate token by making a request to /api/auth/me
      const validateResponse = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!validateResponse.ok) {
        setErrors({ submit: 'Oturum süresi doldu. Lütfen tekrar giriş yapın' });
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      const formDataToSend = new FormData();
      
      // Transform form data to match backend expectations
      const transformedData = {
        application_type: 'new_installation',
        applicant_name: user.full_name,
        property_address: formData.propertyAddress,
        installation_number: formData.installationNumber,
        dask_policy_number: formData.daskPolicyNumber,
        is_tenant: formData.propertyType === 'tenant',
        landlord_full_name: formData.propertyType === 'tenant' ? formData.propertyOwnerName : null,
        landlord_id_type: formData.propertyType === 'tenant' ? 'tckn' : null,
        landlord_id_number: formData.propertyType === 'tenant' ? formData.propertyOwnerId : null,
        landlord_company_name: null,
        landlord_representative_name: null,
        power_of_attorney_provided: formData.isProxy,
        signature_circular_provided: false,
        termination_iban: null,
        ownership_document_type: 'dask',
        notes: null
      };

      // Debug log
      console.log('Form Data:', formData);
      console.log('Transformed Data:', transformedData);

      // Append transformed data to FormData
      Object.keys(transformedData).forEach(key => {
        if (transformedData[key] !== null) {
          formDataToSend.append(key, transformedData[key]);
        }
      });

      // Append files if they exist
      if (formData.old_bill_file) {
        console.log('Appending old_bill_file:', formData.old_bill_file);
        formDataToSend.append('old_bill_file', formData.old_bill_file);
      }
      if (formData.proxy_document) {
        console.log('Appending proxy_document:', formData.proxy_document);
        formDataToSend.append('proxy_document', formData.proxy_document);
      }
      if (formData.dask_policy_file) {
        console.log('Appending dask_policy_file:', formData.dask_policy_file);
        formDataToSend.append('dask_policy_file', formData.dask_policy_file);
      }
      if (formData.ownership_document) {
        console.log('Appending ownership_document:', formData.ownership_document);
        formDataToSend.append('ownership_document', formData.ownership_document);
      }

      // Debug log FormData contents
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/profile');
      } else {
        const data = await response.json();
        console.error('Server error details:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        setErrors({ 
          submit: data.message || 'Başvuru gönderilemedi',
          details: data.details ? JSON.stringify(data.details, null, 2) : null
        });
      }
    } catch (error) {
      console.error('Error submitting application:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setErrors({ submit: 'Başvuru gönderilirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Başvuru</h2>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {errors.submit}
              {errors.details && (
                <pre className="mt-2 text-xs overflow-auto">
                  {errors.details}
                </pre>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Mülk Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mülk Adresi
                </label>
                <textarea
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows="3"
                />
              </div>
            </div>

            {/* Installation Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Tesisat Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tesisat Tipi
                </label>
                <select
                  name="installationType"
                  value={formData.installationType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="tekil_kod">Tekil Kod</option>
                  <option value="meter_barcode">Sayaç Barkod Seri Numarası</option>
                  <option value="old_bill">Upload Old Bill</option>
                </select>
              </div>

              {formData.installationType !== 'old_bill' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.installationType === 'tekil_kod' ? 'Tekil Kod' : 'Sayaç Barkod Seri Numarası'}
                  </label>
                  <input
                    type="text"
                    name="installationNumber"
                    value={formData.installationNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  {errors.installationNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.installationNumber}</p>
                  )}
                </div>
              )}

              {formData.installationType === 'old_bill' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Old Bill
                  </label>
                  <input
                    type="file"
                    name="old_bill_file"
                    onChange={handleChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="mt-1 block w-full"
                  />
                  {errors.old_bill_file && (
                    <p className="mt-1 text-sm text-red-600">{errors.old_bill_file}</p>
                  )}
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  TCKN
                </label>
                <input
                  type="text"
                  name="tckn"
                  value={formData.tckn}
                  onChange={handleChange}
                  maxLength="11"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.tckn && (
                  <p className="mt-1 text-sm text-red-600">{errors.tckn}</p>
                )}
              </div>
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Mülk Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mülk Tipi
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="owner">Mülk Sahibi</option>
                  <option value="tenant">Kiracı</option>
                </select>
              </div>

              {formData.propertyType === 'tenant' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mülk Sahibi Adı
                    </label>
                    <input
                      type="text"
                      name="propertyOwnerName"
                      value={formData.propertyOwnerName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.propertyOwnerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.propertyOwnerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mülk Sahibi Kimlik Numarası (TCKN/VKN)
                    </label>
                    <input
                      type="text"
                      name="propertyOwnerId"
                      value={formData.propertyOwnerId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    {errors.propertyOwnerId && (
                      <p className="mt-1 text-sm text-red-600">{errors.propertyOwnerId}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Proxy Information */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isProxy"
                  checked={formData.isProxy}
                  onChange={(e) => setFormData(prev => ({ ...prev, isProxy: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Ben bir başkasının temsilcisiyim
                </label>
              </div>

              {formData.isProxy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Proxy Belgesi
                  </label>
                  <input
                    type="file"
                    name="proxy_document"
                    onChange={handleChange}
                    accept=".pdf"
                    className="mt-1 block w-full"
                  />
                </div>
              )}
            </div>

            {/* DASK Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">DASK Bilgileri</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DASK Poliçe Numarası
                </label>
                <input
                  type="text"
                  name="daskPolicyNumber"
                  value={formData.daskPolicyNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.daskPolicyNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.daskPolicyNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  DASK Poliçe Belgesi
                </label>
                <input
                  type="file"
                  name="dask_policy_file"
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 block w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mülk Belgesi
                </label>
                <input
                  type="file"
                  name="ownership_document"
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 block w-full"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Başvuru Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewApplication; 
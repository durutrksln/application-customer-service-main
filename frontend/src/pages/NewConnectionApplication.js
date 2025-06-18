import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NewConnectionApplication() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    tckn: '',
    deedFile: null,
    electricalProjectFile: null,
    buildingPermitFile: null,
    requiresLicense: 'no',
    // Additional files that appear when requiresLicense is 'yes'
    permitDocumentFile: null,
    law6292File: null,
    law3194File: null,
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

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'İsim-Soyisim alanı zorunludur';
    }

    // TCKN validation (11 digits)
    if (!/^\d{11}$/.test(formData.tckn)) {
      newErrors.tckn = 'TCKN 11 haneli olmalıdır';
    }

    // Required files validation
    if (!formData.deedFile) {
      newErrors.deedFile = 'Tapu kaydı zorunludur';
    }
    if (!formData.electricalProjectFile) {
      newErrors.electricalProjectFile = 'Onaylı elektrik projesi zorunludur';
    }
    if (!formData.buildingPermitFile) {
      newErrors.buildingPermitFile = 'Yapı kullanma izni zorunludur';
    }

    // Additional files validation when requiresLicense is 'yes'
    if (formData.requiresLicense === 'yes') {
      if (!formData.permitDocumentFile) {
        newErrors.permitDocumentFile = 'İzin belgesi zorunludur';
      }
      if (!formData.law6292File) {
        newErrors.law6292File = '6292 sayılı kanun izin belgesi zorunludur';
      }
      if (!formData.law3194File) {
        newErrors.law3194File = '3194 sayılı İmar Kanunu izin belgesi zorunludur';
      }
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
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications/connection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        navigate('/applications/pending');
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || 'Başvuru gönderilemedi' });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setErrors({ submit: 'Başvuru gönderilirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Yeni Bağlantı Başvurusu</h2>
          
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  İsim-Soyisim
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  TC Kimlik Numarası
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

            {/* Required Documents */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Gerekli Belgeler</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tapu Kaydı (PDF)
                </label>
                <input
                  type="file"
                  name="deedFile"
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 block w-full"
                />
                {errors.deedFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.deedFile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Onaylı Elektrik Projesi (PDF)
                </label>
                <input
                  type="file"
                  name="electricalProjectFile"
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 block w-full"
                />
                {errors.electricalProjectFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.electricalProjectFile}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Yapı Kullanma İzni (PDF)
                </label>
                <input
                  type="file"
                  name="buildingPermitFile"
                  onChange={handleChange}
                  accept=".pdf"
                  className="mt-1 block w-full"
                />
                {errors.buildingPermitFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.buildingPermitFile}</p>
                )}
              </div>
            </div>

            {/* License Requirement */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Ruhsat Durumu</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ruhsat gerektiriyor mu?
                </label>
                <select
                  name="requiresLicense"
                  value={formData.requiresLicense}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="no">Hayır</option>
                  <option value="yes">Evet</option>
                </select>
              </div>

              {formData.requiresLicense === 'yes' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mevzuat Kapsamında İlgili Mercilerden Alınacak İzin Belgesi (PDF)
                    </label>
                    <input
                      type="file"
                      name="permitDocumentFile"
                      onChange={handleChange}
                      accept=".pdf"
                      className="mt-1 block w-full"
                    />
                    {errors.permitDocumentFile && (
                      <p className="mt-1 text-sm text-red-600">{errors.permitDocumentFile}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      6292 Sayılı Kanun Kapsamında Alınan İzin Belgesi (PDF)
                    </label>
                    <input
                      type="file"
                      name="law6292File"
                      onChange={handleChange}
                      accept=".pdf"
                      className="mt-1 block w-full"
                    />
                    {errors.law6292File && (
                      <p className="mt-1 text-sm text-red-600">{errors.law6292File}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      3194 Sayılı İmar Kanunu Kapsamında Yapı Ruhsatı (PDF)
                    </label>
                    <input
                      type="file"
                      name="law3194File"
                      onChange={handleChange}
                      accept=".pdf"
                      className="mt-1 block w-full"
                    />
                    {errors.law3194File && (
                      <p className="mt-1 text-sm text-red-600">{errors.law3194File}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewConnectionApplication; 
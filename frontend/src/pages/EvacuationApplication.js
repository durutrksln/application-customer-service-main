import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function EvacuationApplication() {
  const { id } = useParams(); // Get the application ID from the URL
  const [application, setApplication] = useState(null); // State to hold fetched application data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    tckn: '',
    address: '',
    phoneNumber: '',
    email: '',
    evacuationReason: '',
    evacuationDate: '',
    nufusCuzdani: null, // for pdf, png
    mulkiyetBelgesi: null, // for pdf, png
    tesisatNumarasi: '', // for string
    daskPoliceNumarasi: '', // for string
    mulkSahibiAdSoyad: '', // for string (for tenants - individual)
    vergiNumarasi: '', // for string (for tenants - company)
    tuzelKisiAd: '', // for string (for tenants - company)
    tuzelKisiSoyad: '', // for string (for tenants - company)
    unvan: '', // for string (for tenants - company)
    zorunluDepremSigortasi: '', // for string
    iban: '', // for string
  });

  const [userType, setUserType] = useState(''); // 'kiraci' or 'mulkSahibi'
  const [landlordType, setLandlordType] = useState(''); // 'bireysel' or 'tuzelKisi' (only if userType is 'kiraci')

  useEffect(() => {
    // Fetch application data if ID is present in the URL
    if (id) {
      const fetchApplication = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/evacuation/${id}`);
          console.log('Fetched application details:', response.data);
          if (response.data.success) {
            setApplication(response.data.data); // Assuming response.data.data contains the application object
          } else {
            setError(response.data.message || 'Failed to fetch application details');
          }
        } catch (err) {
          console.error('Error fetching application details:', err);
          setError(err.response?.data?.message || err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchApplication();
    } else {
      // If no ID, we are creating a new application
      setLoading(false); // No loading needed for a new form
    }
  }, [id]); // Rerun effect when ID changes

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);
    // Clear tenant-specific fields when switching user type
    if (newUserType !== 'kiraci') {
      setLandlordType('');
      setFormData(prev => ({
        ...prev,
        mulkSahibiAdSoyad: '',
        vergiNumarasi: '',
        tuzelKisiAd: '',
        tuzelKisiSoyad: '',
        unvan: '',
      }));
    }
  };

  const handleLandlordTypeChange = (e) => {
    const newLandlordType = e.target.value;
    setLandlordType(newLandlordType);
    // Clear irrelevant landlord fields when switching landlord type
    if (newLandlordType === 'bireysel') {
      setFormData(prev => ({
        ...prev,
        vergiNumarasi: '',
        tuzelKisiAd: '',
        tuzelKisiSoyad: '',
        unvan: '',
      }));
    } else if (newLandlordType === 'tuzelKisi') {
      setFormData(prev => ({ ...prev, mulkSahibiAdSoyad: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    
    try {
      const formDataToSend = new FormData();
      
      // Append user information
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('tckn', formData.tckn);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('evacuationReason', formData.evacuationReason);
      formDataToSend.append('evacuationDate', formData.evacuationDate);
      
      // Append all form fields
      formDataToSend.append('nufusCuzdani', formData.nufusCuzdani);
      formDataToSend.append('mulkiyetBelgesi', formData.mulkiyetBelgesi);
      formDataToSend.append('tesisatNumarasi', formData.tesisatNumarasi);
      formDataToSend.append('daskPoliceNumarasi', formData.daskPoliceNumarasi);
      formDataToSend.append('zorunluDepremSigortasi', formData.zorunluDepremSigortasi);
      formDataToSend.append('iban', formData.iban);
      formDataToSend.append('userType', userType);
      formDataToSend.append('landlordType', landlordType);

      // Append tenant-specific fields
      if (userType === 'kiraci') {
        if (landlordType === 'bireysel') {
          formDataToSend.append('mulkSahibiAdSoyad', formData.mulkSahibiAdSoyad);
        } else if (landlordType === 'tuzelKisi') {
          formDataToSend.append('vergiNumarasi', formData.vergiNumarasi);
          formDataToSend.append('tuzelKisiAd', formData.tuzelKisiAd);
          formDataToSend.append('tuzelKisiSoyad', formData.tuzelKisiSoyad);
          formDataToSend.append('unvan', formData.unvan);
        }
      }

      console.log('Form data being sent:');
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');

      const API_URL = 'http://localhost:5000/api/evacuation';
      console.log('Sending request to:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);

      alert('Başvurunuz başarıyla alındı!');
      // Reset form
      setFormData({
        fullName: '',
        tckn: '',
        address: '',
        phoneNumber: '',
        email: '',
        evacuationReason: '',
        evacuationDate: '',
        nufusCuzdani: null,
        mulkiyetBelgesi: null,
        tesisatNumarasi: '',
        daskPoliceNumarasi: '',
        mulkSahibiAdSoyad: '',
        vergiNumarasi: '',
        tuzelKisiAd: '',
        tuzelKisiSoyad: '',
        unvan: '',
        zorunluDepremSigortasi: '',
        iban: '',
      });
      setUserType('');
      setLandlordType('');

    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Başvuru gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Tahliye Başvurusu Detayları' : 'Yeni Tahliye Başvurusu'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">

        {/* Conditional rendering: Show details if application data is loaded, otherwise show form or loading/error */}
        {loading ? (
          <div className="flex justify-center items-center p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">Error: {error}</div>
        ) : application ? (
          /* Display Application Details Here */
          <div className="space-y-4 text-gray-700">
            <p><strong>Başvuru Sahibi Tipi:</strong> {application.user_type === 'mulkSahibi' ? 'Mülk Sahibi' : 'Kiracı'}</p>
            {/* Add other fields you want to display */}
            <p><strong>Tesisat Numarası:</strong> {application.tesisat_numarasi}</p>
            <p><strong>DASK Poliçe Numarası:</strong> {application.dask_police_numarasi}</p>
            <p><strong>IBAN:</strong> {application.iban}</p>
            {/* ... add more fields based on your application schema */}
            <p><strong>Durum:</strong> {application.status}</p>
            <p><strong>Oluşturulma Tarihi:</strong> {new Date(application.created_at).toLocaleDateString()}</p>
            {/* You might want to add links or buttons to view uploaded documents if applicable */}
          </div>
        ) : (
          /* Show the form for new applications if no ID is present and not loading/error */
          /* You can keep the original form rendering logic here */
          <div className="space-y-6">
            {/* User Information Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Kişisel Bilgiler</h3>
              
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              
              <div>
                <label htmlFor="tckn" className="block text-sm font-medium text-gray-700">TCKN</label>
                <input type="text" name="tckn" id="tckn" value={formData.tckn} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
                <textarea name="address" id="address" value={formData.address} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3" />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              
              <div>
                <label htmlFor="evacuationReason" className="block text-sm font-medium text-gray-700">Tahliye Nedeni</label>
                <textarea name="evacuationReason" id="evacuationReason" value={formData.evacuationReason} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="3" />
              </div>
              
              <div>
                <label htmlFor="evacuationDate" className="block text-sm font-medium text-gray-700">Tahliye Tarihi</label>
                <input type="date" name="evacuationDate" id="evacuationDate" value={formData.evacuationDate} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>

        {/* User Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Başvuru Sahibi Tipi:</label>
          <div className="mt-1 flex space-x-4">
            <label className="inline-flex items-center">
              <input type="radio" name="userType" value="mulkSahibi" checked={userType === 'mulkSahibi'} onChange={handleUserTypeChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
              <span className="ml-2 text-sm text-gray-900">Mülk Sahibi</span>
            </label>
            <label className="inline-flex items-center">
              <input type="radio" name="userType" value="kiraci" checked={userType === 'kiraci'} onChange={handleUserTypeChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
              <span className="ml-2 text-sm text-gray-900">Kiracı</span>
            </label>
          </div>
        </div>

        {/* Common Fields */}
        <div>
          <label htmlFor="nufusCuzdani" className="block text-sm font-medium text-gray-700">Nüfus cüzdanı (PDF, PNG)</label>
          <input type="file" name="nufusCuzdani" id="nufusCuzdani" accept=".pdf,.png,.jpg,.jpeg" onChange={handleInputChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>

        <div>
          <label htmlFor="mulkiyetBelgesi" className="block text-sm font-medium text-gray-700">Mülkiyet belirten bir belge (Tapu, kira sözleşmesi, Lojman tahsis belgesi vb.) (PDF, PNG)</label>
          <input type="file" name="mulkiyetBelgesi" id="mulkiyetBelgesi" accept=".pdf,.png,.jpg,.jpeg" onChange={handleInputChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
        </div>

        <div>
          <label htmlFor="tesisatNumarasi" className="block text-sm font-medium text-gray-700">Varsa kullanım yerinin abone ya da tesisat numarası (Eski bir fatura)</label>
          <input type="text" name="tesisatNumarasi" id="tesisatNumarasi" value={formData.tesisatNumarasi} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="daskPoliceNumarasi" className="block text-sm font-medium text-gray-700">DASK Poliçesi numarası</label>
          <input type="text" name="daskPoliceNumarasi" id="daskPoliceNumarasi" value={formData.daskPoliceNumarasi} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="zorunluDepremSigortasi" className="block text-sm font-medium text-gray-700">Zorunlu deprem sigortası (DASK) poliçesi</label>
          <input type="text" name="zorunluDepremSigortasi" id="zorunluDepremSigortasi" value={formData.zorunluDepremSigortasi} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        <div>
          <label htmlFor="iban" className="block text-sm font-medium text-gray-700">Şahsi banka hesabına ait IBAN</label>
          <input type="text" name="iban" id="iban" value={formData.iban} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        {/* Tenant Specific Fields (Conditional) */}
        {userType === 'kiraci' && (
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Mülk Sahibi Bilgileri (Kiracılar İçin)</h3>

            {/* Landlord Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mülk Sahibi Tipi:</label>
              <div className="mt-1 flex space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" name="landlordType" value="bireysel" checked={landlordType === 'bireysel'} onChange={handleLandlordTypeChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                  <span className="ml-2 text-sm text-gray-900">Bireysel</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="landlordType" value="tuzelKisi" checked={landlordType === 'tuzelKisi'} onChange={handleLandlordTypeChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300" />
                  <span className="ml-2 text-sm text-gray-900">Tüzel Kişi (Şirket vb.)</span>
                </label>
              </div>
            </div>

            {/* Landlord Details (Conditional based on landlordType) */}
            {landlordType === 'bireysel' && (
              <div>
                <label htmlFor="mulkSahibiAdSoyad" className="block text-sm font-medium text-gray-700">Mülk sahibinin adı ve soyadı</label>
                <input type="text" name="mulkSahibiAdSoyad" id="mulkSahibiAdSoyad" value={formData.mulkSahibiAdSoyad} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            )}

            {landlordType === 'tuzelKisi' && (
              <div className="space-y-4">
                 <p className="text-sm text-gray-600">Lütfen mülk sahibi tüzel kişiye ait aşağıdaki bilgileri girin:</p>
                 <div>
                   <label htmlFor="vergiNumarasi" className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                   <input type="text" name="vergiNumarasi" id="vergiNumarasi" value={formData.vergiNumarasi} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                 </div>
                 <div>
                   <label htmlFor="tuzelKisiAd" className="block text-sm font-medium text-gray-700">Ad</label>
                   <input type="text" name="tuzelKisiAd" id="tuzelKisiAd" value={formData.tuzelKisiAd} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                 </div>
                 <div>
                   <label htmlFor="tuzelKisiSoyad" className="block text-sm font-medium text-gray-700">Soyad</label>
                   <input type="text" name="tuzelKisiSoyad" id="tuzelKisiSoyad" value={formData.tuzelKisiSoyad} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                 </div>
                  <div>
                   <label htmlFor="unvan" className="block text-sm font-medium text-gray-700">Unvan</label>
                   <input type="text" name="unvan" id="unvan" value={formData.unvan} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                 </div>
              </div>
            )}

          </div>
        )}

        <div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Başvuruyu Gönder</button>
        </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default EvacuationApplication; 
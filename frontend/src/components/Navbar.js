import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    applications: false,
    customers: false,
    settings: false
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDropdown = (dropdown) => {
    setIsDropdownOpen(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                Müşteri Hizmetleri
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('applications')}
                  className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Abonelikler
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen.applications && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/applications/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yeni Abonelik</Link>
                      <Link to="/applications/pending-subscriptions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bekleyen Abonelikler</Link>
                      <Link to="/applications/completed-subscriptions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tamamlanan Abonelikler</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown('customers')}
                  className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tahliye
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen.customers && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/evacuation/new" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yeni Tahliye</Link>
                      <Link to="/evacuation/pending" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bekleyen Tahliyeler</Link>
                      <Link to="/evacuation/completed" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tamamlanan Tahliyeler</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown('settings')}
                  className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Başvurular
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen.settings && (
                  <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link to="/applications/new-connection" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Yeni Bağlantı</Link>
                      <Link to="/applications/pending" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bekleyen Başvurular</Link>
                      <Link to="/applications/completed-applications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tamamlanan Başvurular</Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-primary-600 cursor-pointer"
                >
                  Hoş Geldiniz, {user.full_name || user.name || user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
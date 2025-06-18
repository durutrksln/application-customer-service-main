import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/applications/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentCustomers(data.recentCustomers);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        
        <h1 className="mt-6 text-5xl font-extrabold text-gray-900 leading-tight">
          Geleceği Güçlendiriyoruz
        </h1>
        <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
          Müşteri Hizmetleri Paneline Hoş Geldiniz! En son elektrik sistemleri teknolojisiyle iş akışınızı izleyin, yönetin ve güçlendirin. Bağlı kalın, verimli olun ve akışı sürdürün.
        </p>
      </div>
    </div>
  );
}

export default Dashboard; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import Profile from './pages/Profile';
import NewApplication from './pages/NewApplication';
import NewConnectionApplication from './pages/NewConnectionApplication';
import PendingSubscriptions from './pages/PendingSubscriptions';
import CompletedSubscriptions from './pages/CompletedSubscriptions';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ApplicationDetail from './pages/ApplicationDetail';
import NavWrapper from './components/NavWrapper';
import EvacuationApplication from './pages/EvacuationApplication';
import PendingEvacuation from './pages/PendingEvacuation';
import CompletedEvacuation from './pages/CompletedEvacuation';
import ConnectionPendingApplications from './pages/ConnectionPendingApplications';
import PendingApplications from './pages/PendingApplications';
import CompletedApplications from './pages/CompletedApplications';

// Create router with future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <AuthProvider>
      <Router future={router.future}>
        <div className="min-h-screen bg-gray-100">
          <NavWrapper />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <CustomerList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <ProtectedRoute>
                    <CustomerDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/new"
                element={
                  <ProtectedRoute>
                    <NewApplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/new-connection"
                element={
                  <ProtectedRoute>
                    <NewConnectionApplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/pending"
                element={
                  <ProtectedRoute>
                    <PendingApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/pending-subscriptions"
                element={
                  <ProtectedRoute>
                    <PendingSubscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/completed-subscriptions"
                element={
                  <ProtectedRoute>
                    <CompletedSubscriptions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/completed-applications"
                element={
                  <ProtectedRoute>
                    <CompletedApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications/:applicationId"
                element={
                  <ProtectedRoute>
                    <ApplicationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evacuation/new"
                element={
                  <ProtectedRoute>
                    <EvacuationApplication />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evacuation/pending"
                element={
                  <ProtectedRoute>
                    <PendingEvacuation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evacuation/completed"
                element={
                  <ProtectedRoute>
                    <CompletedEvacuation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/evacuation/:id"
                element={
                  <ProtectedRoute>
                    <EvacuationApplication />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
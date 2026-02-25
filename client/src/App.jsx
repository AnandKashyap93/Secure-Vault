import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import ThemeToggle from './components/ThemeToggle';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import ApproverDashboard from './pages/approver/ApproverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// Dashboard Router (Redirects to role-specific dashboard)
const DashboardSelector = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <LandingPage />;

  if (user.role === 'CLIENT') return <Navigate to="/client" />;
  if (user.role === 'APPROVER') return <Navigate to="/approver" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<DashboardSelector />} />


            <Route path="/client" element={
              <ProtectedRoute roles={['CLIENT']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />

            <Route path="/approver" element={
              <ProtectedRoute roles={['APPROVER', 'ADMIN']}>
                <ApproverDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

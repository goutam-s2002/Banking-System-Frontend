import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Navbar from './components/Navbar';
import Header from './components/Header';

// Auth Components
import Login from './auth/Login';
import Register from './auth/Register';

// Customer Components
import Dashboard from './user/Dashboard';
import Deposit from './user/Deposit';
import Withdraw from './user/Withdraw';
import Transfer from './user/Transfer';
import TransactionHistory from './user/TransactionHistory';
import Statement from './user/Statement';

// Admin Components
import AdminDashboard from './admin/AdminDashboard';
import UserList from './admin/UserList';
import UserDetail from './admin/UserDetail';
import AuditLogs from './admin/AuditLogs';
import CreateAccount from './admin/CreateAccount';
import AccountReport from './admin/AccountReport';

// Helper redirect component for root path /
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return user.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column flex-md-row min-vh-100 bg-light">
          <Navbar />
          <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
            <Header />
            <div className="container flex-grow-1 py-4">
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Customer Routes (Accessible to USER & ADMIN) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/deposit"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <Deposit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/withdraw"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <Withdraw />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transfer"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <Transfer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <TransactionHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statement"
                element={
                  <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
                    <Statement />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin-Only Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-account"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <CreateAccount />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/accounts"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AccountReport />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />

              {/* Fallback redirects */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </div>
            <footer className="bg-dark text-white-50 text-center py-3 mt-auto d-print-none">
              <div className="container">
                <small>&copy; {new Date().getFullYear()} BankingSystem. All Rights Reserved.</small>
              </div>
            </footer>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

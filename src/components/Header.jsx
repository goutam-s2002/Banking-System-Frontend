import React from 'react';
import { useAuth } from '../auth/AuthContext';

const Header = () => {
  const { user } = useAuth();

  if (!user) return null; // Only show when user is logged in

  return (
    <header className="navbar navbar-expand navbar-light bg-white border-bottom px-4 py-2 shadow-sm d-none d-md-flex d-print-none" style={{ height: '56px' }}>
      <div className="container-fluid justify-content-end">
        <div className="d-flex align-items-center">
          <span className="badge bg-secondary me-2 small text-uppercase" style={{ fontSize: '0.75rem' }}>
            {user.role}
          </span>
          <span className="text-dark fw-bold small">
            👤 Welcome, <strong>{user.name || user.email}</strong>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleNavClick = () => {
    setCollapsed(true); // Close mobile drawer when a link is clicked
  };

  if (!user) return null; // Hide navigation completely if user is not logged in (e.g. login/register pages)

  return (
    <>
      {/* Mobile Header (Visible only on screens below 768px) */}
      <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center d-md-none shadow-sm d-print-none" style={{ height: '56px' }}>
        <Link className="text-decoration-none text-white d-flex align-items-center" to="/" onClick={handleNavClick}>
          <span className="fs-4 me-2">🏦</span>
          <strong className="fs-5">BankingSystem</strong>
        </Link>
        <button 
          className="btn btn-dark border-secondary btn-sm fs-5 py-0 px-2"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '☰' : '✕'}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`bg-dark text-white d-flex flex-column sidebar ${collapsed ? 'd-none' : ''} d-md-flex d-print-none`} style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        {/* Brand Header */}
        <div className="p-4 border-bottom border-secondary text-center">
          <Link className="text-decoration-none text-white d-flex align-items-center justify-content-center" to="/" onClick={handleNavClick}>
            <span className="fs-3 me-2">🏦</span>
            <h4 className="mb-0 fw-bold">BankingSystem</h4>
          </Link>
        </div>


        {/* Menu Navigation Links */}
        <div className="flex-grow-1 py-3 overflow-auto">
          <ul className="nav nav-pills flex-column px-3 gap-1">
            {/* Customer Links */}
            {user.role === 'USER' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/dashboard')}`} to="/dashboard" onClick={handleNavClick}>
                    📊 Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/deposit')}`} to="/deposit" onClick={handleNavClick}>
                    📥 Deposit Money
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/withdraw')}`} to="/withdraw" onClick={handleNavClick}>
                    📤 Withdraw Money
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/transfer')}`} to="/transfer" onClick={handleNavClick}>
                    💸 Transfer Funds
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/history')}`} to="/history" onClick={handleNavClick}>
                    📜 History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/statement')}`} to="/statement" onClick={handleNavClick}>
                    📅 Statement Report
                  </Link>
                </li>
              </>
            )}

            {/* Admin Links */}
            {user.role === 'ADMIN' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/admin/dashboard')}`} to="/admin/dashboard" onClick={handleNavClick}>
                    📈 Admin Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/admin/users')}`} to="/admin/users" onClick={handleNavClick}>
                    👥 Manage Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/admin/accounts')}`} to="/admin/accounts" onClick={handleNavClick}>
                    📊 Accounts Report
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/admin/create-account')}`} to="/admin/create-account" onClick={handleNavClick}>
                    ➕ Create Account
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/admin/audit')}`} to="/admin/audit" onClick={handleNavClick}>
                    📜 Audit Logs
                  </Link>
                </li>
                
                {/* Embedded customer shortcuts for testing transaction inputs directly */}
                <li className="nav-item">
                  <hr className="border-secondary my-2" />
                  <span className="small text-muted px-3 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Transactional Views</span>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/deposit')}`} to="/deposit" onClick={handleNavClick}>
                    📥 Deposit
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/withdraw')}`} to="/withdraw" onClick={handleNavClick}>
                    📤 Withdraw
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/transfer')}`} to="/transfer" onClick={handleNavClick}>
                    💸 Transfer
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/history')}`} to="/history" onClick={handleNavClick}>
                    📜 History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link text-white ${isActive('/statement')}`} to="/statement" onClick={handleNavClick}>
                    📅 Statement
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-top border-secondary">
          <button className="btn btn-outline-danger w-100 btn-sm" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;

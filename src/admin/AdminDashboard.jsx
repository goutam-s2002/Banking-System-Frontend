import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/admin/dashboard');
      setMetrics(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">Admin Dashboard</h2>
          <p className="text-muted">Overview of the BankingSystem state</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-primary" onClick={fetchDashboard}>
            🔄 Refresh Stats
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {metrics && (
        <>
          {/* Metrics Row */}
          <div className="row g-4 mb-5">
            {/* Total Customers -> Registered Users */}
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/admin/users" className="text-decoration-none text-dark">
                <div className="card shadow-sm border-0 border-start border-primary border-4 h-100 card-hover">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted text-uppercase small fw-bold">Total Customers</span>
                        <h2 className="fw-bold mt-2 mb-0 text-primary">{metrics.totalUsers}</h2>
                      </div>
                      <span className="fs-1">👥</span>
                    </div>
                    <span className="text-muted small mt-2 d-block">
                      Click to manage users
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Active Accounts -> Accounts Report with Active filter */}
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/admin/accounts?status=active" className="text-decoration-none text-dark">
                <div className="card shadow-sm border-0 border-start border-success border-4 h-100 card-hover">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted text-uppercase small fw-bold">Active Accounts</span>
                        <h2 className="fw-bold mt-2 mb-0 text-success">{metrics.activeAccounts}</h2>
                      </div>
                      <span className="fs-1">🛡️</span>
                    </div>
                    <span className="text-muted small mt-2 d-block">
                      Out of {metrics.totalAccounts} total accounts
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Blocked Accounts -> Accounts Report with Blocked filter */}
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/admin/accounts?status=blocked" className="text-decoration-none text-dark">
                <div className="card shadow-sm border-0 border-start border-warning border-4 h-100 card-hover">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted text-uppercase small fw-bold">Blocked Accounts</span>
                        <h2 className="fw-bold mt-2 mb-0 text-warning">{metrics.blockedAccounts}</h2>
                      </div>
                      <span className="fs-1">⚠️</span>
                    </div>
                    <span className="text-muted small mt-2 d-block">
                      Click to check blocked accounts
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Closed Accounts -> Accounts Report with Closed filter */}
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/admin/accounts?status=closed" className="text-decoration-none text-dark">
                <div className="card shadow-sm border-0 border-start border-danger border-4 h-100 card-hover">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted text-uppercase small fw-bold">Closed Accounts</span>
                        <h2 className="fw-bold mt-2 mb-0 text-danger">{metrics.closedAccounts}</h2>
                      </div>
                      <span className="fs-1">🛑</span>
                    </div>
                    <span className="text-muted small mt-2 d-block">
                      Click to check closed accounts
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Total Transactions -> Audit Logs */}
            <div className="col-12 col-sm-6 col-lg-4">
              <Link to="/admin/audit" className="text-decoration-none text-dark">
                <div className="card shadow-sm border-0 border-start border-info border-4 h-100 card-hover">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted text-uppercase small fw-bold">Total Transactions</span>
                        <h2 className="fw-bold mt-2 mb-0 text-info">{metrics.totalTransactions}</h2>
                      </div>
                      <span className="fs-1">📊</span>
                    </div>
                    <span className="text-muted small mt-2 d-block">
                      Click to audit transaction logs
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Management Shortcuts</h5>
              <div className="row g-2">
                <div className="col-12 col-md-3">
                  <Link to="/admin/users" className="btn btn-primary w-100 py-3">
                    👥 Manage Registered Users
                  </Link>
                </div>
                <div className="col-12 col-md-3">
                  <Link to="/admin/accounts" className="btn btn-dark w-100 py-3">
                    📊 Accounts Report List
                  </Link>
                </div>
                <div className="col-12 col-md-3">
                  <Link to="/admin/audit" className="btn btn-secondary w-100 py-3">
                    📜 View Audit Logs
                  </Link>
                </div>
                <div className="col-12 col-md-3">
                  <Link to="/deposit" className="btn btn-success w-100 py-3">
                    💸 Deposit/Withdraw Portal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

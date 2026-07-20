import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const Dashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAccounts = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/accounts/my');
      setAccounts(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefreshBalance = async (accountId) => {
    try {
      const response = await axiosClient.get(`/accounts/balance?accountId=${accountId}`);
      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === accountId ? { ...acc, balance: response.data } : acc))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to refresh balance.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold">My Accounts</h2>
          <p className="text-muted">Manage your funds and view balances</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-outline-primary" onClick={fetchAccounts}>
            🔄 Refresh Page
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {accounts.length === 0 ? (
        <div className="card text-center p-5 border-0 shadow-sm">
          <div className="card-body">
            <span className="fs-1">📂</span>
            <h4 className="fw-bold mt-3">No Active Accounts Found</h4>
            <p className="text-muted text-center mx-auto" style={{ maxWidth: '400px' }}>
              You do not have any bank accounts opened yet. Please contact an Administrator to set up an account (Savings or Current) for you.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {accounts.map((account) => (
            <div className="col-12 col-md-6" key={account.accountId}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center py-3">
                  <div>
                    <span className="badge bg-primary me-2">{account.accountType}</span>
                    <span className="font-monospace">{account.accountNumber}</span>
                  </div>
                  <div>
                    {account.status === 'ACTIVE' && <span className="badge bg-success">Active</span>}
                    {account.status === 'BLOCKED' && <span className="badge bg-warning text-dark">Blocked</span>}
                    {account.status === 'CLOSED' && <span className="badge bg-danger">Closed</span>}
                  </div>
                </div>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">Available Balance</span>
                    <button
                      className="btn btn-sm btn-light border"
                      onClick={() => handleRefreshBalance(account.accountId)}
                      title="Refresh Balance"
                    >
                      🔄
                    </button>
                  </div>
                  <h1 className="fw-bold mb-4 text-primary">
                    ₹{account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </h1>

                  <hr />

                  <div className="row g-2 mt-3">
                    <div className="col-6">
                      <Link
                        to={`/deposit?accountId=${account.accountId}`}
                        className="btn btn-outline-success w-100 btn-sm py-2"
                        disabled={account.status !== 'ACTIVE'}
                      >
                        📥 Deposit
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link
                        to={`/withdraw?accountId=${account.accountId}`}
                        className="btn btn-outline-danger w-100 btn-sm py-2"
                        disabled={account.status !== 'ACTIVE'}
                      >
                        📤 Withdraw
                      </Link>
                    </div>
                    <div className="col-12">
                      <Link
                        to={`/transfer?fromAccountId=${account.accountId}`}
                        className="btn btn-primary w-100 py-2 btn-sm mb-2"
                        disabled={account.status !== 'ACTIVE'}
                      >
                        💸 Transfer Money
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link
                        to={`/history?accountId=${account.accountId}`}
                        className="btn btn-light border w-100 btn-sm py-2"
                      >
                        📜 History
                      </Link>
                    </div>
                    <div className="col-6">
                      <Link
                        to={`/statement?accountId=${account.accountId}`}
                        className="btn btn-light border w-100 btn-sm py-2"
                      >
                        📅 Statement
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const AccountReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAccounts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.get('/accounts');
      setAccounts(response.data);
      
      // Load status filter from query param if present
      const qStatus = searchParams.get('status');
      if (qStatus) {
        setStatusFilter(qStatus.toUpperCase());
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve system accounts report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [searchParams]);

  const handleDeleteAccount = async (accountId, accountNumber) => {
    if (!window.confirm(`Are you sure you want to delete account "${accountNumber}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await axiosClient.delete('/accounts/delete', {
        params: {
          accountId: accountId,
        },
      });
      setSuccess(res.data || 'Account deleted successfully.');
      setAccounts((prev) => prev.filter((acc) => acc.accountId !== accountId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleStatusChange = async (accountId, newStatus) => {
    setError('');
    setSuccess('');

    try {
      const res = await axiosClient.put(`/accounts/status/${accountId}`, {
        status: newStatus,
      });
      setSuccess(res.data || 'Account status updated.');
      
      // Update local state
      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === accountId ? { ...acc, status: newStatus } : acc))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  // Filter Accounts locally
  const filteredAccounts = accounts.filter((acc) => {
    const matchesStatus = statusFilter === 'ALL' || 
      (acc.status && acc.status.toUpperCase() === statusFilter.toUpperCase());
    const searchString = `${acc.accountNumber} ${acc.ownerName} ${acc.ownerEmail}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusFilterChange = (e) => {
    const val = e.target.value;
    setStatusFilter(val);
    if (val === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ status: val.toLowerCase() });
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">📊 Accounts Report</h4>
          <button className="btn btn-sm btn-outline-light" onClick={fetchAccounts}>
            🔄 Refresh List
          </button>
        </div>
        <div className="card-body p-4">
          
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close"></button>
            </div>
          )}

          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}

          {/* Filtering Tools */}
          <div className="row g-2 mb-4">
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-semibold">Search Accounts</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search owner name, email, account no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-semibold">Filter by Status</label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {filteredAccounts.length === 0 ? (
            <div className="text-center text-muted py-5 bg-light rounded">
              No bank accounts found matching criteria.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Customer (Owner)</th>
                    <th>Account No / Type</th>
                    <th>Balance (₹)</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((acc) => (
                    <tr key={acc.accountId}>
                      <td>
                        <strong>{acc.ownerName}</strong>
                        <div className="text-muted small">{acc.ownerEmail}</div>
                      </td>
                      <td>
                        <strong className="font-monospace">{acc.accountNumber}</strong>
                        <div className="text-muted small">{acc.accountType}</div>
                      </td>
                      <td className="font-monospace fw-semibold text-primary">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm fw-bold ${
                            acc.status?.toUpperCase() === 'ACTIVE'
                              ? 'text-success'
                              : acc.status?.toUpperCase() === 'BLOCKED'
                              ? 'text-warning'
                              : 'text-danger'
                          }`}
                          value={acc.status?.toUpperCase()}
                          onChange={(e) => handleStatusChange(acc.accountId, e.target.value)}
                          style={{ width: '120px' }}
                        >
                          <option value="ACTIVE" className="text-success">ACTIVE</option>
                          <option value="BLOCKED" className="text-warning">BLOCKED</option>
                          <option value="CLOSED" className="text-danger">CLOSED</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <Link to={`/admin/users/${acc.accountId}`} className="btn btn-sm btn-outline-secondary me-2">
                          🔍 Edit Owner
                        </Link>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteAccount(acc.accountId, acc.accountNumber)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AccountReport;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
    role: 'USER',
  });
  const [password, setPassword] = useState('12345'); // Default placeholder to bypass backend NOT_BLANK validation
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Account State
  const [newAccountType, setNewAccountType] = useState('SAVINGS');

  // Form Alerts
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');

  const [submittingUser, setSubmittingUser] = useState(false);
  const [submittingAccount, setSubmittingAccount] = useState(false);

  const fetchUserDetails = async () => {
    try {
      // 1. Get user details
      const userRes = await axiosClient.get(`/auth/users/${id}`);
      setUser({
        name: userRes.data.name,
        email: userRes.data.email,
        role: userRes.data.role,
      });

      // 2. Get user accounts using the new helper endpoint
      const accountsRes = await axiosClient.get(`/accounts/user/${id}`);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error(err);
      setUserError('Failed to load user details or accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');
    setSubmittingUser(true);

    try {
      // Send User object including the password to satisfy backend validation
      await axiosClient.put(`/auth/users/${id}`, {
        name: user.name,
        email: user.email,
        role: user.role,
        password: password,
      });
      setUserSuccess('User details updated successfully.');
    } catch (err) {
      console.error(err);
      setUserError(err.response?.data?.message || 'Failed to update user details.');
    } finally {
      setSubmittingUser(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    setSubmittingAccount(true);

    try {
      const res = await axiosClient.post('/accounts/create', null, {
        params: {
          userId: id,
          accountType: newAccountType,
        },
      });
      setAccountSuccess(`Account ${res.data.accountNumber} created successfully!`);
      // Reload accounts list
      const accountsRes = await axiosClient.get(`/accounts/user/${id}`);
      setAccounts(accountsRes.data);
    } catch (err) {
      console.error(err);
      setAccountError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmittingAccount(false);
    }
  };

  const handleDeleteAccount = async (accountId, accountNumber) => {
    if (!window.confirm(`Are you sure you want to delete account "${accountNumber}"?`)) {
      return;
    }

    setAccountError('');
    setAccountSuccess('');

    try {
      const res = await axiosClient.delete('/accounts/delete', {
        params: {
          accountId: accountId,
        },
      });
      setAccountSuccess(res.data || 'Account deleted successfully.');
      setAccounts((prev) => prev.filter((acc) => acc.accountId !== accountId));
    } catch (err) {
      console.error(err);
      setAccountError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const handleStatusChange = async (accountId, newStatus) => {
    setAccountError('');
    setAccountSuccess('');

    try {
      const res = await axiosClient.put(`/accounts/status/${accountId}`, {
        status: newStatus,
      });
      setAccountSuccess(res.data || 'Account status updated.');
      // Update local state
      setAccounts((prev) =>
        prev.map((acc) => (acc.accountId === accountId ? { ...acc, status: newStatus } : acc))
      );
    } catch (err) {
      console.error(err);
      setAccountError(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      {/* Back Button */}
      <div className="mb-4 d-print-none">
        <Link to="/admin/users" className="btn btn-outline-secondary btn-sm">
          ← Back to Users
        </Link>
      </div>

      <div className="row g-4">
        {/* Edit User Form */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="mb-0 fw-bold">✏️ Edit User Details</h5>
            </div>
            <div className="card-body p-4">
              {userSuccess && <div className="alert alert-success">{userSuccess}</div>}
              {userError && <div className="alert alert-danger">{userError}</div>}

              <form onSubmit={handleUpdateUser}>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={user.name}
                    onChange={handleUserChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={user.email}
                    onChange={handleUserChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Update Password (Required for Save)</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password (min 5 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={5}
                  />
                  <div className="form-text text-muted small">
                    Backend requires the password to be supplied on update. Defaulting to a placeholder.
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">User Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.role}
                    disabled
                  />
                  <div className="form-text text-muted small">
                    Roles cannot be dynamically upgraded once registered.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2" disabled={submittingUser}>
                  {submittingUser ? 'Saving Changes...' : 'Save User Details'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Account Management Card */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">💳 User Bank Accounts</h5>
            </div>
            <div className="card-body p-4">
              {accountSuccess && <div className="alert alert-success">{accountSuccess}</div>}
              {accountError && <div className="alert alert-danger">{accountError}</div>}

              {/* Create Account Form */}
              <form onSubmit={handleCreateAccount} className="row g-2 mb-4 bg-light p-3 rounded mx-0">
                <div className="col-12 col-sm-6">
                  <select
                    className="form-select form-select-sm h-100"
                    value={newAccountType}
                    onChange={(e) => setNewAccountType(e.target.value)}
                    required
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6">
                  <button type="submit" className="btn btn-success btn-sm w-100 py-2" disabled={submittingAccount}>
                    ➕ Create New Account
                  </button>
                </div>
              </form>

              {/* Accounts List */}
              {accounts.length === 0 ? (
                <div className="text-center py-5 text-muted bg-light rounded">
                  No accounts exist for this user.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Acc No / Type</th>
                        <th>Balance (₹)</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((acc) => (
                        <tr key={acc.accountId}>
                          <td>
                            <strong className="font-monospace">{acc.accountNumber}</strong>
                            <div className="text-muted small">{acc.accountType}</div>
                          </td>
                          <td className="font-monospace fw-semibold">
                            ₹{acc.balance.toFixed(2)}
                          </td>
                          <td>
                            <select
                              className={`form-select form-select-sm fw-bold ${
                                acc.status === 'ACTIVE'
                                  ? 'text-success'
                                  : acc.status === 'BLOCKED'
                                  ? 'text-warning'
                                  : 'text-danger'
                              }`}
                              value={acc.status}
                              onChange={(e) => handleStatusChange(acc.accountId, e.target.value)}
                            >
                              <option value="ACTIVE" className="text-success">ACTIVE</option>
                              <option value="BLOCKED" className="text-warning">BLOCKED</option>
                              <option value="CLOSED" className="text-danger">CLOSED</option>
                            </select>
                          </td>
                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-danger"
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
      </div>
    </div>
  );
};

export default UserDetail;

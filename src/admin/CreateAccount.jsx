import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const CreateAccount = () => {
  const navigate = useNavigate();

  // Search User State
  const [emailInput, setEmailInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState(null);

  // Create Account Form State
  const [accountType, setAccountType] = useState('SAVINGS');
  const [initialBalance, setInitialBalance] = useState('0.0');

  // Page Notifications
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLookupUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFoundUser(null);

    if (!emailInput.trim()) {
      setError('Please enter a user email.');
      return;
    }

    setSearching(true);
    try {
      const response = await axiosClient.get(`/auth/users/by-email?email=${encodeURIComponent(emailInput.trim())}`);
      setFoundUser(response.data);
      setSuccess(`User "${response.data.name}" found successfully!`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'User not found. Check the email and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!foundUser) {
      setError('Please look up and verify a user first.');
      return;
    }

    const parsedBalance = parseFloat(initialBalance);
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      setError('Initial balance must be a non-negative number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosClient.post('/accounts/create', null, {
        params: {
          userId: foundUser.id,
          accountType: accountType,
          initialBalance: parsedBalance,
        },
      });

      setSuccess(`Account Created Successfully! Account Number: ${response.data.accountNumber}`);
      setFoundUser(null);
      setEmailInput('');
      setInitialBalance('0.0');
      setAccountType('SAVINGS');

      // Redirect back to admin dashboard after 3s
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '650px' }}>
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold">➕ Create Customer Bank Account</h4>
        </div>
        <div className="card-body p-4">
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success" role="alert">
              {success}
            </div>
          )}

          {/* User Lookup Form */}
          <form onSubmit={handleLookupUser} className="mb-4 pb-4 border-bottom">
            <h5 className="fw-bold mb-3 text-secondary">Step 1: Lookup Customer by Email</h5>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="customer@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={searching || submitting}
                required
              />
              <button className="btn btn-primary" type="submit" disabled={searching || submitting}>
                {searching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Searching...
                  </>
                ) : (
                  '🔍 Lookup'
                )}
              </button>
            </div>
          </form>

          {/* Account Creation Form (Shown after user is found) */}
          {foundUser && (
            <form onSubmit={handleCreateAccountSubmit}>
              <h5 className="fw-bold mb-3 text-secondary">Step 2: Enter Account Details</h5>

              {/* Read Only User Info */}
              <div className="row g-2 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small text-muted">Customer Name</label>
                  <input type="text" className="form-control bg-light" value={foundUser.name} disabled />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label small text-muted">Customer Email</label>
                  <input type="text" className="form-control bg-light" value={foundUser.email} disabled />
                </div>
              </div>

              {/* Hidden User ID */}
              <input type="hidden" value={foundUser.id} />

              <div className="mb-3">
                <label htmlFor="accountType" className="form-label fw-semibold">Account Type</label>
                <select
                  id="accountType"
                  className="form-select"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  required
                >
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CURRENT">Current Account</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="initialBalance" className="form-label fw-semibold">Initial Balance (₹)</label>
                <input
                  type="number"
                  id="initialBalance"
                  className="form-control"
                  placeholder="Enter initial balance (e.g. 5000)"
                  min="0"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  required
                />
              </div>

              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setFoundUser(null);
                    setSuccess('');
                    setEmailInput('');
                  }}
                  disabled={submitting}
                >
                  Reset
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreateAccount;

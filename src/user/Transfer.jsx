import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';
import { useAuth } from '../auth/AuthContext';

const Transfer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountNumber: '',
    amount: '',
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const endpoint = user.role === 'ADMIN' ? '/accounts' : '/accounts/my';
        const response = await axiosClient.get(endpoint);
        setAccounts(response.data);

        // Pre-select sender account from query param if present
        const qFromAccountId = searchParams.get('fromAccountId');
        if (qFromAccountId) {
          if (user.role === 'USER') {
            const ownsAccount = response.data.some(acc => acc.accountId.toString() === qFromAccountId.toString());
            if (!ownsAccount) {
              setError("Access Denied: You do not own Account ID " + qFromAccountId);
              setFormData((prev) => ({ ...prev, fromAccountId: '' }));
              return;
            }
          }
          setFormData((prev) => ({ ...prev, fromAccountId: qFromAccountId }));
        } else if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, fromAccountId: response.data[0].accountId.toString() }));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [searchParams, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (user.role === 'USER') {
      const ownsAccount = accounts.some(acc => acc.accountId.toString() === formData.fromAccountId.toString());
      if (!ownsAccount) {
        setError("Access Denied: You do not own the source account.");
        return;
      }
    }

    // Check if transferring to own account
    const senderAcc = accounts.find(acc => acc.accountId.toString() === formData.fromAccountId.toString());
    if (senderAcc && senderAcc.accountNumber === formData.toAccountNumber.trim()) {
      setError('Sender and recipient accounts cannot be the same.');
      return;
    }

    setValidated(true);
    setSubmitting(true);

    try {
      // Backend expects fromAccountId, toAccountNumber, and amount as request parameters, body is empty
      const res = await axiosClient.post('/transactions/transfer', null, {
        params: {
          fromAccountId: formData.fromAccountId,
          toAccountNumber: formData.toAccountNumber.trim(),
          amount: parseFloat(formData.amount),
        },
      });

      setSuccess(res.data || 'Transfer successful!');
      setFormData((prev) => ({ ...prev, toAccountNumber: '', amount: '' }));
      setValidated(false);
      
      // Auto-redirect back to dashboard after 2s
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Transfer transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-primary text-white py-3">
          <h4 className="mb-0 fw-bold">💸 Transfer Funds</h4>
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

          <form onSubmit={handleSubmit} noValidate className={validated ? 'was-validated' : ''}>
            <div className="mb-3">
              <label htmlFor="fromAccountId" className="form-label">From Account (Sender)</label>
              {accounts.length === 0 ? (
                <input
                  type="text"
                  name="fromAccountId"
                  className="form-control"
                  placeholder="Enter Sender Account ID"
                  value={formData.fromAccountId}
                  onChange={handleChange}
                  required
                />
              ) : (
                <select
                  id="fromAccountId"
                  name="fromAccountId"
                  className="form-select"
                  value={formData.fromAccountId}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {accounts.filter(acc => acc.status?.toUpperCase() === 'ACTIVE').map((acc) => (
                    <option key={acc.accountId} value={acc.accountId}>
                      {acc.accountNumber} ({acc.accountType}) - Balance: ₹{acc.balance}{user.role === 'ADMIN' && acc.ownerName ? ` - ${acc.ownerName}` : ''}
                    </option>
                  ))}
                </select>
              )}
              <div className="invalid-feedback">
                Please select a sender account.
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="toAccountNumber" className="form-label">To Account Number (Recipient)</label>
              <input
                type="text"
                id="toAccountNumber"
                name="toAccountNumber"
                className="form-control"
                placeholder="Enter Recipient Account Number (e.g. ACC171...)"
                value={formData.toAccountNumber}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please enter a valid Recipient Account Number.
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="amount" className="form-label">Transfer Amount (₹)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-control"
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <div className="invalid-feedback">
                Please enter an amount greater than 0.
              </div>
            </div>

            <div className="d-grid gap-2">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing Transfer...
                  </>
                ) : (
                  'Transfer'
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transfer;

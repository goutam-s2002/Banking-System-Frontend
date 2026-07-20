import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';
import { useAuth } from '../auth/AuthContext';

const TransactionHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingTxns, setFetchingTxns] = useState(false);
  
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [page, setPage] = useState(0);
  const size = 5;

  const [error, setError] = useState('');

  // 1. Fetch user accounts first
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const endpoint = user.role === 'ADMIN' ? '/accounts' : '/accounts/my';
        const response = await axiosClient.get(endpoint);
        setAccounts(response.data);

        // Pre-select account from URL search params or pick the first one
        const urlAccId = searchParams.get('accountId');
        if (urlAccId) {
          if (user.role === 'USER') {
            const owns = response.data.some(acc => acc.accountId.toString() === urlAccId.toString());
            if (!owns) {
              setError("Access Denied: You do not own Account ID " + urlAccId);
              return;
            }
          }
          setSelectedAccountId(urlAccId);
        } else if (response.data.length > 0) {
          setSelectedAccountId(response.data[0].accountId.toString());
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [user]);

  // 2. Fetch transactions whenever account selection or page changes
  useEffect(() => {
    if (!selectedAccountId) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      if (user.role === 'USER') {
        const owns = accounts.some(acc => acc.accountId.toString() === selectedAccountId.toString());
        if (!owns) {
          setError("Access Denied: You do not own this account.");
          setTransactions([]);
          return;
        }
      }

      setFetchingTxns(true);
      setError('');
      try {
        const response = await axiosClient.get('/transactions/history', {
          params: {
            accountId: selectedAccountId,
            page: page,
            size: size,
          },
        });
        setTransactions(response.data);
        // Sync URL param
        setSearchParams({ accountId: selectedAccountId });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load transaction history.');
      } finally {
        setFetchingTxns(false);
      }
    };

    fetchTransactions();
  }, [selectedAccountId, page, accounts, user]);

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
    setPage(0); // Reset page to 0 on account swap
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    // If the current list contains exactly 'size' items, there might be more on next page
    if (transactions.length === size) {
      setPage((prev) => prev + 1);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">📜 Transaction History</h4>
          <div className="d-flex align-items-center">
            <span className="me-2 text-nowrap">Account:</span>
            {accounts.length === 0 ? (
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Enter Account ID"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              />
            ) : (
              <select
                className="form-select form-select-sm"
                value={selectedAccountId}
                onChange={handleAccountChange}
                style={{ minWidth: '200px' }}
              >
                <option value="">-- Choose Account --</option>
                {accounts.map((acc) => (
                  <option key={acc.accountId} value={acc.accountId}>
                    {acc.accountNumber} ({acc.accountType}){user.role === 'ADMIN' && acc.ownerName ? ` - ${acc.ownerName}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}

          {fetchingTxns ? (
            <div className="text-center py-5">
              <div className="spinner-border text-secondary" role="status">
                <span className="visually-hidden">Loading transactions...</span>
              </div>
            </div>
          ) : !selectedAccountId ? (
            <div className="text-center text-muted py-5">
              Please select or enter an Account ID to view transaction history.
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-muted py-5">
              No transactions recorded for this account.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date & Time</th>
                      <th>Transaction Type</th>
                      <th>Amount (₹)</th>
                      <th>Direction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((txn, index) => (
                      <tr key={index}>
                        <td>{new Date(txn.date).toLocaleString()}</td>
                        <td>
                          <span className="fw-semibold">{txn.type}</span>
                        </td>
                        <td className={txn.direction === 'CREDIT' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {txn.direction === 'CREDIT' ? '+' : '-'} ₹{txn.amount.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge ${txn.direction === 'CREDIT' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                            {txn.direction}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Simple Pagination Controls */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handlePrevPage}
                  disabled={page === 0}
                >
                  ◀ Previous Page
                </button>
                <span className="text-muted small">Page {page + 1}</span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleNextPage}
                  disabled={transactions.length < size}
                >
                  Next Page ▶
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;

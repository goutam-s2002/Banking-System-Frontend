import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';
import { useAuth } from '../auth/AuthContext';

const Statement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const endpoint = user.role === 'ADMIN' ? '/accounts' : '/accounts/my';
        const response = await axiosClient.get(endpoint);
        setAccounts(response.data);

        // Pre-select account from URL search params
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

        // Set default date range (current month)
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = now.toISOString().split('T')[0];
        setDateRange({ from: firstDay, to: lastDay });
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts.');
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, [user]);

  const handleAccountChange = (e) => {
    setSelectedAccountId(e.target.value);
    setTransactions([]);
    setError('');
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleFetchStatement = async (e) => {
    e.preventDefault();
    if (!selectedAccountId || !dateRange.from || !dateRange.to) {
      setError('Please select an account and both dates.');
      return;
    }

    if (user.role === 'USER') {
      const owns = accounts.some(acc => acc.accountId.toString() === selectedAccountId.toString());
      if (!owns) {
        setError("Access Denied: You do not have permission to fetch statements for this account.");
        setTransactions([]);
        return;
      }
    }

    setFetching(true);
    setError('');
    try {
      const response = await axiosClient.get('/transactions/statement', {
        params: {
          accountId: selectedAccountId,
          from: dateRange.from,
          to: dateRange.to,
        },
      });
      setTransactions(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch bank statement.');
    } finally {
      setFetching(false);
    }
  };

  // Export handlers
  const getAccountDetails = () => {
    const account = accounts.find(a => a.accountId.toString() === selectedAccountId.toString());
    return {
      accNo: account ? account.accountNumber : selectedAccountId,
      accType: account ? account.accountType : 'UNKNOWN',
      ownerName: account ? (account.ownerName || user.name || user.email) : (user.name || user.email)
    };
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const { accNo, accType, ownerName } = getAccountDetails();
    
    const headers = ['Date & Time', 'Description', 'Debits (Dr) (INR)', 'Credits (Cr) (INR)'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleString(),
      t.type,
      t.direction === 'DEBIT' ? t.amount.toFixed(2) : '0.00',
      t.direction === 'CREDIT' ? t.amount.toFixed(2) : '0.00'
    ]);

    const csvContent = [
      `"Statement of Account",`,
      `"Customer Name","${ownerName}"`,
      `"Account Number","${accNo}"`,
      `"Account Type","${accType}"`,
      `"Period","${dateRange.from} to ${dateRange.to}"`,
      `""`,
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `statement_${accNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) return;
    const { accNo, accType, ownerName } = getAccountDetails();

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"></head>
      <body>
        <table border="0" style="font-family: Arial, sans-serif; border-collapse: collapse;">
          <tr><td colspan="4" style="font-size: 18px; font-weight: bold; text-align: center;">STATEMENT OF ACCOUNT</td></tr>
          <tr><td><b>Customer Name:</b></td><td colspan="3">${ownerName}</td></tr>
          <tr><td><b>Account Number:</b></td><td colspan="3" style="mso-number-format:'@';">${accNo}</td></tr>
          <tr><td><b>Account Type:</b></td><td colspan="3">${accType}</td></tr>
          <tr><td><b>Period:</b></td><td colspan="3">${dateRange.from} to ${dateRange.to}</td></tr>
          <tr><td colspan="4"></td></tr>
          <tr style="background-color: #343a40; color: #ffffff; font-weight: bold; text-align: center;">
            <td style="border: 1px solid #000000; padding: 8px;">Date & Time</td>
            <td style="border: 1px solid #000000; padding: 8px;">Description</td>
            <td style="border: 1px solid #000000; padding: 8px; text-align: right;">Debits (Dr)</td>
            <td style="border: 1px solid #000000; padding: 8px; text-align: right;">Credits (Cr)</td>
          </tr>
          ${transactions.map(t => `
            <tr>
              <td style="border: 1px solid #000000; padding: 8px;">${new Date(t.date).toLocaleString()}</td>
              <td style="border: 1px solid #000000; padding: 8px;">${t.type}</td>
              <td style="border: 1px solid #000000; padding: 8px; text-align: right;">${t.direction === 'DEBIT' ? t.amount.toFixed(2) : '-'}</td>
              <td style="border: 1px solid #000000; padding: 8px; text-align: right;">${t.direction === 'CREDIT' ? t.amount.toFixed(2) : '-'}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `statement_${accNo}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportWord = () => {
    if (transactions.length === 0) return;
    const { accNo, accType, ownerName } = getAccountDetails();

    let html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>Statement of Account</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.2; }
          .header-table { width: 100%; border: none; margin-bottom: 20px; }
          .header-table td { border: none; padding: 4px; }
          table.data-table { border-collapse: collapse; width: 100%; }
          table.data-table th, table.data-table td { border: 1px solid #000000; padding: 8px; text-align: left; }
          table.data-table th { background-color: #f2f2f2; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2 style="text-align: center; font-family: Arial; font-weight: bold;">STATEMENT OF ACCOUNT</h2>
        <table class="header-table">
          <tr><td style="width: 150px;"><b>Customer Name:</b></td><td>${ownerName}</td></tr>
          <tr><td><b>Account Number:</b></td><td>${accNo}</td></tr>
          <tr><td><b>Account Type:</b></td><td>${accType}</td></tr>
          <tr><td><b>Statement Period:</b></td><td>${dateRange.from} to ${dateRange.to}</td></tr>
        </table>
        <br/>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Description</th>
              <th style="text-align: right;">Debits (Dr) (INR)</th>
              <th style="text-align: right;">Credits (Cr) (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.date).toLocaleString()}</td>
                <td>${t.type}</td>
                <td style="text-align: right;">${t.direction === 'DEBIT' ? t.amount.toFixed(2) : '-'}</td>
                <td style="text-align: right;">${t.direction === 'CREDIT' ? t.amount.toFixed(2) : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `statement_${accNo}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summarize statement
  const totalCredits = transactions
    .filter((t) => t.direction === 'CREDIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.direction === 'DEBIT')
    .reduce((sum, t) => sum + t.amount, 0);

  const { accNo, accType, ownerName } = getAccountDetails();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      {/* Search Filter Card */}
      <div className="card shadow-sm border-0 mb-4 d-print-none">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold">📅 Bank Statement</h4>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleFetchStatement}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Select Account</label>
                {accounts.length === 0 ? (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Account ID"
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                  />
                ) : (
                  <select
                    className="form-select"
                    value={selectedAccountId}
                    onChange={handleAccountChange}
                    required
                  >
                    <option value="">-- Select Account --</option>
                    {accounts.map((acc) => (
                      <option key={acc.accountId} value={acc.accountId}>
                        {acc.accountNumber} ({acc.accountType}){user.role === 'ADMIN' && acc.ownerName ? ` - ${acc.ownerName}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold">From Date</label>
                <input
                  type="date"
                  name="from"
                  className="form-control"
                  value={dateRange.from}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="col-12 col-sm-6 col-md-3">
                <label className="form-label fw-semibold">To Date</label>
                <input
                  type="date"
                  name="to"
                  className="form-control"
                  value={dateRange.to}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="col-12 col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100 py-2" disabled={fetching}>
                  {fetching ? 'Loading...' : 'Generate'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Statement Print Area */}
      {transactions.length > 0 ? (
        <div className="card border shadow-sm p-4 bg-white">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-2 border-bottom">
            <div className="mb-2 mb-sm-0">
              <h3 className="fw-bold mb-0 text-primary">Statement of Account</h3>
              <p className="text-muted mb-0 small">
                Period: {new Date(dateRange.from).toLocaleDateString()} to {new Date(dateRange.to).toLocaleDateString()}
              </p>
            </div>
            
            {/* Export Buttons */}
            <div className="d-flex flex-wrap gap-2 d-print-none">
              <button className="btn btn-outline-secondary btn-sm" onClick={() => window.print()}>
                🖨️ Print / PDF
              </button>
              <button className="btn btn-outline-success btn-sm" onClick={handleExportCSV}>
                📄 CSV
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={handleExportExcel}>
                📊 Excel
              </button>
              <button className="btn btn-outline-info btn-sm text-dark" onClick={handleExportWord}>
                📝 Word
              </button>
            </div>
          </div>

          {/* Account & Customer Details (Top section) */}
          <div className="row mb-4 bg-light p-3 rounded border mx-0">
            <div className="col-12 col-sm-6 mb-2 mb-sm-0">
              <span className="text-muted small d-block">Customer Name</span>
              <strong className="fs-5 text-dark">{ownerName}</strong>
            </div>
            <div className="col-6 col-sm-3">
              <span className="text-muted small d-block">Account Number</span>
              <strong className="fs-5 font-monospace text-dark">{accNo}</strong>
            </div>
            <div className="col-6 col-sm-3">
              <span className="text-muted small d-block">Account Type</span>
              <span className="badge bg-dark mt-1 fs-6">{accType}</span>
            </div>
          </div>

          {/* Statement Summaries */}
          <div className="row g-3 mb-4 text-center">
            <div className="col-6 col-sm-4">
              <div className="p-3 border rounded bg-danger-subtle text-danger">
                <span className="small d-block text-uppercase fw-semibold">Total Debits (Dr)</span>
                <h4 className="fw-bold mb-0">₹{totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
              </div>
            </div>
            <div className="col-6 col-sm-4">
              <div className="p-3 border rounded bg-success-subtle text-success">
                <span className="small d-block text-uppercase fw-semibold">Total Credits (Cr)</span>
                <h4 className="fw-bold mb-0">₹{totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
              </div>
            </div>
            <div className="col-12 col-sm-4">
              <div className={`p-3 border rounded ${totalCredits - totalDebits >= 0 ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning-emphasis'}`}>
                <span className="small d-block text-uppercase fw-semibold">Net Activity</span>
                <h4 className="fw-bold mb-0">
                  ₹{(totalCredits - totalDebits).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h4>
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Date & Time</th>
                  <th>Description</th>
                  <th className="text-end">Debits (Dr)</th>
                  <th className="text-end">Credits (Cr)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, index) => (
                  <tr key={index}>
                    <td>{new Date(txn.date).toLocaleString()}</td>
                    <td>
                      <span className="fw-semibold">{txn.type}</span>
                    </td>
                    <td className="text-end text-danger font-monospace">
                      {txn.direction === 'DEBIT' ? `₹${txn.amount.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-end text-success font-monospace">
                      {txn.direction === 'CREDIT' ? `₹${txn.amount.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        selectedAccountId && !error && !fetching && (
          <div className="card text-center p-5 border shadow-sm">
            <p className="text-muted mb-0">Please click 'Generate' to load statements for the chosen period.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Statement;

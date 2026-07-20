import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local Search & Filter State
  const [filterUsername, setFilterUsername] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/admin/audit');
      // Sort logs by timestamp descending (newest first) by default
      const sortedLogs = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(sortedLogs);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch system audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs locally in state
  const filteredLogs = logs.filter((log) => {
    const matchUser = log.username?.toLowerCase().includes(filterUsername.toLowerCase());
    const matchAction = log.action?.toLowerCase().includes(filterAction.toLowerCase());
    return matchUser && matchAction;
  });

  // Paginated chunk
  const paginatedLogs = filteredLogs.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Reset page when filters change
  const handleUserFilterChange = (e) => {
    setFilterUsername(e.target.value);
    setPage(0);
  };

  const handleActionFilterChange = (e) => {
    setFilterAction(e.target.value);
    setPage(0);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">📜 System Audit Logs</h4>
          <button className="btn btn-sm btn-outline-light" onClick={fetchLogs}>
            🔄 Refresh Logs
          </button>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Filtering Tools */}
          <div className="row g-2 mb-4">
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">Filter by Email / Username</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search email..."
                value={filterUsername}
                onChange={handleUserFilterChange}
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label small fw-semibold">Filter by Action</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search action (e.g., LOGIN, TRANSFER)..."
                value={filterAction}
                onChange={handleActionFilterChange}
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center text-muted py-5">
              No audit logs found matching criteria.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle table-sm">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>Log ID</th>
                      <th>User / Email</th>
                      <th>Action</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td className="font-monospace text-muted">{log.username}</td>
                        <td>
                          <span className={`badge ${
                            log.action?.includes('LOGIN') 
                              ? 'bg-info text-dark' 
                              : log.action?.includes('REGISTER')
                              ? 'bg-success'
                              : log.action?.includes('DELETED')
                              ? 'bg-danger'
                              : 'bg-secondary'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="d-flex justify-content-between align-items-center mt-4">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ◀ Prev
                </button>
                <span className="text-muted small">
                  Showing {page * itemsPerPage + 1}-{Math.min((page + 1) * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next ▶
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Loader from '../components/Loader';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [direction, setDirection] = useState('asc');

  // Search State
  const [searchType, setSearchType] = useState('all'); // all, name, role
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRole, setSearchRole] = useState('USER');
  const [isSearching, setIsSearching] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (searchType === 'name' && searchQuery) {
        response = await axiosClient.get(`/auth/users/search/name?name=${encodeURIComponent(searchQuery)}`);
        // Search API returns List<UserResponse>, not PageResponse
        setUsers(response.data);
        setIsSearching(true);
      } else if (searchType === 'role') {
        response = await axiosClient.get(`/auth/users/search/role?role=${searchRole}`);
        setUsers(response.data);
        setIsSearching(true);
      } else {
        // Fetch paginated
        response = await axiosClient.get('/auth/users', {
          params: {
            page,
            size: 5,
            sortBy,
            direction,
          },
        });
        setUsers(response.data.content);
        setTotalPages(response.data.totalPages);
        setIsSearching(false);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, direction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleClearSearch = () => {
    setSearchType('all');
    setSearchQuery('');
    setPage(0);
    setIsSearching(false);
    // Directly triggers reload via useEffect since page reset or searchType change is tracked or fetchUsers is called
    setTimeout(() => {
      fetchUsers();
    }, 50);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This will delete all their accounts as well.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      const res = await axiosClient.delete(`/auth/users/${id}`);
      setSuccess(res.data || 'User deleted successfully.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleSort = (field) => {
    if (isSearching) return; // Disable sorting for search results since they are list responses
    if (sortBy === field) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setDirection('asc');
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-dark text-white py-3">
          <h4 className="mb-0 fw-bold">👥 User Management</h4>
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

          {/* Search Filter Header */}
          <form onSubmit={handleSearchSubmit} className="row g-2 mb-4 align-items-end">
            <div className="col-12 col-sm-3 col-md-2">
              <label className="form-label small fw-semibold">Search By</label>
              <select
                className="form-select form-select-sm"
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value);
                  setSearchQuery('');
                }}
              >
                <option value="all">All Users</option>
                <option value="name">Name</option>
                <option value="role">Role</option>
              </select>
            </div>

            {searchType === 'name' && (
              <div className="col-12 col-sm-5 col-md-6">
                <label className="form-label small fw-semibold">Enter Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter name search term..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
              </div>
            )}

            {searchType === 'role' && (
              <div className="col-12 col-sm-5 col-md-6">
                <label className="form-label small fw-semibold">Select Role</label>
                <select
                  className="form-select form-select-sm"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            )}

            <div className="col-12 col-sm-4 col-md-4 d-flex gap-2">
              {searchType !== 'all' && (
                <>
                  <button type="submit" className="btn btn-primary btn-sm flex-grow-1">
                    🔍 Search
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleClearSearch}>
                    Clear
                  </button>
                </>
              )}
            </div>
          </form>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading users...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-muted py-5">
              No users found matching requirements.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th
                        onClick={() => handleSort('id')}
                        style={{ cursor: isSearching ? 'default' : 'pointer' }}
                        className="user-select-none"
                      >
                        ID {sortBy === 'id' && !isSearching && (direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('name')}
                        style={{ cursor: isSearching ? 'default' : 'pointer' }}
                        className="user-select-none"
                      >
                        Name {sortBy === 'name' && !isSearching && (direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th
                        onClick={() => handleSort('email')}
                        style={{ cursor: isSearching ? 'default' : 'pointer' }}
                        className="user-select-none"
                      >
                        Email {sortBy === 'email' && !isSearching && (direction === 'asc' ? '▲' : '▼')}
                      </th>
                      <th>Role</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          <strong>{user.name}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link to={`/admin/users/${user.id}`} className="btn btn-sm btn-outline-secondary me-2">
                            🔎 Edit & Accounts
                          </Link>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginated Footer */}
              {!isSearching && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ◀ Prev
                  </button>
                  <span className="text-muted small">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;

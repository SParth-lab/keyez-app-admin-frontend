import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // all, admin, regular

  // Load users and statistics
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchTerm, userFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      
      if (userFilter === 'admin') filters.isAdmin = 'true';
      if (userFilter === 'regular') filters.isAdmin = 'false';
      if (searchTerm) filters.search = searchTerm;

      const response = await usersAPI.getAllUsers(currentPage, 10, filters);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setError('');
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await usersAPI.getStatistics();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id || user._id));
    }
  };

  const handleDeleteUsers = async () => {
    if (selectedUsers.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
      return;
    }

    try {
      await usersAPI.bulkOperation('delete', selectedUsers);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error deleting users:', err);
      setError('Failed to delete users');
    }
  };

  const handleToggleAdminStatus = async (user) => {
    try {
      await usersAPI.updateUser(user.id || user._id, { 
        isAdmin: !user.isAdmin 
      });
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6b7280' }}>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header with Statistics */}
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '1rem'
        }}>
          User Management
        </h2>
        
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '1rem',
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                {stats.totalUsers}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Total Users
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '1rem',
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                {stats.adminUsers}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                Admin Users
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#dcfce7',
              padding: '1rem',
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#166534' }}>
                {stats.regularUsers}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#166534' }}>
                Regular Users
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '1rem',
              borderRadius: '0.375rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                {stats.recentUsers}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                Recent (30d)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Search */}
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            minWidth: '200px'
          }}
        />

        {/* Filter */}
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}
        >
          <option value="all">All Users</option>
          <option value="admin">Admin Only</option>
          <option value="regular">Regular Only</option>
        </select>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <button
            onClick={handleDeleteUsers}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Delete Selected ({selectedUsers.length})
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          padding: '0.75rem',
          marginBottom: '1rem',
          color: '#991b1b',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  style={{ marginRight: '0.5rem' }}
                />
                Select All
              </th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Username
              </th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Role
              </th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Created
              </th>
              <th style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id || user._id}
                style={{
                  borderTop: index > 0 ? '1px solid #f3f4f6' : 'none',
                  backgroundColor: selectedUsers.includes(user.id || user._id) ? '#eff6ff' : 'white'
                }}
              >
                <td style={{ padding: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id || user._id)}
                    onChange={() => handleUserSelect(user.id || user._id)}
                  />
                </td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#111827'
                }}>
                  {user.username}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    backgroundColor: user.isAdmin ? '#fef3c7' : '#dcfce7',
                    color: user.isAdmin ? '#92400e' : '#166534'
                  }}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td style={{
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#6b7280'
                }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleAdminStatus(user)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: user.isAdmin ? '#fecaca' : '#bfdbfe',
                      color: user.isAdmin ? '#991b1b' : '#1e40af',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No users found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === 1 ? '#f3f4f6' : '#3b82f6',
              color: currentPage === 1 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          
          <span style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#3b82f6',
              color: currentPage === totalPages ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
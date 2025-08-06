import React from 'react';

const UserList = ({ users, selectedUser, onUserSelect }) => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '500',
          color: '#111827',
          margin: '0 0 0.25rem 0'
        }}>
          Users
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: 0
        }}>
          {users.length} total users
        </p>
      </div>

      {/* User list */}
      <div style={{ flex: '1', overflowY: 'auto' }}>
        {users.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            No users available
          </div>
        ) : (
          <div>
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserSelect(user)}
                style={{
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                  backgroundColor: selectedUser?.id === user.id ? '#eff6ff' : 'transparent',
                  borderRight: selectedUser?.id === user.id ? '2px solid #3b82f6' : 'none',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (selectedUser?.id !== user.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedUser?.id !== user.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  {/* Online status indicator */}
                  <div style={{
                    width: '0.75rem',
                    height: '0.75rem',
                    borderRadius: '50%',
                    backgroundColor: user.isOnline ? '#10b981' : '#9ca3af',
                    flexShrink: 0
                  }} />

                  {/* User info */}
                  <div style={{ flex: '1', minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#111827',
                      margin: '0 0 0.125rem 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {user.username}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  {/* Selection indicator */}
                  {selectedUser?.id === user.id && (
                    <div style={{ flexShrink: 0 }}>
                      <svg
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          color: '#3b82f6'
                        }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
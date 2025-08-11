import React, { useEffect, useMemo, useState } from 'react';
import { groupsAPI, usersAPI } from '../api/api';

const GroupsManagement = ({ onChanged }) => {
  const [groups, setGroups] = useState([]);
  const [groupsTotalPages, setGroupsTotalPages] = useState(1);
  const [groupsCurrentPage, setGroupsCurrentPage] = useState(1);
  const [groupsSearch, setGroupsSearch] = useState('');
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [error, setError] = useState('');

  const [regularUsers, setRegularUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [creating, setCreating] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editMembers, setEditMembers] = useState([]);
  const [updating, setUpdating] = useState(false);

  const filteredRegularUsers = useMemo(() => {
    const term = usersSearch.toLowerCase();
    return regularUsers.filter(u => u.username.toLowerCase().includes(term));
  }, [regularUsers, usersSearch]);

  useEffect(() => {
    loadGroups();
  }, [groupsCurrentPage, groupsSearch]);

  useEffect(() => {
    loadRegularUsers();
  }, []);

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      setError('');
      const res = await groupsAPI.getAll(groupsCurrentPage, 10, groupsSearch);
      setGroups(res.groups || []);
      setGroupsTotalPages(res.totalPages || 1);
    } catch (e) {
      console.error('Failed to load groups', e);
      setError('Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  const loadRegularUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await usersAPI.getAllUsers(1, 200, { isAdmin: 'false' });
      const list = (res.users || []).map(u => ({ id: u.id || u._id, username: u.username }));
      setRegularUsers(list);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setUsersLoading(false);
    }
  };

  const toggleMemberSelection = (userId, setFn) => {
    setFn(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || newGroupMembers.length < 3) return;
    try {
      setCreating(true);
      await groupsAPI.create(newGroupName.trim(), newGroupMembers);
      setNewGroupName('');
      setNewGroupMembers([]);
      await loadGroups();
      if (onChanged) onChanged();
    } catch (e) {
      console.error('Failed to create group', e);
      setError(e.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (group) => {
    setEditingGroupId(group.id || group._id);
    setEditName(group.name);
    const memberIds = (group.members || []).map(m => m.id || m._id || m);
    setEditMembers(memberIds);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditName('');
    setEditMembers([]);
  };

  const handleUpdateGroup = async () => {
    if (!editingGroupId) return;
    if (!editName.trim() || editMembers.length < 3) return;
    try {
      setUpdating(true);
      await groupsAPI.update(editingGroupId, { name: editName.trim(), members: editMembers });
      cancelEdit();
      await loadGroups();
      if (onChanged) onChanged();
    } catch (e) {
      console.error('Failed to update group', e);
      setError(e.response?.data?.error || 'Failed to update group');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (groupId) => {
    if (!confirm('Delete this group?')) return;
    try {
      await groupsAPI.remove(groupId);
      await loadGroups();
      if (onChanged) onChanged();
    } catch (e) {
      console.error('Failed to delete group', e);
      setError('Failed to delete group');
    }
  };

  return (
    <div style={{ height: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--wa-border)', backgroundColor: 'var(--wa-panel-header)' }}>
        <span style={{ fontSize: '20px', fontWeight: '500' }}>Groups Management</span>
      </div>

      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '16px', flex: 1, overflow: 'auto' }}>
        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600 }}>Create New Group</div>
          </div>
          <div style={{ padding: '16px', display: 'grid', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Members (regular users)</label>
              <input
                type="text"
                placeholder="Search users..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #eee', borderRadius: '6px', marginBottom: '8px' }}
              />
              <div style={{ maxHeight: '220px', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                {usersLoading ? (
                  <div style={{ padding: '12px', color: '#888' }}>Loading users...</div>
                ) : filteredRegularUsers.length === 0 ? (
                  <div style={{ padding: '12px', color: '#888' }}>No users found</div>
                ) : (
                  filteredRegularUsers.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #fafafa' }}>
                      <input
                        type="checkbox"
                        checked={newGroupMembers.includes(u.id)}
                        onChange={() => toggleMemberSelection(u.id, setNewGroupMembers)}
                      />
                      <span style={{ fontSize: '14px' }}>{u.username}</span>
                    </label>
                  ))
                )}
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
                Selected: {newGroupMembers.length} • Minimum 3
              </div>
            </div>
            <div>
              <button
                onClick={handleCreateGroup}
                disabled={creating || !newGroupName.trim() || newGroupMembers.length < 3}
                style={{ background: 'var(--wa-green)', color: 'white', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: creating ? 'not-allowed' : 'pointer' }}
              >
                {creating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
            {error && (
              <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', color: '#856404', padding: '8px 12px', borderRadius: '6px' }}>{error}</div>
            )}
          </div>
        </div>

        <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, flex: 1 }}>Groups</div>
            <input
              type="text"
              placeholder="Search groups..."
              value={groupsSearch}
              onChange={(e) => setGroupsSearch(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', minWidth: '220px' }}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {groupsLoading ? (
              <div style={{ padding: '16px', color: '#888' }}>Loading groups...</div>
            ) : groups.length === 0 ? (
              <div style={{ padding: '24px', color: '#888' }}>No groups found</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '13px', color: '#374151' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '13px', color: '#374151' }}>Members</th>
                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '13px', color: '#374151' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '10px', fontSize: '13px', color: '#374151' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, idx) => {
                    const groupId = g.id || g._id;
                    const isEditing = editingGroupId === groupId;
                    const memberList = (g.members || []).map(m => m.username || m).join(', ');
                    return (
                      <tr key={groupId} style={{ borderTop: idx === 0 ? 'none' : '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }} />
                          ) : (
                            <span style={{ fontWeight: 500 }}>{g.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <div>
                              <div style={{ maxHeight: '180px', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                                {filteredRegularUsers.map(u => (
                                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #fafafa' }}>
                                    <input
                                      type="checkbox"
                                      checked={editMembers.includes(u.id)}
                                      onChange={() => toggleMemberSelection(u.id, setEditMembers)}
                                    />
                                    <span style={{ fontSize: '14px' }}>{u.username}</span>
                                  </label>
                                ))}
                              </div>
                              <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>Selected: {editMembers.length} • Minimum 3</div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '13px', color: '#374151' }}>{memberList}</span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '12px', background: g.isActive ? '#dcfce7' : '#fee2e2', color: g.isActive ? '#166534' : '#991b1b' }}>
                            {g.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          {isEditing ? (
                            <>
                              <button onClick={handleUpdateGroup} disabled={updating || !editName.trim() || editMembers.length < 3} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: updating ? 'not-allowed' : 'pointer', marginRight: '8px' }}>Save</button>
                              <button onClick={cancelEdit} style={{ background: '#e5e7eb', color: '#111827', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => openEdit(g)} style={{ background: '#bfdbfe', color: '#1e40af', border: 'none', padding: '6px 10px', borderRadius: '6px', marginRight: '8px' }}>Edit</button>
                              <button onClick={() => handleDelete(groupId)} style={{ background: '#fecaca', color: '#991b1b', border: 'none', padding: '6px 10px', borderRadius: '6px' }}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
          {groupsTotalPages > 1 && (
            <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', borderTop: '1px solid #f0f0f0' }}>
              <button onClick={() => setGroupsCurrentPage(p => Math.max(1, p - 1))} disabled={groupsCurrentPage === 1} style={{ padding: '6px 10px', background: groupsCurrentPage === 1 ? '#f3f4f6' : '#3b82f6', color: groupsCurrentPage === 1 ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px' }}>Prev</button>
              <span style={{ padding: '6px 10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '13px' }}>Page {groupsCurrentPage} of {groupsTotalPages}</span>
              <button onClick={() => setGroupsCurrentPage(p => Math.min(groupsTotalPages, p + 1))} disabled={groupsCurrentPage === groupsTotalPages} style={{ padding: '6px 10px', background: groupsCurrentPage === groupsTotalPages ? '#f3f4f6' : '#3b82f6', color: groupsCurrentPage === groupsTotalPages ? '#9ca3af' : 'white', border: 'none', borderRadius: '6px' }}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupsManagement;



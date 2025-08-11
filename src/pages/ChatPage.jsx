import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../utils/auth';
import { usersAPI, chatAPI, groupsAPI } from '../api/api';
import RealTimeChatWindow from '../components/RealTimeChatWindow';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import UserManagement from '../components/UserManagement';
import GroupsManagement from '../components/GroupsManagement';

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (!user.isAdmin) {
      console.log('User is not admin, redirecting to login');
      navigate('/login');
      return;
    }
    
    console.log('Authenticated admin user:', user);
    setCurrentUser(user);
    loadUsers();
    loadGroups();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('Loading users...');
      console.log('API Base URL:', import.meta.env.VITE_API_URL || 'https://keyez-dev.descube.in/api');
      console.log('Auth Token:', localStorage.getItem('adminToken') ? 'Present' : 'Missing');
      
      const response = await usersAPI.getAllUsers(1, 50);
      console.log('Users API response:', response);
      
      if (response && response.users && Array.isArray(response.users)) {
        // Add online status simulation
        const usersWithStatus = response.users.map(user => ({
          ...user,
          id: user.id || user._id, // Ensure we have an ID field
          isOnline: Math.random() > 0.5,
          lastSeen: 'Last seen recently'
        }));
        console.log(`Processed ${usersWithStatus.length} users:`, usersWithStatus);
        setUsers(usersWithStatus);
      } else {
        console.error('Invalid response structure:', response);
        console.error('Expected: { users: [...] }, got:', typeof response, response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setSidebarVisible(false);
    
    try {
      console.log('Loading conversation for user:', user);
      const response = await chatAPI.getConversation(user.id);
      console.log('Conversation API response:', response);
      
      if (response && response.conversation) {
        setMessages(response.conversation);
      } else {
        console.log('No conversation found, setting empty messages');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      setMessages([]);
    }
  };

  const handleGroupSelect = async (group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
    setSidebarVisible(false);
    try {
      const response = await chatAPI.getGroupMessages(group.id);
      setGroupMessages(
        (response.messages || []).map(m => ({
          id: m.id,
          sender: m.from?.id,
          senderInfo: m.from,
          text: m.text,
          timestamp: m.timestamp,
        }))
      );
    } catch (e) {
      console.error('Error loading group messages:', e);
      setGroupMessages([]);
    }
  };

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await groupsAPI.getAll(1, 100);
      const list = (response.groups || []).map(g => ({
        id: g.id || g._id,
        name: g.name,
        members: g.members || [],
        isActive: g.isActive,
      }));
      setGroups(list);
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!selectedUser || !messageText.trim()) return;

    const tempMessage = {
      id: Date.now(),
      text: messageText,
      sender: currentUser.id,
      timestamp: new Date().toISOString(),
      formattedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      await chatAPI.sendMessage(selectedUser.id, messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatarColor = (username) => {
    const colors = [
      '#00a884', '#128c7e', '#25d366', '#34b7f1', '#8696a0',
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="whatsapp-container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%',
          fontSize: '18px',
          color: 'var(--wa-text-muted)'
        }}>
          Loading KeyezApp...
        </div>
      </div>
    );
  }

  if (activeTab === 'users') {
    return (
      <div style={{ height: '100vh', backgroundColor: 'white' }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--wa-border)',
          backgroundColor: 'var(--wa-panel-header)'
        }}>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: 'var(--wa-green)',
              cursor: 'pointer',
              marginRight: '16px'
            }}
          >
            ← Back to Chat
          </button>
          <span style={{ fontSize: '20px', fontWeight: '500' }}>User Management</span>
        </div>
        <UserManagement />
      </div>
    );
  }

  if (activeTab === 'groups') {
    return (
      <div style={{ height: '100vh', backgroundColor: 'white' }}>
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid var(--wa-border)',
          backgroundColor: 'var(--wa-panel-header)'
        }}>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: 'var(--wa-green)',
              cursor: 'pointer',
              marginRight: '16px'
            }}
          >
            ← Back to Chat
          </button>
          <span style={{ fontSize: '20px', fontWeight: '500' }}>Groups Management</span>
        </div>
        <GroupsManagement onChanged={loadUsers} />
      </div>
    );
  }

  return (
    <div className="whatsapp-container">
      {/* Mobile Backdrop */}
      <div 
        className={`mobile-backdrop ${sidebarVisible ? 'show' : ''}`}
        onClick={() => setSidebarVisible(false)}
      />

      {/* Sidebar */}
      <div className={`whatsapp-sidebar ${sidebarVisible ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div 
                className="avatar"
                style={{ backgroundColor: getAvatarColor(currentUser?.username || 'A') }}
              >
                {currentUser?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setActiveTab('users')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--wa-text-muted)',
                  cursor: 'pointer',
                  padding: '8px'
                }}
                title="User Management"
              >
                👥
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--wa-text-muted)',
                  cursor: 'pointer',
                  padding: '8px'
                }}
                title="Groups Management"
              >
                🧑‍🤝‍🧑
              </button>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--wa-text-muted)',
                  cursor: 'pointer',
                  padding: '8px'
                }}
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search or start new chat"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="contact-list">
          {isLoading ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center',
              color: 'var(--wa-text-muted)'
            }}>
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center',
              color: 'var(--wa-text-muted)'
            }}>
              No contacts found
              <br />
              <small>Check console for API errors</small>
            </div>
          ) : (
            <>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`contact-item ${selectedUser?.id === user.id ? 'active' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <div 
                  className={`avatar ${user.isOnline ? 'avatar-online' : ''}`}
                  style={{ backgroundColor: getAvatarColor(user.username) }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="contact-info">
                  <h3 className="contact-name">{user.username}</h3>
                  <p className="contact-status">
                    {user.isAdmin ? '👑 Admin' : user.isOnline ? 'Online' : user.lastSeen}
                  </p>
                </div>
                <div className="contact-time">
                  {user.isOnline ? 'now' : '12:45 PM'}
                </div>
              </div>
            ))}

            {/* Groups Section */}
            <div style={{ padding: '8px 16px', color: 'var(--wa-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Groups
            </div>
            {groupsLoading ? (
              <div style={{ padding: '12px 16px', color: 'var(--wa-text-muted)' }}>Loading groups...</div>
            ) : filteredGroups.length === 0 ? (
              <div style={{ padding: '12px 16px', color: 'var(--wa-text-muted)' }}>No groups</div>
            ) : (
              filteredGroups.map(group => (
                <div
                  key={group.id}
                  className={`contact-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
                  onClick={() => handleGroupSelect(group)}
                  title="Open Group Chat"
                >
                  <div 
                    className="avatar"
                    style={{ backgroundColor: '#4ecdc4' }}
                  >
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="contact-info">
                    <h3 className="contact-name">{group.name}</h3>
                    <p className="contact-status">{group.members.length} members</p>
                  </div>
                  <div className="contact-time">
                    {group.isActive ? 'active' : 'inactive'}
                  </div>
                </div>
              ))
            )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="whatsapp-main">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="header-left">
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: 'var(--wa-text-muted)',
                    cursor: 'pointer',
                    marginRight: '16px',
                    display: 'none'
                  }}
                  className="mobile-menu-btn"
                >
                  ←
                </button>
                <div 
                  className={`avatar ${selectedUser.isOnline ? 'avatar-online' : ''}`}
                  style={{ backgroundColor: getAvatarColor(selectedUser.username) }}
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: '400',
                    color: 'var(--wa-text-primary)'
                  }}>
                    {selectedUser.username}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px',
                    color: 'var(--wa-text-muted)'
                  }}>
                    {selectedUser.isOnline ? 'online' : selectedUser.lastSeen}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-background">
              <RealTimeChatWindow
                currentUserId={currentUser?.id}
                selectedUserId={selectedUser?.id}
                fallbackMessages={messages}
              />
            </div>

            {/* Message Input */}
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : selectedGroup ? (
          <>
            {/* Group Chat Header */}
            <div className="chat-header">
              <div className="header-left">
                <button
                  onClick={toggleSidebar}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    color: 'var(--wa-text-muted)',
                    cursor: 'pointer',
                    marginRight: '16px',
                    display: 'none'
                  }}
                  className="mobile-menu-btn"
                >
                  ←
                </button>
                <div 
                  className="avatar"
                  style={{ backgroundColor: '#4ecdc4' }}
                >
                  {selectedGroup.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ marginLeft: '12px' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: '400',
                    color: 'var(--wa-text-primary)'
                  }}>
                    {selectedGroup.name}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '13px',
                    color: 'var(--wa-text-muted)'
                  }}>
                    {selectedGroup.members?.length || 0} members
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-background">
              <RealTimeChatWindow
                currentUserId={currentUser?.id}
                selectedGroupId={selectedGroup?.id}
                fallbackMessages={groupMessages}
              />
            </div>

            {/* Message Input */}
            <MessageInput onSendMessage={async (text) => {
              if (!text.trim() || !selectedGroup) return;
              const temp = {
                id: Date.now(),
                text,
                sender: currentUser.id,
                timestamp: new Date().toISOString(),
              };
              setGroupMessages(prev => [...prev, temp]);
              try {
                await chatAPI.sendGroupMessage(selectedGroup.id, text);
              } catch (e) {
                console.error('Error sending group message:', e);
                setGroupMessages(prev => prev.filter(m => m.id !== temp.id));
              }
            }} />
          </>
        ) : (
          <div className="empty-chat">
            <div style={{ 
              fontSize: '80px',
              marginBottom: '24px',
              opacity: 0.4
            }}>
              💬
            </div>
            <h1 className="empty-chat-title">KeyezApp Web</h1>
            <p className="empty-chat-subtitle">
              Send and receive messages without keeping your phone online.<br/>
              Use KeyezApp on up to 4 linked devices and 1 phone at the same time.
            </p>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'var(--wa-green)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '20px',
                display: 'none'
              }}
              className="mobile-menu-btn"
            >
              Start Messaging
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
import React, { useState, useEffect, useRef } from 'react';
import { useRealTimeMessages, useRealTimeGroupMessages } from '../firebase/firebase';

const RealTimeChatWindow = ({ currentUserId, selectedUserId, selectedGroupId, fallbackMessages = [] }) => {
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Try to use real-time messages, fall back to provided messages
  const { messages: realTimeMessages, loading } = selectedGroupId
    ? (useRealTimeGroupMessages(selectedGroupId) || {})
    : (useRealTimeMessages(currentUserId, selectedUserId) || {});
  
  // Use real-time messages if available, otherwise use fallback
  const messages = realTimeMessages && realTimeMessages.length > 0 ? realTimeMessages : fallbackMessages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format time to HH:MM format
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (error) {
      return '';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="messages-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          color: 'var(--wa-text-muted)'
        }}>
          Loading messages...
        </div>
      </div>
    );
  }

  const getDateHeader = () => {
 // Find the first message's date
 const firstDate = new Date(messages[0].timestamp);
 const today = new Date();
 const yesterday = new Date();
 yesterday.setDate(today.getDate() - 1);

 // Helper to compare dates (ignoring time)
 const isSameDay = (d1, d2) =>
   d1.getFullYear() === d2.getFullYear() &&
   d1.getMonth() === d2.getMonth() &&
   d1.getDate() === d2.getDate();

 if (isSameDay(firstDate, today)) {
   return "Today";
 } else if (isSameDay(firstDate, yesterday)) {
   return "Yesterday";
 } else {
   // If all messages are from the same day, show that date
   const allSameDay = messages.every(
     m => isSameDay(new Date(m.timestamp), firstDate)
   );
   if (allSameDay) {
     return formatDate(messages[0].timestamp);
   }
   // Otherwise, show the date of the first message
   return formatDate(messages[0].timestamp);
 }
  }

  return (
    <div className="messages-container">
      {error && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          padding: '8px 12px',
          margin: '12px 0',
          fontSize: '13px',
          color: '#856404'
        }}>
          ⚠️ Real-time updates unavailable
        </div>
      )}
      
      {messages.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          textAlign: 'center',
          color: 'var(--wa-text-muted)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💬</div>
          <p style={{ margin: 0, fontSize: '16px' }}>No messages yet</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Start the conversation!</p>
        </div>
      ) : (
        <>
          {/* Date Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '20px 0',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '7.5px',
              padding: '5px 12px',
              fontSize: '12.5px',
              color: 'var(--wa-text-muted)',
              boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)'
            }}>
              {getDateHeader()}
            </div>
          </div>

          {messages.map((message, index) => {
            // Handle both Firebase message format and API message format
            const isCurrentUser = message.from?.id === currentUserId || message.sender === currentUserId;
            const messageText = message.text || message.content || '';
            const messageTime = message.timestamp || message.formattedTimestamp || message.createdAt;
            const senderName = message.from?.username || message.senderInfo?.username || 'Unknown';
            
            return (
              <div
                key={message.id || index}
                className={`message-row ${isCurrentUser ? 'outgoing' : 'incoming'}`}
              >
                <div className={`message-bubble ${isCurrentUser ? 'outgoing' : 'incoming'}`}>
                  {/* Show sender name for received messages in group chats */}
                  {!isCurrentUser && (
                    <div style={{
                      fontSize: '12.8px',
                      fontWeight: '500',
                      color: 'var(--wa-green)',
                      marginBottom: '2px'
                    }}>
                      {senderName}
                    </div>
                  )}
                  
                  <p className="message-text">{messageText}</p>
                  
                  <div className="message-time">
                    <span>{formatTime(messageTime)}</span>
                    {isCurrentUser && (
                      <span className="message-status" title="Delivered">
                        ✓✓
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default RealTimeChatWindow;
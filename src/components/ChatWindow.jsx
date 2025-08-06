import React, { useEffect, useRef } from 'react';

const ChatWindow = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (messages.length === 0) {
    return (
      <div style={{
        padding: '1.5rem',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div style={{
      padding: '1rem',
      height: '100%',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => {
          const isCurrentUser = message.sender === currentUserId || 
                               (message.senderInfo && message.senderInfo.id === currentUserId);
          
          return (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isCurrentUser ? 'flex-end' : 'flex-start'
              }}>
                {/* Message bubble */}
                <div style={{
                  backgroundColor: isCurrentUser ? '#3b82f6' : '#f3f4f6',
                  color: isCurrentUser ? 'white' : '#111827',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  borderBottomRightRadius: isCurrentUser ? '0.25rem' : '1rem',
                  borderBottomLeftRadius: isCurrentUser ? '1rem' : '0.25rem',
                  wordWrap: 'break-word'
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    lineHeight: '1.25'
                  }}>
                    {message.text}
                  </p>
                </div>
                
                {/* Timestamp */}
                <span style={{
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  marginTop: '0.25rem',
                  paddingLeft: isCurrentUser ? 0 : '0.5rem',
                  paddingRight: isCurrentUser ? '0.5rem' : 0
                }}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
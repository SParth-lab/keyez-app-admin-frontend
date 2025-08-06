import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      resetTextareaHeight();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    autoResizeTextarea();
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
  };

  const resetTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '20px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [message]);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit}>
        <div className="message-input-wrapper">
          {/* Emoji Button */}
          <button 
            type="button"
            className="emoji-button"
            title="Emoji"
          >
            😊
          </button>

          {/* Attach Button */}
          <button 
            type="button"
            className="attach-button"
            title="Attach"
          >
            📎
          </button>

          {/* Message Input Field */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            className="message-input-field"
            rows={1}
            style={{
              height: '20px',
              overflow: 'hidden'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="input-button"
            title="Send"
          >
            {message.trim() ? '➤' : '🎤'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
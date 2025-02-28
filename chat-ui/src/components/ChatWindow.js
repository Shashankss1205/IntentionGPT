
// components/ChatWindow.js
import React from 'react';
import './ChatWindow.css';
import Message from './Message';

function ChatWindow({ messages, isLoading, chatEndRef }) {
  const EmptyState = () => (
    <div className="empty-state">
      <h1>What can I help with?</h1>
      <div className="input-placeholder">
        Ask anything in the text box below...
      </div>
      <div className="options">
        <button className="option">
          <span className="icon">+</span>
        </button>
        <button className="option">
          <span className="icon">🔍</span>
          <span>Search</span>
        </button>
        <button className="option">
          <span className="icon">🧠</span>
          <span>Reason</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
          {isLoading && (
            <div className="loading-indicator">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;

import React, { useState, useEffect } from 'react';
import './Message.css';
import ReactMarkdown from 'react-markdown';

function Message({ message }) {
  const { role, content } = message;
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
  
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedText(content.slice(0, index + 1)); // Use slice for accurate updates
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20); // Adjust speed as needed
  
    return () => clearInterval(interval);
  }, [content]);
  
  return (
    <div className={`message ${role}`}>
      <div className="avatar">
        {role === 'user' ? '👤' : role === 'assistant' ? '🤖' : '⚠️'}
      </div>
      <div className="content">
        <ReactMarkdown>{displayedText}</ReactMarkdown>
        {/* {displayedText} */}
      </div>
      {role === 'assistant' && (
        <div className="message-actions">
          <button className="action-button">📋</button>
          <button className="action-button">👍</button>
          <button className="action-button">👎</button>
          <button className="action-button">🔊</button>
          <button className="action-button">📎</button>
          <button className="action-button">↻</button>
        </div>
      )}
    </div>
  );
}

export default Message;

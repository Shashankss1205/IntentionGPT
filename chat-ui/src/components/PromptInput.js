// components/PromptInput.js (Updated)
import React, { useState } from 'react';
import './PromptInput.css';
import MultiModalInput from './MultiModalInput';


function PromptInput({ onSendMessage, isLoading }) {
  const [message, setMessage] = useState('');
  const [showMultiModal, setShowMultiModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
      
  const handleSubmit = async(e) => {
    e.preventDefault();
    if ((!message.trim() && attachedFiles.length === 0) || isLoading) return;
    
    // Send both text message and files
    onSendMessage(message, attachedFiles);
    setMessage('');
    setAttachedFiles([]);
  };
  
  const handleFileSubmit = async(files) => {
    console.log(files)
    setAttachedFiles(files);
    setShowMultiModal(false);
  };
  
  const removeAttachedFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="prompt-container">
      {attachedFiles.length > 0 && (
        <div className="attached-files">
          {attachedFiles.map((file, index) => (
            <div key={index} className="attached-file">
              <span className="file-type-icon">
                {file.type.includes('image') ? '🖼️' : 
                 file.type.includes('audio') ? '🔊' : 
                 file.type.includes('video') ? '🎬' : 
                 file.type.includes('pdf') ? '📄' : '📝'}
              </span>
              <span className="file-name">{file.name}</span>
              <button 
                className="remove-attachment"
                onClick={() => removeAttachedFile(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="prompt-form">
        <button 
          type="button" 
          className="option-button plus-button"
          onClick={() => setShowMultiModal(true)}
        >
          +
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything"
          disabled={isLoading}
          className="prompt-input"
        />
        
        <button type="button" className="option-button search-button">🔍</button>
        <button type="button" className="option-button reason-button">💡</button>
        
        <button 
          type="submit" 
          className="send-button"
          disabled={(!message.trim() && attachedFiles.length === 0) || isLoading}
        >
          {isLoading ? '...' : '→'}
        </button>
      </form>
      
      <div className="disclaimer">
        AI can make mistakes. Check important info.
      </div>
      
      {showMultiModal && (
        <MultiModalInput 
          onFileSubmit={handleFileSubmit}
          onClose={() => setShowMultiModal(false)}
        />
      )}
    </div>
  );
}

export default PromptInput;
import React, { useState, useRef } from 'react';
import './MultiModalInput.css';

function MultiModalInput({ onFileSubmit, onClose }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      console.log('Files selected:', filesArray.map(f => `${f.name} (${f.type})`));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    onFileSubmit(selectedFiles);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="multi-modal-overlay">
      <div className="multi-modal-container">
        <div className="multi-modal-header">
          <h3>Add files</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="upload-options">
          <div className="upload-option" onClick={() => console.log('Google Drive clicked')}>
            <div className="option-icon google-drive">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M4.5,13.5L8,8L16,8L12.5,13.5L4.5,13.5Z" fill="#4285F4" />
                <path d="M8,8L12.5,16L16,8L8,8Z" fill="#FBBC05" />
                <path d="M12.5,16L16,8L20,16L16,16L12.5,16Z" fill="#34A853" />
                <path d="M4.5,13.5L7,19.5L12.5,16L8,13.5L4.5,13.5Z" fill="#EA4335" />
              </svg>
            </div>
            <span>Connect to Google Drive</span>
          </div>
          
          <div className="upload-option" onClick={() => console.log('OneDrive clicked')}>
            <div className="option-icon onedrive">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M10.5,12.5L7.5,15.5L2,14L5,17H19L22,14L16.5,15.5L13.5,12.5L10.5,7L7.5,9L10.5,12.5Z" fill="#0078D4" />
              </svg>
            </div>
            <span>Connect to Microsoft OneDrive</span>
            <span className="arrow">›</span>
          </div>
          
          <div className="divider"></div>
          
          <div className="upload-option" onClick={handleUploadClick}>
            <div className="option-icon upload">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
              </svg>
            </div>
            <span>Upload from computer</span>
            <input 
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
            />
          </div>
        </div>
        
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h4>Selected files:</h4>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <div className="file-info">
                    <span className="file-icon">
                      {file.type.includes('image') ? '🖼️' : 
                       file.type.includes('pdf') ? '📄' : '📝'}
                    </span>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </li>
              ))}
            </ul>
            <button 
              className="submit-files-button"
              onClick={handleSubmit}
            >
              Add {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiModalInput;
import React, { useState, useEffect } from 'react';

const SpeechBubble = ({ 
  message, 
  suggestions = [], 
  isVisible, 
  onClose, 
  onAction,
  isLoading = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible]);

  if (!isVisible && !isAnimating) return null;

  const handleActionClick = (action) => {
    onAction && onAction(action);
  };

  return (
    <div className={`clippy-bubble ${isAnimating ? 'show' : ''}`}>
      <button className="close-btn" onClick={onClose} title="Close">
        ×
      </button>
      
      <div className="bubble-header">
        <span className="clippy-emoji">📎</span>
        <span>Clippy here!</span>
      </div>

      <div className="bubble-message">
        {isLoading ? (
          <span className="loading-dots">Thinking</span>
        ) : (
          message
        )}
      </div>

      {suggestions.length > 0 && !isLoading && (
        <div className="bubble-actions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`bubble-btn ${suggestion.type || ''}`}
              onClick={() => handleActionClick(suggestion)}
              disabled={isLoading}
            >
              {suggestion.icon && <span>{suggestion.icon}</span>}
              {suggestion.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeechBubble;
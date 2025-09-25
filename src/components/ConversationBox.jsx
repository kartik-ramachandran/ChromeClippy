import React, { useState, useRef, useEffect } from 'react';

const ConversationBox = ({ 
  isVisible, 
  onClose, 
  onSendMessage,
  onScreenshot,
  onFileAccess,
  messages = [],
  isLoading = false 
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleScreenshot = () => {
    onScreenshot();
  };

  const handleFileAccess = () => {
    onFileAccess();
  };

  if (!isVisible) return null;

  return (
    <div className={`conversation-box ${isExpanded ? 'expanded' : ''}`}>
      <div className="conversation-header">
        <div className="header-left">
          <span className="clippy-emoji">📎</span>
          <span className="conversation-title">Chat with Clippy</span>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn screenshot-btn" 
            onClick={handleScreenshot}
            title="Take screenshot for context"
          >
            📸
          </button>
          <button 
            className="action-btn files-btn" 
            onClick={handleFileAccess}
            title="Access files and folders"
          >
            📁
          </button>
          <button 
            className="action-btn expand-btn" 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? '📉' : '📈'}
          </button>
          <button className="action-btn close-btn" onClick={onClose} title="Close chat">
            ✕
          </button>
        </div>
      </div>

      <div className="conversation-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="clippy-avatar">📎</div>
            <div className="welcome-text">
              <h3>Hi there! I'm your AI assistant! 🤖</h3>
              <p>I can help you with:</p>
              <ul>
                <li>✍️ Writing and editing text</li>
                <li>🌍 Translating languages</li>
                <li>📄 Summarizing content</li>
                <li>💻 Explaining code</li>
                <li>📸 Analyzing screenshots</li>
                <li>📁 Working with your files</li>
              </ul>
              <p><strong>Try asking:</strong> "What's on my screen?" or "Help me write an email"</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user' ? '👤' : '📎'}
              </div>
              <div className="message-content">
                {message.type === 'user' ? (
                  <div className="user-message">{message.content}</div>
                ) : (
                  <div className="clippy-message">
                    {message.content}
                    {message.screenshot && (
                      <div className="screenshot-preview">
                        <img src={message.screenshot} alt="Screenshot" />
                        <span>📸 Screenshot analyzed</span>
                      </div>
                    )}
                    {message.suggestions && (
                      <div className="message-suggestions">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            className="suggestion-btn"
                            onClick={() => onSendMessage(suggestion.text)}
                          >
                            {suggestion.icon} {suggestion.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message clippy">
            <div className="message-avatar">📎</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
                Clippy is thinking...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="conversation-input">
        <div className="input-actions">
          <button 
            className="quick-action-btn" 
            onClick={() => setInputText("What's on my screen right now?")}
            title="Analyze current page"
          >
            👀
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => setInputText("Help me write something")}
            title="Writing assistance"
          >
            ✍️
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => setInputText("Show me my files")}
            title="File browser"
          >
            📂
          </button>
        </div>
        
        <div className="input-row">
          <textarea
            ref={inputRef}
            className="chat-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={isExpanded ? 3 : 1}
            disabled={isLoading}
          />
          <button 
            className="send-btn" 
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? '⏳' : '🚀'}
          </button>
        </div>
        
        <div className="input-hint">
          💡 Try: "Take a screenshot and tell me what you see" or "Help me organize my desktop files"
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
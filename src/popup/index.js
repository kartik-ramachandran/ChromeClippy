import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const SettingsPopup = () => {
  const [settings, setSettings] = useState({
    clippyEnabled: true,
    helpWithWriting: true,
    helpWithTranslation: true,
    helpWithSummarization: true,
    helpWithCode: true,
    personalityLevel: 'classic'
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.sync.get([
        'clippyEnabled',
        'helpWithWriting',
        'helpWithTranslation',
        'helpWithSummarization',
        'helpWithCode',
        'personalityLevel'
      ]);
      
      setSettings(prev => ({ ...prev, ...result }));
    } catch (error) {
      console.log('Could not load settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await chrome.storage.sync.set(newSettings);
      setSaveStatus('Settings saved! 📎');
      setTimeout(() => setSaveStatus(''), 2000);
      
      // Notify content scripts of settings change
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SETTINGS_UPDATED', settings: newSettings });
      }
    } catch (error) {
      setSaveStatus('Error saving settings 😅');
      console.error('Save error:', error);
    }
  };

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handlePersonalityChange = (level) => {
    const newSettings = { ...settings, personalityLevel: level };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="popup-container">
      <div className="header">
        <span className="clippy-icon">📎</span>
        <h1>AI Clippy 2025</h1>
      </div>
      
      <div className={`status ${settings.clippyEnabled ? 'enabled' : ''}`}>
        <span>
          {settings.clippyEnabled 
            ? '🟢 Clippy is active and ready to help!' 
            : '⭕ Clippy is disabled'
          }
        </span>
      </div>

      {saveStatus && (
        <div className="status enabled">
          {saveStatus}
        </div>
      )}
      
      <div className="setting-group">
        <label className="setting-label">Features</label>
        
        <SettingToggle
          icon="✍️"
          label="Writing Help"
          checked={settings.helpWithWriting}
          onChange={() => handleToggle('helpWithWriting')}
        />
        
        <SettingToggle
          icon="🌍"
          label="Translation"
          checked={settings.helpWithTranslation}
          onChange={() => handleToggle('helpWithTranslation')}
        />
        
        <SettingToggle
          icon="📄"
          label="Summarization"
          checked={settings.helpWithSummarization}
          onChange={() => handleToggle('helpWithSummarization')}
        />
        
        <SettingToggle
          icon="💻"
          label="Code Help"
          checked={settings.helpWithCode}
          onChange={() => handleToggle('helpWithCode')}
        />
      </div>
      
      <div className="setting-group">
        <label className="setting-label">Personality</label>
        <div className="personality-selector">
          {['subtle', 'classic', 'extra'].map(level => (
            <button
              key={level}
              className={`personality-btn ${settings.personalityLevel === level ? 'active' : ''}`}
              onClick={() => handlePersonalityChange(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="setting-group">
        <SettingToggle
          icon="📎"
          label="Enable Clippy"
          checked={settings.clippyEnabled}
          onChange={() => handleToggle('clippyEnabled')}
        />
      </div>
      
      <div className="footer">
        <div>Built for Google Chrome AI Challenge 2025</div>
        <div className="version">v1.0.0 - Using Chrome Built-in AI APIs</div>
      </div>
    </div>
  );
};

const SettingToggle = ({ icon, label, checked, onChange }) => {
  return (
    <div className="setting-item">
      <span>{icon} {label}</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className="slider"></span>
      </label>
    </div>
  );
};

// Initialize popup
const container = document.getElementById('root') || document.body;
const root = ReactDOM.createRoot(container);
root.render(<SettingsPopup />);
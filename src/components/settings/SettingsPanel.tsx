import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Slider from '../ui/Slider';

interface Settings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: 'light' | 'dark';
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: Settings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState<Settings>({
    model: 'GigaChat',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    systemPrompt: 'Вы полезный ассистент.',
    theme: 'light',
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const handleSave = () => {
    onSave?.(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({
      model: 'GigaChat',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      systemPrompt: 'Вы полезный ассистент.',
      theme: 'light',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-drawer">
        <button className="settings-close-btn" onClick={onClose}>
          ✕
        </button>
        
        <div className="settings-content">
          <h2>Настройки</h2>
          
          <div className="settings-group">
            <label>Модель</label>
            <select
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="settings-select"
            >
              <option>GigaChat</option>
              <option>GigaChat-Plus</option>
              <option>GigaChat-Pro</option>
              <option>GigaChat-Max</option>
            </select>
          </div>

          <div className="settings-group">
            <label>Temperature: {settings.temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="slider-input"
            />
          </div>

          <div className="settings-group">
            <label>Top-P: {settings.topP}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.topP}
              onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
              className="slider-input"
            />
          </div>

          <div className="settings-group">
            <label>Max Tokens</label>
            <input
              type="number"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              min="1"
              max="8192"
              className="settings-input"
            />
          </div>

          <div className="settings-group">
            <label>System Prompt</label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              rows={4}
              className="settings-textarea"
            />
          </div>

          <div className="settings-group">
            <label>Тема</label>
            <div className="theme-buttons">
              <Button
                variant={settings.theme === 'light' ? 'primary' : 'secondary'}
                onClick={() => setSettings({ ...settings, theme: 'light' })}
              >
                Светлая
              </Button>
              <Button
                variant={settings.theme === 'dark' ? 'primary' : 'secondary'}
                onClick={() => setSettings({ ...settings, theme: 'dark' })}
              >
                Тёмная
              </Button>
            </div>
          </div>

          <div className="settings-actions">
            <Button variant="primary" onClick={handleSave}>
              Сохранить
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Сбросить
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
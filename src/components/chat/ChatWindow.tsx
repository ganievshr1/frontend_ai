// src/components/chat/ChatWindow.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsPanel from '../settings/SettingsPanel';
import EmptyState from '../ui/EmptyState';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../store/chatStore';
import { GigaChatMessage } from '../../services/gigachatApi';
import './ChatWindow.css';

const ChatWindow: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMountedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    activeChat, 
    messages, 
    isLoading, 
    error,
    sendMessage, 
    stopGeneration,
    clearChat 
  } = useChat();
  
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const updateChatMessages = useChatStore((state) => state.updateChatMessages);

  // Синхронизация сообщений из хука в store
  useEffect(() => {
    if (activeChat?.id && messages.length > 0) {
      // Фильтруем system сообщения для отображения, но храним в store все
      const displayMessages = messages.filter((m: GigaChatMessage) => m.role !== 'system');
      updateChatMessages(activeChat.id, displayMessages);
    }
  }, [messages, activeChat?.id, updateChatMessages]);

  // Авто-скролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Обработка выбора чата из URL
  useEffect(() => {
    if (!isMountedRef.current && id && chats.length > 0) {
      isMountedRef.current = true;
      const chat = chats.find(c => c.id === id);
      if (chat && (!activeChat || activeChat.id !== id)) {
        setActiveChat(id);
      }
    }
    
    // Если чат удалён или не найден — редирект на первый доступный
    if (id && chats.length > 0 && !chats.find(c => c.id === id)) {
      navigate(`/chat/${chats[0].id}`, { replace: true });
    }
  }, [id, chats, activeChat, setActiveChat, navigate]);

  // Обработчик отправки сообщения
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !activeChat) return;
    
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Ошибка уже обработана в useChat и отображается в UI
    }
  }, [sendMessage, activeChat]);

  // Обработчик очистки чата
  const handleClearChat = useCallback(() => {
    if (activeChat) {
      clearChat();
    }
  }, [clearChat, activeChat]);

  if (!activeChat) {
    return <EmptyState message="Выберите чат для начала диалога" />;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-left">
          <h2 className="chat-title">{activeChat.title}</h2>
          {activeChat.model && (
            <span className="chat-model-badge">{activeChat.model}</span>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="icon-btn clear-btn"
            onClick={handleClearChat}
            title="Очистить чат"
            disabled={isLoading}
          >
            🗑️
          </button>
          <button 
            className="settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            title="Настройки модели"
          >
            ⚙️
          </button>
        </div>
      </div>
      
      {/* Блок ошибок */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
          <button 
            className="error-dismiss"
            onClick={() => {}}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Список сообщений */}
      <div className="messages-container">
        <MessageList 
          messages={messages.filter((m: GigaChatMessage) => m.role !== 'system')} 
          isTyping={isLoading} 
        />
        <div ref={messagesEndRef} className="messages-end-anchor" />
      </div>
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="typing-indicator-container">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <button 
            className="stop-generation-btn"
            onClick={stopGeneration}
          >
            ⏹ Остановить
          </button>
        </div>
      )}
      
      {/* Область ввода */}
      <InputArea 
        onSendMessage={handleSendMessage}
        onStopGeneration={stopGeneration}
        isLoading={isLoading}
        disabled={!activeChat}
      />
      
      {/* Панель настроек */}
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        chatId={activeChat.id}
      />
    </div>
  );
};

export default ChatWindow;
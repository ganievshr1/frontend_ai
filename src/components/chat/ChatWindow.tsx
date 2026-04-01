import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsPanel from '../settings/SettingsPanel';
import EmptyState from '../ui/EmptyState';
import { useChat } from '../../hooks/useChat';
import { useChatStore } from '../../store/chatStore';

const ChatWindow: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const isMountedRef = useRef(false);
  
  const { activeChat, messages, isLoading, sendMessage, stopGeneration } = useChat();
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  // Только при монтировании: если URL есть, но активный чат не соответствует
  useEffect(() => {
    if (!isMountedRef.current && id && chats.length > 0) {
      isMountedRef.current = true;
      const chat = chats.find(c => c.id === id);
      if (chat && (!activeChat || activeChat.id !== id)) {
        setActiveChat(id);
      }
    }
  }, [id, chats, activeChat, setActiveChat]);

  if (!activeChat) {
    return <EmptyState message="Выберите чат для начала диалога" />;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{activeChat.title}</h2>
        <button 
          className="settings-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ Настройки
        </button>
      </div>
      
      <MessageList messages={messages} isTyping={isLoading} />
      <InputArea 
        onSendMessage={sendMessage}
        onStopGeneration={stopGeneration}
        isLoading={isLoading}
      />
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatWindow;
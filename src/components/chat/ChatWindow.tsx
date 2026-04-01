import React, { useState } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsPanel from '../settings/SettingsPanel';
import EmptyState from '../ui/EmptyState';
import { useChat } from '../../hooks/useChat';

const ChatWindow: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { activeChat, messages, isLoading, sendMessage, stopGeneration } = useChat();

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
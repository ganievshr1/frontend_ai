import React, { useState } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsPanel from '../settings/SettingsPanel';
import EmptyState from '../ui/EmptyState';
import { mockChats } from '../../mocks/mockChats';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const currentChat = mockChats.find(chat => chat.id === chatId);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    setTimeout(() => {
      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Это тестовый ответ от ИИ-ассистента. Здесь будет отображаться сгенерированный контент с поддержкой **markdown** и другими возможностями.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, assistantResponse]);
      setIsLoading(false);
    }, 1500);
  };

  if (!currentChat) {
    return <EmptyState message="Выберите чат для начала диалога" />;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>{currentChat.title}</h2>
        <button 
          className="settings-btn"
          onClick={() => setIsSettingsOpen(true)}
        >
          ⚙️ Настройки
        </button>
      </div>
      
      <MessageList messages={messages} isLoading={isLoading} />
      <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatWindow;
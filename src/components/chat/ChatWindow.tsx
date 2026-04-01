import React, { useState, useRef } from 'react';
import MessageList from './MessageList';
import InputArea from './InputArea';
import SettingsPanel from '../settings/SettingsPanel';
import EmptyState from '../ui/EmptyState';
import { mockMessages, Message } from '../../mocks/mockMessages';
import { mockChats } from '../../mocks/mockChats';

interface ChatWindowProps {
  chatId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentChat = mockChats.find(chat => chat.id === chatId);

  const handleSendMessage = (text: string) => {
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);
    
    // Simulate AI response after 2 seconds
    timeoutRef.current = setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Это тестовый ответ от ИИ-ассистента. Здесь будет отображаться сгенерированный контент с поддержкой **markdown** и другими возможностями.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      timeoutRef.current = null;
    }, 2000);
  };

  const handleStopGeneration = () => {
    // Очищаем таймаут, если он существует
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTyping(false);
    
    // Опционально: добавить сообщение о прерывании
    const stopMessage: Message = {
      id: Date.now().toString(),
      text: '*Генерация ответа остановлена пользователем*',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, stopMessage]);
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
      
      <MessageList messages={messages} isTyping={isTyping} />
      <InputArea 
        onSendMessage={handleSendMessage}
        onStopGeneration={handleStopGeneration}
        isLoading={isTyping}
      />
      
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatWindow;
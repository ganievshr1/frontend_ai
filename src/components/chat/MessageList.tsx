import React, { useEffect, useRef } from 'react';
import MessageComponent from './Message';  // Переименовываем импорт компонента
import TypingIndicator from './TypingIndicator';
import { Message as MessageType } from '../../mocks/mockMessages';  // Переименовываем импорт типа

interface MessageListProps {
  messages: MessageType[];
  isTyping: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="message-list">
      {messages.map(message => (
        <MessageComponent
          key={message.id}
          message={message}
          variant={message.sender === 'user' ? 'user' : 'assistant'}
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
import React, { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="message-list">
      {messages.map(message => (
        <Message
          key={message.id}
          message={message}
          // Передаем variant в зависимости от role
          variant={message.role === 'user' ? 'user' : 'assistant'}
        />
      ))}
      {/* Передаем isVisible={isLoading} в TypingIndicator */}
      <TypingIndicator isVisible={isLoading} />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
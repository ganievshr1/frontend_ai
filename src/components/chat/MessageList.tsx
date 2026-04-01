import React, { useEffect, useRef } from 'react';
import MessageComponent from './Message';
import TypingIndicator from './TypingIndicator';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
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
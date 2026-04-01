import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../../types';

interface MessageProps {
  message: Message;
  variant: 'user' | 'assistant';
}

const MessageComponent: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message message-${variant}`}>
      <div className="message-header">
        <span className="sender">
          {variant === 'user' ? 'Вы' : 'GigaChat'}
        </span>
        <span className="time">{formatTime(message.timestamp)}</span>
      </div>
      
      <div className="message-content">
        <ReactMarkdown
          components={{
            code: ({ node, inline, className, children, ...props }: any) => {
              return inline ? (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="code-block">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
      
      {variant === 'assistant' && (
        <button
          className={`copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Копировать текст"
        >
          <span className="copy-icon">{copied ? '✓' : '📋'}</span>
          <span className="copy-text">{copied ? 'Скопировано!' : 'Копировать'}</span>
        </button>
      )}
    </div>
  );
};

export default MessageComponent;
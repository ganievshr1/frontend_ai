import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message as MessageType } from '../../mocks/mockMessages';

interface MessageProps {
  message: MessageType;
  variant: 'user' | 'assistant';
}

const MessageComponent: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setCopyError(false);
      // Сбрасываем состояние через 2 секунды
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
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
      
      {/* Кнопка копирования только для сообщений ассистента */}
      {variant === 'assistant' && (
        <button
          className={`copy-btn ${copied ? 'copied' : ''} ${copyError ? 'error' : ''}`}
          onClick={handleCopy}
          title="Копировать текст"
        >
          {copied ? (
            <>
              <span className="copy-icon">✓</span>
              <span className="copy-text">Скопировано!</span>
            </>
          ) : copyError ? (
            <>
              <span className="copy-icon">⚠️</span>
              <span className="copy-text">Ошибка</span>
            </>
          ) : (
            <>
              <span className="copy-icon">📋</span>
              <span className="copy-text">Копировать</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default MessageComponent;
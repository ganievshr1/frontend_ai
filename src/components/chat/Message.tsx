import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface MessageProps {
  message: MessageType;
  variant: 'user' | 'assistant';
}

const Message: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          {message.content}
        </ReactMarkdown>
      </div>
      
      <button
        className="copy-btn"
        onClick={handleCopy}
        title="Копировать"
      >
        {copied ? '✓' : '📋'}
      </button>
    </div>
  );
};

export default Message;
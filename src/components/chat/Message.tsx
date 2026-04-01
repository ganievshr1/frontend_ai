import React, { useState, ReactNode, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'assistant';
    timestamp: string;
  };
  variant: 'user' | 'assistant';
}

type MarkdownComponentProps<T extends React.HTMLAttributes<HTMLElement>> = T & {
  node?: any;
  inline?: boolean;
};

const Message: React.FC<MessageProps> = ({ message, variant }) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      setCopied(true);
      setCopyError(false);
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

  // ✅ Исправленный компонент для кода с копированием
  // children теперь ReactNode, а не string
  const CodeBlock = ({ children, className }: { children: ReactNode; className?: string }) => {
    const [copiedCode, setCopiedCode] = useState(false);
    const codeRef = useRef<HTMLElement>(null);
    const language = className ? className.replace('language-', '') : 'text';

    const handleCopyCode = async () => {
      try {
        // ✅ Извлекаем текст из DOM-элемента, а не из React-children
        const codeText = codeRef.current?.textContent || '';
        await navigator.clipboard.writeText(codeText.trim());
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } catch (err) {
        console.error('Failed to copy code: ', err);
      }
    };

    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="code-language">{language}</span>
          <button className="code-copy-btn" onClick={handleCopyCode} title="Копировать код">
            {copiedCode ? '✓ Скопировано!' : '📋 Копировать'}
          </button>
        </div>
        <pre className={`code-block ${className || ''}`}>
          {/* ✅ Передаем children как есть + добавляем ref для копирования */}
          <code 
            ref={codeRef}
            className={className || ''}
          >
            {children}
          </code>
        </pre>
      </div>
    );
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
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // ✅ Исправленный рендер кода: children передаём как ReactNode
            code({ node, inline, className, children, ...props }: MarkdownComponentProps<React.HTMLAttributes<HTMLElement>>) {
              const match = /language-(\w+)/.exec(className || '');
              
              if (!inline && match) {
                return (
                  <CodeBlock className={className}>
                    {children} {/* ✅ Не преобразуем в строку! */}
                  </CodeBlock>
                );
              }
              
              return (
                <code className={`inline-code ${className || ''}`} {...props}>
                  {children}
                </code>
              );
            },
            a({ node, href, children, ...props }: MarkdownComponentProps<React.AnchorHTMLAttributes<HTMLAnchorElement>>) {
              return (
                <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link" {...props}>
                  {children}
                </a>
              );
            },
            table({ node, children, ...props }: MarkdownComponentProps<React.TableHTMLAttributes<HTMLTableElement>>) {
              return (
                <div className="markdown-table-wrapper">
                  <table className="markdown-table" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            blockquote({ node, children, ...props }: MarkdownComponentProps<React.BlockquoteHTMLAttributes<HTMLElement>>) {
              return (
                <blockquote className="markdown-blockquote" {...props}>
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
      
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

export default Message;
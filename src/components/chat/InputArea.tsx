import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  onStopGeneration?: () => void;
  isLoading?: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  onStopGeneration, 
  isLoading = false 
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 5 * 24;
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [inputValue]);

  const isMessageEmpty = (): boolean => {
    return !inputValue.trim();
  };

  const handleSend = (): void => {
    if (!isMessageEmpty() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleStop = (): void => {
    if (onStopGeneration) {
      onStopGeneration();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputValue(e.target.value);
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <button 
          className="attach-btn" 
          title="Прикрепить изображение (в разработке)"
          disabled={isLoading}
        >
          📎
        </button>
        
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "ИИ печатает ответ..." : "Введите сообщение... (Shift+Enter для новой строки)"}
          rows={1}
          className="textarea"
          disabled={isLoading}
        />
        
        <div className="input-buttons">
          {isLoading ? (
            <button
              className="stop-btn active"
              onClick={handleStop}
              title="Остановить генерацию"
            >
              ⏹️ Стоп
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={isMessageEmpty()}
              title={isMessageEmpty() ? "Введите сообщение" : "Отправить сообщение"}
            >
              Отправить
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputArea;
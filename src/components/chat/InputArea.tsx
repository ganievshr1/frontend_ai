import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  onStopGeneration?: () => void;  // Добавляем обработчик остановки генерации
  isLoading?: boolean;  // Добавляем флаг загрузки
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  onStopGeneration, 
  isLoading = false 
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоматическая подстройка высоты textarea (до 5 строк)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 5 * 24; // 5 строк по 24px
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [inputValue]);

  // Проверка, что сообщение не пустое и не состоит только из пробелов
  const isMessageEmpty = (): boolean => {
    return !inputValue.trim();
  };

  // Обработчик отправки сообщения
  const handleSend = (): void => {
    if (!isMessageEmpty() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  // Обработчик остановки генерации
  const handleStop = (): void => {
    if (onStopGeneration) {
      onStopGeneration();
    }
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  // Обработчик изменения значения textarea
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
            // Кнопка "Стоп" отображается во время генерации
            <button
              className="stop-btn active"
              onClick={handleStop}
              title="Остановить генерацию"
            >
              ⏹️ Стоп
            </button>
          ) : (
            // Кнопка "Отправить" отображается в обычном режиме
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
import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  // Храним значение поля в useState
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автоподстройка высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 5 * 24) + 'px';
    }
  }, [inputValue]);

  // Функция отправки сообщения
  const handleSend = () => {
    // Блокируем кнопку при пустом вводе или isLoading === true
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      // Очищаем поле после отправки сообщения
      setInputValue('');
      
      // Возвращаем фокус на textarea после отправки
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  // Обработка нажатия клавиш
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <button 
          className="attach-btn" 
          title="Прикрепить изображение"
          disabled={isLoading}
        >
          📎
        </button>
        
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "GigaChat печатает..." : "Введите сообщение... (Shift+Enter для новой строки)"}
          rows={1}
          className="textarea"
          disabled={isLoading}
        />
        
        <div className="input-buttons">
          <button
            className="stop-btn"
            disabled
            title="Остановить генерацию (в разработке)"
          >
            ⏹️
          </button>
          <button
            className="send-btn"
            onClick={handleSend}
            // Блокируем кнопку при пустом вводе или isLoading === true
            disabled={!inputValue.trim() || isLoading}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
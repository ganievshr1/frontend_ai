import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import SearchInput from './SearchInput';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useChatStore } from '../../store/chatStore';

interface SidebarProps {
  onDeleteChat?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onDeleteChat }) => {
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const {
    chats,
    activeChatId,
    addChat,
    updateChatTitle,
    deleteChat,
    setActiveChat,
  } = useChatStore();

  // Фильтрация чатов по поисковому запросу (с мемоизацией для производительности)
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase().trim();
    return chats.filter(chat => {
      // Поиск по названию чата
      if (chat.title.toLowerCase().includes(query)) return true;
      
      // Поиск по содержимому последнего сообщения
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage && lastMessage.text.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }, [chats, searchQuery]);

  // Создание нового чата
  const handleNewChat = useCallback(() => {
    console.log('📝 Создание нового чата с временным названием');
    addChat(); // Создаем чат с временным названием "Новый чат X"
  }, [addChat]);

  // Выбор чата
  const handleSelectChat = useCallback((chatId: string) => {
    console.log('🖱️ Sidebar: выбран чат', chatId);
    
    // Если это уже активный чат - ничего не делаем
    if (chatId === activeChatId) return;
    
    // Обновляем активный чат (URL обновится в AppLayout через useEffect)
    setActiveChat(chatId);
  }, [activeChatId, setActiveChat]);

  // Клик по кнопке удаления
  const handleDeleteClick = useCallback((chatId: string) => {
    console.log('🗑️ Запрос на удаление чата:', chatId);
    setChatToDelete(chatId);
  }, []);

  // Подтверждение удаления
  const handleConfirmDelete = useCallback(() => {
    if (chatToDelete) {
      console.log('✅ Подтверждено удаление чата:', chatToDelete);
      deleteChat(chatToDelete);
      onDeleteChat?.(chatToDelete);
      setChatToDelete(null);
    }
  }, [chatToDelete, deleteChat, onDeleteChat]);

  // Отмена удаления
  const handleCancelDelete = useCallback(() => {
    console.log('❌ Отмена удаления чата');
    setChatToDelete(null);
  }, []);

  // Редактирование названия чата
  const handleEditChat = useCallback((chatId: string, newTitle: string) => {
    console.log('✏️ Редактирование названия чата:', chatId, newTitle);
    updateChatTitle(chatId, newTitle);
  }, [updateChatTitle]);

  // Очистка поиска
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="sidebar-container">
      {/* Кнопка создания нового чата */}
      <button className="new-chat-btn" onClick={handleNewChat}>
        <span className="plus-icon">+</span>
        Новый чат
      </button>
      
      {/* Поиск по чатам */}
      <div className="search-container">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Поиск по названию или сообщению..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear" 
              onClick={handleClearSearch} 
              title="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Список чатов */}
      <ChatList
        chats={filteredChats}
        selectedChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteClick}
        onEditChat={handleEditChat}
      />
      
      {/* Диалог подтверждения удаления */}
      <ConfirmDialog
        isOpen={!!chatToDelete}
        title="Удаление чата"
        message="Вы уверены, что хотите удалить этот чат? Все сообщения будут потеряны без возможности восстановления."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Sidebar;
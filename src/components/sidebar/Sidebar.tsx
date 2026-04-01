import React, { useState, useCallback } from 'react';
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

  // Фильтрация чатов по поисковому запросу
  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    
    if (chat.title.toLowerCase().includes(query)) return true;
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && lastMessage.text.toLowerCase().includes(query)) return true;
    
    return false;
  });

  const handleNewChat = useCallback(() => {
    addChat();
  }, [addChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    console.log('Sidebar: selecting chat', chatId);
    
    // Если это уже активный чат - ничего не делаем
    if (chatId === activeChatId) return;
    
    // Обновляем активный чат (URL обновится в AppLayout через useEffect)
    setActiveChat(chatId);
  }, [activeChatId, setActiveChat]);

  const handleDeleteClick = useCallback((chatId: string) => {
    setChatToDelete(chatId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      onDeleteChat?.(chatToDelete);
      setChatToDelete(null);
    }
  }, [chatToDelete, deleteChat, onDeleteChat]);

  const handleCancelDelete = useCallback(() => {
    setChatToDelete(null);
  }, []);

  const handleEditChat = useCallback((chatId: string, newTitle: string) => {
    updateChatTitle(chatId, newTitle);
  }, [updateChatTitle]);

  return (
    <div className="sidebar-container">
      <button className="new-chat-btn" onClick={handleNewChat}>
        <span className="plus-icon">+</span>
        Новый чат
      </button>
      
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
            <button className="search-clear" onClick={() => setSearchQuery('')} title="Очистить">
              ✕
            </button>
          )}
        </div>
      </div>
      
      <ChatList
        chats={filteredChats}
        selectedChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteClick}
        onEditChat={handleEditChat}
      />
      
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
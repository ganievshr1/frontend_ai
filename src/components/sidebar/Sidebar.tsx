import React, { useState } from 'react';
import ChatList from './ChatList';
import SearchInput from './SearchInput';
import ConfirmDialog from '../ui/ConfirmDialog';
import { useChatStore } from '../../store/chatStore';

const Sidebar: React.FC = () => {
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
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
    
    // Поиск по названию чата
    if (chat.title.toLowerCase().includes(query)) return true;
    
    // Поиск по содержимому последнего сообщения
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage && lastMessage.text.toLowerCase().includes(query)) return true;
    
    return false;
  });

  const handleNewChat = () => {
    addChat();
  };

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
  };

  const handleConfirmDelete = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setChatToDelete(null);
  };

  const handleEditChat = (chatId: string, newTitle: string) => {
    updateChatTitle(chatId, newTitle);
  };

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
        onSelectChat={setActiveChat}
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
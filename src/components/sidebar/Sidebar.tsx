import React, { useState } from 'react';
import ChatList from './ChatList';
import SearchInput from './SearchInput';
import { mockChats, Chat } from '../../mocks/mockChats';

interface SidebarProps {
  selectedChatId: string;
  onSelectChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedChatId, onSelectChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>(mockChats);

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'Новый чат',
      lastMessageDate: new Date().toISOString(),
    };
    setChats([newChat, ...chats]);
    onSelectChat(newChat.id);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(chats.filter(chat => chat.id !== chatId));
    if (selectedChatId === chatId && chats.length > 1) {
      onSelectChat(chats[0].id);
    }
  };

  const handleEditChat = (chatId: string, newTitle: string) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar-container">
      <button className="new-chat-btn" onClick={handleNewChat}>
        <span className="plus-icon">+</span>
        Новый чат
      </button>
      <SearchInput value={searchQuery} onChange={setSearchQuery} />
      <ChatList
        chats={filteredChats}
        selectedChatId={selectedChatId}
        onSelectChat={onSelectChat}
        onDeleteChat={handleDeleteChat}
        onEditChat={handleEditChat}
      />
    </div>
  );
};

export default Sidebar;
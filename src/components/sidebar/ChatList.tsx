import React from 'react';
import ChatItem from './ChatItem';
import { Chat } from '../../types';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onEditChat: (chatId: string, newTitle: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  selectedChatId, 
  onSelectChat, 
  onDeleteChat, 
  onEditChat 
}) => {
  if (chats.length === 0) {
    return (
      <div className="chat-list-empty">
        <p>Нет чатов</p>
        <p className="chat-list-empty-hint">Нажмите "Новый чат" чтобы начать диалог</p>
      </div>
    );
  }

  console.log('ChatList render, chats:', chats.map(c => c.id)); // 👈 Лог для отладки

  return (
    <div className="chat-list">
      {chats.map(chat => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onSelect={() => {
            console.log('ChatList: onSelect called for chat', chat.id); // 👈 Лог
            onSelectChat(chat.id);
          }}
          onDelete={() => onDeleteChat(chat.id)}
          onEdit={(newTitle) => onEditChat(chat.id, newTitle)}
        />
      ))}
    </div>
  );
};

export default ChatList;
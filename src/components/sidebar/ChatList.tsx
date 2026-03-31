import React from 'react';
import ChatItem from './ChatItem';
import { Chat } from '../../mocks/mockChats';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string;
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
  return (
    <div className="chat-list">
      {chats.map(chat => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          onSelect={() => onSelectChat(chat.id)}
          onDelete={() => onDeleteChat(chat.id)}
          onEdit={(newTitle) => onEditChat(chat.id, newTitle)}
        />
      ))}
    </div>
  );
};

export default ChatList;
import React, { useState } from 'react';
import { Chat } from '../../types';

interface ChatItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: (newTitle: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ 
  chat, 
  isSelected, 
  onSelect, 
  onDelete, 
  onEdit 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString();
  };

  const getLastMessagePreview = (): string => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (!lastMessage) return 'Нет сообщений';
    const preview = lastMessage.text.length > 50 
      ? lastMessage.text.substring(0, 50) + '...' 
      : lastMessage.text;
    return preview;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 👈 Добавить
    if (editTitle.trim() && editTitle.trim() !== chat.title) {
      onEdit(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 👈 Добавить
    setIsEditing(true);
    setEditTitle(chat.title);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 👈 Добавить
    onDelete();
  };

  const handleSelect = () => {
    if (!isEditing) {
      onSelect();
    }
  };

  return (
    <div
      className={`chat-item ${isSelected ? 'selected' : ''}`}
      onClick={handleSelect}
    >
      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="edit-form" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
            onBlur={handleEditSubmit}
            className="edit-input"
            maxLength={50}
          />
        </form>
      ) : (
        <>
          <div className="chat-info">
            <div className="chat-title">{chat.title}</div>
            <div className="chat-preview">{getLastMessagePreview()}</div>
            <div className="chat-date">{formatDate(chat.lastMessageDate)}</div>
          </div>
          <div className="chat-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="edit-btn"
              onClick={handleEditClick}
              title="Редактировать название"
            >
              ✏️
            </button>
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
              title="Удалить чат"
            >
              🗑️
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatItem;
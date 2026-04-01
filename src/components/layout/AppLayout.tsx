import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import ThemeToggle from '../ui/ThemeToggle';
import { useChatStore } from '../../store/chatStore';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isUpdatingRef = useRef(false);
  const initialLoadRef = useRef(true);
  
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const deleteChat = useChatStore((state) => state.deleteChat);

  // Только при первой загрузке: синхронизируем URL с активным чатом
  useEffect(() => {
    if (initialLoadRef.current && chats.length > 0) {
      initialLoadRef.current = false;
      
      if (id && chats.some(chat => chat.id === id)) {
        // URL содержит ID существующего чата
        if (activeChatId !== id) {
          setActiveChat(id);
        }
      } else if (activeChatId) {
        // Есть активный чат, но URL не соответствует
        navigate(`/chat/${activeChatId}`, { replace: true });
      } else if (chats.length > 0) {
        // Нет активного чата, выбираем первый
        setActiveChat(chats[0].id);
        navigate(`/chat/${chats[0].id}`, { replace: true });
      }
    }
  }, [id, chats, activeChatId, setActiveChat, navigate]);

  // Только при изменении активного чата вручную обновляем URL
  useEffect(() => {
    if (!initialLoadRef.current && !isUpdatingRef.current && activeChatId && activeChatId !== id) {
      isUpdatingRef.current = true;
      navigate(`/chat/${activeChatId}`, { replace: true });
      setTimeout(() => { isUpdatingRef.current = false; }, 100);
    }
  }, [activeChatId, id, navigate]);

  // Обработчик удаления чата
  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (chatId === activeChatId) {
      const remainingChats = chats.filter(c => c.id !== chatId);
      if (remainingChats.length > 0) {
        navigate(`/chat/${remainingChats[0].id}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      <button className="burger-menu" onClick={toggleSidebar}>
        <div className="burger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar onDeleteChat={handleDeleteChat} />
      </div>
      
      <div className="main-content">
        <ChatWindow />
      </div>
      
      <ThemeToggle />
    </div>
  );
};

export default AppLayout;
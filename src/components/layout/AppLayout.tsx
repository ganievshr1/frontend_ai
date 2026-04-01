import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import ThemeToggle from '../ui/ThemeToggle';

interface AppLayoutProps {
  onLogout?: () => void;  // 👈 Добавляем проп
}

const AppLayout: React.FC<AppLayoutProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        <Sidebar />
      </div>
      
      <div className="main-content">
        <ChatWindow />
      </div>
      
      <ThemeToggle />
      
      {/* Кнопка выхода */}
      {onLogout && (
        <button className="logout-btn" onClick={onLogout} title="Выйти">
          🚪
        </button>
      )}
    </div>
  );
};

export default AppLayout;
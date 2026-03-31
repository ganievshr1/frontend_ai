import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';

interface AppLayoutProps {
  onLogout?: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string>('1');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      {/* Burger menu button */}
      <button className="burger-menu" onClick={toggleSidebar}>
        <div className="burger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          selectedChatId={selectedChatId} 
          onSelectChat={setSelectedChatId}
        />
      </div>
      
      <div className="main-content">
        <ChatWindow chatId={selectedChatId} />
      </div>
    </div>
  );
};

export default AppLayout;
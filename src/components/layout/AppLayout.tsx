import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import ChatWindow from '../chat/ChatWindow';
import ThemeToggle from '../ui/ThemeToggle';

const AppLayout: React.FC = () => {
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
    </div>
  );
};

export default AppLayout;
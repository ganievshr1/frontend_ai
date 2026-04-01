import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import AuthForm from './components/auth/AuthForm';
import { useChatStore } from './store/chatStore';
import './styles/theme.css';

interface AuthData {
  credentials: string;
  scope: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);

  const handleLogin = (authData: AuthData) => {
    console.log('Login with:', authData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Главный маршрут - перенаправляет на первый чат или на AppLayout без чата */}
        <Route 
          path="/" 
          element={
            chats.length > 0 ? (
              <Navigate to={`/chat/${chats[0].id}`} replace />
            ) : (
              <AppLayout />
            )
          } 
        />
        
        {/* Маршрут для конкретного чата */}
        <Route 
          path="/chat/:id" 
          element={<AppLayout />} 
        />
        
        {/* Любые другие маршруты перенаправляют на главный */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
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
  const resetStore = useChatStore((state) => state.resetStore);

  useEffect(() => {
    if (!isAuthenticated) {
      resetStore();
    }
  }, [isAuthenticated, resetStore]);

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

  return <AppLayout />;
}

export default App;
import React, { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import AuthForm from './components/auth/AuthForm';
import './styles/theme.css';

interface AuthData {
  credentials: string;
  scope: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return <AppLayout onLogout={handleLogout} />;
}

export default App;
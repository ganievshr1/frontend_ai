import React, { useState } from 'react';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';
import { useChatStore } from '../../store/chatStore';

interface AuthData {
  credentials: string;
  scope: string;
}

interface AuthFormProps {
  onLogin: (authData: AuthData) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState('');
  const [scope, setScope] = useState('GIGACHAT_API_PERS');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const setCredentialsInStore = useChatStore((state) => state.setCredentials);

  const validateBase64 = (str: string): boolean => {
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    return base64Regex.test(str);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.trim()) {
      setError('Поле Credentials не может быть пустым');
      return;
    }
    
    if (!validateBase64(credentials)) {
      setError('Некорректный формат Base64 строки');
      return;
    }
    
    setIsLoading(true);
    
    // Сохраняем credentials в store
    setCredentialsInStore(credentials);
    
    setTimeout(() => {
      setIsLoading(false);
      onLogin({ credentials, scope });
    }, 1000);
  };

  return (
    <div className="auth-form">
      <div className="auth-container">
        <h1>Вход в GigaChat</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Credentials (Base64)</label>
            <input
              type="password"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="Введите Base64 строку..."
              className="auth-input"
            />
          </div>
          
          <div className="form-group">
            <label>Scope</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="GIGACHAT_API_PERS"
                  checked={scope === 'GIGACHAT_API_PERS'}
                  onChange={(e) => setScope(e.target.value)}
                />
                GIGACHAT_API_PERS
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="GIGACHAT_API_B2B"
                  checked={scope === 'GIGACHAT_API_B2B'}
                  onChange={(e) => setScope(e.target.value)}
                />
                GIGACHAT_API_B2B
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="GIGACHAT_API_CORP"
                  checked={scope === 'GIGACHAT_API_CORP'}
                  onChange={(e) => setScope(e.target.value)}
                />
                GIGACHAT_API_CORP
              </label>
            </div>
          </div>
          
          {error && <ErrorMessage message={error} />}
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
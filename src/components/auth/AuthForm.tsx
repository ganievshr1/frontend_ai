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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.trim()) {
      setError('Поле Authorization Key не может быть пустым');
      return;
    }
    
    setIsLoading(true);
    
    // Сохраняем credentials в store для использования в API запросах
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
            <label>Authorization Key</label>
            <input
              type="password"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="Введите ключ авторизации из Studio..."
              className="auth-input"
            />
            <small style={{ display: 'block', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Получите ключ в личном кабинете Studio → Настройки API → Получить ключ
            </small>
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
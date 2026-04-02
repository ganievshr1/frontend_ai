// src/hooks/useChat.ts
import { useState, useCallback, useRef } from 'react';
import { gigachatApi, GigaChatMessage, GigaChatSettings } from '../services/gigachatApi';

export interface UseChatOptions {
  initialMessages?: GigaChatMessage[];
  systemPrompt?: string;
  onError?: (error: Error) => void;
}

export function useChat(options: UseChatOptions = {}) {
  const { 
    initialMessages = [], 
    systemPrompt,
    onError 
  } = options;

  const [messages, setMessages] = useState<GigaChatMessage[]>(() => {
    if (systemPrompt) {
      return [{ role: 'system' as const, content: systemPrompt }, ...initialMessages];
    }
    return initialMessages;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const credentials = process.env.REACT_APP_GIGACHAT_CREDENTIALS || '';
  
  const settings: GigaChatSettings = {
    model: process.env.REACT_APP_GIGACHAT_MODEL || 'GigaChat-2-Max',
    temperature: parseFloat(process.env.REACT_APP_GIGACHAT_TEMPERATURE || '0.1'),
    topP: parseFloat(process.env.REACT_APP_GIGACHAT_TOP_P || '0.9'),
    maxTokens: parseInt(process.env.REACT_APP_GIGACHAT_MAX_TOKENS || '1000'),
  };

  const useStreaming = process.env.REACT_APP_GIGACHAT_USE_STREAMING === 'true';

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Добавляем сообщение пользователя
    const userMessage: GigaChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError(null);

    // Создаем assistant message заранее для streaming
    const assistantMessageId = Date.now();
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      if (useStreaming) {
        // Streaming режим
        let accumulatedContent = '';
        
        await gigachatApi.sendMessageStream(
          credentials,
          [...messages, userMessage],
          settings,
          // onChunk
          (chunk) => {
            accumulatedContent += chunk;
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.role === 'assistant') {
                lastMessage.content = accumulatedContent;
              }
              return newMessages;
            });
          },
          // onComplete
          () => {
            setIsLoading(false);
            console.log('✅ Streaming завершен');
          },
          // onError
          (err) => {
            setError(err.message);
            setIsLoading(false);
            onError?.(err);
            // Удаляем пустое assistant сообщение при ошибке
            setMessages(prev => prev.slice(0, -1));
          }
        );
      } else {
        // Обычный режим
        const response = await gigachatApi.sendMessage(
          credentials,
          [...messages, userMessage],
          settings
        );

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = response;
          }
          return newMessages;
        });
        
        setIsLoading(false);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
      // Удаляем пустое assistant сообщение при ошибке
      setMessages(prev => prev.slice(0, -1));
    }
  }, [messages, credentials, settings, useStreaming, onError]);

  const clearChat = useCallback(() => {
    setMessages(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []);
    setError(null);
  }, [systemPrompt]);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    setMessages,
  };
}

export default useChat;
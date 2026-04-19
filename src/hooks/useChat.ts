// src/hooks/useChat.ts
import { useState, useCallback, useRef } from 'react';
import { gigachatApi, GigaChatMessage, GigaChatSettings } from '../services/gigachatApi';

export const useChat = () => {
  const {
    chats,
    activeChatId,
    isLoading,
    error,
    setActiveChat,
    addChat,
    updateChatTitle,
    deleteChat,
    addMessage,
    setLoading,
    clearError,
    stopGeneration,
  } = useChatStore();

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
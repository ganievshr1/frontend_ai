import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chat, Message } from '../types';
import { mockChats as initialMockChats } from '../mocks/mockChats';
import { mockMessages as initialMockMessages } from '../mocks/mockMessages';
import { gigachatApi } from '../services/gigachatApi';

interface ChatStore {
  // State
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  credentials: string | null;
  settings: {
    model: string;
    temperature: number;
    topP: number;
    maxTokens: number;
    systemPrompt: string;
  };
  isStreaming: boolean;
  abortController: AbortController | null;

  // Actions
  setActiveChat: (chatId: string) => void;
  addChat: (title?: string) => void;
  updateChatTitle: (chatId: string, newTitle: string) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSearchQuery: (query: string) => void;
  resetStore: () => void;
  getFilteredChats: () => Chat[];
  exportToLocalStorage: () => void;
  importFromLocalStorage: () => void;
  clearLocalStorage: () => void;
  setCredentials: (credentials: string) => void;
  updateSettings: (settings: Partial<ChatStore['settings']>) => void;
  stopGeneration: () => void;
  setAbortController: (controller: AbortController | null) => void;
}

// Функция для генерации названия чата из сообщения
const generateChatTitleFromMessage = (messageText: string, index: number): string => {
  const trimmedText = messageText.trim();
  
  if (!trimmedText || trimmedText.length < 3) {
    return `Диалог ${index + 1}`;
  }
  
  const cleanText = trimmedText.replace(/\s+/g, ' ').replace(/\n/g, ' ');
  
  let title = cleanText;
  if (cleanText.length > 35) {
    title = cleanText.substring(0, 35) + '...';
  }
  
  return title;
};

// Создаем начальные чаты с сообщениями
const createInitialChats = (): Chat[] => {
  return initialMockChats.map(chat => ({
    ...chat,
    messages: chat.id === '1' ? [...initialMockMessages] : [],
    isLoading: false,
    error: null,
  }));
};

// Функция для генерации названия чата из сообщения
const generateChatTitleFromMessage = (messageText: string, index: number): string => {
  const trimmedText = messageText.trim();
  
  if (!trimmedText || trimmedText.length < 3) {
    return `Диалог ${index + 1}`;
  }
  
  const cleanText = trimmedText.replace(/\s+/g, ' ').replace(/\n/g, ' ');
  
  let title = cleanText;
  if (cleanText.length > 35) {
    title = cleanText.substring(0, 35) + '...';
  }
  
  return title;
};

// Интерфейс для сохраненных данных
interface StoredData {
  state: {
    chats: Chat[];
    activeChatId: string | null;
    settings: ChatStore['settings'];
  };
}

// Функция для безопасного парсинга JSON
const safeJSONParse = (data: string | null): StoredData | null => {
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === 'object' && parsed.state && Array.isArray(parsed.state.chats)) {
      return parsed as StoredData;
    }
    return null;
  } catch (error) {
    console.error('❌ Ошибка парсинга localStorage:', error);
    return null;
  }
};

// Функция для загрузки данных из localStorage
const loadFromLocalStorage = (): { chats: Chat[]; activeChatId: string | null; settings: ChatStore['settings'] } | null => {
  try {
    const stored = localStorage.getItem('chat-storage');
    if (!stored) return null;
    
    const parsed = safeJSONParse(stored);
    
    if (parsed && parsed.state && parsed.state.chats.length > 0) {
      console.log('✅ Загружено из localStorage:', parsed.state.chats.length, 'чатов');
      return {
        chats: parsed.state.chats,
        activeChatId: parsed.state.activeChatId,
        settings: parsed.state.settings || {
          model: 'GigaChat',
          temperature: 0.7,
          topP: 0.9,
          maxTokens: 2048,
          systemPrompt: 'Вы полезный ассистент.',
        },
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Ошибка загрузки из localStorage:', error);
    return null;
  }
};

// Загружаем начальное состояние
const getInitialState = () => {
  const loaded = loadFromLocalStorage();
  if (loaded && loaded.chats.length > 0) {
    return {
      chats: loaded.chats,
      activeChatId: loaded.activeChatId,
      settings: loaded.settings,
    };
  }
  const initialChats = createInitialChats();
  return {
    chats: initialChats,
    activeChatId: initialChats[0]?.id || null,
    settings: {
      model: 'GigaChat',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      systemPrompt: 'Вы полезный ассистент.',
    },
  };
};

const initialState = getInitialState();

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: initialState.chats,
      activeChatId: initialState.activeChatId,
      isLoading: false,
      error: null,
      searchQuery: '',
      credentials: null,
      settings: getInitialState().settings,
      isStreaming: false,
      abortController: null,

      // Set active chat
      setActiveChat: (chatId: string) => {
        console.log('🔄 Смена активного чата:', chatId);
        set({ activeChatId: chatId });
      },

      // Add new chat
      addChat: (title?: string) => {
        console.log('➕ Создание нового чата');
        const currentChats = get().chats;
        const newChat: Chat = {
          id: Date.now().toString(),
          title: title || `Новый чат ${currentChats.length + 1}`,
          lastMessageDate: new Date().toISOString(),
          messages: [],
          isLoading: false,
          error: null,
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChatId: newChat.id,
        }));
      },

      // Update chat title
      updateChatTitle: (chatId: string, newTitle: string) => {
        console.log('✏️ Обновление названия чата:', chatId, newTitle);
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          ),
        }));
      },

      // Delete chat
      deleteChat: (chatId: string) => {
        console.log('🗑️ Удаление чата:', chatId);
        set((state) => {
          const newChats = state.chats.filter(chat => chat.id !== chatId);
          const newActiveChatId = state.activeChatId === chatId
            ? newChats[0]?.id || null
            : state.activeChatId;
          
          return {
            chats: newChats,
            activeChatId: newActiveChatId,
          };
        });
      },

      // Set AbortController
      setAbortController: (controller: AbortController | null) => {
        set({ abortController: controller });
      },

      // Stop generation
      stopGeneration: () => {
        console.log('⏹️ Остановка генерации...');
        const { abortController } = get();
        
        if (abortController) {
          console.log('⏹️ Отправка сигнала отмены...');
          abortController.abort();
          set({ 
            abortController: null,
            isLoading: false, 
            isStreaming: false 
          });
        } else {
          console.log('⚠️ Нет активного AbortController для отмены');
          set({ isLoading: false, isStreaming: false });
        }
      },

      // Add message to chat with GigaChat API integration
      addMessage: async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const { credentials, settings, isStreaming } = get();
        
        console.log('💬 Добавление сообщения в чат:', chatId);
        
        const chat = get().chats.find(c => c.id === chatId);
        
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };

        // Если это первое сообщение в чате и оно от пользователя
        const isFirstMessage = chat && chat.messages.length === 0;
        let updatedTitle = chat?.title;
        
        if (isFirstMessage && message.sender === 'user') {
          const chatIndex = get().chats.findIndex(c => c.id === chatId);
          const newTitle = generateChatTitleFromMessage(message.text, chatIndex);
          console.log('🏷️ Генерация названия чата:', newTitle);
          updatedTitle = newTitle;
        }

        // Добавляем сообщение пользователя
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: updatedTitle || chat.title,
                  messages: [...chat.messages, newMessage],
                  lastMessageDate: newMessage.timestamp,
                }
              : chat
          ),
        }));

        // Если сообщение от пользователя и есть credentials, отправляем запрос к API
        if (message.sender === 'user' && credentials) {
          // Создаем AbortController для возможности отмены запроса
          const abortController = new AbortController();
          set({ isLoading: true, error: null, isStreaming: true, abortController });
          
          // Подготавливаем контекст диалога
          const currentChat = get().chats.find(c => c.id === chatId);
          const messagesForAPI = [
            { role: 'system' as const, content: settings.systemPrompt },
            ...(currentChat?.messages || []).map(msg => ({
              role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
              content: msg.text,
            })),
          ];

          // Создаем временное сообщение ассистента для streaming
          const assistantMessageId = (Date.now() + 1).toString();
          let assistantContent = '';
          let isAborted = false;
          
          set((state) => ({
            chats: state.chats.map(chat =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, {
                      id: assistantMessageId,
                      text: '',
                      sender: 'assistant',
                      timestamp: new Date().toISOString(),
                    }],
                  }
                : chat
            ),
          }));

          try {
            // Используем streaming режим с поддержкой отмены
            await gigachatApi.sendMessageStream(
              credentials,
              messagesForAPI,
              {
                model: settings.model,
                temperature: settings.temperature,
                topP: settings.topP,
                maxTokens: settings.maxTokens,
              },
              // onChunk - обновляем сообщение по мере поступления данных
              (chunk: string) => {
                if (isAborted) return;
                assistantContent += chunk;
                set((state) => ({
                  chats: state.chats.map(chat =>
                    chat.id === chatId
                      ? {
                          ...chat,
                          messages: chat.messages.map(msg =>
                            msg.id === assistantMessageId
                              ? { ...msg, text: assistantContent }
                              : msg
                          ),
                          lastMessageDate: new Date().toISOString(),
                        }
                      : chat
                  ),
                }));
              },
              // onComplete - завершение streaming
              () => {
                if (isAborted) return;
                console.log('✅ Streaming завершен');
                set({ isLoading: false, isStreaming: false, abortController: null });
              },
              // onError - обработка ошибки
              (error: Error) => {
                if (isAborted) return;
                console.error('❌ Ошибка streaming:', error);
                
                // Проверяем, не была ли операция отменена
                if (error.name === 'AbortError') {
                  console.log('⏹️ Запрос был отменен пользователем');
                  set((state) => ({
                    chats: state.chats.map(chat =>
                      chat.id === chatId
                        ? {
                            ...chat,
                            messages: chat.messages.map(msg =>
                              msg.id === assistantMessageId
                                ? { ...msg, text: assistantContent || '⏹️ Генерация остановлена пользователем.' }
                                : msg
                            ),
                          }
                        : chat
                    ),
                    isLoading: false,
                    isStreaming: false,
                    abortController: null,
                  }));
                } else {
                  set({ 
                    error: error.message,
                    isLoading: false,
                    isStreaming: false,
                    abortController: null,
                  });
                  
                  // Обновляем сообщение с ошибкой
                  set((state) => ({
                    chats: state.chats.map(chat =>
                      chat.id === chatId
                        ? {
                            ...chat,
                            messages: chat.messages.map(msg =>
                              msg.id === assistantMessageId
                                ? { ...msg, text: `❌ Ошибка: ${error.message}` }
                                : msg
                            ),
                          }
                        : chat
                    ),
                  }));
                }
              },
              abortController.signal
            );
          } catch (error) {
            console.error('❌ Ошибка отправки сообщения:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Ошибка отправки сообщения',
              isLoading: false,
              isStreaming: false,
              abortController: null,
            });
          }
        } else if (message.sender === 'user' && !credentials) {
          // Если нет credentials, используем заглушку
          set({ isLoading: true });
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
            text: '⚠️ Не выполнена авторизация. Пожалуйста, введите ключ авторизации в форме входа.',
            sender: 'assistant',
          };
          
          const aiMessage: Message = {
            ...assistantMessage,
            id: (Date.now() + 1).toString(),
            timestamp: new Date().toISOString(),
          };
          
          set((state) => ({
            chats: state.chats.map(chat =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: [...chat.messages, aiMessage],
                    lastMessageDate: aiMessage.timestamp,
                  }
                : chat
            ),
            isLoading: false,
          }));
        }
      },

      // Set loading state
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set search query
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      // Get filtered chats
      getFilteredChats: () => {
        const { chats, searchQuery } = get();
        if (!searchQuery.trim()) return chats;
        
        const query = searchQuery.toLowerCase().trim();
        return chats.filter(chat => {
          if (chat.title.toLowerCase().includes(query)) return true;
          const lastMessage = chat.messages[chat.messages.length - 1];
          if (lastMessage && lastMessage.text.toLowerCase().includes(query)) return true;
          return false;
        });
      },

      // Set credentials
      setCredentials: (credentials: string) => {
        console.log('🔑 Установка credentials');
        set({ credentials });
      },

      // Update settings
      updateSettings: (newSettings: Partial<ChatStore['settings']>) => {
        console.log('⚙️ Обновление настроек:', newSettings);
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // Export to localStorage (manual)
      exportToLocalStorage: () => {
        try {
          console.log('💾 Ручной экспорт в localStorage');
          const state = {
            chats: get().chats,
            activeChatId: get().activeChatId,
            settings: get().settings,
          };
          localStorage.setItem('chat-storage', JSON.stringify({ state }));
          console.log('✅ Данные успешно сохранены');
          set({ error: null });
        } catch (error) {
          console.error('❌ Ошибка экспорта:', error);
          set({ error: 'Не удалось сохранить данные' });
        }
      },

      // Import from localStorage (manual)
      importFromLocalStorage: () => {
        try {
          console.log('📂 Ручной импорт из localStorage');
          const stored = localStorage.getItem('chat-storage');
          if (!stored) {
            set({ error: 'Нет сохраненных данных' });
            return;
          }
          
          const parsed = safeJSONParse(stored);
          
          if (parsed && parsed.state && Array.isArray(parsed.state.chats)) {
            set({
              chats: parsed.state.chats,
              activeChatId: parsed.state.activeChatId,
              settings: parsed.state.settings || get().settings,
              error: null,
            });
            console.log('✅ Данные успешно загружены');
          } else {
            throw new Error('Неверная структура данных');
          }
        } catch (error) {
          console.error('❌ Ошибка импорта:', error);
          set({ error: 'Не удалось загрузить данные' });
        }
      },

      // Clear localStorage
      clearLocalStorage: () => {
        try {
          console.log('🗑️ Очистка localStorage');
          localStorage.removeItem('chat-storage');
          const initialChats = createInitialChats();
          set({
            chats: initialChats,
            activeChatId: initialChats[0]?.id || null,
            error: null,
          });
          console.log('✅ localStorage очищен');
        } catch (error) {
          console.error('❌ Ошибка очистки:', error);
          set({ error: 'Не удалось очистить данные' });
        }
      },

      // Reset store
      resetStore: () => {
        console.log('🔄 Сброс хранилища');
        const initialChats = createInitialChats();
        set({
          chats: initialChats,
          activeChatId: initialChats[0]?.id || null,
          isLoading: false,
          error: null,
          searchQuery: '',
          credentials: null,
          isStreaming: false,
          abortController: null,
        });
        try {
          localStorage.removeItem('chat-storage');
          console.log('✅ Хранилище сброшено');
        } catch (error) {
          console.error('❌ Ошибка сброса:', error);
        }
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        if (state.chats.length === 0) return {};
        console.log('💾 Автосохранение в localStorage:', {
          chatsCount: state.chats.length,
          activeChatId: state.activeChatId,
        });
        return {
          chats: state.chats,
          activeChatId: state.activeChatId,
          settings: state.settings,
        };
      },
      onRehydrateStorage: () => {
        console.log('🔄 Восстановление из localStorage...');
        return (state, error) => {
          if (error) {
            console.error('❌ Ошибка восстановления:', error);
          } else if (state) {
            console.log('✅ Данные восстановлены:', {
              chatsCount: state.chats.length,
              activeChatId: state.activeChatId,
            });
          } else {
            console.log('📦 Нет сохраненных данных, используются моки');
          }
          return state;
        };
      },
    }
  )
);
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Chat, Message } from '../types';
import { mockChats as initialMockChats } from '../mocks/mockChats';
import { mockMessages as initialMockMessages } from '../mocks/mockMessages';

interface ChatStore {
  // State
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

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
}

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
  
  // Если сообщение пустое или слишком короткое (меньше 3 символов)
  if (!trimmedText || trimmedText.length < 3) {
    return `Диалог ${index + 1}`;
  }
  
  // Удаляем лишние пробелы и переносы строк
  const cleanText = trimmedText.replace(/\s+/g, ' ').replace(/\n/g, ' ');
  
  // Обрезаем до 35 символов (не 40, чтобы добавить многоточие)
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
const loadFromLocalStorage = (): { chats: Chat[]; activeChatId: string | null } | null => {
  try {
    const stored = localStorage.getItem('chat-storage');
    if (!stored) return null;
    
    const parsed = safeJSONParse(stored);
    
    if (parsed && parsed.state && parsed.state.chats.length > 0) {
      console.log('✅ Загружено из localStorage:', parsed.state.chats.length, 'чатов');
      return {
        chats: parsed.state.chats,
        activeChatId: parsed.state.activeChatId,
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
    };
  }
  const initialChats = createInitialChats();
  return {
    chats: initialChats,
    activeChatId: initialChats[0]?.id || null,
  };
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: getInitialState().chats,
      activeChatId: getInitialState().activeChatId,
      isLoading: false,
      error: null,
      searchQuery: '',

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

      // Add message to chat (с обновлением названия для первого сообщения)
      addMessage: async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
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
          // Генерируем новое название на основе первого сообщения
          const chatIndex = get().chats.findIndex(c => c.id === chatId);
          const newTitle = generateChatTitleFromMessage(message.text, chatIndex);
          console.log('🏷️ Генерация названия чата:', newTitle);
          updatedTitle = newTitle;
        }

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

        // Simulate AI response if message is from user
        if (message.sender === 'user') {
          set({ isLoading: true });
          
          try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
              text: 'Это тестовый ответ от ИИ-ассистента. Здесь будет отображаться сгенерированный контент с поддержкой **markdown** и другими возможностями.',
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
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Ошибка отправки сообщения',
              isLoading: false 
            });
          }
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

      // Export to localStorage (manual)
      exportToLocalStorage: () => {
        try {
          console.log('💾 Ручной экспорт в localStorage');
          const state = {
            chats: get().chats,
            activeChatId: get().activeChatId,
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
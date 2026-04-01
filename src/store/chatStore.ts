import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
}

// Создаем начальные чаты с сообщениями
const createInitialChats = (): Chat[] => {
  return initialMockChats.map(chat => ({
    ...chat,
    messages: chat.id === '1' ? initialMockMessages : [],
    isLoading: false,
    error: null,
  }));
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      chats: createInitialChats(),
      activeChatId: '1',
      isLoading: false,
      error: null,
      searchQuery: '',

      // Set active chat
      setActiveChat: (chatId: string) => {
        set({ activeChatId: chatId });
      },

      // Add new chat
      addChat: (title?: string) => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: title || `Новый чат ${get().chats.length + 1}`,
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
        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          ),
        }));
      },

      // Delete chat
      deleteChat: (chatId: string) => {
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

      // Add message to chat
      addMessage: async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        const newMessage: Message = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
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
          // Поиск по названию чата
          if (chat.title.toLowerCase().includes(query)) return true;
          
          // Поиск по содержимому последнего сообщения
          const lastMessage = chat.messages[chat.messages.length - 1];
          if (lastMessage && lastMessage.text.toLowerCase().includes(query)) return true;
          
          return false;
        });
      },

      // Reset store
      resetStore: () => {
        set({
          chats: createInitialChats(),
          activeChatId: '1',
          isLoading: false,
          error: null,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        chats: state.chats,
        activeChatId: state.activeChatId,
      }),
    }
  )
);
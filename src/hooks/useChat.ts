import { useChatStore } from '../store/chatStore';

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

  const activeChat = activeChatId
    ? chats.find(chat => chat.id === activeChatId)
    : null;

  const messages = activeChat?.messages || [];

  const sendMessage = async (text: string) => {
    if (!activeChatId) return;

    await addMessage(activeChatId, {
      text,
      sender: 'user',
    });
  };

  return {
    chats,
    activeChat,
    activeChatId,
    messages,
    isLoading,
    error,
    setActiveChat,
    addChat,
    updateChatTitle,
    deleteChat,
    sendMessage,
    stopGeneration,
    clearError,
  };
};
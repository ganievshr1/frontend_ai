export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface Chat {
  id: string;
  title: string;
  lastMessageDate: string;
  messages: Message[];
  isLoading?: boolean;
  error?: string | null;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Settings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  theme: 'light' | 'dark';
}

export interface AuthData {
  credentials: string;
  scope: string;
}
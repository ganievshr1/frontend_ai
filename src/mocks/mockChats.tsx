import { Chat } from '../types';

export const mockChats: Chat[] = [
  {
    id: '1',
    title: 'Обсуждение проекта GigaChat',
    lastMessageDate: '2024-01-15T10:30:00',
    messages: [], // Сообщения будут загружены отдельно
    isLoading: false,
    error: null,
  },
  {
    id: '2',
    title: 'Техническая поддержка',
    lastMessageDate: '2024-01-14T15:45:00',
    messages: [],
    isLoading: false,
    error: null,
  },
  {
    id: '3',
    title: 'Идеи для новых функций',
    lastMessageDate: '2024-01-13T09:20:00',
    messages: [],
    isLoading: false,
    error: null,
  },
  {
    id: '4',
    title: 'Интеграция с API',
    lastMessageDate: '2024-01-12T14:10:00',
    messages: [],
    isLoading: false,
    error: null,
  },
  {
    id: '5',
    title: 'Документация и примеры',
    lastMessageDate: '2024-01-11T11:55:00',
    messages: [],
    isLoading: false,
    error: null,
  },
];
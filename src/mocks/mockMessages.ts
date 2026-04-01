// Экспортируем интерфейс Message
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Привет! Как я могу помочь вам сегодня?',
    sender: 'assistant',
    timestamp: '2024-01-15T10:30:00',
  },
  {
    id: '2',
    text: 'Здравствуйте! Расскажите, пожалуйста, о возможностях GigaChat.',
    sender: 'user',
    timestamp: '2024-01-15T10:31:00',
  },
  {
    id: '3',
    text: 'GigaChat - это мощная нейросетевая модель, которая умеет:\n\n- Отвечать на вопросы\n- Писать код\n- Создавать контент\n- **Поддерживать markdown**\n- *Форматировать текст*\n\nВот пример кода:\n```python\ndef hello():\n    print("Hello, GigaChat!")\n```',
    sender: 'assistant',
    timestamp: '2024-01-15T10:32:00',
  },
  {
    id: '4',
    text: 'Отлично! А какие языки программирования вы поддерживаете?',
    sender: 'user',
    timestamp: '2024-01-15T10:33:00',
  },
  {
    id: '5',
    text: 'Я поддерживаю множество языков программирования, включая:\n1. Python\n2. JavaScript\n3. Java\n4. C++\n5. Go\n\nИ многие другие!',
    sender: 'assistant',
    timestamp: '2024-01-15T10:34:00',
  },
  {
    id: '6',
    text: 'Спасибо за информацию!',
    sender: 'user',
    timestamp: '2024-01-15T10:35:00',
  },
];
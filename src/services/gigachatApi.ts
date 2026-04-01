interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GigaChatRequest {
  model: string;
  messages: GigaChatMessage[];
  temperature: number;
  top_p: number;
  max_tokens: number;
  stream?: boolean;
}

interface GigaChatResponse {
  choices: {
    message: {
      content: string;
      role: string;
    };
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

class GigaChatAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private baseUrl = 'https://gigachat.devices.sberbank.ru/api/v1';

  // Получение токена доступа
  async getAccessToken(credentials: string): Promise<string> {
    // Проверяем, есть ли действующий токен
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Authorization': `Basic ${credentials}`,
          'RqUID': this.generateUUID(),
        },
        body: 'scope=GIGACHAT_API_PERS',
      });

      if (!response.ok) {
        throw new Error(`Ошибка авторизации: ${response.status}`);
      }

      const data: TokenResponse = await response.json();
      this.accessToken = data.access_token;
      // Токен живет 30 минут, устанавливаем expiry на 28 минут для запаса
      this.tokenExpiry = Date.now() + (data.expires_in - 120) * 1000;
      
      // Убеждаемся, что токен не null
      if (!this.accessToken) {
        throw new Error('Токен не получен');
      }
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      throw error;
    }
  }

  // Генерация UUID для RqUID
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Обычный запрос (без streaming)
  async sendMessage(
    credentials: string,
    messages: GigaChatMessage[],
    settings: {
      model: string;
      temperature: number;
      topP: number;
      maxTokens: number;
    }
  ): Promise<string> {
    const token = await this.getAccessToken(credentials);

    const requestBody: GigaChatRequest = {
      model: settings.model,
      messages: messages,
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }

      const data: GigaChatResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw error;
    }
  }

  // Streaming запрос (SSE)
  async sendMessageStream(
    credentials: string,
    messages: GigaChatMessage[],
    settings: {
      model: string;
      temperature: number;
      topP: number;
      maxTokens: number;
    },
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const token = await this.getAccessToken(credentials);

      const requestBody: GigaChatRequest = {
        model: settings.model,
        messages: messages,
        temperature: settings.temperature,
        top_p: settings.topP,
        max_tokens: settings.maxTokens,
        stream: true,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Ошибка запроса: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Не удалось получить reader');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.error('Ошибка парсинга SSE:', e);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      console.error('❌ Ошибка streaming запроса:', error);
      onError(error instanceof Error ? error : new Error('Неизвестная ошибка'));
    }
  }
}

export const gigachatApi = new GigaChatAPI();
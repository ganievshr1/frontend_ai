// src/services/gigachatApi.ts

export interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GigaChatRequest {
  model: string;
  messages: GigaChatMessage[];
  temperature: number;
  top_p: number;
  max_tokens: number;
  stream?: boolean;
}

export interface GigaChatResponse {
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

export interface GigaChatStreamChunk {
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
  }[];
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export interface GigaChatSettings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

class GigaChatAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  
  private readonly baseUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2';
  private readonly chatBaseUrl = 'https://gigachat.devices.sberbank.ru/api/v1';

  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    return Date.now() < this.tokenExpiry - 120_000; // 2 минуты запаса
  }

  async getAccessToken(credentials: string): Promise<string> {
    if (this.isTokenValid()) {
      return this.accessToken!;
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
        const errorText = await response.text().catch(() => 'Нет деталей ошибки');
        throw new Error(`OAuth error ${response.status}: ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      
      if (!data.access_token) {
        throw new Error('Access token not found in response');
      }

      this.accessToken = data.access_token;
      const expiresInSeconds = data.expires_in || 1800;
      this.tokenExpiry = Date.now() + (expiresInSeconds - 120) * 1000;
      
      console.log('✅ Токен получен, действителен до:', new Date(this.tokenExpiry).toLocaleTimeString());
      return this.accessToken;
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      this.accessToken = null;
      this.tokenExpiry = null;
      throw error;
    }
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async sendMessage(
    credentials: string,
    messages: GigaChatMessage[],
    settings: GigaChatSettings
  ): Promise<string> {
    const token = await this.getAccessToken(credentials);

    const requestBody: GigaChatRequest = {
      model: settings.model,
      messages,
      temperature: settings.temperature,
      top_p: settings.topP,
      max_tokens: settings.maxTokens,
      stream: false,
    };

    try {
      const response = await fetch(`${this.chatBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Нет деталей ошибки');
        if (response.status === 422) {
          throw new Error('Превышен лимит контекста. Попробуйте сократить историю сообщений.');
        }
        throw new Error(`Chat API error ${response.status}: ${errorText}`);
      }

      const data: GigaChatResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      throw error;
    }
  }

  async sendMessageStream(
    credentials: string,
    messages: GigaChatMessage[],
    settings: GigaChatSettings,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const token = await this.getAccessToken(credentials);

      const requestBody: GigaChatRequest = {
        model: settings.model,
        messages,
        temperature: settings.temperature,
        top_p: settings.topP,
        max_tokens: settings.maxTokens,
        stream: true,
      };

      const response = await fetch(`${this.chatBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Нет деталей ошибки');
        throw new Error(`Stream API error ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            try {
              const parsed: GigaChatStreamChunk = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content ?? '';
              if (content) {
                onChunk(content);
              }
            } catch (parseError) {
              console.warn('⚠️ Не удалось распарсить SSE chunk:', data);
            }
          }
        }
        onComplete();
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('❌ Ошибка streaming запроса:', error);
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public invalidateToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const gigachatApi = new GigaChatAPI();
export default gigachatApi;
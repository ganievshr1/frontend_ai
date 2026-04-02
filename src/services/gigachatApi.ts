interface GigaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GigaChatAPI {
  private backendUrl = 'http://localhost:3001'; // URL бэкенда

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
    try {
      const response = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          messages,
          model: settings.model,
          temperature: settings.temperature,
          topP: settings.topP,
          maxTokens: settings.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка запроса: ${response.status}`);
      }

      const data = await response.json();
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
      const response = await fetch(`${this.backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentials,
          messages,
          model: settings.model,
          temperature: settings.temperature,
          topP: settings.topP,
          maxTokens: settings.maxTokens,
        }),
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
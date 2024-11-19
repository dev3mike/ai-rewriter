import { AIResponse, AIRequestPayload, Settings, StreamCallbacks } from '../types';

export class AIService {
  private static instance: AIService;
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private abortController: AbortController | null = null;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private async getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'systemPrompt'], (result) => {
        resolve({
          apiKey: result.apiKey || '',
          systemPrompt: result.systemPrompt || 'You are a helpful assistant that rewrites text to make it better while maintaining the original meaning.',
        });
      });
    });
  }

  public async rewriteText(text: string, callbacks?: StreamCallbacks): Promise<AIResponse> {
    try {
      const settings = await this.getSettings();
      
      if (!settings.apiKey) {
        return {
          success: false,
          content: '',
          error: 'API key not found. Please set your OpenRouter API key in the extension settings.',
        };
      }

      const payload: AIRequestPayload = {
        model: 'openai/gpt-4',
        messages: [
          {
            role: 'system',
            content: settings.systemPrompt,
          },
          {
            role: 'user',
            content: `Please rewrite the following text: "${text}"`,
          },
        ],
      };

      this.abortController = new AbortController();

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
          'HTTP-Referer': 'https://github.com/OpenRouterTeam/openrouter',
        },
        body: JSON.stringify({ ...payload, stream: !!callbacks }),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle streaming response
      if (callbacks) {
        if (!response.body) {
          throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const token = parsed.choices[0]?.delta?.content || '';
                  if (token) {
                    fullContent += token;
                    callbacks.onToken(token);
                  }
                } catch (e) {
                  console.error('Error parsing streaming response:', e);
                }
              }
            }
          }
          callbacks.onComplete();
          return { success: true, content: fullContent, isStreaming: true };
        } catch (error) {
          if (error instanceof Error) {
            callbacks.onError(error.message);
          }
          throw error;
        }
      }

      // Handle non-streaming response
      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content.trim(),
        isStreaming: false,
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        isStreaming: false,
      };
    }
  }

  public cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

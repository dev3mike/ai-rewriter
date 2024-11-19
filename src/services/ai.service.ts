import { AIResponse, AIRequestPayload, Settings } from '../types';

export class AIService {
  private static instance: AIService;
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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

  public async rewriteText(text: string): Promise<AIResponse> {
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
        model: 'openai/gpt-4o-mini',
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

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content.trim(),
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }
}

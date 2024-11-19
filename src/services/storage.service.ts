import { Settings } from '../types';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public async getSettings(): Promise<Settings> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiKey', 'systemPrompt'], (result) => {
        resolve({
          apiKey: result.apiKey || '',
          systemPrompt: result.systemPrompt || 'You are a helpful assistant that rewrites text to make it better while maintaining the original meaning.',
        });
      });
    });
  }

  public async saveSettings(settings: Settings): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set(settings, () => {
        resolve();
      });
    });
  }

  public async clearSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  }
}

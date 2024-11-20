import { StorageService } from '../services/storage.service';
import { Settings, Provider } from '../types';
import './popup.css';

class PopupUI {
  private storageService: StorageService;
  private apiKeyInput: HTMLInputElement;
  private providerSelect: HTMLSelectElement;
  private saveButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private statusElement: HTMLDivElement;

  constructor() {
    this.storageService = StorageService.getInstance();
    this.apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    this.providerSelect = document.getElementById('provider') as HTMLSelectElement;
    this.saveButton = document.getElementById('saveBtn') as HTMLButtonElement;
    this.resetButton = document.getElementById('resetBtn') as HTMLButtonElement;
    this.statusElement = document.getElementById('status') as HTMLDivElement;

    this.initializeUI();
    this.setupEventListeners();
  }

  private async initializeUI(): Promise<void> {
    const settings = await this.storageService.getSettings();
    this.apiKeyInput.value = settings.apiKey;
    this.providerSelect.value = settings.provider || 'openrouter';
  }

  private setupEventListeners(): void {
    this.saveButton.addEventListener('click', () => this.saveSettings());
    this.resetButton.addEventListener('click', () => this.resetSettings());
  }

  private async saveSettings(): Promise<void> {
    const settings: Settings = {
      apiKey: this.apiKeyInput.value,
      provider: this.providerSelect.value as Provider
    };

    try {
      await this.storageService.saveSettings(settings);
      this.showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      this.showStatus('Failed to save settings', 'error');
    }
  }

  private async resetSettings(): Promise<void> {
    this.apiKeyInput.value = '';
    this.providerSelect.value = 'openrouter';
    await this.saveSettings();
  }

  private showStatus(message: string, type: 'success' | 'error'): void {
    this.statusElement.textContent = message;
    this.statusElement.className = `status ${type}`;
    setTimeout(() => {
      this.statusElement.textContent = '';
      this.statusElement.className = 'status';
    }, 3000);
  }
}

// Initialize popup UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});

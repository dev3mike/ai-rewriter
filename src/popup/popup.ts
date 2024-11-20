import { StorageService } from '../services/storage.service';
import { Settings } from '../types';
import './popup.css';

class PopupUI {
  private storageService: StorageService;
  private apiKeyInput: HTMLInputElement;
  private saveButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private statusElement: HTMLDivElement;

  constructor() {
    this.storageService = StorageService.getInstance();
    this.apiKeyInput = document.getElementById('apiKey') as HTMLInputElement;
    this.saveButton = document.getElementById('saveBtn') as HTMLButtonElement;
    this.resetButton = document.getElementById('resetBtn') as HTMLButtonElement;
    this.statusElement = document.getElementById('status') as HTMLDivElement;

    this.initializeUI();
    this.setupEventListeners();
  }

  private async initializeUI(): Promise<void> {
    const settings = await this.storageService.getSettings();
    this.apiKeyInput.value = settings.apiKey;
  }

  private setupEventListeners(): void {
    this.saveButton.addEventListener('click', () => this.saveSettings());
    this.resetButton.addEventListener('click', () => this.resetSettings());
  }

  private async saveSettings(): Promise<void> {
    const settings: Settings = {
      apiKey: this.apiKeyInput.value.trim(),
    };

    try {
      await this.storageService.saveSettings(settings);
      this.showStatus('Settings saved successfully!', false);
    } catch (error) {
      this.showStatus('Failed to save settings. Please try again.', true);
    }
  }

  private async resetSettings(): Promise<void> {
    try {
      await this.storageService.clearSettings();
      const settings = await this.storageService.getSettings();
      this.apiKeyInput.value = settings.apiKey;
      this.showStatus('Settings reset successfully!', false);
    } catch (error) {
      this.showStatus('Failed to reset settings. Please try again.', true);
    }
  }

  private showStatus(message: string, isError: boolean): void {
    this.statusElement.textContent = message;
    this.statusElement.className = 'status ' + (isError ? 'error' : 'success');

    setTimeout(() => {
      this.statusElement.className = 'status';
    }, 3000);
  }
}

// Initialize popup UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});

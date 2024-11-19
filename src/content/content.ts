import { Message } from '../types';

class ContentScript {
  private toast: HTMLDivElement | null = null;
  private suggestionCard: HTMLDivElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private currentSelection: Selection | null = null;
  private rewrittenText: string = '';
  private originalText: string = '';
  private isStreaming: boolean = false;
  private streamContent: string = '';
  private typingSpeed: number = 1; // Adjust typing speed (lower = faster)

  constructor() {
    this.initializeMessageListener();
    this.createToastElement();
    this.createOverlay();
    this.createSuggestionCard();
  }

  private createToastElement(): void {
    this.toast = document.createElement('div');
    this.toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px;
      background: #333;
      color: white;
      border-radius: 8px;
      z-index: 10001;
      display: none;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
    `;
    document.body.appendChild(this.toast);
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: none;
      backdrop-filter: blur(2px);
    `;
    document.body.appendChild(this.overlay);
  }

  private createSuggestionCard(): void {
    this.suggestionCard = document.createElement('div');
    this.suggestionCard.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background: #2c2c2c;
      color: white;
      border-radius: 12px;
      z-index: 10001;
      display: none;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      font-family: system-ui, -apple-system, sans-serif;
      border: 1px solid #3c3c3c;
      animation: fadeIn 0.3s ease-out;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #3c3c3c;
    `;

    const title = document.createElement('div');
    title.textContent = 'AI Rewriter';
    title.style.cssText = `
      font-weight: 600;
      font-size: 16px;
      color: #fff;
      flex-grow: 1;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      padding: 4px;
      font-size: 16px;
      line-height: 1;
      transition: color 0.2s;
    `;
    closeButton.addEventListener('mouseover', () => {
      closeButton.style.color = '#fff';
    });
    closeButton.addEventListener('mouseout', () => {
      closeButton.style.color = '#999';
    });
    closeButton.addEventListener('click', () => this.hideSuggestionCard());

    header.appendChild(title);
    header.appendChild(closeButton);

    const content = document.createElement('div');
    content.style.cssText = `
      margin-bottom: 16px;
      color: #e0e0e0;
      font-size: 15px;
      line-height: 1.6;
      white-space: pre-wrap;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `;

    const copyButton = this.createButton('Copy', '📋');
    copyButton.addEventListener('click', () => this.copyToClipboard());

    const regenerateButton = this.createButton('Regenerate', '🔄');
    regenerateButton.addEventListener('click', () => this.regenerateText());

    buttonContainer.appendChild(copyButton);
    buttonContainer.appendChild(regenerateButton);

    this.suggestionCard.appendChild(header);
    this.suggestionCard.appendChild(content);
    this.suggestionCard.appendChild(buttonContainer);
    document.body.appendChild(this.suggestionCard);
  }

  private createButton(text: string, icon: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerHTML = `${icon} ${text}`;
    button.style.cssText = `
      background: #3c3c3c;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background-color 0.2s;
    `;
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#4c4c4c';
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#3c3c3c';
    });
    return button;
  }

  private async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.rewrittenText);
      this.showToast('Copied to clipboard!');
    } catch (error) {
      this.showToast('Failed to copy text', true);
    }
  }

  private regenerateText(): void {
    if (!this.originalText) return;

    // Send message to background script to regenerate
    chrome.runtime.sendMessage({
      type: 'REGENERATE_TEXT',
      payload: {
        text: this.originalText
      }
    });
  }

  private showSuggestionCard(text: string, isStreaming: boolean = false): void {
    if (!this.suggestionCard || !this.overlay) return;

    // Store the text
    this.rewrittenText = text;
    this.originalText = window.getSelection()?.toString() || '';

    // Update content
    const content = this.suggestionCard.querySelector('div:nth-child(2)') as HTMLDivElement;
    if (content) {
      content.textContent = text;
    }

    // Show overlay and card if not already visible
    if (this.overlay.style.display !== 'block') {
      this.overlay.style.display = 'block';
      this.suggestionCard.style.display = 'block';
    }
  }

  private startStreaming(): void {
    if (!this.suggestionCard) return;

    this.isStreaming = true;
    this.streamContent = '';
    this.showSuggestionCard('', true);

    // Update UI for streaming state
    const content = this.suggestionCard.querySelector('div:nth-child(2)') as HTMLDivElement;
    if (content) {
      content.textContent = '';
      // Add blinking cursor effect
      const cursor = document.createElement('span');
      cursor.className = 'typing-cursor';
      cursor.textContent = '|';
      cursor.style.cssText = `
        display: inline-block;
        animation: blink 1s step-end infinite;
      `;
      content.appendChild(cursor);

      // Add cursor blink animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes blink {
          50% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  private appendStreamToken(token: string): void {
    if (!this.suggestionCard || !this.isStreaming) return;

    const content = this.suggestionCard.querySelector('div:nth-child(2)') as HTMLDivElement;
    if (!content) return;

    this.streamContent += token;
    
    // Remove existing cursor
    const cursor = content.querySelector('.typing-cursor');
    if (cursor) {
      cursor.remove();
    }

    // Update content with new token
    content.textContent = this.streamContent;

    // Add cursor back
    const newCursor = document.createElement('span');
    newCursor.className = 'typing-cursor';
    newCursor.textContent = '|';
    content.appendChild(newCursor);
  }

  private endStreaming(): void {
    if (!this.suggestionCard) return;

    this.isStreaming = false;
    this.rewrittenText = this.streamContent;

    // Remove cursor
    const content = this.suggestionCard.querySelector('div:nth-child(2)') as HTMLDivElement;
    if (content) {
      const cursor = content.querySelector('.typing-cursor');
      if (cursor) {
        cursor.remove();
      }
    }
  }

  private hideSuggestionCard(): void {
    if (this.suggestionCard && this.overlay) {
      this.suggestionCard.style.display = 'none';
      this.overlay.style.display = 'none';
    }
  }

  private showToast(message: string, isError: boolean = false): void {
    if (!this.toast) return;

    this.toast.textContent = message;
    this.toast.style.background = isError ? '#dc3545' : '#28a745';
    this.toast.style.display = 'block';

    setTimeout(() => {
      if (this.toast) {
        this.toast.style.display = 'none';
      }
    }, 3000);
  }

  private initializeMessageListener(): void {
    chrome.runtime.onMessage.addListener((message: Message) => {
      switch (message.type) {
        case 'REWRITE_TEXT':
          if (message.payload.text) {
            this.showSuggestionCard(message.payload.text);
          }
          break;
        case 'STREAM_START':
          this.startStreaming();
          break;
        case 'STREAM_TOKEN':
          if (message.payload.token) {
            this.appendStreamToken(message.payload.token);
          }
          break;
        case 'STREAM_END':
          this.endStreaming();
          break;
        case 'STREAM_ERROR':
        case 'SHOW_ERROR':
          if (message.payload.error) {
            this.showToast(message.payload.error, true);
            this.hideSuggestionCard();
          }
          break;
      }
    });
  }
}

// Initialize content script
new ContentScript();

import { AIService } from '../services/ai.service';
import { Message } from '../types';

// Remove existing menu items if any
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'rewriteText',
      title: 'AI Rewriter | Rewrite it',
      contexts: ['selection', 'editable'],
      documentUrlPatterns: ['<all_urls>']
    });
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'rewriteText' && tab?.id) {
    const selectedText = info.selectionText;
    if (!selectedText) return;

    const tabId = tab.id; // Store tab.id to ensure it's defined throughout the callbacks

    try {
      const aiService = AIService.getInstance();

      // Start streaming
      chrome.tabs.sendMessage(tabId, {
        type: 'STREAM_START',
        payload: {},
      } as Message);

      const response = await aiService.rewriteText(selectedText, {
        onToken: (token: string) => {
          chrome.tabs.sendMessage(tabId, {
            type: 'STREAM_TOKEN',
            payload: {
              token,
            },
          } as Message);
        },
        onComplete: () => {
          chrome.tabs.sendMessage(tabId, {
            type: 'STREAM_END',
            payload: {},
          } as Message);
        },
        onError: (error: string) => {
          chrome.tabs.sendMessage(tabId, {
            type: 'STREAM_ERROR',
            payload: {
              error,
            },
          } as Message);
        },
      });

      if (!response.success) {
        chrome.tabs.sendMessage(tabId, {
          type: 'STREAM_ERROR',
          payload: {
            error: response.error || 'Failed to rewrite text',
          },
        } as Message);
      }
    } catch (error) {
      chrome.tabs.sendMessage(tabId, {
        type: 'STREAM_ERROR',
        payload: {
          error: 'Failed to rewrite text. Please try again.',
        },
      } as Message);
    }
  }
});

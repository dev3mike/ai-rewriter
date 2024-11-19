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

    try {
      const aiService = AIService.getInstance();
      const response = await aiService.rewriteText(selectedText);

      if (response.success) {
        // Send message to content script with rewritten text
        chrome.tabs.sendMessage(tab.id, {
          type: 'REWRITE_TEXT',
          payload: {
            text: response.content,
            selectedText: selectedText,
          },
        } as Message);
      } else {
        // Send error message to content script
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_ERROR',
          payload: {
            error: response.error,
          },
        } as Message);
      }
    } catch (error) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_ERROR',
        payload: {
          error: 'Failed to rewrite text. Please try again.',
        },
      } as Message);
    }
  }
});

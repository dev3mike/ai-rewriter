export interface Settings {
  apiKey: string;
  systemPrompt: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
}

export interface Message {
  type: 'REWRITE_TEXT' | 'REPLACE_TEXT' | 'SHOW_ERROR';
  payload: {
    text?: string;
    error?: string;
    selectedText?: string;
  };
}

export interface AIRequestPayload {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

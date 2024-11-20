export interface Settings {
  apiKey: string;
}

export interface AIResponse {
  success: boolean;
  content: string;
  error?: string;
  isStreaming?: boolean;
}

export interface Message {
  type: 'REWRITE_TEXT' | 'REPLACE_TEXT' | 'SHOW_ERROR' | 'STREAM_START' | 'STREAM_TOKEN' | 'STREAM_END' | 'STREAM_ERROR';
  payload: {
    text?: string;
    error?: string;
    selectedText?: string;
    token?: string;
  };
}

export interface AIRequestPayload {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

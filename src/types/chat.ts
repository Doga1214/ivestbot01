export interface ChatAction {
  label: string;
  type: 'navigate' | 'link' | 'quick_reply';
  payload: string; // e.g. '/wallet', 'https://t.me/ivestbotsupport', or question query
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  actions?: ChatAction[];
}

export interface QuickPrompt {
  id: string;
  icon: string;
  title: string;
  query: string;
}

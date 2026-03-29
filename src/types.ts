export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTranslating?: boolean;
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

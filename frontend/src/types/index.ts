export type UserRole = 'user' | 'admin' | 'superadmin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  filename: string;
  language: string;
  category: string;
  uploadDate: string;
  isPublic: boolean;
  userId: string;
  status: 'processing' | 'ready' | 'error';
  pageCount?: number;
}

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  excerpt: string;
  score: number;
  source: 'general' | 'personal';
  page?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: {
    documentId: string;
    documentTitle: string;
    page: number;
    source: 'general' | 'personal';
  }[];
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  documentIds: string[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

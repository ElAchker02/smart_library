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
  filename: string;
  file: string | null;
  language: string;
  source: 'personal' | 'general';
  status: 'pending_meta' | 'uploaded' | 'processed' | 'indexed';
  dateAdded: string;
  owner: string;
  tagId: number | null;
  tagName?: string | null;
  path?: string | null;
}

export interface SearchResult {
  documentId: string;
  documentTitle: string;
  filename: string;
  language: string;
  source: 'general' | 'personal';
  status: 'pending_meta' | 'uploaded' | 'processed' | 'indexed';
  dateAdded: string;
  tagName?: string | null;
  file?: string | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  mode: 'general' | 'personal' | 'mixed';
  isActive: boolean;
  startedAt: string;
  lastActivity: string;
}

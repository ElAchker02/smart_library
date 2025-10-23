const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, body = null, headers = {}, isFormData = false } = options;

  const config: RequestInit = {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    },
    body,
  };

  // Remove Content-Type for FormData, let browser set correct boundary.
  if (isFormData && config.headers && 'Content-Type' in config.headers) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ApiDocument {
  id: string;
  title: string;
  filename: string;
  file: string | null;
  tag: number | null;
  owner: string;
  source: 'personal' | 'general';
  language: string;
  status: 'pending_meta' | 'uploaded' | 'processed' | 'indexed';
  date_added: string;
  path: string | null;
}

export interface ApiTag {
  id: number;
  name: string;
}

export interface ApiConversation {
  id: string;
  title: string;
  mode: 'general' | 'personal' | 'mixed';
  is_active: boolean;
  started_at: string;
  last_activity: string;
}

export interface ApiMessage {
  id: string;
  conversation: string;
  sender: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  role?: string;
  password?: string;
}

export async function loginRequest(email: string, password: string) {
  return request<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchDocuments(token: string | null) {
  return request<ApiDocument[]>('/documents/', {
    method: 'GET',
    token,
  });
}

export interface UploadDocumentPayload {
  file: File;
  title: string;
  tag?: number | null;
  source?: 'personal' | 'general';
  language?: string;
}

export async function uploadDocument(payload: UploadDocumentPayload, token: string | null) {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('title', payload.title);

  if (payload.tag !== undefined && payload.tag !== null) {
    formData.append('tag', String(payload.tag));
  }
  if (payload.source) {
    formData.append('source', payload.source);
  }
  if (payload.language) {
    formData.append('language', payload.language);
  }

  return request<ApiDocument>('/documents/', {
    method: 'POST',
    token,
    body: formData,
    isFormData: true,
  });
}

export interface UpdateDocumentPayload {
  title?: string;
  tag?: number | null;
  source?: 'personal' | 'general';
  language?: string;
}

export async function updateDocument(
  id: string,
  payload: UpdateDocumentPayload,
  token: string | null,
) {
  return request<ApiDocument>(`/documents/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}


export async function deleteDocument(documentId: string, token: string | null) {
  return request<void>(`/documents/${documentId}/`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchTags(token: string | null) {
  return request<ApiTag[]>('/tags/', {
    method: 'GET',
    token,
  });
}

export async function fetchConversations(token: string | null) {
  return request<ApiConversation[]>('/conversations/', {
    method: 'GET',
    token,
  });
}

export async function createConversation(
  payload: Partial<Pick<ApiConversation, 'title' | 'mode' | 'is_active'>>,
  token: string | null,
) {
  return request<ApiConversation>('/conversations/', {
    method: 'POST',
    token,
    body: JSON.stringify({
      title: payload.title ?? 'Nouvelle conversation',
      mode: payload.mode ?? 'personal',
      is_active: payload.is_active ?? true,
    }),
  });
}

export async function fetchMessages(token: string | null) {
  return request<ApiMessage[]>('/messages/', {
    method: 'GET',
    token,
  });
}

export async function sendMessage(
  payload: { conversation: string; sender: 'user' | 'assistant'; content: string },
  token: string | null,
) {
  return request<ApiMessage>('/messages/', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function fetchPendingDocuments(token: string | null) {
  return request<ApiDocument[]>('/documents/awaiting-approval/', {
    method: 'GET',
    token,
  });
}

export async function approveDocument(id: string, token: string | null) {
  return request<ApiDocument>(`/documents/${id}/approve/`, {
    method: 'POST',
    token,
  });
}

export async function fetchUsers(token: string | null) {
  return request<ApiUser[]>('/users/', {
    method: 'GET',
    token,
  });
}

export async function createUser(payload: CreateUserPayload, token: string | null) {
  return request<ApiUser>('/users/', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
  token: string | null,
) {
  return request<ApiUser>(`/users/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string, token: string | null) {
  return request<void>(`/users/${id}/`, {
    method: 'DELETE',
    token,
  });
}



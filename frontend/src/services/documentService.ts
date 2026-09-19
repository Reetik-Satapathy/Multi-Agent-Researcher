import type { DocumentUploadResult } from '../types/research';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export const documentService = {
  async upload(file: File): Promise<DocumentUploadResult> {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, { method: 'POST', body: form });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<DocumentUploadResult>;
  },

  async ask(documentId: string, question: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json() as { answer: string };
    return data.answer;
  },
};

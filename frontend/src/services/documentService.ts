import type { DocumentUploadResult } from '../types/research';
import type { DocumentMetadata } from '../types/research';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface DocumentChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DocumentComparisonResult {
  document_ids: string[];
  documents: DocumentMetadata[];
  comparison: {
    overview: string;
    similarities: string[];
    differences: string[];
    research_gaps: string[];
    comparison_table: Array<{ metric: string; values: Record<string, string> }>;
  };
}

export const documentService = {
  async upload(file: File): Promise<DocumentUploadResult> {
    const form = new FormData();
    form.append('file', file);
    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, { method: 'POST', body: form });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<DocumentUploadResult>;
  },

  async ask(documentId: string, question: string, history: DocumentChatMessage[] = []): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(documentId)}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history: history.slice(-8) }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json() as { answer: string };
    return data.answer;
  },

  async compare(documentIds: string[]): Promise<DocumentComparisonResult> {
    const response = await fetch(`${API_BASE_URL}/api/documents/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json() as Promise<DocumentComparisonResult>;
  },

  async askComparison(
    documentIds: string[],
    question: string,
    history: DocumentChatMessage[] = [],
  ): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/documents/compare/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds, question, history: history.slice(-8) }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json() as { answer: string };
    return data.answer;
  },
};

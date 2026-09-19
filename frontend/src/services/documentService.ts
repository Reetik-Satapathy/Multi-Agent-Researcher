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
  async upload(file: File, onProgress?: (progress: number) => void): Promise<DocumentUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('POST', `${API_BASE_URL}/api/documents/upload`);
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      request.onerror = () => reject(new Error('PDF upload failed.'));
      request.onload = () => {
        if (request.status < 200 || request.status >= 300) {
          reject(new Error(request.responseText || 'PDF upload failed.'));
          return;
        }
        try {
          resolve(JSON.parse(request.responseText) as DocumentUploadResult);
        } catch {
          reject(new Error('The backend returned an invalid PDF upload response.'));
        }
      };
      request.send(form);
    });
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
    const data = await response.json() as Partial<DocumentComparisonResult>;
    const comparison: Partial<DocumentComparisonResult['comparison']> = data.comparison || {};
    return {
      document_ids: data.document_ids || documentIds,
      documents: Array.isArray(data.documents) ? data.documents : [],
      comparison: {
        overview: typeof comparison.overview === 'string' ? comparison.overview : 'No comparison overview was returned.',
        similarities: Array.isArray(comparison.similarities) ? comparison.similarities : [],
        differences: Array.isArray(comparison.differences) ? comparison.differences : [],
        research_gaps: Array.isArray(comparison.research_gaps) ? comparison.research_gaps : [],
        comparison_table: Array.isArray(comparison.comparison_table) ? comparison.comparison_table : [],
      },
    };
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

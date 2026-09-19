import type { Paper } from '../types/research';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface PaperFilters {
  query?: string;
  count?: number;
  year?: string;
  area?: string;
  journal?: string;
  openAccessOnly?: boolean;
  sortBy?: 'relevance' | 'citations' | 'year';
}

export const paperService = {
  // Search research papers with query and filters
  async searchPapers(filters: PaperFilters = {}): Promise<Paper[]> {
    const response = await fetch(`${API_BASE_URL}/api/papers/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: filters.query || 'research', count: filters.count || 30 }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json() as { papers: Array<Record<string, unknown>> };
    let results = data.papers.map(toPaper);
    if (filters.area && filters.area !== 'All Areas') results = results.filter((p) => p.area === filters.area);
    if (filters.year && filters.year !== 'All Years') results = results.filter((p) => p.year === Number(filters.year));
    if (filters.sortBy === 'citations') results.sort((a, b) => b.citations - a.citations);
    if (filters.sortBy === 'year') results.sort((a, b) => b.year - a.year);
    return results;
  },

  async getPaperById(_id: string): Promise<Paper | null> {
    return null;
  },

  async getSavedPapers(): Promise<Paper[]> {
    return [];
  },

  toggleSavePaper(_id: string): boolean {
    return false;
  }
};

function toPaper(raw: Record<string, unknown>): Paper {
  const title = String(raw.title || 'Untitled paper');
  const source = String(raw.source || 'Research venue');
  const doi = String(raw.doi || raw.url || '');
  return {
    id: doi || `${title}-${raw.year || 'unknown'}`,
    title,
    authors: Array.isArray(raw.authors) ? raw.authors.map(String) : [],
    year: Number(raw.year || 0),
    journal: String(raw.venue || source),
    doi,
    url: String(raw.url || ''),
    abstract: String(raw.abstract || 'No abstract available.'),
    openAccess: Boolean(raw.open_access),
    citations: Number(raw.citation_count || 0),
    area: source,
    peerReviewStatus: String(raw.peer_review_status || 'unverified'),
  };
}

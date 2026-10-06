import React, { useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, Trash2 } from 'lucide-react';
import { PaperCard } from '../components/PaperCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import type { Paper } from '../types/research';
import { paperService } from '../services/paperService';
import type { PaperFilters } from '../services/paperService';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

interface DiscoverPapersViewProps {
  onOpenPaper: (paper: Paper) => void;
  onSummarizePaper: (paper: Paper) => void;
  onCompareToggle: (paper: Paper) => void;
  onSaveToggle: (paper: Paper) => void;
  comparedPapers: Paper[];
  savedPapers: Paper[];
  initialQuery?: string;
}

const CATEGORY_FILTERS = [
  'All',
  'Computer Science',
  'AI / ML',
  'Data Science',
  'Healthcare',
  'Climate',
];

export const DiscoverPapersView: React.FC<DiscoverPapersViewProps> = ({
  onOpenPaper,
  onSummarizePaper,
  onCompareToggle,
  onSaveToggle,
  comparedPapers,
  savedPapers,
  initialQuery = ''
}) => {
  const [query, setQuery] = useLocalStorageState('discover-query-v1', initialQuery);
  const [submittedQuery, setSubmittedQuery] = useLocalStorageState('discover-submitted-query-v1', initialQuery);
  const [hasSearched, setHasSearched] = useLocalStorageState('discover-has-searched-v1', false);
  const [papers, setPapers] = useLocalStorageState<Paper[]>('discover-results-v1', []);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const searchRequestId = useRef(0);

  const [selectedYear, setSelectedYear] = useLocalStorageState<string>('discover-year-v1', 'All Years');
  const [sortBy, setSortBy] = useLocalStorageState<'relevance' | 'citations' | 'year'>('discover-sort-v1', 'relevance');
  const [paperCount, setPaperCount] = useLocalStorageState<number>('discover-count-v1', 20);

  const years = [...new Set(papers.map((paper) => paper.year).filter((year) => Number.isFinite(year) && year > 0))]
    .sort((a, b) => b - a)
    .map(String);

  const visiblePapers = papers
    .filter((paper) => selectedYear === 'All Years' || String(paper.year) === selectedYear)
    .filter((paper) => selectedCategory === 'All' || !paper.area || paper.area.toLowerCase().includes(selectedCategory.toLowerCase()) || selectedCategory === 'AI / ML')
    .map((paper, index) => ({ paper, index }))
    .sort((a, b) => {
      if (sortBy === 'citations') return b.paper.citations - a.paper.citations || a.index - b.index;
      if (sortBy === 'year') return b.paper.year - a.paper.year || a.index - b.index;
      return a.index - b.index;
    })
    .map(({ paper }) => paper);

  const fetchPapers = async (overrides: Partial<PaperFilters> = {}) => {
    const requestId = ++searchRequestId.current;
    setLoading(true);
    setSearchError('');
    const filters: PaperFilters = {
      query: submittedQuery,
      count: paperCount,
      ...overrides,
    };
    try {
      const data = await paperService.searchPapers(filters);
      if (requestId === searchRequestId.current) setPapers(data);
    } catch (error) {
      if (requestId === searchRequestId.current) {
        setSearchError(error instanceof Error ? error.message : 'Paper search failed.');
      }
    } finally {
      if (requestId === searchRequestId.current) setLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const topic = query.trim();
    if (!topic) return;
    setHasSearched(true);
    setSubmittedQuery(topic);
    setSelectedYear('All Years');
    void fetchPapers({ query: topic, count: paperCount });
  };

  const resetFilters = () => {
    setSelectedYear('All Years');
    setSortBy('relevance');
    setSelectedCategory('All');
  };

  const clearSearch = () => {
    searchRequestId.current += 1;
    setQuery('');
    setSubmittedQuery('');
    setHasSearched(false);
    setPapers([]);
    setLoading(false);
    setSearchError('');
    resetFilters();
    setSortBy('relevance');
    setPaperCount(20);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Editorial Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#F5F7F3]">Discover Papers</h2>
        <p className="mt-1 text-xs text-[#A5ADA7]">
          Find and explore relevant research from across the knowledge base.
        </p>
      </div>

      {/* Main Search Bar */}
      <form className="relative" onSubmit={handleSearch}>
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0C100E] p-2 transition-all focus-within:border-[#6F9B83]/40 focus-within:shadow-[0_0_20px_-8px_rgba(49,92,75,0.3)]">
          <Search className="h-4 w-4 shrink-0 text-[#6F9B83] ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search papers by title, topic, author, or DOI..."
            className="w-full bg-transparent text-sm text-[#F5F7F3] placeholder-[#737B76] outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded text-[#737B76] hover:text-[#F5F7F3]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-lg bg-[#315C4B] px-4 py-2 text-xs font-semibold text-[#F5F7F3] transition-colors hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Horizontal Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/[0.06] py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                selectedCategory === cat
                  ? 'border border-[#6F9B83]/40 bg-[#16231D] font-medium text-[#F5F7F3]'
                  : 'border border-transparent bg-transparent text-[#A5ADA7] hover:bg-[#101512] hover:text-[#F5F7F3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A5ADA7]">
          <label className="flex items-center gap-1.5">
            <span className="text-[#737B76]">Count:</span>
            <select
              value={paperCount}
              onChange={(event) => {
                const count = Number(event.target.value);
                setPaperCount(count);
                if (hasSearched) void fetchPapers({ count });
              }}
              className="rounded-md border border-white/[0.08] bg-[#0C100E] px-2 py-1 text-xs text-[#F5F7F3] outline-none focus:border-[#6F9B83]"
            >
              {[10, 15, 20, 25].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <span className="text-[#737B76]">Year:</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="rounded-md border border-white/[0.08] bg-[#0C100E] px-2 py-1 text-xs text-[#F5F7F3] outline-none focus:border-[#6F9B83]"
            >
              <option value="All Years">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3 w-3 text-[#737B76]" />
            <span className="text-[#737B76]">Sort:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'relevance' | 'citations' | 'year')}
              className="rounded-md border border-white/[0.08] bg-[#0C100E] px-2 py-1 text-xs text-[#F5F7F3] outline-none focus:border-[#6F9B83]"
            >
              <option value="relevance">Relevance</option>
              <option value="citations">Most Citations</option>
              <option value="year">Latest Release</option>
            </select>
          </label>

          {(selectedYear !== 'All Years' || sortBy !== 'relevance' || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#6F9B83] hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Header Status */}
      <div className="flex items-center justify-between px-1 text-xs text-[#737B76]">
        <span>
          Showing {visiblePapers.length} publications
        </span>
        {hasSearched && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex items-center gap-1 text-xs text-[#737B76] hover:text-[#F5F7F3] transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear search</span>
          </button>
        )}
      </div>

      {/* Vertical Editorial Results List */}
      {searchError ? (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-xs text-red-300">{searchError}</p>
      ) : !hasSearched ? (
        <EmptyState
          title="Explore Scholarly Literature"
          description="Enter a research topic, keyword, or author name above to discover verified academic papers."
        />
      ) : loading ? (
        <LoadingState message="Querying Crossref, OpenAlex, and Semantic Scholar..." />
      ) : visiblePapers.length > 0 ? (
        <div className="space-y-3">
          {visiblePapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onOpen={onOpenPaper}
              onSummarize={onSummarizePaper}
              onCompareToggle={onCompareToggle}
              onSaveToggle={onSaveToggle}
              isCompared={comparedPapers.some((p) => p.id === paper.id)}
              isSaved={savedPapers.some((p) => p.id === paper.id) || paper.isSaved}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Publications Found"
          description="Try broadening your search query or adjusting your filters."
          actionText="Clear Filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
};

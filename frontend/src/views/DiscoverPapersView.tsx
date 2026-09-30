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
  const searchRequestId = useRef(0);

  // Filters apply to the current result set without rerunning the search.
  const [selectedYear, setSelectedYear] = useLocalStorageState<string>('discover-year-v1', 'All Years');
  const [sortBy, setSortBy] = useLocalStorageState<'relevance' | 'citations' | 'year'>('discover-sort-v1', 'relevance');
  const [paperCount, setPaperCount] = useLocalStorageState<number>('discover-count-v1', 20);

  const years = [...new Set(papers.map((paper) => paper.year).filter((year) => Number.isFinite(year) && year > 0))]
    .sort((a, b) => b - a)
    .map(String);
  const visiblePapers = papers
    .filter((paper) => selectedYear === 'All Years' || String(paper.year) === selectedYear)
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-[#171717] tracking-tight">Discover Papers</h2>
        <p className="text-xs text-[#6B6B67] mt-1">
          Explore peer-reviewed publications, arXiv preprints, and open-access scientific literature.
        </p>
      </div>

      {/* Large Search Bar */}
      <form className="relative" onSubmit={handleSearch}>
        <div className="glass-input rounded-2xl p-2.5 flex items-center space-x-3 shadow-card">
          <Search className="w-5 h-5 text-[#1D4ED8] ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research papers, topics, authors, DOI (e.g. '10.48550/arXiv.2501.08921' or 'Pathology Graph Transformer')"
            className="w-full bg-transparent text-[#171717] placeholder-[#8B8F98] text-sm md:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-[#6B6B67] hover:text-[#171717] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 rounded-xl bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[#6B6B67]">
            <span>Papers:</span>
            <select
              value={paperCount}
              onChange={(event) => {
                const count = Number(event.target.value);
                setPaperCount(count);
                if (hasSearched) void fetchPapers({ count });
              }}
              className="rounded-lg border border-[#D9D7D0] bg-white px-2.5 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#1D4ED8]"
            >
              {[10, 15, 20, 25].map((count) => (
                <option key={count} value={count}>{count}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-[#6B6B67]">
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="rounded-lg border border-[#D9D7D0] bg-white px-2.5 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value="All Years">All Years</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[#6B6B67]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'relevance' | 'citations' | 'year')}
              className="rounded-lg border border-[#D9D7D0] bg-white px-2.5 py-1.5 text-xs text-[#171717] focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value="relevance">Relevance</option>
              <option value="citations">Most Citations</option>
              <option value="year">Latest Release</option>
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={selectedYear === 'All Years' && sortBy === 'relevance'}
            className="text-xs text-[#6B6B67] transition-colors hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono text-[#6B6B67]">
          Showing {visiblePapers.length} publications
        </span>
        {hasSearched && !loading && !searchError && selectedYear === 'All Years' && papers.length < paperCount && (
          <span className="text-xs text-[#6B6B67]" role="status">
            Found {papers.length} of {paperCount} requested; showing all available papers.
          </span>
        )}
        <button
          type="button"
          onClick={clearSearch}
          disabled={!hasSearched && !query && papers.length === 0 && selectedYear === 'All Years' && sortBy === 'relevance' && paperCount === 20}
          className="flex items-center gap-1.5 rounded-lg border border-[#D9D7D0] px-3 py-1.5 text-xs font-semibold text-[#6B6B67] transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear results</span>
        </button>
      </div>

      {/* Results Grid */}
      {searchError ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{searchError}</p>
      ) : !hasSearched ? (
        <EmptyState
          title="Ready to discover papers?"
          description="Enter a research topic above and select Search to find relevant academic papers."
        />
      ) : loading ? (
        <LoadingState message="Discovering Papers across Academic Repositories..." />
      ) : visiblePapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          title={papers.length > 0 ? 'No Papers for This Year' : 'No Matching Papers Found'}
          description={papers.length > 0 ? 'Choose another year or reset the year filter.' : 'Try broadening your search query or clear active filters.'}
          actionText={papers.length > 0 ? 'Reset Filters' : 'Clear Search'}
          onAction={papers.length > 0 ? resetFilters : clearSearch}
        />
      )}
    </div>
  );
};

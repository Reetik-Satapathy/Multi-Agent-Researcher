import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { PaperCard } from '../components/PaperCard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import type { Paper } from '../types/research';
import { paperService } from '../services/paperService';
import type { PaperFilters } from '../services/paperService';

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
  const [query, setQuery] = useState(initialQuery);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedArea, setSelectedArea] = useState<string>('All Areas');
  const [selectedYear, setSelectedYear] = useState<string>('All Years');
  const [openAccessOnly, setOpenAccessOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'citations' | 'year'>('relevance');
  const [requestedCount, setRequestedCount] = useState(20);

  const researchAreas = ['All Areas', 'Artificial Intelligence', 'Computer Science', 'Medicine', 'Neuroscience', 'Physics', 'Robotics'];
  const years = ['All Years', '2026', '2025', '2024'];

  const fetchPapers = async () => {
    setLoading(true);
    const filters: PaperFilters = {
      query,
      count: requestedCount,
      area: selectedArea,
      year: selectedYear,
      openAccessOnly,
      sortBy
    };
    try {
      const data = await paperService.searchPapers(filters);
      setPapers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [query, selectedArea, selectedYear, openAccessOnly, sortBy, requestedCount]);

  const clearFilters = () => {
    setQuery('');
    setSelectedArea('All Areas');
    setSelectedYear('All Years');
    setOpenAccessOnly(false);
    setSortBy('relevance');
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
      <div className="relative">
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
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Research Area Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-[#6B6B67]">
            <Filter className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Area:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-[#09090B] border border-[#D9D7D0] text-[#171717] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#1D4ED8]"
            >
              {researchAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center space-x-1.5 text-xs text-[#6B6B67]">
            <span>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-[#09090B] border border-[#D9D7D0] text-[#171717] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#1D4ED8]"
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Open Access Toggle */}
          <label className="flex items-center space-x-2 text-xs text-[#6B6B67] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={openAccessOnly}
              onChange={(e) => setOpenAccessOnly(e.target.checked)}
              className="rounded bg-black border-[#C4C2BB] text-[#1D4ED8] focus:ring-0"
            />
            <span>Open Access Only</span>
          </label>
        </div>

        {/* Sorting & Clear */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center gap-1.5 text-xs text-[#6B6B67]">
            <span>Papers:</span>
            <input type="number" min={1} max={100} value={requestedCount} onChange={(e) => setRequestedCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))} className="w-16 rounded-lg border border-[#D9D7D0] bg-[#09090B] px-2.5 py-1 text-xs text-[#171717] outline-none" />
          </label>
          <div className="flex items-center space-x-1.5 text-xs text-[#6B6B67]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#09090B] border border-[#D9D7D0] text-[#171717] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value="relevance">Relevance</option>
              <option value="citations">Most Citations</option>
              <option value="year">Latest Release</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="text-xs text-[#6B6B67] hover:text-[#171717] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono text-[#6B6B67]">
          Showing {papers.length} publications
        </span>
      </div>

      {/* Results Grid */}
      {loading ? (
        <LoadingState message="Discovering Papers across Academic Repositories..." />
      ) : papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {papers.map((paper) => (
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
          title="No Matching Papers Found"
          description="Try broadening your search query or clear active filters."
          actionText="Reset Filters"
          onAction={clearFilters}
        />
      )}
    </div>
  );
};

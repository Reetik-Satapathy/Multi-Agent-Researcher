import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus, Search, X } from 'lucide-react';
import type { AgentId, ResearchAgent } from '../types/agents';
import { AgentSelector } from './AgentSelector';
import { AgentDropdown } from './AgentDropdown';
import { SearchSuggestion } from './SearchSuggestion';
import { cn } from '../lib/cn';

const SUGGESTIONS = [
  'Machine learning in healthcare',
  'Transformer architecture',
  'Climate change impacts',
  'Quantum computing advances',
];

interface ResearchSearchProps {
  agents: ResearchAgent[];
  onSearch: (query: string, agentId: AgentId) => void;
  onFocusChange?: (focused: boolean) => void;
  isBusy?: boolean;
}

export function ResearchSearch({
  agents,
  onSearch,
  onFocusChange,
  isBusy = false,
}: ResearchSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<ResearchAgent | null>(agents[0] ?? null);
  const [attachedAgents, setAttachedAgents] = useState<ResearchAgent[]>([]);
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const setFocus = (value: boolean) => {
    setFocused(value);
    onFocusChange?.(value);
  };

  const toggleAttached = (agent: ResearchAgent) => {
    setAttachedAgents((prev) =>
      prev.some((a) => a.id === agent.id)
        ? prev.filter((a) => a.id !== agent.id)
        : [...prev, agent]
    );
  };

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed || isBusy) return;
    onSearch(trimmed, selectedAgent?.id ?? 'discovery');
  };

  return (
    <div className="mx-auto w-full max-w-[780px] space-y-5">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn(
          'flex flex-col gap-2.5 rounded-2xl border bg-white px-3 py-2.5 shadow-[0_12px_32px_-18px_rgba(23,37,84,0.25)] transition-all duration-200 sm:flex-row sm:items-center sm:gap-2.5',
          focused
            ? 'border-[#1D4ED8]/50 shadow-[0_0_0_3px_rgba(219,234,254,0.9)]'
            : 'border-[#D9D7D0]'
        )}
      >
        {/* + button: attach agents to the search */}
        <div ref={pickerRef} className="relative shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPickerOpen((value) => !value)}
            aria-label="Add agents"
            title="Add agents"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200',
              pickerOpen
                ? 'border-[#1D4ED8]/50 bg-[#DBEAFE]/70 text-[#1D4ED8]'
                : 'border-[#D9D7D0] bg-[#F5F3EE] text-[#6B6B67] hover:border-[#1D4ED8]/40 hover:text-[#1D4ED8]'
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
          {pickerOpen && (
            <AgentDropdown
              agents={agents}
              selectedId={null}
              selectedIds={attachedAgents.map((a) => a.id)}
              onSelect={toggleAttached}
              align="left"
            />
          )}
        </div>

        {/* Attached agent chips + search input */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {attachedAgents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => toggleAttached(agent)}
              title="Remove agent"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-[#1D4ED8]/25 bg-[#DBEAFE]/70 px-2.5 text-[12px] font-medium text-[#172554] transition-colors duration-150 hover:border-[#1D4ED8]/50"
            >
              {agent.name.replace(' Agent', '')}
              <X className="h-3 w-3 text-[#1D4ED8]" />
            </button>
          ))}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-[#6B6B67]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder="Search papers, topics, authors or DOI..."
              className="h-9 w-full min-w-0 bg-transparent text-[14.5px] text-[#171717] outline-none placeholder:text-[#8B8F98]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:pl-1">
          <AgentSelector agents={agents} selected={selectedAgent} onSelect={setSelectedAgent} />
          <button
            type="submit"
            disabled={isBusy || !query.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1D4ED8] text-white transition-all duration-200 hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Run research"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="space-y-2.5 text-center">
        <p className="text-[12px] text-[#6B6B67]">Try searching for</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((label) => (
            <SearchSuggestion key={label} label={label} onSelect={setQuery} />
          ))}
        </div>
      </div>
    </div>
  );
}

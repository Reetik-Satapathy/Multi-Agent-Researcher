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
  onQueryChange?: (query: string) => void;
  selectedAgentId?: AgentId;
  placeholder?: string;
  isBusy?: boolean;
}

export function ResearchSearch({
  agents,
  onSearch,
  onFocusChange,
  onQueryChange,
  selectedAgentId,
  placeholder = 'Search papers, topics, authors or DOI...',
  isBusy = false,
}: ResearchSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<ResearchAgent | null>(
    agents.find((a) => a.id === selectedAgentId) ?? agents[0] ?? null
  );
  const [attachedAgents, setAttachedAgents] = useState<ResearchAgent[]>([]);
  const [focused, setFocused] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAgentId) {
      const match = agents.find((a) => a.id === selectedAgentId);
      if (match) setSelectedAgent(match);
    }
  }, [selectedAgentId, agents]);

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

  const handleTextChange = (val: string) => {
    setQuery(val);
    onQueryChange?.(val);
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
          'flex flex-col gap-2.5 rounded-xl border bg-[#101512] px-3 py-2.5 transition-all duration-200 sm:flex-row sm:items-center sm:gap-2.5',
          focused
            ? 'border-[#6F9B83]/40 shadow-[0_0_20px_-8px_rgba(49,92,75,0.3)]'
            : 'border-white/[0.08]'
        )}
      >
        <div ref={pickerRef} className="relative shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPickerOpen((value) => !value)}
            aria-label="Add agents"
            title="Add agents"
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200',
              pickerOpen
                ? 'border-[#6F9B83]/50 bg-[#16231D] text-[#6F9B83]'
                : 'border-white/[0.08] bg-[#0C100E] text-[#737B76] hover:border-[#6F9B83]/30 hover:text-[#F5F7F3]'
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

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {attachedAgents.map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => toggleAttached(agent)}
              title="Remove agent"
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-[#6F9B83]/30 bg-[#16231D] px-2.5 text-[12px] font-medium text-[#F5F7F3] transition-colors hover:border-[#6F9B83]/50"
            >
              {agent.name.replace(' Agent', '')}
              <X className="h-3 w-3 text-[#6F9B83]" />
            </button>
          ))}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-[#6F9B83]" />
            <input
              value={query}
              onChange={(event) => handleTextChange(event.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder={placeholder}
              className="h-9 w-full min-w-0 bg-transparent text-sm text-[#F5F7F3] outline-none placeholder:text-[#737B76]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:pl-1">
          <AgentSelector agents={agents} selected={selectedAgent} onSelect={setSelectedAgent} />
          <button
            type="submit"
            disabled={isBusy || !query.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#315C4B] text-[#F5F7F3] transition-colors hover:bg-[#3D705C] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Run research"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="space-y-2 text-center">
        <p className="text-xs text-[#737B76]">Try searching for</p>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {SUGGESTIONS.map((label) => (
            <SearchSuggestion key={label} label={label} onSelect={handleTextChange} />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ResearchAgent } from '../types/agents';
import { AgentDropdown } from './AgentDropdown';
import { cn } from '../lib/cn';

interface AgentSelectorProps {
  agents: ResearchAgent[];
  selected: ResearchAgent | null;
  onSelect: (agent: ResearchAgent) => void;
}

export function AgentSelector({ agents, selected, onSelect }: AgentSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[13px] transition-all duration-200',
          selected
            ? 'border-[#1D4ED8]/35 bg-[#DBEAFE]/60 text-[#172554]'
            : 'border-[#D9D7D0] bg-white text-[#6B6B67] hover:border-[#1D4ED8]/40 hover:text-[#171717]'
        )}
      >
        <span className="max-w-[140px] truncate whitespace-nowrap">
          {selected ? selected.name.replace(' Agent', '') : 'Select Agent'}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <AgentDropdown
          agents={agents}
          selectedId={selected?.id ?? null}
          onSelect={(agent) => {
            onSelect(agent);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

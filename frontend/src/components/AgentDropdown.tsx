import { Check } from 'lucide-react';
import {
  Compass,
  FileText,
  GitCompare,
  MessageCircle,
  ScrollText,
} from 'lucide-react';
import type { AgentId, ResearchAgent } from '../types/agents';
import { cn } from '../lib/cn';

const AGENT_ICONS: Record<AgentId, typeof Compass> = {
  discovery: Compass,
  summarization: ScrollText,
  report: FileText,
  assistant: MessageCircle,
  comparison: GitCompare,
};

interface AgentDropdownProps {
  agents: ResearchAgent[];
  selectedId: AgentId | null;
  onSelect: (agent: ResearchAgent) => void;
  /** Which side of the trigger the panel aligns to. */
  align?: 'left' | 'right';
  /** Agent ids shown as selected (used by the multi-add picker). */
  selectedIds?: AgentId[];
}

export function AgentDropdown({
  agents,
  selectedId,
  onSelect,
  align = 'right',
  selectedIds,
}: AgentDropdownProps) {
  return (
    <div
      className={cn(
        'absolute top-[calc(100%+8px)] z-50 w-[280px] max-h-[320px] overflow-y-auto rounded-xl border border-[#D9D7D0] bg-white py-1.5 shadow-[0_16px_40px_-16px_rgba(23,37,84,0.28)] animate-dropdown',
        align === 'left' ? 'left-0' : 'right-0'
      )}
    >
      <p className="px-3 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B8F98]">
        Agents
      </p>
      {agents.map((agent) => {
        const Icon = AGENT_ICONS[agent.id];
        const selected = selectedIds ? selectedIds.includes(agent.id) : selectedId === agent.id;
        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => onSelect(agent)}
            className={cn(
              'flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors duration-150',
              selected ? 'bg-[#DBEAFE]/60' : 'hover:bg-black/[0.03]'
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                selected ? 'bg-[#1D4ED8] text-white' : 'bg-[#DBEAFE]/70 text-[#1D4ED8]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-[#171717]">
                {agent.name}
              </span>
              <span className="block truncate text-[11.5px] leading-snug text-[#6B6B67]">
                {agent.description}
              </span>
            </span>
            {selected && <Check className="h-3.5 w-3.5 shrink-0 text-[#1D4ED8]" />}
          </button>
        );
      })}
    </div>
  );
}


import { useState } from 'react';
import { ArrowRight, FileText, GitCompare, Search, Sparkles, Wand2 } from 'lucide-react';
import type { AgentId } from '../types/agents';
import { agentService } from '../services/agentService';
import { ResearchSearch } from '../components/ResearchSearch';
import { Button } from '../components/ui';
import { cn } from '../lib/cn';

interface ResearchHomeViewProps {
  onRun: (query: string, agentId: AgentId) => void;
  onOpenCompare: () => void;
  onOpenReports: () => void;
  onOpenDiscover: () => void;
  isBusy?: boolean;
}

const ACTIONS: Array<{ id: AgentId | 'compare-page' | 'reports-page'; label: string; icon: typeof Search }> = [
  { id: 'discovery', label: 'Search', icon: Search },
  { id: 'assistant', label: 'Analyze', icon: Wand2 },
  { id: 'summarization', label: 'Summarize', icon: Sparkles },
  { id: 'comparison', label: 'Compare', icon: GitCompare },
  { id: 'report', label: 'Generate Report', icon: FileText },
];

export function ResearchHomeView({
  onRun,
  onOpenCompare,
  onOpenReports,
  onOpenDiscover,
  isBusy = false,
}: ResearchHomeViewProps) {
  const [pendingQuery, setPendingQuery] = useState('');
  const [activeAction, setActiveAction] = useState<AgentId>('discovery');
  const agents = agentService.getAgents();

  const run = (query: string, agentId: AgentId) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onRun(trimmed, agentId);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col justify-center pb-16 pt-6">
      <div className="space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-[#737B76]">
            Research workspace
          </p>
          <h1 className="text-[clamp(1.8rem,4vw,2.75rem)] font-light leading-tight tracking-tight text-[#F5F7F3]">
            What would you like to research?
          </h1>
        </div>

        <ResearchSearch
          agents={agents}
          isBusy={isBusy}
          selectedAgentId={activeAction}
          placeholder="Ask anything or enter a research topic..."
          onQueryChange={setPendingQuery}
          onSearch={(query, agentId) => run(query, agentId)}
        />

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            const selected = action.id === activeAction;
            return (
              <Button
                key={action.label}
                type="button"
                variant={selected ? 'accent' : 'ghost'}
                className={cn('h-8', selected && 'bg-[#16231D]')}
                onClick={() => {
                  if (action.id === 'comparison' && !pendingQuery.trim()) {
                    onOpenCompare();
                    return;
                  }
                  if (action.id === 'report' && !pendingQuery.trim()) {
                    onOpenReports();
                    return;
                  }
                  if (action.id === 'discovery' && !pendingQuery.trim()) {
                    onOpenDiscover();
                    return;
                  }
                  setActiveAction(action.id as AgentId);
                  if (pendingQuery.trim()) run(pendingQuery, action.id as AgentId);
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ResearchHomeHint() {
  return (
    <p className="flex items-center justify-center gap-1 text-xs text-[#737B76]">
      Press Enter to continue
      <ArrowRight className="h-3 w-3" />
    </p>
  );
}

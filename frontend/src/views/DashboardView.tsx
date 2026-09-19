import { useMemo } from 'react';
import { ResearchVisual } from '../components/ResearchVisual';
import { ResearchSearch } from '../components/ResearchSearch';
import type { AgentId } from '../types/agents';
import type { UserProfile } from '../types/research';
import { agentService } from '../services/agentService';

interface DashboardViewProps {
  user: UserProfile;
  onAgentSearch: (query: string, agentId: AgentId) => void;
  isSearching?: boolean;
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function firstName(name: string) {
  return name.split(' ')[0] || name;
}

export function DashboardView({ user, onAgentSearch, isSearching = false }: DashboardViewProps) {
  const greeting = useMemo(() => greetingForHour(new Date().getHours()), []);
  const agents = agentService.getAgents();

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10 md:h-full md:min-h-0 md:py-6 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_22%,rgba(29,78,216,0.07)_0%,rgba(245,243,238,0)_62%)]" />

      <div className="relative z-10 mb-5">
        <ResearchVisual />
      </div>

      <div className="relative z-10 mb-6 max-w-3xl text-center">
        <p className="text-[13px] font-medium text-[#6B6B67]">
          {greeting}, <span className="text-[#1D4ED8]">{firstName(user.name)}</span> 👋
        </p>
        <h1 className="mt-2.5 text-[32px] font-semibold leading-tight tracking-tight text-[#171717] sm:text-[36px] md:text-[40px]">
          What are you researching today?
        </h1>
        <p className="mx-auto mt-2.5 max-w-lg text-[15px] leading-relaxed text-[#6B6B67]">
          Search papers, understand research, and generate insights with AI.
        </p>
      </div>

      <div className="relative z-10 w-full">
        <ResearchSearch
          agents={agents}
          onSearch={onAgentSearch}
          isBusy={isSearching}
        />
      </div>
    </section>
  );
}

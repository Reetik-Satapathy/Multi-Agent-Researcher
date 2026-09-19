import type { AgentId, ResearchAgent } from '../types/agents';
import type { Paper } from '../types/research';
import { paperService } from './paperService';
import { aiService } from './aiService';

export const RESEARCH_AGENTS: ResearchAgent[] = [
  {
    id: 'discovery',
    name: 'Discovery Agent',
    description: 'Find and fetch research papers',
  },
  {
    id: 'summarization',
    name: 'Summarization Agent',
    description: 'Summarize research papers',
  },
  {
    id: 'report',
    name: 'Report Generation Agent',
    description: 'Generate structured research reports',
  },
  {
    id: 'assistant',
    name: 'Research Assistant',
    description: 'Answer research questions',
  },
  {
    id: 'comparison',
    name: 'Comparison Agent',
    description: 'Compare multiple papers',
  },
];

export type AgentDispatchResult =
  | { intent: 'discover'; query: string; papers: Paper[] }
  | { intent: 'summarize'; query: string; paper: Paper }
  | { intent: 'report'; query: string; papers: Paper[] }
  | { intent: 'assistant'; query: string; paper: Paper }
  | { intent: 'compare'; query: string; papers: Paper[] };

async function resolvePapers(query: string): Promise<Paper[]> {
  const matches = await paperService.searchPapers({ query });
  if (matches.length > 0) return matches;
  return paperService.searchPapers({});
}

export const agentService = {
  getAgents(): ResearchAgent[] {
    return RESEARCH_AGENTS;
  },

  getAgent(id: AgentId): ResearchAgent | undefined {
    return RESEARCH_AGENTS.find((agent) => agent.id === id);
  },

  async discoveryAgent(query: string) {
    return paperService.searchPapers({ query });
  },

  async summarizationAgent(paper: Paper) {
    return aiService.generateSummary(paper);
  },

  async reportAgent(
    title: string,
    reportType: string,
    sourcePapers: Paper[],
    selectedSections: string[]
  ) {
    return aiService.generateReport(title, reportType, sourcePapers, selectedSections);
  },

  async researchAssistant(paper: Paper, question: string) {
    return aiService.askAssistant(paper, question);
  },

  async comparisonAgent(papers: Paper[]) {
    return aiService.comparePapers(papers);
  },

  async dispatch(agentId: AgentId, query: string): Promise<AgentDispatchResult> {
    const papers = await resolvePapers(query);
    const primary = papers[0];

    switch (agentId) {
      case 'discovery':
        return { intent: 'discover', query, papers };
      case 'summarization':
        return { intent: 'summarize', query, paper: primary };
      case 'report':
        return { intent: 'report', query, papers: papers.slice(0, 4) };
      case 'assistant':
        return { intent: 'assistant', query, paper: primary };
      case 'comparison':
        return { intent: 'compare', query, papers: papers.slice(0, 4) };
    }
  },
};

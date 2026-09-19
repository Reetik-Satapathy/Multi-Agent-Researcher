export type AgentId =
  | 'discovery'
  | 'summarization'
  | 'report'
  | 'assistant'
  | 'comparison';

export interface ResearchAgent {
  id: AgentId;
  name: string;
  description: string;
}

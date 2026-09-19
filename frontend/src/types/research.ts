export interface Author {
  name: string;
  affiliation?: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  url: string;
  abstract: string;
  openAccess: boolean;
  citations: number;
  area: string;
  peerReviewStatus?: 'verified' | 'unverified' | string;
  pdfUrl?: string;
  methodology?: string;
  keyFindings?: string[];
  limitations?: string[];
  isSaved?: boolean;
}

export interface PaperSummary {
  paperId: string;
  paperTitle: string;
  tldr: string;
  keyFindings: Array<{
    finding: string;
    confidence: number;
    impact: 'High' | 'Medium' | 'Critical';
  }>;
  methodology: {
    architecture: string;
    datasetSize: string;
    trainingHours: string;
    description: string;
  };
  results: Array<{
    metric: string;
    value: string;
    baseline: string;
    improvement: string;
  }>;
  limitations: string[];
  keyTakeaways: string[];
}

export interface PaperComparison {
  id: string;
  title: string;
  paperIds: string[];
  date: string;
  overview: string;
  similarities: string[];
  differences: string[];
  methodologyComparison: string;
  resultComparison: string;
  researchGaps: string[];
  comparisonTable: Array<{
    metric: string;
    values: Record<string, string>; // paperId -> metric value
  }>;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface ResearchReport {
  id: string;
  title: string;
  type: 'Literature Review' | 'Research Summary' | 'Comparative Analysis' | 'Academic Report' | 'Custom';
  sourcePapers: Paper[];
  date: string;
  wordCount: number;
  sections: ReportSection[];
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  paperCount: number;
  reportCount: number;
  comparisonCount: number;
  lastUpdated: string;
  tags: string[];
  papers: Paper[];
  reports: ResearchReport[];
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  institution: string;
  avatar: string;
  stats: {
    savedPapers: number;
    reports: number;
    comparisons: number;
    projects: number;
  };
}

export interface DocumentMetadata {
  document_id: string;
  filename: string;
  title: string;
  authors: string[];
  page_count: number;
  subject: string;
  doi?: string | null;
}

export interface DocumentUploadResult {
  metadata: DocumentMetadata;
  summary: Record<string, unknown>;
}

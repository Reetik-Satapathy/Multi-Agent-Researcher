import { MOCK_PROJECTS, MOCK_REPORTS, MOCK_PAPERS, INITIAL_USER } from '../data/mockData';
import type { Project, ResearchReport, UserProfile } from '../types/research';

class WorkspaceService {
  private projects: Project[] = [...MOCK_PROJECTS];
  private reports: ResearchReport[] = [...MOCK_REPORTS];
  private user: UserProfile = { ...INITIAL_USER };
  private recentSearches: string[] = [
    'Self-Correction in LLMs',
    'Graph Transformers Clinical Pathology',
    'Quantum Variational Eigensolver Protein Folding',
    'Vision-Language-Action Robotics'
  ];

  getUserProfile(): UserProfile {
    return {
      ...this.user,
      stats: {
        savedPapers: MOCK_PAPERS.filter((p) => p.isSaved).length,
        reports: this.reports.length,
        comparisons: 4,
        projects: this.projects.length
      }
    };
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getProjectById(id: string): Project | undefined {
    return this.projects.find((p) => p.id === id);
  }

  createProject(title: string, description: string, tags: string[] = []): Project {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title,
      description,
      paperCount: 0,
      reportCount: 0,
      comparisonCount: 0,
      lastUpdated: 'Just now',
      tags,
      papers: [],
      reports: []
    };
    this.projects.unshift(newProj);
    return newProj;
  }

  getReports(): ResearchReport[] {
    return this.reports;
  }

  getReportById(id: string): ResearchReport | undefined {
    return this.reports.find((r) => r.id === id);
  }

  addReport(report: ResearchReport): ResearchReport {
    this.reports.unshift(report);
    return report;
  }

  saveReport(report: ResearchReport): void {
    const idx = this.reports.findIndex((r) => r.id === report.id);
    if (idx !== -1) {
      this.reports[idx] = report;
    } else {
      this.reports.unshift(report);
    }
  }

  getRecentSearches(): string[] {
    return this.recentSearches;
  }

  addRecentSearch(query: string): void {
    if (!query || query.trim() === '') return;
    this.recentSearches = [query, ...this.recentSearches.filter((q) => q !== query)].slice(0, 8);
  }
}

export const workspaceService = new WorkspaceService();

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PageContainer } from './components/PageContainer';
import { DashboardView } from './views/DashboardView';
import { DiscoverPapersView } from './views/DiscoverPapersView';
import { PaperDetailView } from './views/PaperDetailView';
import { AISummaryView } from './views/AISummaryView';
import { CompareView } from './views/CompareView';
import { ReportGeneratorView } from './views/ReportGeneratorView';
import { ReportWorkspaceView } from './views/ReportWorkspaceView';
import { MyResearchView } from './views/MyResearchView';
import { ProfileView } from './views/ProfileView';
import { DocumentChatView } from './views/DocumentChatView';

import { MOCK_PAPERS, MOCK_PROJECTS, MOCK_REPORTS, INITIAL_USER } from './data/mockData';
import type { Paper, Project, ResearchReport } from './types/research';
import type { AgentId } from './types/agents';
import { workspaceService } from './services/workspaceService';
import { agentService } from './services/agentService';

const RESEARCH_SECTIONS: ActiveTab[] = ['my-research', 'projects', 'saved', 'history'];

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [allPapers, setAllPapers] = useState<Paper[]>(MOCK_PAPERS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [reports, setReports] = useState<ResearchReport[]>(MOCK_REPORTS);
  const userProfile = INITIAL_USER;

  const [selectedPaper, setSelectedPaper] = useState<Paper>(MOCK_PAPERS[0]);
  const [selectedReport, setSelectedReport] = useState<ResearchReport>(MOCK_REPORTS[0]);
  const [comparedPapers, setComparedPapers] = useState<Paper[]>([MOCK_PAPERS[0], MOCK_PAPERS[1]]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tablet = window.matchMedia('(max-width: 1023px)');
    const apply = () => {
      if (tablet.matches) setSidebarCollapsed(true);
    };
    apply();
    tablet.addEventListener('change', apply);
    return () => tablet.removeEventListener('change', apply);
  }, []);

  const handleOpenPaper = (paper: Paper) => {
    setSelectedPaper(paper);
    setActiveTab('paper-detail');
  };

  const handleSummarizePaper = (paper: Paper) => {
    setSelectedPaper(paper);
    setActiveTab('ai-summary');
  };

  const handleCompareToggle = (paper: Paper) => {
    setComparedPapers((prev) => {
      const exists = prev.some((p) => p.id === paper.id);
      if (exists) {
        return prev.filter((p) => p.id === paper.id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, paper];
    });
  };

  const handleSaveToggle = (paper: Paper) => {
    setAllPapers((prev) =>
      prev.map((p) => (p.id === paper.id ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const handleAgentSearch = async (query: string, agentId: AgentId) => {
    setIsSearching(true);
    workspaceService.addRecentSearch(query);
    setSearchQuery(query);

    try {
      const result = await agentService.dispatch(agentId, query);
      if (result.intent === 'discover') {
        setActiveTab('discover');
      } else if (result.intent === 'summarize') {
        handleSummarizePaper(result.paper);
      } else if (result.intent === 'compare') {
        if (result.papers.length >= 2) {
          setComparedPapers(result.papers.slice(0, 4));
        }
        setActiveTab('compare');
      } else if (result.intent === 'report') {
        if (result.papers.length > 0) {
          setComparedPapers(result.papers.slice(0, 4));
        }
        setActiveTab('reports');
      } else if (result.intent === 'assistant') {
        setSelectedPaper(result.paper);
        setActiveTab('paper-detail');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerateReportFromPapers = (sourcePapers: Paper[]) => {
    setComparedPapers(sourcePapers);
    setActiveTab('reports');
  };

  const handleReportGenerated = (newReport: ResearchReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setActiveTab('report-workspace');
  };

  const handleOpenReport = (report: ResearchReport) => {
    setSelectedReport(report);
    setActiveTab('report-workspace');
  };

  const handleSaveReportDraft = (updatedReport: ResearchReport) => {
    setReports((prev) =>
      prev.map((r) => (r.id === updatedReport.id ? updatedReport : r))
    );
    setSelectedReport(updatedReport);
  };

  const handleOpenProject = (_project: Project) => {
    setActiveTab('projects');
  };

  const handleCreateNewProject = () => {
    const title = prompt('Enter new project title:', 'Neuro-Symbolic Reasoning');
    if (title) {
      workspaceService.createProject(title, 'Custom research workspace folder.', ['AI', 'Research']);
      setProjects([...workspaceService.getProjects()]);
    }
  };

  const savedPapersList = allPapers.filter((p) => p.isSaved);
  const isDashboard = activeTab === 'dashboard';
  const researchSection =
    activeTab === 'saved' ? 'saved' : activeTab === 'history' ? 'history' : 'projects';

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F5F3EE] font-sans text-[#171717]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={userProfile}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div
        className={`relative flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-[248px]'
        }`}
      >
        {!isDashboard && (
          <TopBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            savedCount={savedPapersList.length}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
        )}

        {isDashboard && (
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="absolute left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9D7D0] bg-white/80 text-[#171717] md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <main className={isDashboard ? 'relative min-h-screen w-full md:h-screen md:overflow-hidden' : 'min-w-0 flex-1'}>
          {isDashboard && (
            <DashboardView
              user={userProfile}
              onAgentSearch={handleAgentSearch}
              isSearching={isSearching}
            />
          )}

          {activeTab === 'discover' && (
            <PageContainer>
              <DiscoverPapersView
                initialQuery={searchQuery}
                onOpenPaper={handleOpenPaper}
                onSummarizePaper={handleSummarizePaper}
                onCompareToggle={handleCompareToggle}
                onSaveToggle={handleSaveToggle}
                comparedPapers={comparedPapers}
                savedPapers={savedPapersList}
              />
            </PageContainer>
          )}

          {activeTab === 'paper-detail' && selectedPaper && (
            <PageContainer>
              <PaperDetailView
                paper={selectedPaper}
                onBack={() => setActiveTab('discover')}
                onSummarize={handleSummarizePaper}
                onCompareToggle={handleCompareToggle}
                onSaveToggle={handleSaveToggle}
                onGenerateReport={handleGenerateReportFromPapers}
                isSaved={selectedPaper.isSaved}
                isCompared={comparedPapers.some((p) => p.id === selectedPaper.id)}
              />
            </PageContainer>
          )}

          {activeTab === 'ai-summary' && selectedPaper && (
            <PageContainer>
              <AISummaryView
                paper={selectedPaper}
                onBack={() => setActiveTab('paper-detail')}
                onGenerateReport={handleGenerateReportFromPapers}
              />
            </PageContainer>
          )}

          {activeTab === 'compare' && (
            <PageContainer>
              <CompareView />
            </PageContainer>
          )}

          {activeTab === 'reports' && (
            <PageContainer>
              <ReportGeneratorView
                initialSourcePapers={comparedPapers}
                allPapers={allPapers}
                onReportGenerated={handleReportGenerated}
              />
            </PageContainer>
          )}

          {activeTab === 'document-chat' && (
            <PageContainer>
              <DocumentChatView />
            </PageContainer>
          )}

          {activeTab === 'report-workspace' && selectedReport && (
            <PageContainer>
              <ReportWorkspaceView
                report={selectedReport}
                onBack={() => setActiveTab('my-research')}
                onSaveReport={handleSaveReportDraft}
              />
            </PageContainer>
          )}

          {RESEARCH_SECTIONS.includes(activeTab) && (
            <PageContainer>
              <MyResearchView
                projects={projects}
                savedPapers={savedPapersList}
                reports={reports}
                onOpenProject={handleOpenProject}
                onOpenPaper={handleOpenPaper}
                onSummarizePaper={handleSummarizePaper}
                onCompareToggle={handleCompareToggle}
                onSaveToggle={handleSaveToggle}
                onOpenReport={handleOpenReport}
                onNewProject={handleCreateNewProject}
                comparedPapers={comparedPapers}
                initialSection={researchSection}
              />
            </PageContainer>
          )}

          {activeTab === 'profile' && (
            <PageContainer>
              <ProfileView user={userProfile} />
            </PageContainer>
          )}

          {activeTab === 'settings' && (
            <PageContainer>
              <ProfileView user={userProfile} initialTab="preferences" />
            </PageContainer>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

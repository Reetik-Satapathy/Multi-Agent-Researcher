import { useEffect, useState } from 'react';
import { Sidebar, type ActiveTab } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { PageContainer } from './components/PageContainer';
import { DiscoverPapersView } from './views/DiscoverPapersView';
import { PaperDetailView } from './views/PaperDetailView';
import { AISummaryView } from './views/AISummaryView';
import { CompareView } from './views/CompareView';
import { ReportGeneratorView } from './views/ReportGeneratorView';
import { ReportWorkspaceView } from './views/ReportWorkspaceView';
import { MyResearchView } from './views/MyResearchView';
import { ProfileView } from './views/ProfileView';
import { DocumentChatView } from './views/DocumentChatView';

import { MOCK_PAPERS, MOCK_REPORTS, INITIAL_USER } from './data/mockData';
import type { Paper, ResearchReport } from './types/research';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { authService, type GoogleUser } from './services/authService';

const RESEARCH_SECTIONS: ActiveTab[] = ['my-research'];

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loginPromptDismissed, setLoginPromptDismissed] = useLocalStorageState(
    'google-login-prompt-dismissed-v1',
    false,
  );

  const [savedPapers, setSavedPapers] = useLocalStorageState<Paper[]>(
    'saved-papers-v1',
    MOCK_PAPERS.filter((paper) => paper.isSaved),
  );
  const [reports, setReports] = useLocalStorageState<ResearchReport[]>('generated-reports-v1', MOCK_REPORTS);
  const userProfile = INITIAL_USER;

  useEffect(() => {
    let active = true;
    void authService.getSession()
      .then((session) => {
        if (!active) return;
        setGoogleUser(session.user);
        setGoogleEnabled(session.google_enabled);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(error instanceof Error ? error.message : 'Could not check Google sign-in status.');
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleGoogleSignIn = () => {
    setAuthError('');
    authService.startGoogleLogin();
  };

  const handleGoogleSignOut = async () => {
    setAuthError('');
    try {
      await authService.logout();
      setGoogleUser(null);
      setLoginPromptDismissed(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Could not sign out.');
    }
  };

  const [selectedPaper, setSelectedPaper] = useState<Paper>(MOCK_PAPERS[0]);
  const [selectedReport, setSelectedReport] = useLocalStorageState<ResearchReport>('selected-report-v1', MOCK_REPORTS[0]);
  const [comparedPapers, setComparedPapers] = useState<Paper[]>([MOCK_PAPERS[0], MOCK_PAPERS[1]]);

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
    setSavedPapers((current) => {
      const alreadySaved = current.some((saved) => saved.id === paper.id);
      return alreadySaved
        ? current.filter((saved) => saved.id !== paper.id)
        : [{ ...paper, isSaved: true }, ...current];
    });
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

  const savedPapersList = savedPapers;

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F5F3EE] font-sans text-[#171717]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={googleUser}
        googleEnabled={googleEnabled}
        onSignIn={handleGoogleSignIn}
        onSignOut={() => void handleGoogleSignOut()}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div
        className={`relative flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-300 ${
          sidebarCollapsed ? 'md:pl-20' : 'md:pl-[248px]'
        }`}
      >
        <TopBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedPapersList.length}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="min-w-0 flex-1">
          {activeTab === 'discover' && (
            <PageContainer>
              <DiscoverPapersView
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
                isSaved={savedPapersList.some((paper) => paper.id === selectedPaper.id)}
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
                reports={reports}
                onReportGenerated={handleReportGenerated}
                onOpenReport={handleOpenReport}
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
                savedPapers={savedPapersList}
                reports={reports}
                onOpenPaper={handleOpenPaper}
                onSummarizePaper={handleSummarizePaper}
                onCompareToggle={handleCompareToggle}
                onSaveToggle={handleSaveToggle}
                onOpenReport={handleOpenReport}
                comparedPapers={comparedPapers}
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
      {authError && (googleUser || loginPromptDismissed) && (
        <div
          role="alert"
          className="fixed bottom-4 right-4 z-[110] flex max-w-lg items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg"
        >
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => setAuthError('')}
            className="shrink-0 font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {!authLoading && !googleUser && !loginPromptDismissed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-signin-title"
            className="w-full max-w-md space-y-5 rounded-2xl border border-[#D9D7D0] bg-white p-6 shadow-2xl"
          >
            <div className="space-y-2">
              <h2 id="google-signin-title" className="text-xl font-bold text-[#171717]">Sign in to your workspace</h2>
              <p className="text-sm text-[#6B6B67]">
                Sign in with Google to show your verified account name and email in your profile.
              </p>
            </div>
            {!googleEnabled && (
              <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Google sign-in needs to be configured by adding Google OAuth credentials to the backend environment.
              </p>
            )}
            {authError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{authError}</p>}
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                disabled={!googleEnabled}
                onClick={handleGoogleSignIn}
                className="rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => setLoginPromptDismissed(true)}
                className="rounded-xl border border-[#D9D7D0] px-4 py-2.5 text-sm font-semibold text-[#6B6B67] hover:bg-[#F5F3EE]"
              >
                Do it later
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;

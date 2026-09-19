import { Menu, Search, Bookmark } from 'lucide-react';
import type { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenMobileNav?: () => void;
}

export function TopBar({ activeTab, setActiveTab, savedCount, onOpenMobileNav }: TopBarProps) {
  const getTitle = () => {
    switch (activeTab) {
      case 'discover':
        return 'Discover Papers';
      case 'my-research':
        return 'My Research';
      case 'projects':
        return 'Projects';
      case 'saved':
        return 'Saved Papers';
      case 'history':
        return 'Recent Research';
      case 'compare':
        return 'Compare Papers';
      case 'reports':
        return 'Reports';
      case 'paper-detail':
        return 'Paper';
      case 'ai-summary':
        return 'AI Summary';
      case 'report-workspace':
        return 'Report Workspace';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'REWORK Ai';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#D9D7D0] bg-[#F5F3EE]/85 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#171717] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-[15px] font-semibold tracking-tight text-[#171717]">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="hidden items-center gap-2 rounded-xl border border-[#D9D7D0] bg-white px-3 py-1.5 text-[13px] text-[#6B6B67] transition-colors duration-200 hover:border-[#1D4ED8]/40 hover:text-[#171717] md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          Search papers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className="flex items-center gap-1.5 rounded-xl border border-[#D9D7D0] bg-white px-3 py-1.5 text-[13px] text-[#171717] transition-colors duration-200 hover:border-[#1D4ED8]/40"
        >
          <Bookmark className="h-4 w-4 text-[#1D4ED8]" />
          <span>{savedCount}</span>
        </button>
      </div>
    </header>
  );
}

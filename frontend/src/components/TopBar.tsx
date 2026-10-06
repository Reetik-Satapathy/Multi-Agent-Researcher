import { Bell, Menu, Search, User } from 'lucide-react';
import type { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  onOpenMobileNav?: () => void;
}

export function TopBar({ activeTab, setActiveTab, onOpenMobileNav }: TopBarProps) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'research':
        return 'Home';
      case 'discover':
        return 'Discover Papers';
      case 'document-chat':
        return 'Workspace / Ask PDF';
      case 'my-research':
        return 'My Research';
      case 'compare':
        return 'Compare';
      case 'reports':
        return 'Reports';
      case 'paper-detail':
        return 'Discover / Paper';
      case 'ai-summary':
        return 'Discover / AI Summary';
      case 'report-workspace':
        return 'Reports / Workspace';
      case 'document-chat':
        return 'Home / Document';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'Workspace';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-white/[0.08] bg-[#070807]/92 px-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#A5ADA7] hover:bg-[#101512] hover:text-[#F5F7F3] md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="text-[13px] font-light tracking-wide text-[#A5ADA7]">
          {getBreadcrumb()}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('discover')}
          className="hidden h-8 items-center gap-2 rounded-md px-2.5 text-xs text-[#737B76] transition-colors hover:bg-[#101512] hover:text-[#F5F7F3] md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
        </button>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#737B76] hover:bg-[#101512] hover:text-[#F5F7F3]"
          title="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#737B76] hover:bg-[#101512] hover:text-[#F5F7F3]"
          title="Profile"
        >
          <User className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}

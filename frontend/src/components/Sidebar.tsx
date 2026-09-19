import {
  Bookmark,
  Clock,
  FileText,
  FolderKanban,
  GitCompare,
  Home,
  Library,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { UserProfile as UserProfileData } from '../types/research';
import { UserProfile } from './UserProfile';
import { cn } from '../lib/cn';

export type ActiveTab =
  | 'dashboard'
  | 'discover'
  | 'my-research'
  | 'compare'
  | 'reports'
  | 'paper-detail'
  | 'ai-summary'
  | 'report-workspace'
  | 'profile'
  | 'settings'
  | 'projects'
  | 'saved'
  | 'history'
  | 'document-chat';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: UserProfileData;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const MAIN_NAV: Array<{ id: ActiveTab; label: string; icon: typeof Home }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'discover', label: 'Discover Papers', icon: Search },
  { id: 'my-research', label: 'My Research', icon: Library },
  { id: 'compare', label: 'Compare Papers', icon: GitCompare },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'document-chat', label: 'Ask a PDF', icon: FileText },
];

const WORKSPACE_NAV: Array<{ id: ActiveTab; label: string; icon: typeof FolderKanban }> = [
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'saved', label: 'Saved Papers', icon: Bookmark },
  { id: 'history', label: 'Recent Research', icon: Clock },
];

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  user,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const isActive = (id: ActiveTab) => activeTab === id;

  const go = (tab: ActiveTab) => {
    setActiveTab(tab);
    onMobileClose?.();
  };

  const navButton = (id: ActiveTab, label: string, Icon: typeof Home) => {
    const active = isActive(id);
    return (
      <button
        key={id}
        type="button"
        onClick={() => go(id)}
        title={collapsed ? label : undefined}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors duration-200',
          collapsed && 'justify-center px-0',
          active
            ? 'bg-[#1D4ED8]/20 text-[#F5F3EE]'
            : 'text-[#8B8F98] hover:bg-white/[0.05] hover:text-[#E5E7EB]'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#60A5FA]' : 'text-[#8B8F98]')} />
        {!collapsed && <span className={active ? 'font-medium' : 'font-normal'}>{label}</span>}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.06] bg-[#111318] transition-transform duration-300 md:translate-x-0',
          collapsed ? 'w-20' : 'w-[248px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className={cn('flex items-start justify-between px-5 pt-5 pb-4', collapsed && 'px-3')}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-[#1D4ED8]/40 blur-md" />
              <span className="relative h-7 w-7 rounded-full bg-[radial-gradient(circle_at_30%_25%,#BFDBFE,transparent_30%),radial-gradient(circle_at_70%_70%,#1D4ED8,transparent_34%),linear-gradient(145deg,#172554,#1D4ED8_55%,#0F172A)] shadow-[0_0_16px_rgba(29,78,216,0.55)]" />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[15px] font-semibold tracking-tight text-[#E5E7EB]">REWORK Ai</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8B8F98]">
                  AI Research Workspace
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-1.5 text-[#8B8F98] transition-colors duration-200 hover:bg-white/[0.05] hover:text-[#E5E7EB] md:inline-flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#6B6F78]">
              Main
            </p>
          )}
          <nav className="space-y-0.5">
            {MAIN_NAV.map((item) => navButton(item.id, item.label, item.icon))}
          </nav>

          <div className="mt-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-[#6B6F78]">
                Workspace
              </p>
            )}
            <nav className="space-y-0.5">
              {WORKSPACE_NAV.map((item) => navButton(item.id, item.label, item.icon))}
            </nav>
          </div>
        </div>

        <div className={cn('space-y-2.5 border-t border-white/[0.06] px-3 pb-4 pt-3.5', collapsed && 'px-2')}>
          {navButton('settings', 'Settings', Settings)}
          <UserProfile user={user} collapsed={collapsed} onOpenProfile={() => go('profile')} />
        </div>
      </aside>
    </>
  );
}

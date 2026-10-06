import {
  Search,
  MessageSquareText,
  Library,
  GitCompare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from './UserProfile';
import { cn } from '../lib/cn';
import type { GoogleUser } from '../services/authService';

export type ActiveTab =
  | 'home'
  | 'research'
  | 'discover'
  | 'my-research'
  | 'compare'
  | 'reports'
  | 'paper-detail'
  | 'ai-summary'
  | 'report-workspace'
  | 'profile'
  | 'settings'
  | 'document-chat';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  user: GoogleUser | null;
  googleEnabled: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const MAIN_NAV: Array<{ id: ActiveTab; label: string; icon: typeof Search }> = [
  { id: 'my-research', label: 'My Research', icon: Library },
  { id: 'discover', label: 'Discover Papers', icon: Search },
  { id: 'document-chat', label: 'Ask a PDF', icon: MessageSquareText },
  { id: 'compare', label: 'Compare Papers', icon: GitCompare },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  user,
  googleEnabled,
  onSignIn,
  onSignOut,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const isActive = (id: ActiveTab) => {
    if (id === 'discover' && (activeTab === 'paper-detail' || activeTab === 'ai-summary')) return true;
    if (id === 'reports' && activeTab === 'report-workspace') return true;
    return activeTab === id;
  };

  const go = (tab: ActiveTab) => {
    setActiveTab(tab);
    onMobileClose?.();
  };

  const navButton = (id: ActiveTab, label: string, Icon: typeof Search) => {
    const active = isActive(id);
    return (
      <button
        key={id}
        type="button"
        onClick={() => go(id)}
        title={collapsed ? label : undefined}
        className={cn(
          'sidebar-nav-item relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors duration-150',
          collapsed && 'justify-center px-0',
          active
            ? 'bg-[#16231D] font-medium text-[#F5F7F3]'
            : 'text-[#737B76] hover:bg-[#16231D]/55 hover:text-[#F5F7F3]',
        )}
      >
        {active && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-px bg-[#6F9B83]" />
        )}
        <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#6F9B83]' : 'text-[#737B76]')} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/[0.08] bg-[#070807] transition-transform duration-200 md:translate-x-0',
          collapsed ? 'w-20' : 'w-[220px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        <div className={cn('flex items-center justify-between px-4 py-5', collapsed && 'justify-center px-2')}>
          <button
            type="button"
            onClick={() => go('home')}
            className="min-w-0 text-left"
            title="REWORK Ai"
          >
            {!collapsed ? (
              <span className="text-[13px] font-medium tracking-[0.22em] text-[#F5F7F3]">
                REWORK <span className="font-normal tracking-[0.12em] text-[#6F9B83]">Ai</span>
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#6F9B83]">RA</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-md p-1 text-[#737B76] transition-colors hover:bg-[#101512] hover:text-[#F5F7F3] md:inline-flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#737B76]">
              Workspace
            </p>
          )}
          <nav className="space-y-0.5">
            {MAIN_NAV.map((item) => navButton(item.id, item.label, item.icon))}
          </nav>
        </div>

        <div className={cn('space-y-2 border-t border-white/[0.08] px-3 py-3', collapsed && 'px-2')}>
          {navButton('settings', 'Settings', Settings)}
          <UserProfile
            user={user}
            googleEnabled={googleEnabled}
            collapsed={collapsed}
            onSignIn={onSignIn}
            onSignOut={onSignOut}
          />
        </div>
      </aside>
    </>
  );
}

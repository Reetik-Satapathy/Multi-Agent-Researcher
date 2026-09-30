import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import type { GoogleUser } from '../services/authService';
import { cn } from '../lib/cn';

interface UserProfileProps {
  user: GoogleUser | null;
  googleEnabled: boolean;
  collapsed?: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function UserProfile({
  user,
  googleEnabled,
  collapsed = false,
  onSignIn,
  onSignOut,
}: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const displayName = user?.name || 'Sign in';
  const initial = user?.name.trim().charAt(0).toUpperCase() || 'G';

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-white/[0.05]',
          collapsed && 'justify-center'
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8]/25 text-sm font-medium text-[#60A5FA]">
          {initial}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-[#E5E7EB]">{displayName}</span>
              <span className="block truncate text-[12px] text-[#8B8F98]">{user?.email || 'Google account'}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#8B8F98] transition-colors group-hover:text-[#E5E7EB]" />
          </>
        )}
      </button>
      {open && (
        <div className={cn(
          'absolute bottom-full z-[60] mb-2 min-w-56 rounded-xl border border-white/10 bg-[#1B1E25] p-2 shadow-xl',
          collapsed ? 'left-full ml-2' : 'left-0 right-0'
        )}>
          {user && (
            <div className="border-b border-white/10 px-3 py-2">
              <p className="truncate text-sm font-medium text-[#E5E7EB]">{user.name}</p>
              <p className="truncate text-xs text-[#8B8F98]">{user.email}</p>
            </div>
          )}
          {user ? (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#E5E7EB] hover:bg-white/[0.06]"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={!googleEnabled}
              onClick={() => {
                setOpen(false);
                onSignIn();
              }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#E5E7EB] hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
              title={googleEnabled ? 'Sign in with Google' : 'Google sign-in is not configured'}
            >
              {googleEnabled ? 'Sign in with Google' : 'Google sign-in unavailable'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

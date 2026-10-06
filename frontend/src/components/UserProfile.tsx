import { LogOut, User } from 'lucide-react';
import type { GoogleUser } from '../services/authService';

interface UserProfileProps {
  user: GoogleUser | null;
  googleEnabled: boolean;
  collapsed: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  googleEnabled,
  collapsed,
  onSignIn,
  onSignOut,
}) => {
  if (user) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-[#0C100E] p-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-[#16231D] text-xs font-semibold text-[#6F9B83]">
            {user.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-[#F5F7F3]">{user.name}</p>
              <p className="truncate text-[10px] text-[#737B76]">{user.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={onSignOut}
            className="rounded p-1 text-[#737B76] hover:bg-[#141B17] hover:text-[#F5F7F3] transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSignIn}
      disabled={!googleEnabled}
      className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0C100E] px-3 py-2 text-xs font-medium text-[#A5ADA7] transition-colors hover:border-[#6F9B83]/30 hover:text-[#F5F7F3] disabled:opacity-40"
      title="Sign in with Google"
    >
      <User className="h-3.5 w-3.5 text-[#6F9B83]" />
      {!collapsed && <span>{googleEnabled ? 'Sign In with Google' : 'Local User'}</span>}
    </button>
  );
};

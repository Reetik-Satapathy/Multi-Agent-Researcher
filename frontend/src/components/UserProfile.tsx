import { ChevronDown } from 'lucide-react';
import type { UserProfile as UserProfileData } from '../types/research';
import { cn } from '../lib/cn';

interface UserProfileProps {
  user: UserProfileData;
  collapsed?: boolean;
  onOpenProfile: () => void;
}

export function UserProfile({ user, collapsed = false, onOpenProfile }: UserProfileProps) {
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpenProfile}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors duration-200 hover:bg-white/[0.05]',
        collapsed && 'justify-center'
      )}
    >
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D4ED8]/25 text-sm font-medium text-[#60A5FA]">
          {initial}
        </span>
      )}
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[#E5E7EB]">{user.name}</span>
            <span className="block truncate text-[12px] text-[#8B8F98]">{user.email}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#8B8F98] transition-colors group-hover:text-[#E5E7EB]" />
        </>
      )}
    </button>
  );
}

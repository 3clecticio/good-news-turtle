import React from 'react';
import { Flame, LogIn, User, Sparkles } from 'lucide-react';
import { Profile } from '../types';

interface HeaderProps {
  userProfile: Profile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 pt-safe">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl turtle-gradient-bg flex items-center justify-center text-2xl shadow-lg shadow-emerald-950/40 transform active:scale-95 transition-transform">
            🐢
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-white">
                Good News <span className="turtle-gradient-text">Turtle</span>
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              Daily Positivity & Community
            </p>
          </div>
        </div>

        {/* User Stats & Profile / Login Button */}
        <div className="flex items-center gap-2.5">
          {userProfile ? (
            <>
              {/* Kind Streak Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 animate-bounce" />
                <span>{userProfile.kind_streak || 1} day streak</span>
              </div>

              {/* Profile Avatar */}
              <button
                onClick={onOpenProfile}
                className="relative w-9 h-9 rounded-full bg-slate-800 border-2 border-emerald-500/50 overflow-hidden flex items-center justify-center text-sm font-bold text-emerald-300 hover:border-emerald-400 transition-colors"
              >
                {userProfile.avatar_url ? (
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userProfile.display_name?.[0]?.toUpperCase() || '🐢'}</span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full turtle-gradient-bg text-slate-950 font-bold text-xs shadow-md shadow-emerald-900/30 hover:opacity-95 active:scale-95 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Home, Sparkles, Video, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
}) => {
  const tabs = [
    { id: 'feed', label: 'Feed', icon: Home },
    { id: 'dreams', label: 'Dreams', icon: Sparkles },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-800/80 px-3 py-2 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* Floating Create Post Button */}
        <div className="relative -top-4">
          <button
            onClick={onOpenCreateModal}
            aria-label="Create New Post"
            className="w-12 h-12 rounded-full turtle-gradient-bg flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 transform active:scale-90 hover:scale-105 transition-all"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

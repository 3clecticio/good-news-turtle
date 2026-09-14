import React, { useState } from 'react';
import { Sparkles, Plus, Heart } from 'lucide-react';
import { Profile } from '../types';

interface DreamsViewProps {
  userProfile: Profile | null;
  onOpenAuth: () => void;
}

interface DreamItem {
  id: string;
  author: string;
  avatar: string;
  dream: string;
  category: string;
  supporters: number;
}

const SAMPLE_DREAMS: DreamItem[] = [
  {
    id: 'd1',
    author: 'Sam Turtle',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    dream: 'My dream is to plant 1,000 native trees in our local park to build a haven for wild birds & butterflies! 🌳🦋',
    category: 'Environment',
    supporters: 34,
  },
  {
    id: 'd2',
    author: 'Maya Ocean',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    dream: 'Opening a free community after-school tutoring hub where senior citizens mentor young kids! 📚❤️',
    category: 'Community',
    supporters: 52,
  },
  {
    id: 'd3',
    author: 'Leo Shell',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    dream: 'Building solar-powered water filtration units for coastal turtle habitats around the world! 🌊☀️',
    category: 'Innovation',
    supporters: 89,
  },
];

export const DreamsView: React.FC<DreamsViewProps> = ({ userProfile, onOpenAuth }) => {
  const [dreams, setDreams] = useState<DreamItem[]>(SAMPLE_DREAMS);
  const [newDream, setNewDream] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddDream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }
    if (!newDream.trim()) return;

    const created: DreamItem = {
      id: `dream-${Date.now()}`,
      author: userProfile.display_name,
      avatar: userProfile.avatar_url || '',
      dream: newDream.trim(),
      category: 'Community',
      supporters: 1,
    };

    setDreams([created, ...dreams]);
    setNewDream('');
    setShowAddModal(false);
  };

  const handleSupport = (id: string) => {
    setDreams((prev) =>
      prev.map((d) => (d.id === id ? { ...d, supporters: d.supporters + 1 } : d))
    );
  };

  return (
    <div className="px-4 py-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Banner */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-500/30 text-center relative overflow-hidden">
        <div className="w-12 h-12 mx-auto mb-2 rounded-2xl turtle-gradient-bg flex items-center justify-center text-2xl shadow-lg">
          ✨
        </div>
        <h2 className="text-lg font-extrabold text-white">Turtle Dreams Universe</h2>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Share your positive aspirations for the world. Support community dreams!
        </p>

        <button
          onClick={() => (userProfile ? setShowAddModal(true) : onOpenAuth())}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full turtle-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/40 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Post Your Dream</span>
        </button>
      </div>

      {/* Dream Cards List */}
      <div className="space-y-3">
        {dreams.map((d) => (
          <div key={d.id} className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-xs font-bold text-emerald-300">
                  {d.avatar ? (
                    <img src={d.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{d.author[0]}</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">{d.author}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">{d.category}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed italic">"{d.dream}"</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400">
                ❤️ {d.supporters} Dream Supporters
              </span>
              <button
                onClick={() => handleSupport(d.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Support Dream</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Dream Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-slate-700">
            <h3 className="font-extrabold text-white text-base mb-3">Share Your Positive Dream</h3>
            <form onSubmit={handleAddDream} className="space-y-3">
              <textarea
                value={newDream}
                onChange={(e) => setNewDream(e.target.value)}
                placeholder="What is your hope or goal for a better community?"
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 rounded-full text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full turtle-gradient-bg text-slate-950 font-bold text-xs"
                >
                  Publish Dream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

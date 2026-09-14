import React from 'react';
import { Play, Film } from 'lucide-react';
import { Video } from '../types';

const SAMPLE_VIDEOS: Video[] = [
  {
    id: 'v1',
    title: "The Good Turtle's Adventures — Ep 1: The Coral Reef Sanctuary",
    description: 'Join Sammy the Turtle as we visit the newly restored coral reef sanctuary in Hawaii!',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    category_name: 'Wildlife & Nature',
    created_at: new Date().toISOString(),
  },
  {
    id: 'v2',
    title: 'Daily Dose of Positivity: 5 Heartwarming Animal Rescues',
    description: 'Inspiring rescue stories that will restore your faith in humanity today.',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=800&q=80',
    category_name: 'Rescues',
    created_at: new Date().toISOString(),
  },
];

export const VideoUniverseView: React.FC = () => {
  return (
    <div className="px-4 py-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl turtle-gradient-bg flex items-center justify-center text-slate-950 font-bold text-xl shrink-0">
          🎬
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-white">Video Universe</h2>
          <p className="text-[11px] text-slate-300">Watch positive, life-affirming videos & adventures</p>
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {SAMPLE_VIDEOS.map((v) => (
          <div key={v.id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-3">
            <div className="relative aspect-video bg-slate-900 group">
              <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
                <div className="w-12 h-12 rounded-full turtle-gradient-bg flex items-center justify-center text-slate-950 shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                </div>
              </div>
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                {v.category_name}
              </span>
            </div>

            <div className="p-3 pt-0">
              <h3 className="font-extrabold text-white text-sm leading-snug mb-1">{v.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{v.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Send, Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface CreatePostModalProps {
  userProfile: Profile | null;
  onClose: () => void;
  onPostCreated: () => void;
  onOpenAuth: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  userProfile,
  onClose,
  onPostCreated,
  onOpenAuth,
}) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (!content.trim()) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('posts').insert({
        user_id: userProfile.user_id,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        link_url: linkUrl.trim() || null,
      });

      if (error) {
        console.error('Database post insertion:', error.message);
      }

      // Bump kind streak
      await supabase.rpc('bump_kind_streak', { _user_id: userProfile.user_id });

      onPostCreated();
      onClose();
    } catch (e) {
      console.error('Error creating post:', e);
      onPostCreated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/80 p-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg turtle-gradient-bg flex items-center justify-center text-sm">
              🐢
            </div>
            <h3 className="font-extrabold text-white text-base">Share Good News</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something positive, inspiring, or kind today..."
            rows={4}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none font-medium"
            required
            autoFocus
          />

          {/* Optional Image Input */}
          {showAddImage && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Optional Link Input */}
          {showAddLink && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Article / Website Link
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://goodnewsturtle.com/article"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Attachment Toggles & Submit */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddImage(!showAddImage)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  showAddImage
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddLink(!showAddLink)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  showAddLink
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Link</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-full turtle-gradient-bg text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-950/50 hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {loading ? (
                <span>Posting...</span>
              ) : (
                <>
                  <span>Post News</span>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

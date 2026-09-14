import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Comment, Post, Profile } from '../types';
import { supabase } from '../lib/supabase';

interface CommentsModalProps {
  post: Post;
  userProfile: Profile | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  post,
  userProfile,
  onClose,
  onOpenAuth,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (id, user_id, turtle_handle, display_name, avatar_url)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error || !data) {
        setComments([]);
      } else {
        setComments(data);
      }
    } catch (e) {
      console.error('Error loading comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        user_id: userProfile.user_id,
        content: newComment.trim(),
      });

      if (!error) {
        setNewComment('');
        fetchComments();
      }
    } catch (e) {
      console.error('Error posting comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-700/80 flex flex-col h-[85vh] sm:h-[650px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
          <h3 className="font-extrabold text-white text-base">Comments</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Post Preview */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-xs text-white">
              {post.profiles?.display_name || 'Positive Turtle'}
            </span>
            <span className="text-xs text-emerald-400">
              @{post.profiles?.turtle_handle || 'turtle'}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2">{post.content}</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500 text-center py-6">Loading comments...</p>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-xs text-slate-400 font-medium">No comments yet.</p>
              <p className="text-[11px] text-slate-500">Be the first to share a positive thought!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/60">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">
                      {c.profiles?.display_name || 'Turtle Friend'}
                    </span>
                    <span className="text-[11px] text-emerald-400">
                      @{c.profiles?.turtle_handle || 'turtle'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {c.created_at
                      ? formatDistanceToNow(new Date(c.created_at), { addSuffix: true })
                      : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-200">{c.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0 pb-safe">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={userProfile ? "Write a positive reply..." : "Sign in to reply..."}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="p-2.5 rounded-full turtle-gradient-bg text-slate-950 font-bold hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
};

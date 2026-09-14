import React, { useState } from 'react';
import { MessageSquare, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onTurtlePower: (postId: string) => void;
  onOpenComments: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onTurtlePower,
  onOpenComments,
}) => {
  const [isPowered, setIsPowered] = useState(post.has_user_powered || false);
  const [powerCount, setPowerCount] = useState(post.turtle_powers_count || 0);

  const handlePowerClick = () => {
    onTurtlePower(post.id);
    if (isPowered) {
      setIsPowered(false);
      setPowerCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsPowered(true);
      setPowerCount((prev) => prev + 1);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Good News Turtle Post',
          text: post.content.slice(0, 100) + '...',
          url: window.location.href,
        });
      } catch (e) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Post link copied to clipboard!');
    }
  };

  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : 'recently';

  return (
    <article className="glass-card rounded-2xl p-4 transition-all duration-200 hover:border-slate-700/60 shadow-lg shadow-black/20">
      {/* Author Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-emerald-500/40 overflow-hidden flex items-center justify-center font-bold text-emerald-300 text-sm shrink-0">
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.display_name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{post.profiles?.display_name?.[0]?.toUpperCase() || '🐢'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-white text-sm truncate">
              {post.profiles?.display_name || 'Positive Turtle'}
            </span>
            <span className="text-xs text-emerald-400 font-medium">
              @{post.profiles?.turtle_handle || 'turtle'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{timeAgo}</p>
        </div>
      </div>

      {/* Post Text Content */}
      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line mb-3 font-normal">
        {post.content}
      </p>

      {/* Attached Image */}
      {post.image_url && (
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 max-h-96">
          <img
            src={post.image_url}
            alt="Post media"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      {/* Embedded Video */}
      {post.video_url && (
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          <iframe
            src={post.video_url.replace('watch?v=', 'embed/')}
            title="Video post"
            className="w-full aspect-video"
            allowFullScreen
          />
        </div>
      )}

      {/* Shared Article Card */}
      {post.shared_article_title && (
        <a
          href={post.link_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-colors group"
        >
          {post.shared_article_image && (
            <img
              src={post.shared_article_image}
              alt=""
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              {post.shared_article_source || 'Good News'}
            </span>
            <h4 className="text-xs font-semibold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors">
              {post.shared_article_title}
            </h4>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 shrink-0 self-center" />
        </a>
      )}

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1 text-slate-400">
        {/* Turtle Power Upvote Button */}
        <button
          onClick={handlePowerClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isPowered
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'hover:bg-slate-800 text-slate-400 hover:text-emerald-300'
          }`}
        >
          <span className="text-base transform active:scale-125 transition-transform">🐢</span>
          <span>{powerCount} Turtle Power</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onOpenComments(post)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments_count || 0} Comments</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Share post"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};

import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Filter, Heart } from 'lucide-react';
import { Post, Profile } from '../types';
import { PostCard } from './PostCard';
import { supabase } from '../lib/supabase';

interface FeedProps {
  userProfile: Profile | null;
  onOpenComments: (post: Post) => void;
  onOpenCreateModal: () => void;
}

// Initial positive news posts seed for instant display & offline resiliency
const SAMPLE_POSTS: Post[] = [
  {
    id: 'sample-1',
    user_id: 'turtle-team',
    content: '🐢 Great news! Scientists in Australia report a record number of sea turtle nests this season! Over 10,000 hatchlings safely reached the ocean thanks to community volunteer beach patrols! 🌊💚',
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    turtle_powers_count: 42,
    comments_count: 8,
    profiles: {
      id: 'p1',
      user_id: 'turtle-team',
      turtle_handle: 'ocean_guardian',
      display_name: 'Marine Turtle Project',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      kind_streak: 14,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'sample-2',
    user_id: 'positivity_bot',
    content: 'Remember today: even small acts of kindness radiate further than you know. Drop a kind word to someone in the community today! ✨🐢',
    shared_article_title: 'Global Solar Power Capacity Doubles Ahead of Schedule',
    shared_article_source: 'Good News Network',
    shared_article_image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    link_url: 'https://goodnewsturtle.com',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    turtle_powers_count: 28,
    comments_count: 3,
    profiles: {
      id: 'p2',
      user_id: 'positivity_bot',
      turtle_handle: 'sunny_shelly',
      display_name: 'Shelly Sunshine',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      kind_streak: 9,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'sample-3',
    user_id: 'eco_turtle',
    content: 'Community garden in Chicago just harvested over 1,500 lbs of fresh organic produce, donated 100% to local food pantries! Kindness in action. 🥦🥕✨',
    image_url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    turtle_powers_count: 65,
    comments_count: 12,
    profiles: {
      id: 'p3',
      user_id: 'eco_turtle',
      turtle_handle: 'kind_farmer',
      display_name: 'Green Turtle',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      kind_streak: 21,
      created_at: new Date().toISOString(),
    },
  },
];

export const Feed: React.FC<FeedProps> = ({
  userProfile,
  onOpenComments,
  onOpenCreateModal,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, user_id, turtle_handle, display_name, avatar_url, kind_streak),
          turtle_power(id, user_id),
          comments(id)
        `)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        console.log('Using sample feed data');
        setPosts(SAMPLE_POSTS);
      } else {
        const formatted: Post[] = data.map((p) => ({
          ...p,
          turtle_powers_count: p.turtle_power ? p.turtle_power.length : 0,
          has_user_powered: userProfile
            ? p.turtle_power?.some((tp: any) => tp.user_id === userProfile.user_id)
            : false,
          comments_count: p.comments ? p.comments.length : 0,
        }));
        setPosts(formatted);
      }
    } catch (e) {
      console.error('Error fetching posts:', e);
      setPosts(SAMPLE_POSTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userProfile]);

  const handleTurtlePower = async (postId: string) => {
    if (!userProfile) return;

    try {
      const targetPost = posts.find((p) => p.id === postId);
      if (!targetPost) return;

      if (targetPost.has_user_powered) {
        await supabase
          .from('turtle_power')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userProfile.user_id);
      } else {
        await supabase.from('turtle_power').insert({
          post_id: postId,
          user_id: userProfile.user_id,
        });

        // Trigger kind streak bump
        await supabase.rpc('bump_kind_streak', { _user_id: userProfile.user_id });
      }
    } catch (e) {
      console.error('Error toggling turtle power:', e);
    }
  };

  const categories = [
    { id: 'all', label: '🌟 All Good News' },
    { id: 'positivity', label: '💚 Positivity' },
    { id: 'turtles', label: '🐢 Turtle News' },
    { id: 'community', label: '🤝 Community' },
  ];

  return (
    <div className="pb-24 pt-3">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 mb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'turtle-gradient-bg text-slate-950 shadow-md shadow-emerald-950/50 scale-105'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Daily Motivation Banner */}
      <div className="px-4 mb-4">
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg shrink-0">
              ☀️
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                Daily Turtle Wisdom
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                "Slow and steady wins the race — celebrate small wins today!"
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchPosts();
            }}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Post List */}
      <div className="px-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-2xl p-4 animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-2 bg-slate-800/60 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="h-16 bg-slate-800/40 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onTurtlePower={handleTurtlePower}
              onOpenComments={onOpenComments}
            />
          ))
        )}
      </div>
    </div>
  );
};

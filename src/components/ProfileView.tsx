import React, { useEffect, useState } from 'react';
import { Flame, LogOut, Award, Edit3, ArrowLeft } from 'lucide-react';
import { Post, Profile } from '../types';
import { supabase } from '../lib/supabase';
import { PostCard } from './PostCard';

interface ProfileViewProps {
  userProfile: Profile | null;
  targetUserId?: string | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onBack?: () => void;
  onSelectUser?: (userId: string) => void;
  onOpenComments?: (post: Post) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  targetUserId,
  onOpenAuth,
  onSignOut,
  onBack,
  onSelectUser,
  onOpenComments,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const isOwnProfile = !targetUserId || (userProfile && userProfile.user_id === targetUserId);
  const activeUserId = targetUserId || userProfile?.user_id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!activeUserId) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', activeUserId)
          .single();

        if (profileData) {
          setProfile(profileData);
          setDisplayName(profileData.display_name || '');
          setBio(profileData.bio || '');
        } else if (isOwnProfile && userProfile) {
          setProfile(userProfile);
        }

        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (id, user_id, turtle_handle, display_name, avatar_url, kind_streak),
            turtle_power(id, user_id),
            comments(id)
          `)
          .eq('user_id', activeUserId)
          .order('created_at', { ascending: false });

        if (postsData) {
          setUserPosts(
            postsData.map((p) => ({
              ...p,
              turtle_powers_count: p.turtle_power ? p.turtle_power.length : 0,
              comments_count: p.comments ? p.comments.length : 0,
            }))
          );
        }
      } catch (e) {
        console.error('Error loading profile details:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [activeUserId, targetUserId, userProfile]);

  if (!userProfile && isOwnProfile) {
    return (
      <div className="px-4 py-12 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl turtle-gradient-bg flex items-center justify-center text-4xl shadow-xl shadow-emerald-950/50">
          🐢
        </div>
        <h2 className="text-xl font-extrabold text-white mb-2">Join Good News Turtle</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Create an account to post positive news, save kind streaks, and connect with the community!
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 rounded-full turtle-gradient-bg text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-900/40 active:scale-95 transition-transform"
        >
          Sign In or Create Profile
        </button>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    try {
      setSaving(true);
      await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          bio: bio,
        })
        .eq('user_id', userProfile.user_id);

      setIsEditing(false);
      if (profile) {
        setProfile({ ...profile, display_name: displayName, bio: bio });
      }
    } catch (e) {
      console.error('Save profile error:', e);
    } finally {
      setSaving(false);
    }
  };

  const activeProfile = profile || (isOwnProfile ? userProfile : null);

  return (
    <div className="px-4 py-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Back Button if viewing another user */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-semibold mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
      )}

      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl p-5 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-emerald-400/60 overflow-hidden flex items-center justify-center text-2xl font-bold text-emerald-300 shadow-md">
              {activeProfile?.avatar_url && !avatarError ? (
                <img
                  src={activeProfile.avatar_url}
                  alt={activeProfile.display_name}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{activeProfile?.display_name?.[0]?.toUpperCase() || '🐢'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full turtle-gradient-bg flex items-center justify-center text-xs text-slate-950 font-bold border-2 border-slate-950">
              🐢
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditing && isOwnProfile ? (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-4 py-1.5 rounded-full turtle-gradient-bg text-slate-950 font-bold text-xs"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-white leading-tight">
              {activeProfile?.display_name || 'Turtle Friend'}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold mb-2">
              @{activeProfile?.turtle_handle || 'turtle'}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {activeProfile?.bio || 'Spreading daily smiles & positive energy! 🐢✨'}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-lg">
              <Flame className="w-5 h-5 fill-emerald-400" />
              <span>{activeProfile?.kind_streak || 1} Days</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Kind Streak</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-white font-extrabold text-lg">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Guardian</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Turtle Rank</span>
          </div>
        </div>
      </div>

      {/* Account Options for Own Profile */}
      {isOwnProfile && (
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Account Options
          </h3>
          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-rose-400 font-semibold text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      )}

      {/* Posts by this User */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
          Posts by {activeProfile?.display_name || 'User'}
        </h3>
        {loading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Loading posts...</p>
        ) : userPosts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No posts yet.</p>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onTurtlePower={() => { }}
              onOpenComments={(p) => onOpenComments && onOpenComments(p)}
              onSelectUser={onSelectUser}
            />
          ))
        )}
      </div>
    </div>
  );
};
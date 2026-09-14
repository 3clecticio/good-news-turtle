import React, { useState } from 'react';
import { Flame, LogOut, Shield, Award, Edit3, User, Sparkles } from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileViewProps {
  userProfile: Profile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  onOpenAuth,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.display_name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!userProfile) {
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
    } catch (e) {
      console.error('Save profile error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 pb-24 max-w-md mx-auto space-y-4">
      {/* Profile Header Card */}
      <div className="glass-card rounded-3xl p-5 border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-emerald-400/60 overflow-hidden flex items-center justify-center text-2xl font-bold text-emerald-300 shadow-md">
              {userProfile.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userProfile.display_name?.[0]?.toUpperCase() || '🐢'}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full turtle-gradient-bg flex items-center justify-center text-xs text-slate-950 font-bold border-2 border-slate-950">
              🐢
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-emerald-400 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isEditing ? (
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
              {userProfile.display_name}
            </h2>
            <p className="text-xs text-emerald-400 font-semibold mb-2">
              @{userProfile.turtle_handle}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {userProfile.bio || 'Spreading daily smiles & positive energy! 🐢✨'}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-400 font-extrabold text-lg">
              <Flame className="w-5 h-5 fill-emerald-400" />
              <span>{userProfile.kind_streak || 1} Days</span>
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

      {/* Account Settings / Sign Out */}
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
    </div>
  );
};
